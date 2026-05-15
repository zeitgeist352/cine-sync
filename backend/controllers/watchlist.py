import pymysql.err
from flask import Blueprint, request, jsonify
from db import query, execute
from auth_utils import token_required

bp = Blueprint("watchlist", __name__)


@bp.route("/api/watchlists", methods=["GET"])
@token_required
def get_watchlists():
    uid = request.current_user["userID"]
    rows = query("""
        SELECT watchListID, title, visibility, contentCount
        FROM WatchListSummary
        WHERE userID = %s
        ORDER BY title
    """, (uid,))
    return jsonify(rows)


@bp.route("/api/watchlists", methods=["POST"])
@token_required
def create_watchlist():
    data = request.json or {}
    title      = data.get("title", "").strip()
    visibility = data.get("visibility", "public")
    if not title:
        return jsonify({"error": "Title required"}), 400
    uid = request.current_user["userID"]
    wid = execute(
        "INSERT INTO WatchList (userID,title,visibility,numOfContent) VALUES (%s,%s,%s,0)",
        (uid, title, visibility)
    )
    return jsonify({"watchListID": wid, "title": title, "visibility": visibility}), 201


@bp.route("/api/watchlists/<int:wid>", methods=["DELETE"])
@token_required
def delete_watchlist(wid):
    uid = request.current_user["userID"]
    wl = query("SELECT 1 FROM WatchList WHERE watchListID=%s AND userID=%s", (wid, uid), fetchone=True)
    if not wl:
        return jsonify({"error": "Not found or not yours"}), 404
    execute("DELETE FROM WatchList WHERE watchListID=%s", (wid,))
    return jsonify({"message": "Watchlist deleted"})


@bp.route("/api/watchlists/<int:wid>/contents", methods=["GET"])
def get_watchlist_contents(wid):
    rows = query("""
        SELECT c.contentID, c.title, c.genre, c.date, c.globalScore,
               cbv.contentType
        FROM WatchListContent wlc
        JOIN Content c ON c.contentID = wlc.contentID
        LEFT JOIN ContentBrowseView cbv ON cbv.contentID = c.contentID
        WHERE wlc.watchListID = %s
    """, (wid,))
    for r in rows:
        if r.get("date"): r["date"] = str(r["date"])
    return jsonify(rows)


@bp.route("/api/watchlists/<int:wid>/contents", methods=["POST"])
@token_required
def add_to_watchlist(wid):
    uid = request.current_user["userID"]
    wl = query("SELECT 1 FROM WatchList WHERE watchListID=%s AND userID=%s", (wid, uid), fetchone=True)
    if not wl:
        return jsonify({"error": "Watchlist not found or not yours"}), 404
    data = request.json or {}
    cid = data.get("contentID")
    if not cid:
        return jsonify({"error": "contentID required"}), 400
    try:
        execute("INSERT INTO WatchListContent (watchListID,contentID) VALUES (%s,%s)", (wid, cid))
    except pymysql.err.IntegrityError:
        return jsonify({"message": "Already in watchlist"})
    return jsonify({"message": "Added to watchlist"})


@bp.route("/api/watchlists/<int:wid>/contents/<int:cid>", methods=["DELETE"])
@token_required
def remove_from_watchlist(wid, cid):
    uid = request.current_user["userID"]
    wl = query("SELECT 1 FROM WatchList WHERE watchListID=%s AND userID=%s", (wid, uid), fetchone=True)
    if not wl:
        return jsonify({"error": "Not found or not yours"}), 404
    execute("DELETE FROM WatchListContent WHERE watchListID=%s AND contentID=%s", (wid, cid))
    return jsonify({"message": "Removed from watchlist"})
