from flask import Blueprint, request, jsonify
from db import query

bp = Blueprint("content", __name__)


@bp.route("/api/content", methods=["GET"])
def browse_content():
    genre    = request.args.get("genre")
    language = request.args.get("language")
    year     = request.args.get("year")
    ctype    = request.args.get("type")
    q        = request.args.get("q")
    limit    = int(request.args.get("limit", 20))
    offset   = int(request.args.get("offset", 0))

    sql = """
        SELECT contentID, title, genre, language, date, globalScore, criticScore,
               synopsis, duration, contentType
        FROM ContentBrowseView
        WHERE 1=1
    """
    params = []
    if genre:
        sql += " AND genre = %s";      params.append(genre)
    if language:
        sql += " AND language = %s";   params.append(language)
    if year:
        sql += " AND YEAR(date) = %s"; params.append(year)
    if ctype:
        sql += " AND contentType = %s"; params.append(ctype)
    if q:
        sql += " AND title LIKE %s";   params.append(f"%{q}%")
    sql += " ORDER BY globalScore DESC, date DESC LIMIT %s OFFSET %s"
    params += [limit, offset]

    rows = query(sql, params)
    for r in rows:
        if r.get("date"):
            r["date"] = str(r["date"])
    return jsonify(rows)


@bp.route("/api/content/<int:content_id>", methods=["GET"])
def content_detail(content_id):
    row = query("""
        SELECT c.contentID, c.title, c.date, c.producer, c.genre, c.language,
               c.globalScore, c.criticScore, c.weightedScore, c.duration, c.synopsis,
               cbv.contentType,
               AVG(rl.rating)   AS avgUserRating,
               COUNT(rl.userID) AS totalRatings
        FROM Content c
        LEFT JOIN ContentBrowseView cbv ON cbv.contentID = c.contentID
        LEFT JOIN RatingLog rl ON rl.contentID = c.contentID
        WHERE c.contentID = %s
        GROUP BY c.contentID, c.title, c.date, c.producer, c.genre, c.language,
                 c.globalScore, c.criticScore, c.weightedScore, c.duration, c.synopsis, cbv.contentType
    """, (content_id,), fetchone=True)
    if not row:
        return jsonify({"error": "Not found"}), 404
    if row.get("date"):
        row["date"] = str(row["date"])
    return jsonify(row)


@bp.route("/api/content/<int:content_id>/reviews", methods=["GET"])
def content_reviews(content_id):
    rows = query("""
        SELECT u.username, u.name, u.lastName, or2.reviewID,
               or2.points, or2.review, or2.criticUserID
        FROM OfficialReviews or2
        JOIN Users u ON u.userID = or2.criticUserID
        WHERE or2.contentID = %s
        ORDER BY or2.points DESC
    """, (content_id,))
    return jsonify(rows)


@bp.route("/api/content/<int:content_id>/cast", methods=["GET"])
def content_cast(content_id):
    rows = query("""
        SELECT acc.creatorID, acc.name, acc.role, acc.nationality, acc.numOfFollowers
        FROM TakePart tp
        JOIN ApprovedContentCreator acc ON acc.creatorID = tp.creatorID
        WHERE tp.contentID = %s
    """, (content_id,))
    return jsonify(rows)


@bp.route("/api/content/<int:content_id>/comments", methods=["GET"])
def content_comments(content_id):
    rows = query("""
        SELECT cl.commentID, u.username, cl.comment, cl.timestamp
        FROM CommentLog cl
        JOIN Users u ON u.userID = cl.userID
        WHERE cl.contentID = %s
        ORDER BY cl.timestamp DESC
    """, (content_id,))
    for r in rows:
        if r.get("timestamp"):
            r["timestamp"] = str(r["timestamp"])
    return jsonify(rows)


@bp.route("/api/content/<int:content_id>/episodes", methods=["GET"])
def content_episodes(content_id):
    from auth_utils import SECRET_KEY
    import jwt

    uid = None
    auth = request.headers.get("Authorization", "")
    if auth.startswith("Bearer "):
        token = auth[7:]
        try:
            data = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
            uid = data.get("userID")
        except:
            pass

    if uid:
        rows = query("""
            SELECT e.seasonNo, e.episodeNo, e.title, e.episodeRating, er.rating as userRating
            FROM Episode e
            LEFT JOIN EpisodeRatingLog er ON er.contentID = e.contentID 
                AND er.seasonNo = e.seasonNo AND er.episodeNo = e.episodeNo AND er.userID = %s
            WHERE e.contentID = %s
            ORDER BY e.seasonNo, e.episodeNo
        """, (uid, content_id))
    else:
        rows = query("""
            SELECT seasonNo, episodeNo, title, episodeRating, NULL as userRating
            FROM Episode
            WHERE contentID = %s
            ORDER BY seasonNo, episodeNo
        """, (content_id,))
    return jsonify(rows)


@bp.route("/api/genres", methods=["GET"])
def get_genres():
    rows = query("SELECT DISTINCT genre FROM Content WHERE genre IS NOT NULL ORDER BY genre")
    return jsonify([r["genre"] for r in rows])
