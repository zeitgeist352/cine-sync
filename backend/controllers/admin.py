"""
Admin controller — full CRUD for platform management.
All routes require admin JWT role.
"""

from flask import Blueprint, request, jsonify
from db import query, execute
from auth_utils import admin_required

bp = Blueprint("admin", __name__)


# ── Platform Statistics ────────────────────────────────────────────────────────

@bp.route("/api/admin/stats", methods=["GET"])
@admin_required
def get_stats():
    stats = {}
    stats["totalUsers"]    = query("SELECT COUNT(*) AS c FROM Users",             fetchone=True)["c"]
    stats["totalContent"]  = query("SELECT COUNT(*) AS c FROM Content",           fetchone=True)["c"]
    stats["totalMovies"]   = query("SELECT COUNT(*) AS c FROM Movies",            fetchone=True)["c"]
    stats["totalSeries"]   = query("SELECT COUNT(*) AS c FROM Series",            fetchone=True)["c"]
    stats["totalShorts"]   = query("SELECT COUNT(*) AS c FROM ShortContents",     fetchone=True)["c"]
    stats["totalCritics"]  = query("SELECT COUNT(*) AS c FROM Critics",           fetchone=True)["c"]
    stats["totalComments"] = query("SELECT COUNT(*) AS c FROM CommentLog",        fetchone=True)["c"]
    stats["totalReviews"]  = query("SELECT COUNT(*) AS c FROM OfficialReviews",   fetchone=True)["c"]
    stats["totalClubs"]    = query("SELECT COUNT(*) AS c FROM Club",              fetchone=True)["c"]
    stats["totalWatchLogs"]= query("SELECT COUNT(*) AS c FROM WatchLog",          fetchone=True)["c"]
    stats["totalCreators"] = query("SELECT COUNT(*) AS c FROM ApprovedContentCreator", fetchone=True)["c"]
    return jsonify(stats)


# ── Users ──────────────────────────────────────────────────────────────────────

@bp.route("/api/admin/users", methods=["GET"])
@admin_required
def list_users():
    rows = query("""
        SELECT
            u.userID, u.username, u.email, u.name, u.lastName, u.age,
            CASE
                WHEN a.email IS NOT NULL THEN 'admin'
                WHEN c.userID IS NOT NULL THEN 'critic'
                ELSE 'standard'
            END AS role,
            (SELECT COUNT(*) FROM WatchLog wl WHERE wl.userID = u.userID)   AS watchCount,
            (SELECT COUNT(*) FROM CommentLog cl WHERE cl.userID = u.userID) AS commentCount,
            (SELECT COUNT(*) FROM RatingLog rl WHERE rl.userID = u.userID)  AS ratingCount,
            (
                (SELECT COUNT(*) FROM WatchLog wl WHERE wl.userID = u.userID) * 1 +
                (SELECT COUNT(*) FROM CommentLog cl WHERE cl.userID = u.userID) * 1 +
                (SELECT COUNT(*) FROM RatingLog rl WHERE rl.userID = u.userID) * 1
            ) AS engagementScore
        FROM Users u
        LEFT JOIN Critics c ON c.userID = u.userID
        LEFT JOIN Admin a   ON a.email  = u.email
        ORDER BY u.userID
    """)
    return jsonify(rows)


@bp.route("/api/admin/users/<int:uid>", methods=["PUT"])
@admin_required
def update_user(uid):
    data = request.json or {}
    # Fields that can be updated
    allowed = ["username", "email", "name", "lastName", "age"]
    sets, vals = [], []
    for field in allowed:
        if field in data:
            sets.append(f"{field}=%s")
            vals.append(data[field])
    if not sets:
        return jsonify({"error": "No valid fields to update"}), 400
    vals.append(uid)
    execute(f"UPDATE Users SET {', '.join(sets)} WHERE userID=%s", vals)

    # Role change
    new_role = data.get("role")
    if new_role in ("standard", "critic"):
        # Remove from both subtypes first
        execute("DELETE FROM StandardUsers WHERE userID=%s", (uid,))
        execute("DELETE FROM Critics WHERE userID=%s", (uid,))
        if new_role == "standard":
            execute("INSERT IGNORE INTO StandardUsers (userID) VALUES (%s)", (uid,))
        else:
            execute("INSERT IGNORE INTO Critics (userID) VALUES (%s)", (uid,))

    return jsonify({"ok": True})


