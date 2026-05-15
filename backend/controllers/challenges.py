import pymysql.err
from flask import Blueprint, request, jsonify
from db import query, execute
from auth_utils import token_required

bp = Blueprint("challenges", __name__)


@bp.route("/api/challenges", methods=["GET"])
def get_challenges():
    club_id = request.args.get("clubID")
    if club_id:
        rows = query("""
            SELECT gc.challengeID, gc.title, gc.startDate, gc.endDate, gc.groupProgress, gc.clubID,
                   gc.challengeType, gc.contentType, gc.genre, gc.requiredCount,
                   (SELECT COUNT(*) FROM UserGroupChallenge ugc WHERE ugc.challengeID = gc.challengeID) AS numOfMembers
            FROM GroupChallenges gc
            WHERE gc.clubID=%s
            ORDER BY gc.startDate
        """, (club_id,))
    else:
        rows = query("""
            SELECT gc.challengeID, gc.title, gc.startDate, gc.endDate, gc.groupProgress, gc.clubID,
                   gc.challengeType, gc.contentType, gc.genre, gc.requiredCount,
                   (SELECT COUNT(*) FROM UserGroupChallenge ugc WHERE ugc.challengeID = gc.challengeID) AS numOfMembers
            FROM GroupChallenges gc
            ORDER BY gc.startDate
        """)
    for r in rows:
        if r.get("startDate"): r["startDate"] = str(r["startDate"])
        if r.get("endDate"):   r["endDate"]   = str(r["endDate"])
    return jsonify(rows)


@bp.route("/api/challenges", methods=["POST"])
@token_required
def create_challenge():
    data = request.json or {}
    for f in ["clubID", "title", "startDate", "endDate", "badgeName"]:
        if not data.get(f):
            return jsonify({"error": f"{f} required"}), 400

    uid = request.current_user["userID"]
    club = query("SELECT moderatorID FROM Club WHERE clubID = %s", (data["clubID"],), fetchone=True)
    if not club:
        return jsonify({"error": "Club not found"}), 404
    if str(club.get("moderatorID")) != str(uid):
        return jsonify({"error": "Only the club moderator can create challenges"}), 403

    content_ids  = data.get("contentIDs", [])
    content_type = data.get("contentType") or None
    genre        = data.get("genre") or None
    required_count = int(data.get("requiredCount", 1))

    if content_ids:
        challenge_type = "specific"
        required_count = len(content_ids)
    elif content_type:
        challenge_type = "type_based"
        if required_count <= 0:
            return jsonify({"error": "Required count must be a strictly positive integer"}), 400
    else:
        return jsonify({"error": "Provide contentIDs (specific challenge) or contentType (type-based challenge)"}), 400

    cid = execute("""
        INSERT INTO GroupChallenges
            (clubID, title, startDate, endDate, numOfMembers, groupProgress,
             challengeType, contentType, genre, requiredCount)
        VALUES (%s, %s, %s, %s, 0, 'Not Started', %s, %s, %s, %s)
    """, (data["clubID"], data["title"], data["startDate"], data["endDate"],
          challenge_type, content_type, genre, required_count))

    # Link specific content items
    if challenge_type == "specific":
        for item_id in content_ids:
            execute(
                "INSERT IGNORE INTO ChallengeContent (challengeID, contentID) VALUES (%s, %s)",
                (cid, item_id))

    # Auto-create badge
    execute(
        "INSERT INTO Badge (name, explanation, challengeID) VALUES (%s, %s, %s)",
        (data["badgeName"], data.get("badgeExplanation", ""), cid))

    # Auto-enroll every current club member with progress=0
    members = query("SELECT userID FROM UserClub WHERE clubID = %s", (data["clubID"],))
    for m in members:
        execute("""
            INSERT IGNORE INTO UserGroupChallenge (userID, challengeID, joinDate, progress)
            VALUES (%s, %s, CURDATE(), 0.00)
        """, (m["userID"], cid))
    execute(
        "UPDATE GroupChallenges SET numOfMembers=%s WHERE challengeID=%s",
        (len(members), cid))

    return jsonify({"challengeID": cid}), 201


