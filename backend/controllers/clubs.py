import pymysql.err
from flask import Blueprint, request, jsonify
from db import query, execute
from auth_utils import token_required

bp = Blueprint("clubs", __name__)


# ── Helpers ────────────────────────────────────────────────────────────────────

def _check_eligibility(uid, club_id):
    """
    Verify that a user meets all criteria for a club.
    Returns (eligible: bool, missing: list[str])
    """
    missing = []

    # Genre criteria: user must have watched >= threshold movies of that genre
    genre_criteria = query("""
        SELECT gc.criteriaID, gc.typeOfGenre, gc.thresholdOfGenre,
               (SELECT COUNT(DISTINCT wl.contentID)
                FROM WatchLog wl
                JOIN Content c ON c.contentID = wl.contentID
                WHERE wl.userID = %s AND c.genre = gc.typeOfGenre
               ) AS watchedCount
        FROM GenreCriteria gc
        WHERE gc.clubID = %s
    """, (uid, club_id))

    for gc in genre_criteria:
        needed = int(gc["thresholdOfGenre"])
        have   = int(gc["watchedCount"])
        if have < needed:
            missing.append(
                f"Watch at least {needed} {gc['typeOfGenre']} film(s) "
                f"(you have {have})"
            )

    # Celebrity criteria: user must have watched >= threshold content featuring that creator
    celebrity_criteria = query("""
        SELECT cc.criteriaID, acc.name AS creatorName,
               cc.thresholdOfCelebrity AS threshold,
               (SELECT COUNT(DISTINCT wl.contentID)
                FROM WatchLog wl
                JOIN TakePart tp ON tp.contentID = wl.contentID
                WHERE wl.userID = %s AND tp.creatorID = cc.creatorID
               ) AS watchedCount
        FROM CelebrityCriteria cc
        JOIN ApprovedContentCreator acc ON acc.creatorID = cc.creatorID
        WHERE cc.clubID = %s
    """, (uid, club_id))

    for cc in celebrity_criteria:
        needed = int(cc["threshold"])
        have   = int(cc["watchedCount"])
        if have < needed:
            missing.append(
                f"Watch at least {needed} content featuring {cc['creatorName']} "
                f"(you have {have})"
            )

    # Era criteria: user must have watched >= threshold films from that era
    era_criteria = query("""
        SELECT ec.criteriaID, ec.startOfEra, ec.endOfEra, ec.thresholdOfEra,
               (SELECT COUNT(DISTINCT wl.contentID)
                FROM WatchLog wl
                JOIN Content c ON c.contentID = wl.contentID
                WHERE wl.userID = %s AND c.date BETWEEN ec.startOfEra AND ec.endOfEra
               ) AS watchedInEra
        FROM EraCriteria ec
        WHERE ec.clubID = %s
    """, (uid, club_id))

    for ec in era_criteria:
        needed = int(ec["thresholdOfEra"])
        have   = int(ec["watchedInEra"])
        start  = str(ec["startOfEra"])[:4]
        end    = str(ec["endOfEra"])[:4]
        if have < needed:
            missing.append(
                f"Watch at least {needed} film(s) from {start}–{end} "
                f"(you have {have})"
            )

    return len(missing) == 0, missing


# ── Club list / detail ─────────────────────────────────────────────────────────

@bp.route("/api/clubs", methods=["GET"])
def get_clubs():
    rows = query("""
        SELECT c.clubID, c.title, c.numOfMembers, c.moderatorID,
               u.username AS moderatorUsername,
               (SELECT COUNT(*) FROM Criteria cr WHERE cr.clubID = c.clubID) AS hasCriteria
        FROM Club c
        LEFT JOIN Users u ON u.userID = c.moderatorID
        ORDER BY c.numOfMembers DESC
    """)
    return jsonify(rows)


@bp.route("/api/clubs", methods=["POST"])
@token_required
def create_club():
    uid  = request.current_user["userID"]
    data = request.json or {}
    title = data.get("title", "").strip()
    if not title:
        return jsonify({"error": "Title required"}), 400
    # Creator becomes the moderator and joins the club
    cid = execute(
        "INSERT INTO Club (title, numOfMembers, moderatorID) VALUES (%s, 0, %s)",
        (title, uid)
    )
    execute("INSERT INTO UserClub (userID, clubID, joinDate) VALUES (%s, %s, CURDATE())", (uid, cid))
    return jsonify({"clubID": cid, "title": title, "moderatorID": uid}), 201