@bp.route("/api/admin/users/<int:uid>", methods=["DELETE"])
@admin_required
def delete_user(uid):
    # Prevent deleting self
    if request.current_user.get("userID") == uid:
        return jsonify({"error": "Cannot delete your own account"}), 400
    execute("DELETE FROM Users WHERE userID=%s", (uid,))
    return jsonify({"ok": True})


# ── Content ────────────────────────────────────────────────────────────────────

@bp.route("/api/admin/content", methods=["GET"])
@admin_required
def list_content():
    rows = query("""
        SELECT
            c.contentID, c.title, c.genre, c.language, c.date, c.producer,
            c.globalScore, c.criticScore, c.duration, c.synopsis,
            CASE
                WHEN m.contentID  IS NOT NULL THEN 'Movie'
                WHEN s.contentID  IS NOT NULL THEN 'Series'
                WHEN ls.contentID IS NOT NULL THEN 'LiveStream'
                ELSE 'ShortContent'
            END AS contentType,
            (SELECT COUNT(*) FROM CommentLog cl WHERE cl.contentID = c.contentID)   AS commentCount,
            (SELECT COUNT(*) FROM RatingLog  rl WHERE rl.contentID = c.contentID)   AS ratingCount,
            (SELECT COUNT(*) FROM OfficialReviews OR2 WHERE OR2.contentID = c.contentID) AS reviewCount
        FROM Content c
        LEFT JOIN Movies      m  ON m.contentID  = c.contentID
        LEFT JOIN Series      s  ON s.contentID  = c.contentID
        LEFT JOIN LiveStreams  ls ON ls.contentID = c.contentID
        ORDER BY c.contentID
    """)
    return jsonify(rows)


@bp.route("/api/admin/content/<int:cid>", methods=["PUT"])
@admin_required
def update_content(cid):
    data = request.json or {}
    allowed = ["title", "genre", "language", "producer", "duration", "synopsis"]
    sets, vals = [], []
    for field in allowed:
        if field in data:
            sets.append(f"{field}=%s")
            vals.append(data[field])
    if not sets:
        return jsonify({"error": "No valid fields to update"}), 400
    vals.append(cid)
    execute(f"UPDATE Content SET {', '.join(sets)} WHERE contentID=%s", vals)
    return jsonify({"ok": True})


@bp.route("/api/admin/content/<int:cid>", methods=["DELETE"])
@admin_required
def delete_content(cid):
    execute("DELETE FROM Content WHERE contentID=%s", (cid,))
    return jsonify({"ok": True})


# ── Comments ───────────────────────────────────────────────────────────────────

@bp.route("/api/admin/comments", methods=["GET"])
@admin_required
def list_comments():
    rows = query("""
        SELECT
            cl.userID, u.username,
            cl.contentID, c.title AS contentTitle,
            cl.timestamp, cl.comment
        FROM CommentLog cl
        JOIN Users   u ON u.userID    = cl.userID
        JOIN Content c ON c.contentID = cl.contentID
        ORDER BY cl.timestamp DESC
    """)
    return jsonify(rows)


@bp.route("/api/admin/comments/<int:uid>/<int:cid>", methods=["DELETE"])
@admin_required
def delete_comment(uid, cid):
    execute("DELETE FROM CommentLog WHERE userID=%s AND contentID=%s", (uid, cid))
    return jsonify({"ok": True})


# ── Official Reviews ───────────────────────────────────────────────────────────

@bp.route("/api/admin/reviews", methods=["GET"])
@admin_required
def list_reviews():
    rows = query("""
        SELECT
            r.reviewID, r.points, r.review,
            r.criticUserID, u.username AS criticUsername,
            r.contentID, c.title AS contentTitle
        FROM OfficialReviews r
        JOIN Users   u ON u.userID    = r.criticUserID
        JOIN Content c ON c.contentID = r.contentID
        ORDER BY r.reviewID DESC
    """)
    return jsonify(rows)


@bp.route("/api/admin/reviews/<int:rid>", methods=["PUT"])
@admin_required
def update_review(rid):
    data = request.json or {}
    sets, vals = [], []
    if "points" in data:
        sets.append("points=%s")
        vals.append(data["points"])
    if "review" in data:
        sets.append("review=%s")
        vals.append(data["review"])
    if not sets:
        return jsonify({"error": "No valid fields to update"}), 400
    vals.append(rid)
    execute(f"UPDATE OfficialReviews SET {', '.join(sets)} WHERE reviewID=%s", vals)
    return jsonify({"ok": True})


