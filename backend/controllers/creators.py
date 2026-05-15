from flask import Blueprint, request, jsonify
from db import query

bp = Blueprint("creators", __name__)


@bp.route("/api/creators", methods=["GET"])
def get_creators():
    q    = request.args.get("q", "").strip()
    role = request.args.get("role", "").strip()
    sql  = """
        SELECT acc.creatorID, acc.name, acc.role, acc.nationality, acc.age, acc.gender,
               COUNT(f.userID) AS numOfFollowers
        FROM ApprovedContentCreator acc
        LEFT JOIN Follow f ON f.creatorID = acc.creatorID
        WHERE 1=1
    """
    params = []
    if q:
        sql += " AND (acc.name LIKE %s OR acc.role LIKE %s)"
        params += [f"%{q}%", f"%{q}%"]
    if role:
        sql += " AND acc.role LIKE %s"
        params.append(f"%{role}%")
    sql += " GROUP BY acc.creatorID, acc.name, acc.role, acc.nationality, acc.age, acc.gender"
    sql += " ORDER BY numOfFollowers DESC, acc.name LIMIT 60"
    rows = query(sql, params)
    return jsonify(rows)


@bp.route("/api/creators/roles", methods=["GET"])
def get_creator_roles():
    rows = query("SELECT DISTINCT role FROM ApprovedContentCreator WHERE role IS NOT NULL ORDER BY role")
    return jsonify([r["role"] for r in rows])


@bp.route("/api/creators/<int:creator_id>", methods=["GET"])
def get_creator(creator_id):
    row = query("""
        SELECT acc.creatorID, acc.name, acc.role, acc.nationality, acc.age, acc.gender,
               COUNT(f.userID) AS numOfFollowers
        FROM ApprovedContentCreator acc
        LEFT JOIN Follow f ON f.creatorID = acc.creatorID
        WHERE acc.creatorID = %s
        GROUP BY acc.creatorID, acc.name, acc.role, acc.nationality, acc.age, acc.gender
    """, (creator_id,), fetchone=True)
    if not row:
        return jsonify({"error": "Creator not found"}), 404
    return jsonify(row)


@bp.route("/api/creators/<int:creator_id>/content", methods=["GET"])
def creator_content(creator_id):
    rows = query("""
        SELECT c.contentID, c.title, c.genre, c.date, c.globalScore,
               cbv.contentType
        FROM TakePart tp
        JOIN Content c ON c.contentID = tp.contentID
        LEFT JOIN ContentBrowseView cbv ON cbv.contentID = c.contentID
        WHERE tp.creatorID = %s
        ORDER BY c.date DESC
    """, (creator_id,))
    for r in rows:
        if r.get("date"): r["date"] = str(r["date"])
    return jsonify(rows)