@bp.route("/api/clubs/<int:club_id>", methods=["GET"])
def get_club(club_id):
    row = query("""
        SELECT c.clubID, c.title, c.numOfMembers, c.moderatorID,
               u.username AS moderatorUsername
        FROM Club c
        LEFT JOIN Users u ON u.userID = c.moderatorID
        WHERE c.clubID = %s
    """, (club_id,), fetchone=True)
    if not row:
        return jsonify({"error": "Club not found"}), 404
    return jsonify(row)


# ── Criteria ───────────────────────────────────────────────────────────────────

@bp.route("/api/clubs/<int:club_id>/criteria", methods=["GET"])
def get_criteria(club_id):
    result = []

    genre_rows = query("""
        SELECT gc.criteriaID, 'genre' AS type,
               gc.typeOfGenre AS genreName,
               gc.thresholdOfGenre AS threshold
        FROM GenreCriteria gc
        WHERE gc.clubID = %s
    """, (club_id,))
    result.extend(genre_rows)

    celeb_rows = query("""
        SELECT cc.criteriaID, 'celebrity' AS type,
               acc.name AS creatorName, acc.creatorID,
               cc.thresholdOfCelebrity AS threshold
        FROM CelebrityCriteria cc
        JOIN ApprovedContentCreator acc ON acc.creatorID = cc.creatorID
        WHERE cc.clubID = %s
    """, (club_id,))
    result.extend(celeb_rows)

    era_rows = query("""
        SELECT ec.criteriaID, 'era' AS type,
               ec.startOfEra, ec.endOfEra,
               ec.thresholdOfEra AS threshold
        FROM EraCriteria ec
        WHERE ec.clubID = %s
    """, (club_id,))
    for r in era_rows:
        if r.get("startOfEra"): r["startOfEra"] = str(r["startOfEra"])
        if r.get("endOfEra"):   r["endOfEra"]   = str(r["endOfEra"])
    result.extend(era_rows)

    return jsonify(result)


@bp.route("/api/clubs/<int:club_id>/criteria", methods=["POST"])
@token_required
def add_criterion(club_id):
    uid  = request.current_user["userID"]
    club = query("SELECT moderatorID FROM Club WHERE clubID=%s", (club_id,), fetchone=True)
    if not club:
        return jsonify({"error": "Club not found"}), 404
    if club["moderatorID"] != uid and request.current_user.get("role") != "admin":
        return jsonify({"error": "Only the club moderator can set criteria"}), 403

    data = request.json or {}
    ctype = data.get("type")

    # Insert base Criteria row and get the new criteriaID
    crit_id = execute(
        "INSERT INTO Criteria (clubID) VALUES (%s)", (club_id,)
    )

    if ctype == "genre":
        genre     = data.get("genreName", "").strip()
        threshold = int(data.get("threshold", 1))
        if not genre:
            return jsonify({"error": "genreName required"}), 400
        if threshold <= 0:
            return jsonify({"error": "Threshold must be a strictly positive integer"}), 400
        execute(
            "INSERT INTO GenreCriteria (criteriaID, clubID, typeOfGenre, thresholdOfGenre) VALUES (%s,%s,%s,%s)",
            (crit_id, club_id, genre, threshold)
        )
    elif ctype == "celebrity":
        creator_id = data.get("creatorID")
        threshold  = int(data.get("threshold", 1))
        if not creator_id:
            return jsonify({"error": "creatorID required"}), 400
        if threshold <= 0:
            return jsonify({"error": "Threshold must be a strictly positive integer"}), 400
        execute(
            "INSERT INTO CelebrityCriteria (criteriaID, clubID, thresholdOfCelebrity, creatorID) VALUES (%s,%s,%s,%s)",
            (crit_id, club_id, threshold, creator_id)
        )
    elif ctype == "era":
        start     = data.get("startOfEra")
        end       = data.get("endOfEra")
        threshold = int(data.get("threshold", 1))
        if not start or not end:
            return jsonify({"error": "startOfEra and endOfEra required"}), 400
        if threshold <= 0:
            return jsonify({"error": "Threshold must be a strictly positive integer"}), 400
        execute(
            "INSERT INTO EraCriteria (criteriaID, clubID, startOfEra, endOfEra, thresholdOfEra) VALUES (%s,%s,%s,%s,%s)",
            (crit_id, club_id, start, end, threshold)
        )
    else:
        return jsonify({"error": "type must be genre, celebrity, or era"}), 400

    return jsonify({"ok": True, "criteriaID": crit_id}), 201