@bp.route("/api/admin/reviews/<int:rid>", methods=["DELETE"])
@admin_required
def delete_review(rid):
    execute("DELETE FROM OfficialReviews WHERE reviewID=%s", (rid,))
    return jsonify({"ok": True})


# ── Critics ────────────────────────────────────────────────────────────────────

@bp.route("/api/admin/critics", methods=["GET"])
@admin_required
def list_critics():
    rows = query("""
        SELECT
            u.userID, u.username, u.email, u.name, u.lastName,
            c.reviewCount, c.avgPointsGiven
        FROM Critics c
        JOIN Users u ON u.userID = c.userID
        ORDER BY c.reviewCount DESC
    """)
    return jsonify(rows)


@bp.route("/api/admin/critics/<int:uid>/demote", methods=["POST"])
@admin_required
def demote_critic(uid):
    """Demote a critic to standard user."""
    execute("DELETE FROM Critics WHERE userID=%s", (uid,))
    execute("INSERT IGNORE INTO StandardUsers (userID) VALUES (%s)", (uid,))
    return jsonify({"ok": True})


# ── Clubs ──────────────────────────────────────────────────────────────────────

@bp.route("/api/admin/clubs", methods=["GET"])
@admin_required
def list_clubs():
    rows = query("""
        SELECT
            cl.clubID, cl.title, cl.numOfMembers, cl.moderatorID,
            u.username AS moderatorUsername,
            (SELECT COUNT(*) FROM GroupChallenges gc WHERE gc.clubID = cl.clubID) AS challengeCount,
            (SELECT COUNT(*) FROM WatchParty wp WHERE wp.clubID = cl.clubID)      AS partyCount,
            (SELECT COUNT(*) FROM Criteria cr WHERE cr.clubID = cl.clubID)        AS criteriaCount
        FROM Club cl
        LEFT JOIN Users u ON u.userID = cl.moderatorID
        ORDER BY cl.clubID
    """)
    return jsonify(rows)


@bp.route("/api/admin/clubs/<int:club_id>", methods=["PUT"])
@admin_required
def update_club(club_id):
    data = request.json or {}
    if "title" not in data:
        return jsonify({"error": "title required"}), 400
    execute("UPDATE Club SET title=%s WHERE clubID=%s", (data["title"], club_id))
    return jsonify({"ok": True})


@bp.route("/api/admin/clubs/<int:club_id>", methods=["DELETE"])
@admin_required
def delete_club(club_id):
    execute("DELETE FROM Club WHERE clubID=%s", (club_id,))
    return jsonify({"ok": True})


# ── Creators ───────────────────────────────────────────────────────────────────

@bp.route("/api/admin/creators", methods=["GET"])
@admin_required
def list_creators():
    rows = query("""
        SELECT
            acc.creatorID, acc.name, acc.age, acc.gender, acc.nationality, acc.role, acc.numOfFollowers,
            (SELECT COUNT(*) FROM TakePart tp WHERE tp.creatorID = acc.creatorID) AS contentCount
        FROM ApprovedContentCreator acc
        ORDER BY acc.creatorID
    """)
    return jsonify(rows)


@bp.route("/api/admin/creators/<int:creator_id>", methods=["PUT"])
@admin_required
def update_creator(creator_id):
    data = request.json or {}
    allowed = ["name", "age", "gender", "nationality", "role"]
    sets, vals = [], []
    for field in allowed:
        if field in data:
            sets.append(f"{field}=%s")
            vals.append(data[field])
    if not sets:
        return jsonify({"error": "No valid fields to update"}), 400
    vals.append(creator_id)
    execute(f"UPDATE ApprovedContentCreator SET {', '.join(sets)} WHERE creatorID=%s", vals)
    return jsonify({"ok": True})


@bp.route("/api/admin/creators/<int:creator_id>", methods=["DELETE"])
@admin_required
def delete_creator(creator_id):
    execute("DELETE FROM ApprovedContentCreator WHERE creatorID=%s", (creator_id,))
    return jsonify({"ok": True})


# ── Analytics Reports ──────────────────────────────────────────────────────────

