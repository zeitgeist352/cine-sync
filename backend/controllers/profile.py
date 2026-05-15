from flask import Blueprint, request, jsonify
from db import query, execute
from auth_utils import token_required

bp = Blueprint("profile", __name__)


@bp.route("/api/profile/me", methods=["GET"])
@token_required
def my_profile():
    uid = request.current_user["userID"]
    row = query("""
        SELECT uas.userID, uas.username, uas.email,
               u.name, u.lastName, u.age,
               uas.watchedCount, uas.avgRating,
               uas.watchListCount, uas.followingCount, uas.followerCount,
               uas.clubCount, uas.badgeCount, uas.officialReviewCount
        FROM UserActivitySummary uas
        JOIN Users u ON u.userID = uas.userID
        WHERE uas.userID = %s
    """, (uid,), fetchone=True)
    if row:
        row["role"] = request.current_user.get("role")
    return jsonify(row or {})


@bp.route("/api/profile/me", methods=["PUT"])
@token_required
def update_profile():
    uid = request.current_user["userID"]
    data = request.json or {}
    name      = data.get("name", "").strip()
    last_name = data.get("lastName", "").strip()
    age       = data.get("age")

    if not name or not last_name:
        return jsonify({"error": "Name and last name are required"}), 400

    execute(
        "UPDATE Users SET name=%s, lastName=%s, age=%s WHERE userID=%s",
        (name, last_name, age, uid)
    )
    return jsonify({"message": "Profile updated"})


@bp.route("/api/profile/me/top-genres", methods=["GET"])
@token_required
def my_top_genres():
    uid = request.current_user["userID"]
    rows = query("""
        SELECT c.genre, COUNT(*) AS count
        FROM WatchLog w
        JOIN Content c ON c.contentID = w.contentID
        WHERE w.userID = %s AND c.genre IS NOT NULL
        GROUP BY c.genre
        ORDER BY count DESC
        LIMIT 7
    """, (uid,))
    return jsonify(rows)


@bp.route("/api/profile/<int:user_id>", methods=["GET"])
def public_profile(user_id):
    row = query("""
        SELECT userID, username, watchedCount, avgRating,
               watchListCount, followerCount, clubCount, badgeCount
        FROM UserActivitySummary
        WHERE userID = %s
    """, (user_id,), fetchone=True)
    if not row:
        return jsonify({"error": "User not found"}), 404
    return jsonify(row)
