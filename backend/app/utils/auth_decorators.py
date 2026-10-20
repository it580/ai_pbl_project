from functools import wraps
from flask import jsonify
from flask_jwt_extended import get_jwt_identity, verify_jwt_in_request
from app.models import db
from app.models.user import User


def get_current_user():
    """Retrieve current authenticated User model instance."""
    user_id = get_jwt_identity()
    if not user_id:
        return None
    return db.session.get(User, user_id)


def admin_required(fn):
    """Decorator ensuring endpoint is only accessible to users with admin role."""
    @wraps(fn)
    def wrapper(*args, **kwargs):
        verify_jwt_in_request()
        user_id = get_jwt_identity()
        user = db.session.get(User, user_id)
        if not user or user.role != "admin":
            return jsonify({
                "success": False,
                "error": "Forbidden",
                "message": "Administrator privileges are required for this action."
            }), 403
        return fn(*args, **kwargs)
    return wrapper


def student_required(fn):
    """Decorator ensuring endpoint is accessed by an authenticated student."""
    @wraps(fn)
    def wrapper(*args, **kwargs):
        verify_jwt_in_request()
        user_id = get_jwt_identity()
        user = db.session.get(User, user_id)
        if not user:
            return jsonify({
                "success": False,
                "error": "Unauthorized",
                "message": "User account not found."
            }), 401
        if user.role != "student":
            return jsonify({
                "success": False,
                "error": "Forbidden",
                "message": "This resource is intended for student accounts."
            }), 403
        return fn(*args, **kwargs)
    return wrapper
