import bcrypt
from flask import Blueprint, request, jsonify
from db import query, execute
from auth_utils import create_token, get_user_role

bp = Blueprint("auth", __name__)


@bp.route("/api/auth/login", methods=["POST"])
def login():
    data = request.json or {}
    username = data.get("username", "").strip()
    password = data.get("password", "")
    if not username or not password:
        return jsonify({"error": "Username and password required"}), 400

    user = query(
        "SELECT userID, username, email, name, lastName, password_hash FROM Users WHERE username=%s",
        (username,), fetchone=True
    )
    if not user:
        return jsonify({"error": "Invalid credentials"}), 401

    try:
        pw_check = bcrypt.checkpw(password.encode(), user["password_hash"].encode())
    except Exception as e:
        print(f"DEBUG: bcrypt error: {e}")
        print(f"DEBUG: hash type: {type(user['password_hash'])}, value: {user['password_hash']}")
        return jsonify({"error": f"Auth error: {str(e)}"}), 500

    if not pw_check:
        return jsonify({"error": "Invalid credentials"}), 401

    role = get_user_role(user["userID"])
    token = create_token(user["userID"], user["username"], role)
    return jsonify({
        "token": token,
        "user": {
            "userID":   user["userID"],
            "username": user["username"],
            "email":    user["email"],
            "name":     user["name"],
            "lastName": user["lastName"],
            "role":     role,
        }
    })


@bp.route("/api/auth/register", methods=["POST"])
def register():
    data = request.json or {}
    required = ["username", "email", "password", "name", "lastName"]
    for field in required:
        if not data.get(field, "").strip():
            return jsonify({"error": f"{field} is required"}), 400

    if query("SELECT 1 FROM Users WHERE username=%s", (data["username"],), fetchone=True):
        return jsonify({"error": "Username already taken"}), 409
    if query("SELECT 1 FROM Users WHERE email=%s", (data["email"],), fetchone=True):
        return jsonify({"error": "Email already registered"}), 409

    pw_hash = bcrypt.hashpw(data["password"].encode(), bcrypt.gensalt()).decode()
    role = data.get("role", "standard")
    age  = data.get("age")

    uid = execute(
        "INSERT INTO Users (username,email,age,name,lastName,password_hash) VALUES (%s,%s,%s,%s,%s,%s)",
        (data["username"], data["email"], age, data["name"], data["lastName"], pw_hash)
    )
    if role == "critic":
        execute("INSERT INTO Critics (userID) VALUES (%s)", (uid,))
    else:
        execute("INSERT INTO StandardUsers (userID) VALUES (%s)", (uid,))

    token = create_token(uid, data["username"], role)
    return jsonify({
        "token": token,
        "user": {
            "userID":   uid,
            "username": data["username"],
            "email":    data["email"],
            "name":     data["name"],
            "lastName": data["lastName"],
            "role":     role,
        }
    }), 201