@bp.route("/api/challenges/<int:challenge_id>/join", methods=["POST"])
@token_required
def join_challenge(challenge_id):
    uid = request.current_user["userID"]
    try:
        execute("""
            INSERT INTO UserGroupChallenge (userID, challengeID, joinDate, progress)
            VALUES (%s, %s, CURDATE(), 0.00)
        """, (uid, challenge_id))
        execute(
            "UPDATE GroupChallenges SET numOfMembers=numOfMembers+1 WHERE challengeID=%s",
            (challenge_id,))
    except pymysql.err.IntegrityError:
        return jsonify({"message": "Already joined"})
    return jsonify({"message": "Joined challenge"})


@bp.route("/api/challenges/<int:challenge_id>/progress", methods=["GET"])
@token_required
def my_challenge_progress(challenge_id):
    uid = request.current_user["userID"]
    row = query("""
        SELECT progress, joinDate FROM UserGroupChallenge
        WHERE userID=%s AND challengeID=%s
    """, (uid, challenge_id), fetchone=True)
    if row and row.get("joinDate"):
        row["joinDate"] = str(row["joinDate"])
    return jsonify(row or {"progress": None})


@bp.route("/api/challenges/<int:challenge_id>/members", methods=["GET"])
def challenge_members(challenge_id):
    rows = query("""
        SELECT u.userID, u.username, u.name, u.lastName,
               ugc.progress, ugc.joinDate
        FROM UserGroupChallenge ugc
        JOIN Users u ON u.userID = ugc.userID
        WHERE ugc.challengeID = %s
        ORDER BY ugc.progress DESC, ugc.joinDate
    """, (challenge_id,))
    for r in rows:
        if r.get("joinDate"): r["joinDate"] = str(r["joinDate"])
    return jsonify(rows)


@bp.route("/api/challenges/<int:challenge_id>/content", methods=["GET"])
def challenge_content(challenge_id):
    """Returns what must be watched to complete this challenge."""
    ch = query("""
        SELECT challengeType, contentType, genre, requiredCount
        FROM GroupChallenges WHERE challengeID=%s
    """, (challenge_id,), fetchone=True)
    if not ch:
        return jsonify({"error": "Challenge not found"}), 404

    if ch["challengeType"] == "specific":
        items = query("""
            SELECT c.contentID, c.title, cbv.contentType, c.genre
            FROM ChallengeContent cc
            JOIN Content c ON c.contentID = cc.contentID
            JOIN ContentBrowseView cbv ON cbv.contentID = c.contentID
            WHERE cc.challengeID = %s
        """, (challenge_id,))
        return jsonify({"type": "specific", "content": items})
    else:
        return jsonify({
            "type": "type_based",
            "contentType": ch["contentType"],
            "genre": ch["genre"],
            "requiredCount": ch["requiredCount"],
        })


@bp.route("/api/challenges/mine", methods=["GET"])
@token_required
def my_challenges():
    uid = request.current_user["userID"]
    rows = query("""
        SELECT gc.challengeID, gc.title, gc.startDate, gc.endDate,
               gc.groupProgress, ugc.progress, ugc.joinDate,
               gc.challengeType, gc.contentType, gc.genre, gc.requiredCount
        FROM UserGroupChallenge ugc
        JOIN GroupChallenges gc ON gc.challengeID = ugc.challengeID
        WHERE ugc.userID = %s
    """, (uid,))
    for r in rows:
        if r.get("startDate"): r["startDate"] = str(r["startDate"])
        if r.get("endDate"):   r["endDate"]   = str(r["endDate"])
        if r.get("joinDate"):  r["joinDate"]  = str(r["joinDate"])
    return jsonify(rows)
