import pymysql.err
from flask import Blueprint, request, jsonify
from db import query, execute
from auth_utils import token_required

bp = Blueprint("watchparty", __name__)


@bp.route("/api/watchparties", methods=["GET"])
def get_watchparties():
    rows = query("""
        SELECT partyID, clubID, title, date, authorizedCinema, capacity, joined
        FROM UpcomingWatchParties
        ORDER BY date
    """)
    for r in rows:
        if r.get("date"): r["date"] = str(r["date"])
    return jsonify(rows)


@bp.route("/api/watchparties", methods=["POST"])
@token_required
def create_watchparty():
    data = request.json or {}
    required = ["contentID", "clubID", "date", "authorizedCinema", "capacity"]
    for f in required:
        if not data.get(f):
            return jsonify({"error": f"{f} required"}), 400
            
    uid = request.current_user["userID"]
    club = query("SELECT moderatorID FROM Club WHERE clubID = %s", (data["clubID"],), fetchone=True)
    if not club:
        return jsonify({"error": "Club not found"}), 404
    if str(club.get("moderatorID")) != str(uid):
        return jsonify({"error": "Only the club moderator can create watch parties"}), 403

    pid = execute(
        "INSERT INTO WatchParty (contentID,clubID,date,authorizedCinema,capacity) VALUES (%s,%s,%s,%s,%s)",
        (data["contentID"], data["clubID"], data["date"], data["authorizedCinema"], data["capacity"])
    )
    try:
        execute("INSERT INTO WatchPartyUser (partyID,userID) VALUES (%s,%s)", (pid, uid))
    except pymysql.err.IntegrityError:
        pass
    return jsonify({"partyID": pid}), 201


@bp.route("/api/watchparties/<int:party_id>/join", methods=["POST"])
@token_required
def join_watchparty(party_id):
    uid = request.current_user["userID"]
    party = query("""
        SELECT wp.capacity, COUNT(wpu.userID) AS joined
        FROM WatchParty wp
        LEFT JOIN WatchPartyUser wpu ON wpu.partyID = wp.partyID
        WHERE wp.partyID = %s
        GROUP BY wp.partyID, wp.capacity
    """, (party_id,), fetchone=True)
    if not party:
        return jsonify({"error": "Party not found"}), 404
    if party["joined"] >= party["capacity"]:
        return jsonify({"error": "Party is full"}), 400
    try:
        execute("INSERT INTO WatchPartyUser (partyID,userID) VALUES (%s,%s)", (party_id, uid))
    except pymysql.err.IntegrityError:
        return jsonify({"message": "Already joined"})
    return jsonify({"message": "Joined watch party"})


@bp.route("/api/watchparties/<int:party_id>/leave", methods=["DELETE"])
@token_required
def leave_watchparty(party_id):
    uid = request.current_user["userID"]
    execute("DELETE FROM WatchPartyUser WHERE partyID=%s AND userID=%s", (party_id, uid))
    return jsonify({"message": "Left watch party"})


@bp.route("/api/watchparties/<int:party_id>/status", methods=["GET"])
@token_required
def watchparty_status(party_id):
    uid = request.current_user["userID"]
    row = query("SELECT 1 FROM WatchPartyUser WHERE partyID=%s AND userID=%s", (party_id, uid), fetchone=True)
    return jsonify({"joined": row is not None})
