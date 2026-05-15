import os
import jwt
from datetime import datetime, timedelta, timezone
from functools import wraps
from flask import request, jsonify
from db import query

SECRET_KEY = os.environ.get("SECRET_KEY", "cinelog-secret-key-2024")


def create_token(user_id, username, role):
    payload = {
        "userID":   user_id,
        "username": username,
        "role":     role,
        "exp":      datetime.now(timezone.utc) + timedelta(hours=24),
    }
    return jwt.encode(payload, SECRET_KEY, algorithm="HS256")


def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        auth = request.headers.get("Authorization", "")
        if auth.startswith("Bearer "):
            token = auth[7:]
        if not token:
            return jsonify({"error": "Token missing"}), 401
        try:
            data = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
            request.current_user = data
        except jwt.ExpiredSignatureError:
            return jsonify({"error": "Token expired"}), 401
        except jwt.InvalidTokenError:
            return jsonify({"error": "Invalid token"}), 401
        return f(*args, **kwargs)
    return decorated


def admin_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        auth = request.headers.get("Authorization", "")
        if auth.startswith("Bearer "):
            token = auth[7:]
        if not token:
            return jsonify({"error": "Token missing"}), 401
        try:
            data = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
            request.current_user = data
        except jwt.ExpiredSignatureError:
            return jsonify({"error": "Token expired"}), 401
        except jwt.InvalidTokenError:
            return jsonify({"error": "Invalid token"}), 401
        if data.get("role") != "admin":
            return jsonify({"error": "Admin access required"}), 403
        return f(*args, **kwargs)
    return decorated


def get_user_role(user_id):
    # Check if user's email is registered as an admin
    user = query("SELECT email FROM Users WHERE userID=%s", (user_id,), fetchone=True)
    if user and query("SELECT 1 FROM Admin WHERE email=%s", (user["email"],), fetchone=True):
        return "admin"
    if query("SELECT 1 FROM Critics WHERE userID=%s", (user_id,), fetchone=True):
        return "critic"
    if query("SELECT 1 FROM StandardUsers WHERE userID=%s", (user_id,), fetchone=True):
        return "standard"
    return None
