from flask import Blueprint, request, jsonify
from db import query, execute
from auth_utils import token_required

bp = Blueprint("reviews", __name__)


@bp.route("/api/reviews", methods=["GET"])
@token_required
def my_reviews():
    uid = request.current_user["userID"]
    if request.current_user.get("role") != "critic":
        return jsonify({"error": "Critics only"}), 403
    rows = query("""
        SELECT or2.reviewID, or2.contentID, c.title,
               or2.points, or2.review
        FROM OfficialReviews or2
        JOIN Content c ON c.contentID = or2.contentID
        WHERE or2.criticUserID = %s
        ORDER BY or2.reviewID DESC
    """, (uid,))
    return jsonify(rows)


@bp.route("/api/reviews", methods=["POST"])
@token_required
def submit_review():
    uid = request.current_user["userID"]
    if request.current_user.get("role") != "critic":
        return jsonify({"error": "Critics only"}), 403
    data = request.json or {}
    content_id  = data.get("contentID")
    points      = data.get("points")
    review_text = data.get("review", "")
    if content_id is None or points is None:
        return jsonify({"error": "contentID and points required"}), 400

    existing = query(
        "SELECT reviewID FROM OfficialReviews WHERE criticUserID=%s AND contentID=%s",
        (uid, content_id), fetchone=True
    )
    if existing:
        execute("UPDATE OfficialReviews SET points=%s, review=%s WHERE reviewID=%s",
                (points, review_text, existing["reviewID"]))
        rid = existing["reviewID"]
    else:
        rid = execute(
            "INSERT INTO OfficialReviews (criticUserID,contentID,points,review) VALUES (%s,%s,%s,%s)",
            (uid, content_id, points, review_text)
        )
        execute("""
            UPDATE Critics
            SET reviewCount = reviewCount+1,
                avgPointsGiven = (SELECT AVG(points) FROM OfficialReviews WHERE criticUserID=%s)
            WHERE userID=%s
        """, (uid, uid))

    return jsonify({"reviewID": rid, "message": "Review saved"})


@bp.route("/api/reviews/<int:review_id>", methods=["PUT"])
@token_required
def edit_review(review_id):
    uid = request.current_user["userID"]
    if request.current_user.get("role") != "critic":
        return jsonify({"error": "Critics only"}), 403
    data = request.json or {}
    execute("""
        UPDATE OfficialReviews SET points=%s, review=%s
        WHERE reviewID=%s AND criticUserID=%s
    """, (data.get("points"), data.get("review", ""), review_id, uid))
    return jsonify({"message": "Review updated"})


@bp.route("/api/reviews/<int:review_id>", methods=["DELETE"])
@token_required
def delete_review(review_id):
    uid = request.current_user["userID"]
    execute("DELETE FROM OfficialReviews WHERE reviewID=%s AND criticUserID=%s", (review_id, uid))
    return jsonify({"message": "Review deleted"})