@bp.route("/api/admin/analytics/engagement", methods=["GET"])
@admin_required
def analytics_engagement():
    """User engagement analytics."""

    top_watchers = query("""
        SELECT u.userID, u.username,
               COUNT(DISTINCT wl.contentID)         AS watchCount,
               ROUND(AVG(wl.percentage), 1)         AS avgCompletion,
               COUNT(DISTINCT cl.contentID)         AS commentCount,
               COUNT(DISTINCT rl.contentID)         AS ratingCount,
               (
                   COUNT(DISTINCT wl.contentID) * 1 +
                   COUNT(DISTINCT cl.contentID) * 1 +
                   COUNT(DISTINCT rl.contentID) * 1
               ) AS engagementScore
        FROM Users u
        LEFT JOIN WatchLog   wl ON wl.userID = u.userID
        LEFT JOIN CommentLog cl ON cl.userID = u.userID
        LEFT JOIN RatingLog  rl ON rl.userID = u.userID
        GROUP BY u.userID, u.username
        ORDER BY engagementScore DESC, watchCount DESC
        LIMIT 10
    """)

    genre_distribution = query("""
        SELECT c.genre, COUNT(*) AS totalWatches,
               COUNT(DISTINCT wl.userID) AS uniqueViewers
        FROM WatchLog wl
        JOIN Content c ON c.contentID = wl.contentID
        WHERE c.genre IS NOT NULL
        GROUP BY c.genre
        ORDER BY totalWatches DESC
    """)

    avg_completion = query("""
        SELECT ROUND(AVG(percentage), 1) AS avgPct
        FROM WatchLog
    """, fetchone=True)

    completion_buckets = query("""
        SELECT
            CASE
                WHEN percentage = 100              THEN 'Completed (100%%)'
                WHEN percentage >= 75              THEN 'Mostly watched (75-99%%)'
                WHEN percentage >= 50              THEN 'Half watched (50-74%%)'
                WHEN percentage >= 25              THEN 'Partially watched (25-49%%)'
                ELSE 'Barely started (<25%%)'
            END AS bucket,
            COUNT(*) AS count
        FROM WatchLog
        GROUP BY bucket
        ORDER BY count DESC
    """)

    most_active_clubs = query("""
        SELECT c.clubID, c.title, c.numOfMembers,
               COUNT(DISTINCT gc.challengeID) AS challenges,
               COUNT(DISTINCT wp.partyID)     AS parties
        FROM Club c
        LEFT JOIN GroupChallenges gc ON gc.clubID = c.clubID
        LEFT JOIN WatchParty      wp ON wp.clubID = c.clubID
        GROUP BY c.clubID, c.title, c.numOfMembers
        ORDER BY c.numOfMembers DESC
        LIMIT 5
    """)

    return jsonify({
        "topWatchers":       top_watchers,
        "genreDistribution": genre_distribution,
        "avgCompletion":     avg_completion["avgPct"] if avg_completion else 0,
        "completionBuckets": completion_buckets,
        "mostActiveClubs":   most_active_clubs,
    })


