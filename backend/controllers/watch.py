from flask import Blueprint, request, jsonify
from db import query, execute
from auth_utils import token_required

bp = Blueprint("watch", __name__)


def _update_challenge_progress(uid, content_id):
    """Recalculate and persist badge progress for all active challenges this user is enrolled in."""
    challenges = query("""
        SELECT gc.challengeID, gc.challengeType, gc.requiredCount,
               gc.contentType, gc.genre, gc.startDate
        FROM GroupChallenges gc
        JOIN UserGroupChallenge ugc ON ugc.challengeID = gc.challengeID AND ugc.userID = %s
        WHERE gc.groupProgress != 'Completed'
    """, (uid,))

    for ch in challenges:
        cid = ch["challengeID"]

        if ch["challengeType"] == "specific":
            # Only proceed if this content is part of the challenge
            in_challenge = query(
                "SELECT 1 FROM ChallengeContent WHERE challengeID=%s AND contentID=%s",
                (cid, content_id), fetchone=True)
            if not in_challenge:
                continue
            watched = query("""
                SELECT COUNT(DISTINCT cc.contentID) AS cnt
                FROM ChallengeContent cc
                JOIN WatchLog wl ON wl.contentID = cc.contentID AND wl.userID = %s
                WHERE cc.challengeID = %s AND wl.timestamp >= %s
            """, (uid, cid, str(ch["startDate"])), fetchone=True)
            total = query(
                "SELECT COUNT(*) AS cnt FROM ChallengeContent WHERE challengeID=%s",
                (cid,), fetchone=True)
            progress = (watched["cnt"] / total["cnt"] * 100) if total["cnt"] > 0 else 0

        else:  # type_based
            # Check if this content matches the required type (and optional genre)
            match_sql = "SELECT 1 FROM ContentBrowseView WHERE contentID=%s AND contentType=%s"
            match_params = [content_id, ch["contentType"]]
            if ch.get("genre"):
                match_sql += " AND genre=%s"
                match_params.append(ch["genre"])
            if not query(match_sql, match_params, fetchone=True):
                continue

            genre_clause = "AND cbv.genre = %s" if ch.get("genre") else ""
            count_params = [uid, str(ch["startDate"]), ch["contentType"]]
            if ch.get("genre"):
                count_params.append(ch["genre"])
            watched = query(f"""
                SELECT COUNT(DISTINCT wl.contentID) AS cnt
                FROM WatchLog wl
                JOIN ContentBrowseView cbv ON cbv.contentID = wl.contentID
                WHERE wl.userID = %s AND wl.timestamp >= %s
                  AND cbv.contentType = %s {genre_clause}
            """, count_params, fetchone=True)
            req = ch["requiredCount"] or 1
            progress = min(watched["cnt"] / req * 100, 100)

        execute(
            "UPDATE UserGroupChallenge SET progress=%s WHERE userID=%s AND challengeID=%s",
            (round(progress, 2), uid, cid))

        if progress >= 100:
            badge = query(
                "SELECT id FROM Badge WHERE challengeID=%s", (cid,), fetchone=True)
            if badge:
                execute("""
                    INSERT IGNORE INTO UserBadge (userID, badgeID, earnedAt)
                    VALUES (%s, %s, CURDATE())
                """, (uid, badge["id"]))
            # Mark group as Completed only when every member is done
            remaining = query("""
                SELECT COUNT(*) AS cnt FROM UserGroupChallenge
                WHERE challengeID=%s AND progress < 100
            """, (cid,), fetchone=True)
            if remaining["cnt"] == 0:
                execute(
                    "UPDATE GroupChallenges SET groupProgress='Completed' WHERE challengeID=%s",
                    (cid,))
        else:
            # Flip group status to In Progress on first activity
            execute("""
                UPDATE GroupChallenges SET groupProgress='In Progress'
                WHERE challengeID=%s AND groupProgress='Not Started'
            """, (cid,))


@bp.route("/api/watch", methods=["POST"])
@token_required
def log_watch():
    data = request.json or {}
    content_id = data.get("contentID")
    percentage = data.get("percentage", 100)
    if not content_id:
        return jsonify({"error": "contentID required"}), 400

    uid = request.current_user["userID"]
    execute("""
        INSERT INTO WatchLog (userID, contentID, timestamp, percentage)
        VALUES (%s, %s, NOW(), %s)
        ON DUPLICATE KEY UPDATE timestamp=NOW(), percentage=%s
    """, (uid, content_id, percentage, percentage))

    _update_challenge_progress(uid, content_id)
    return jsonify({"message": "Watch logged"})