@bp.route("/api/clubs/<int:club_id>/criteria/<int:criteria_id>", methods=["DELETE"])
@token_required
def delete_criterion(club_id, criteria_id):
    uid  = request.current_user["userID"]
    club = query("SELECT moderatorID FROM Club WHERE clubID=%s", (club_id,), fetchone=True)
    if not club:
        return jsonify({"error": "Club not found"}), 404
    if club["moderatorID"] != uid and request.current_user.get("role") != "admin":
        return jsonify({"error": "Only the club moderator can manage criteria"}), 403
    execute("DELETE FROM Criteria WHERE criteriaID=%s AND clubID=%s", (criteria_id, club_id))
    return jsonify({"ok": True})


# ── Eligibility check ──────────────────────────────────────────────────────────

@bp.route("/api/clubs/<int:club_id>/eligibility", methods=["GET"])
@token_required
def check_eligibility(club_id):
    uid = request.current_user["userID"]
    eligible, missing = _check_eligibility(uid, club_id)
    return jsonify({"eligible": eligible, "missing": missing})


# ── Join / Leave ───────────────────────────────────────────────────────────────

@bp.route("/api/clubs/<int:club_id>/join", methods=["POST"])
@token_required
def join_club(club_id):
    uid = request.current_user["userID"]

    # Check if already a member
    if query("SELECT 1 FROM UserClub WHERE userID=%s AND clubID=%s", (uid, club_id), fetchone=True):
        return jsonify({"message": "Already a member"})

    # Enforce criteria
    eligible, missing = _check_eligibility(uid, club_id)
    if not eligible:
        return jsonify({
            "error": "You do not meet the requirements to join this club.",
            "missing": missing
        }), 403

    try:
        execute("INSERT INTO UserClub (userID,clubID,joinDate) VALUES (%s,%s,CURDATE())", (uid, club_id))
    except pymysql.err.IntegrityError:
        return jsonify({"message": "Already a member"})
    return jsonify({"message": "Joined club"})


@bp.route("/api/clubs/<int:club_id>/leave", methods=["DELETE"])
@token_required
def leave_club(club_id):
    uid = request.current_user["userID"]
    # Moderator cannot leave their own club
    club = query("SELECT moderatorID FROM Club WHERE clubID=%s", (club_id,), fetchone=True)
    if club and club["moderatorID"] == uid:
        return jsonify({"error": "Moderators cannot leave their own club. Transfer ownership first."}), 400
    execute("DELETE FROM UserClub WHERE userID=%s AND clubID=%s", (uid, club_id))
    return jsonify({"message": "Left club"})


# ── Members ────────────────────────────────────────────────────────────────────

@bp.route("/api/clubs/<int:club_id>/members", methods=["GET"])
def club_members(club_id):
    rows = query("""
        SELECT userID, username, joinDate
        FROM ClubMembersView
        WHERE clubID = %s
        ORDER BY joinDate
    """, (club_id,))
    for r in rows:
        if r.get("joinDate"): r["joinDate"] = str(r["joinDate"])
    return jsonify(rows)


@bp.route("/api/clubs/<int:club_id>/members/<int:target_uid>", methods=["DELETE"])
@token_required
def remove_member(club_id, target_uid):
    """Moderator or admin can remove a member."""
    uid  = request.current_user["userID"]
    club = query("SELECT moderatorID FROM Club WHERE clubID=%s", (club_id,), fetchone=True)
    if not club:
        return jsonify({"error": "Club not found"}), 404
    if club["moderatorID"] != uid and request.current_user.get("role") != "admin":
        return jsonify({"error": "Only the club moderator can remove members"}), 403
    if target_uid == club["moderatorID"]:
        return jsonify({"error": "Cannot remove the club moderator"}), 400
    execute("DELETE FROM UserClub WHERE userID=%s AND clubID=%s", (target_uid, club_id))
    return jsonify({"ok": True})


# ── My clubs ───────────────────────────────────────────────────────────────────

@bp.route("/api/clubs/mine", methods=["GET"])
@token_required
def my_clubs():
    uid = request.current_user["userID"]
    rows = query("""
        SELECT c.clubID, c.title, c.numOfMembers, c.moderatorID, uc.joinDate
        FROM UserClub uc
        JOIN Club c ON c.clubID = uc.clubID
        WHERE uc.userID = %s
    """, (uid,))
    for r in rows:
        if r.get("joinDate"): r["joinDate"] = str(r["joinDate"])
    return jsonify(rows)


@bp.route("/api/clubs/<int:club_id>/membership", methods=["GET"])
@token_required
def club_membership_status(club_id):
    uid = request.current_user["userID"]
    row = query("SELECT 1 FROM UserClub WHERE userID=%s AND clubID=%s", (uid, club_id), fetchone=True)
    return jsonify({"member": row is not None})
