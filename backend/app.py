"""
CINELOG - Entertainment Discovery & Analytics Platform
Flask REST API Backend
CS 353-2 Database Systems - Group 4
"""

from flask import Flask, jsonify
from flask_cors import CORS

from db import query
from controllers import auth, content, watch, watchlist, social, clubs
from controllers import watchparty, challenges, reviews, badges, feed, profile, creators, admin

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

# ── Register blueprints ────────────────────────────────────────────────────────
app.register_blueprint(auth.bp)
app.register_blueprint(content.bp)
app.register_blueprint(watch.bp)
app.register_blueprint(watchlist.bp)
app.register_blueprint(social.bp)
app.register_blueprint(clubs.bp)
app.register_blueprint(watchparty.bp)
app.register_blueprint(challenges.bp)
app.register_blueprint(reviews.bp)
app.register_blueprint(badges.bp)
app.register_blueprint(feed.bp)
app.register_blueprint(profile.bp)
app.register_blueprint(creators.bp)
app.register_blueprint(admin.bp)

# ── Health check ───────────────────────────────────────────────────────────────
@app.route("/api/health", methods=["GET"])
def health():
    try:
        query("SELECT 1", fetchone=True)
        return jsonify({"status": "ok", "db": "connected"})
    except Exception as e:
        return jsonify({"status": "error", "detail": str(e)}), 500

# ── Response headers ───────────────────────────────────────────────────────────
@app.after_request
def add_no_cache_headers(response):
    response.headers["Cache-Control"] = "no-store, no-cache, must-revalidate, max-age=0"
    response.headers["Pragma"] = "no-cache"
    response.headers["Expires"] = "0"
    return response


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
