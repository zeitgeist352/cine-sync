from flask import Blueprint, request, jsonify
from db import query
from auth_utils import token_required

bp = Blueprint("badges", __name__)


@bp.route("/api/badges", methods=["GET"])
@token_required
def my_badges():
    uid = request.current_user["userID"]
    rows = query("""
        SELECT badgeID, name, explanation, earnedAt
        FROM UserBadgesView
        WHERE userID = %s
        ORDER BY earnedAt DESC
    """, (uid,))
    for r in rows:
        if r.get("earnedAt"): r["earnedAt"] = str(r["earnedAt"])
    return jsonify(rows)


@bp.route("/api/badges/all", methods=["GET"])
def all_badges():
    rows = query("SELECT id, name, explanation, challengeID FROM Badge")
    return jsonify(rows)


@bp.route("/api/badges/progress", methods=["GET"])
@token_required
def badge_progress():
    uid = request.current_user["userID"]
    rows = query("""
        SELECT b.id, b.name, b.explanation, b.challengeID,
               gc.title AS challengeTitle, gc.startDate, gc.endDate,
               gc.groupProgress,
               ugc.progress AS userProgress, ugc.joinDate,
               IF(ub.badgeID IS NOT NULL, 1, 0) AS earned
        FROM Badge b
        LEFT JOIN GroupChallenges gc ON gc.challengeID = b.challengeID
        LEFT JOIN UserGroupChallenge ugc ON ugc.challengeID = b.challengeID AND ugc.userID = %s
        LEFT JOIN UserBadge ub ON ub.badgeID = b.id AND ub.userID = %s
        ORDER BY earned DESC, ugc.progress DESC
    """, (uid, uid))
    for r in rows:
        if r.get("startDate"): r["startDate"] = str(r["startDate"])
        if r.get("endDate"):   r["endDate"]   = str(r["endDate"])
        if r.get("joinDate"):  r["joinDate"]  = str(r["joinDate"])
    return jsonify(rows)