@bp.route("/api/admin/analytics/trends", methods=["GET"])
@admin_required
def analytics_trends():
    """Content trends analytics."""

    most_watched = query("""
        SELECT c.contentID, c.title, c.genre,
               CASE
                   WHEN m.contentID  IS NOT NULL THEN 'Movie'
                   WHEN s.contentID  IS NOT NULL THEN 'Series'
                   WHEN ls.contentID IS NOT NULL THEN 'LiveStream'
                   ELSE 'ShortContent'
               END AS contentType,
               COUNT(DISTINCT wl.userID) AS viewerCount,
               ROUND(c.weightedScore, 2) AS weightedScore,
               ROUND(c.globalScore,   2) AS userScore,
               ROUND(c.criticScore,   2) AS criticScore
        FROM Content c
        LEFT JOIN WatchLog    wl ON wl.contentID  = c.contentID
        LEFT JOIN Movies      m  ON m.contentID   = c.contentID
        LEFT JOIN Series      s  ON s.contentID   = c.contentID
        LEFT JOIN LiveStreams  ls ON ls.contentID  = c.contentID
        GROUP BY c.contentID, c.title, c.genre, contentType,
                 c.weightedScore, c.globalScore, c.criticScore
        ORDER BY viewerCount DESC
        LIMIT 10
    """)

    top_rated = query("""
        SELECT c.contentID, c.title, c.genre,
               ROUND(c.weightedScore, 2) AS weightedScore,
               ROUND(c.criticScore,   2) AS criticScore,
               ROUND(c.globalScore,   2) AS userScore,
               COUNT(DISTINCT rl.userID) AS ratingCount
        FROM Content c
        LEFT JOIN RatingLog rl ON rl.contentID = c.contentID
        WHERE c.weightedScore > 0
        GROUP BY c.contentID, c.title, c.genre, c.weightedScore, c.criticScore, c.globalScore
        ORDER BY weightedScore DESC
        LIMIT 10
    """)

    critic_reviewed = query("""
        SELECT c.contentID, c.title,
               COUNT(DISTINCT or2.reviewID) AS reviewCount,
               ROUND(AVG(or2.points), 2)   AS avgCriticScore
        FROM OfficialReviews or2
        JOIN Content c ON c.contentID = or2.contentID
        GROUP BY c.contentID, c.title
        ORDER BY reviewCount DESC
        LIMIT 10
    """)

    genre_scores = query("""
        SELECT c.genre,
               COUNT(DISTINCT c.contentID)         AS contentCount,
               ROUND(AVG(c.weightedScore), 2)       AS avgWeighted,
               ROUND(AVG(c.globalScore),   2)       AS avgUser,
               ROUND(AVG(c.criticScore),   2)       AS avgCritic
        FROM Content c
        WHERE c.genre IS NOT NULL
        GROUP BY c.genre
        ORDER BY avgWeighted DESC
    """)

    language_dist = query("""
        SELECT language, COUNT(*) AS count
        FROM Content
        WHERE language IS NOT NULL
        GROUP BY language
        ORDER BY count DESC
    """)

    return jsonify({
        "mostWatched":    most_watched,
        "topRated":       top_rated,
        "criticReviewed": critic_reviewed,
        "genreScores":    genre_scores,
        "languageDist":   language_dist,
    })


@bp.route("/api/admin/analytics/growth", methods=["GET"])
@admin_required
def analytics_growth():
    """Platform growth analytics."""

    content_by_type = query("""
        SELECT
            CASE
                WHEN m.contentID  IS NOT NULL THEN 'Movie'
                WHEN s.contentID  IS NOT NULL THEN 'Series'
                WHEN ls.contentID IS NOT NULL THEN 'LiveStream'
                ELSE 'ShortContent'
            END AS contentType,
            COUNT(*) AS count
        FROM Content c
        LEFT JOIN Movies      m  ON m.contentID   = c.contentID
        LEFT JOIN Series      s  ON s.contentID   = c.contentID
        LEFT JOIN LiveStreams  ls ON ls.contentID  = c.contentID
        GROUP BY contentType
        ORDER BY count DESC
    """)

    content_by_year = query("""
        SELECT YEAR(date) AS year, COUNT(*) AS count
        FROM Content
        WHERE date IS NOT NULL
        GROUP BY year
        ORDER BY year
    """)

    user_roles = query("""
        SELECT
            'Standard' AS role, COUNT(*) AS count FROM StandardUsers
        UNION ALL
        SELECT 'Critic',  COUNT(*) FROM Critics
        UNION ALL
        SELECT 'Admin',   COUNT(*) FROM Admin
    """)

    critic_stats = query("""
        SELECT u.username,
               c.reviewCount,
               ROUND(c.avgPointsGiven, 2) AS avgPoints,
               (SELECT COUNT(DISTINCT or2.contentID)
                FROM OfficialReviews or2
                WHERE or2.criticUserID = c.userID) AS uniqueContentReviewed
        FROM Critics c
        JOIN Users u ON u.userID = c.userID
        ORDER BY c.reviewCount DESC
    """)

    watchlist_stats = query("""
        SELECT u.username,
               COUNT(wl.watchListID) AS listCount,
               SUM(wl.numOfContent) AS totalItems
        FROM WatchList wl
        JOIN Users u ON u.userID = wl.userID
        GROUP BY u.userID, u.username
        ORDER BY listCount DESC
        LIMIT 10
    """)

    return jsonify({
        "contentByType":  content_by_type,
        "contentByYear":  content_by_year,
        "userRoles":      user_roles,
        "criticStats":    critic_stats,
        "watchlistStats": watchlist_stats,
    })
