from flask import Blueprint, request, jsonify
from db import query, execute
from auth_utils import token_required

bp = Blueprint("feed", __name__)


@bp.route("/api/feed", methods=["GET"])
@token_required
def get_feed():
    uid = request.current_user["userID"]
    rows = query("""
        SELECT c.contentID, c.title, c.genre, c.globalScore,
               f.mainCategory, f.feedID
        FROM Feed f
        JOIN ShortContent_Feed_Stream sfs ON sfs.feedID = f.feedID
        JOIN Content c ON c.contentID = sfs.contentID
        WHERE f.userID = %s
          AND c.contentID NOT IN (SELECT contentID FROM WatchLog WHERE userID = %s)
        ORDER BY c.globalScore DESC
    """, (uid, uid))
    if not rows:
        _generate_feed(uid)
        rows = query("""
            SELECT c.contentID, c.title, c.genre, c.globalScore, f.mainCategory
            FROM Feed f
            JOIN ShortContent_Feed_Stream sfs ON sfs.feedID = f.feedID
            JOIN Content c ON c.contentID = sfs.contentID
            WHERE f.userID = %s
              AND c.contentID NOT IN (SELECT contentID FROM WatchLog WHERE userID = %s)
            ORDER BY c.globalScore DESC
        """, (uid, uid))
    for r in rows:
        if r.get("date"): r["date"] = str(r["date"])
    return jsonify(rows)


@bp.route("/api/feed/refresh", methods=["POST"])
@token_required
def refresh_feed():
    uid = request.current_user["userID"]
    old_feeds = query("SELECT feedID FROM Feed WHERE userID=%s", (uid,))
    for f in old_feeds:
        execute("DELETE FROM ShortContent_Feed_Stream WHERE feedID=%s", (f["feedID"],))
    execute("DELETE FROM Feed WHERE userID=%s", (uid,))
    _generate_feed(uid)
    return jsonify({"message": "Feed refreshed"})


def _generate_feed(uid):
    top_genres = query("""
        SELECT c.genre
        FROM WatchLog w JOIN Content c ON c.contentID = w.contentID
        WHERE w.userID = %s AND c.genre IS NOT NULL
        GROUP BY c.genre ORDER BY COUNT(*) DESC LIMIT 3
    """, (uid,))

    top_creators = query("""
        SELECT acc.creatorID
        FROM WatchLog w
        JOIN TakePart tp ON tp.contentID = w.contentID
        JOIN ApprovedContentCreator acc ON acc.creatorID = tp.creatorID
        WHERE w.userID = %s
        GROUP BY acc.creatorID ORDER BY COUNT(*) DESC LIMIT 3
    """, (uid,))

    fid = execute("INSERT INTO Feed (mainCategory,numOfContents,userID) VALUES ('Personalised',0,%s)", (uid,))

    added = set()
    for g in top_genres:
        shorts = query("""
            SELECT sc.contentID FROM ShortContents sc
            JOIN Content c ON c.contentID = sc.contentID
            WHERE c.genre = %s
              AND sc.contentID NOT IN (SELECT contentID FROM WatchLog WHERE userID = %s)
            ORDER BY c.globalScore DESC LIMIT 10
        """, (g["genre"], uid))
        for s in shorts:
            if s["contentID"] not in added:
                try:
                    execute("INSERT INTO ShortContent_Feed_Stream (contentID,feedID) VALUES (%s,%s)", (s["contentID"], fid))
                    added.add(s["contentID"])
                except:
                    pass

    for cr in top_creators:
        shorts = query("""
            SELECT sc.contentID FROM ShortContents sc
            JOIN TakePart tp ON tp.contentID = sc.contentID
            WHERE tp.creatorID = %s
              AND sc.contentID NOT IN (SELECT contentID FROM WatchLog WHERE userID = %s)
            ORDER BY (SELECT globalScore FROM Content WHERE contentID=sc.contentID) DESC LIMIT 5
        """, (cr["creatorID"], uid))
        for s in shorts:
            if s["contentID"] not in added:
                try:
                    execute("INSERT INTO ShortContent_Feed_Stream (contentID,feedID) VALUES (%s,%s)", (s["contentID"], fid))
                    added.add(s["contentID"])
                except:
                    pass

    if not added:
        all_shorts = query("""
            SELECT sc.contentID FROM ShortContents sc
            WHERE sc.contentID NOT IN (SELECT contentID FROM WatchLog WHERE userID = %s)
            LIMIT 20
        """, (uid,))
        for s in all_shorts:
            try:
                execute("INSERT INTO ShortContent_Feed_Stream (contentID,feedID) VALUES (%s,%s)", (s["contentID"], fid))
            except:
                pass

    execute("""
        UPDATE Feed SET numOfContents=(SELECT COUNT(*) FROM ShortContent_Feed_Stream WHERE feedID=%s)
        WHERE feedID=%s
    """, (fid, fid))
