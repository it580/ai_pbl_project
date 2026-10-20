from flask import Blueprint, jsonify, request
from app.models.user import User
from app.models.student import StudentProfile
from app.models.application import Application
from app.utils.auth_decorators import admin_required

admin_bp = Blueprint("admin", __name__)


@admin_bp.route("/users", methods=["GET"])
@admin_required
def list_users():
    """List registered users with pagination (Admin only)."""
    page = request.args.get("page", 1, type=int)
    limit = request.args.get("limit", 20, type=int)

    pagination = User.query.order_by(User.id.desc()).paginate(page=page, per_page=limit, error_out=False)

    return jsonify({
        "success": True,
        "users": [u.to_dict() for u in pagination.items],
        "total": pagination.total,
        "pages": pagination.pages,
        "current_page": pagination.page,
    }), 200


@admin_bp.route("/students", methods=["GET"])
@admin_required
def list_students():
    """List all student profiles with academic summaries (Admin only)."""
    students = StudentProfile.query.all()
    return jsonify({
        "success": True,
        "students": [s.to_dict() for s in students],
        "count": len(students),
    }), 200


@admin_bp.route("/applications", methods=["GET"])
@admin_required
def list_all_applications():
    """List all student applications across the institution (Admin only)."""
    apps = Application.query.order_by(Application.created_at.desc()).all()
    return jsonify({
        "success": True,
        "applications": [a.to_dict() for a in apps],
        "count": len(apps),
    }), 200