@bp.route("/api/watch/history", methods=["GET"])
@token_required
def watch_history():
    uid = request.current_user["userID"]
    rows = query("""
        SELECT contentID, title, genre, rating, percentage, timestamp, comment
        FROM UserWatchHistoryView
        WHERE userID = %s
        ORDER BY timestamp DESC
    """, (uid,))
    for r in rows:
        if r.get("timestamp"):
            r["timestamp"] = str(r["timestamp"])
    return jsonify(rows)


@bp.route("/api/ratings", methods=["POST"])
@token_required
def rate_content():
    data = request.json or {}
    content_id = data.get("contentID")
    rating     = data.get("rating")
    season_no  = data.get("seasonNo")
    episode_no = data.get("episodeNo")
    if content_id is None or rating is None:
        return jsonify({"error": "contentID and rating required"}), 400
    if not (1 <= int(rating) <= 10):
        return jsonify({"error": "Rating must be 1-10"}), 400

    uid = request.current_user["userID"]
    role = request.current_user.get("role")
    
    is_series = query("SELECT 1 FROM Series WHERE contentID = %s", (content_id,), fetchone=True)
    if is_series and (season_no is None or episode_no is None):
        return jsonify({"error": "Cannot rate a Series directly. Please rate individual episodes."}), 400

    try:
        if is_series and season_no is not None and episode_no is not None:
            execute("""
                INSERT INTO EpisodeRatingLog (userID, contentID, seasonNo, episodeNo, rating, timestamp)
                VALUES (%s, %s, %s, %s, %s, NOW())
                ON DUPLICATE KEY UPDATE rating=%s, timestamp=NOW()
            """, (uid, content_id, season_no, episode_no, rating, rating))
        else:
            if role == "critic":
                existing = query("SELECT reviewID FROM OfficialReviews WHERE criticUserID=%s AND contentID=%s", (uid, content_id), fetchone=True)
                if existing:
                    execute("UPDATE OfficialReviews SET points=%s WHERE reviewID=%s", (rating, existing["reviewID"]))
                else:
                    execute("INSERT INTO OfficialReviews (criticUserID,contentID,points) VALUES (%s,%s,%s)", (uid, content_id, rating))
                    execute("""
                        UPDATE Critics
                        SET reviewCount = reviewCount+1,
                            avgPointsGiven = (SELECT AVG(points) FROM OfficialReviews WHERE criticUserID=%s)
                        WHERE userID=%s
                    """, (uid, uid))
            else:
                execute("""
                    INSERT INTO RatingLog (userID, contentID, rating, timestamp)
                    VALUES (%s, %s, %s, NOW())
                    ON DUPLICATE KEY UPDATE rating=%s, timestamp=NOW()
                """, (uid, content_id, rating, rating))
    except Exception as e:
        return jsonify({"error": f"Failed to save rating: {str(e)}"}), 500
    updated = query("SELECT globalScore FROM Content WHERE contentID=%s", (content_id,), fetchone=True)
    return jsonify({"message": "Rating saved", "globalScore": updated["globalScore"] if updated else None})


@bp.route("/api/comments", methods=["POST"])
@token_required
def add_comment():
    data = request.json or {}
    content_id = data.get("contentID")
    comment    = data.get("comment", "").strip()
    if not content_id or not comment:
        return jsonify({"error": "contentID and comment required"}), 400

    uid = request.current_user["userID"]
    execute("""
        INSERT INTO CommentLog (userID, contentID, timestamp, comment)
        VALUES (%s, %s, NOW(), %s)
    """, (uid, content_id, comment))
    return jsonify({"message": "Comment saved"})

@bp.route("/api/comments/<int:comment_id>", methods=["DELETE"])
@token_required
def delete_comment(comment_id):
    uid = request.current_user["userID"]
    execute("DELETE FROM CommentLog WHERE commentID = %s AND userID = %s", (comment_id, uid))
    return jsonify({"message": "Comment deleted"})


@bp.route("/api/watch/status/<int:content_id>", methods=["GET"])
@token_required
def watch_status(content_id):
    uid = request.current_user["userID"]
    role = request.current_user.get("role")
    watch   = query("SELECT percentage FROM WatchLog  WHERE userID=%s AND contentID=%s", (uid, content_id), fetchone=True)
    if role == "critic":
        rating = query("SELECT points AS rating FROM OfficialReviews WHERE criticUserID=%s AND contentID=%s", (uid, content_id), fetchone=True)
    else:
        rating  = query("SELECT rating     FROM RatingLog WHERE userID=%s AND contentID=%s", (uid, content_id), fetchone=True)
    comment = query("SELECT comment    FROM CommentLog WHERE userID=%s AND contentID=%s", (uid, content_id), fetchone=True)
    return jsonify({
        "watched":    watch is not None,
        "percentage": watch["percentage"]  if watch   else 0,
        "rating":     rating["rating"]     if rating  else None,
        "comment":    comment["comment"]   if comment else None,
    })
