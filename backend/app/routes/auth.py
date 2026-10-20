import re
from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from app.models import db
from app.models.user import User
from app.models.student import StudentProfile

auth_bp = Blueprint("auth", __name__)


def is_valid_email(email: str) -> bool:
    pattern = r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$"
    return bool(re.match(pattern, email))


@auth_bp.route("/register", methods=["POST"])
def register():
    """Register a new student or admin account."""
    data = request.get_json() or {}

    name = data.get("name", "").strip()
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")
    role = data.get("role", "student").strip().lower()

    if not name or len(name) < 2:
        return jsonify({"success": False, "error": "Validation Error", "message": "Name must be at least 2 characters."}), 400

    if not email or not is_valid_email(email):
        return jsonify({"success": False, "error": "Validation Error", "message": "A valid email address is required."}), 400

    if not password or len(password) < 6:
        return jsonify({"success": False, "error": "Validation Error", "message": "Password must be at least 6 characters long."}), 400

    if role not in ["student", "admin"]:
        role = "student"

    if User.query.filter_by(email=email).first():
        return jsonify({"success": False, "error": "Conflict", "message": "An account with this email already exists."}), 409

    try:
        user = User(name=name, email=email, role=role)
        user.set_password(password)
        db.session.add(user)
        db.session.flush()

        # If student, initialize an associated profile
        if role == "student":
            profile = StudentProfile(
                user_id=user.id,
                college=data.get("college", ""),
                degree=data.get("degree", ""),
                branch=data.get("branch", ""),
                graduation_year=data.get("graduation_year"),
                cgpa=data.get("cgpa"),
                technical_skills=data.get("technical_skills", []),
                soft_skills=data.get("soft_skills", []),
                preferred_roles=data.get("preferred_roles", []),
                preferred_locations=data.get("preferred_locations", []),
            )
            db.session.add(profile)

        db.session.commit()

        access_token = create_access_token(identity=str(user.id))
        return jsonify({
            "success": True,
            "message": "Registration successful.",
            "access_token": access_token,
            "user": user.to_dict(),
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({"success": False, "error": "Internal Error", "message": str(e)}), 500


@auth_bp.route("/login", methods=["POST"])
def login():
    """Authenticate existing user and return JWT access token."""
    data = request.get_json() or {}
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    if not email or not password:
        return jsonify({"success": False, "error": "Validation Error", "message": "Email and password are required."}), 400

    user = User.query.filter_by(email=email).first()
    if not user or not user.check_password(password):
        return jsonify({"success": False, "error": "Unauthorized", "message": "Invalid email or password."}), 401

    access_token = create_access_token(identity=str(user.id))
    return jsonify({
        "success": True,
        "message": "Login successful.",
        "access_token": access_token,
        "user": user.to_dict(),
    }), 200


@auth_bp.route("/me", methods=["GET"])
@jwt_required()
def me():
    """Retrieve details of the currently authenticated user."""
    user_id = int(get_jwt_identity())
    user = db.session.get(User, user_id)
    if not user:
        return jsonify({"success": False, "error": "Not Found", "message": "User not found."}), 404

    profile_dict = user.student_profile.to_dict() if user.student_profile else None
    return jsonify({
        "success": True,
        "user": user.to_dict(),
        "student_profile": profile_dict,
    }), 200
