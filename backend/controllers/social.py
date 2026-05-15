import pymysql.err
from flask import Blueprint, request, jsonify
from db import query, execute
from auth_utils import token_required

bp = Blueprint("social", __name__)


@bp.route("/api/social/follow/<int:target_id>", methods=["POST"])
@token_required
def follow_user(target_id):
    uid = request.current_user["userID"]
    if uid == target_id:
        return jsonify({"error": "Cannot follow yourself"}), 400
    try:
        execute("INSERT INTO Follower (followerID,followedID) VALUES (%s,%s)", (uid, target_id))
    except pymysql.err.IntegrityError:
        pass
    return jsonify({"message": "Followed"})


@bp.route("/api/social/follow/<int:target_id>", methods=["DELETE"])
@token_required
def unfollow_user(target_id):
    uid = request.current_user["userID"]
    execute("DELETE FROM Follower WHERE followerID=%s AND followedID=%s", (uid, target_id))
    return jsonify({"message": "Unfollowed"})


@bp.route("/api/social/followers", methods=["GET"])
@token_required
def my_followers():
    uid = request.current_user["userID"]
    rows = query("""
        SELECT u.userID, u.username, u.name, u.lastName
        FROM Follower f JOIN Users u ON u.userID = f.followerID
        WHERE f.followedID = %s
    """, (uid,))
    return jsonify(rows)


@bp.route("/api/social/following", methods=["GET"])
@token_required
def my_following():
    uid = request.current_user["userID"]
    rows = query("""
        SELECT u.userID, u.username, u.name, u.lastName
        FROM Follower f JOIN Users u ON u.userID = f.followedID
        WHERE f.followerID = %s
    """, (uid,))
    return jsonify(rows)


@bp.route("/api/social/follow-status/<int:target_id>", methods=["GET"])
@token_required
def follow_status(target_id):
    uid = request.current_user["userID"]
    row = query("SELECT 1 FROM Follower WHERE followerID=%s AND followedID=%s", (uid, target_id), fetchone=True)
    return jsonify({"following": row is not None})


@bp.route("/api/social/creators", methods=["GET"])
@token_required
def my_creator_follows():
    uid = request.current_user["userID"]
    rows = query("""
        SELECT acc.creatorID, acc.name, acc.role, acc.nationality,
               (SELECT COUNT(*) FROM Follow WHERE creatorID = acc.creatorID) AS numOfFollowers,
               f.followedAt
        FROM Follow f
        JOIN ApprovedContentCreator acc ON acc.creatorID = f.creatorID
        WHERE f.userID = %s
    """, (uid,))
    for r in rows:
        if r.get("followedAt"): r["followedAt"] = str(r["followedAt"])
    return jsonify(rows)


@bp.route("/api/social/creators/<int:creator_id>/follow", methods=["POST"])
@token_required
def follow_creator(creator_id):
    uid = request.current_user["userID"]
    try:
        execute("INSERT INTO Follow (userID,creatorID,followedAt) VALUES (%s,%s,CURDATE())", (uid, creator_id))
        execute("UPDATE ApprovedContentCreator SET numOfFollowers=numOfFollowers+1 WHERE creatorID=%s", (creator_id,))
    except pymysql.err.IntegrityError:
        pass
    return jsonify({"message": "Following creator"})


@bp.route("/api/social/creators/<int:creator_id>/follow", methods=["DELETE"])
@token_required
def unfollow_creator(creator_id):
    uid = request.current_user["userID"]
    rows = query("SELECT 1 FROM Follow WHERE userID=%s AND creatorID=%s", (uid, creator_id), fetchone=True)
    if rows:
        execute("DELETE FROM Follow WHERE userID=%s AND creatorID=%s", (uid, creator_id))
        execute("UPDATE ApprovedContentCreator SET numOfFollowers=GREATEST(numOfFollowers-1,0) WHERE creatorID=%s", (creator_id,))
    return jsonify({"message": "Unfollowed creator"})


@bp.route("/api/users", methods=["GET"])
@token_required
def search_users():
    q = request.args.get("q", "")
    uid = request.current_user["userID"]
    rows = query("""
        SELECT u.userID, u.username, u.name, u.lastName,
               (SELECT COUNT(*) FROM WatchLog WHERE userID=u.userID) AS watchedCount
        FROM Users u
        WHERE u.userID != %s AND u.username LIKE %s
        LIMIT 20
    """, (uid, f"%{q}%"))
    return jsonify(rows)
