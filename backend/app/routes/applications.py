from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models import db
from app.models.student import StudentProfile
from app.models.opportunity import Opportunity
from app.models.application import Application

applications_bp = Blueprint("applications", __name__)

VALID_STATUSES = [
    "Saved",
    "Planning to Apply",
    "Applied",
    "Assessment",
    "Interview",
    "Offer",
    "Rejected",
    "Withdrawn",
]


@applications_bp.route("", methods=["GET"])
@jwt_required()
def list_applications():
    """List all application records tracked by the student."""
    user_id = int(get_jwt_identity())
    student = StudentProfile.query.filter_by(user_id=user_id).first()
    if not student:
        return jsonify({"success": False, "error": "Not Found", "message": "Student profile not found."}), 404

    query = Application.query.filter_by(student_id=student.id)

    status_filter = request.args.get("status")
    if status_filter and status_filter.lower() != "all":
        query = query.filter(Application.status.ilike(status_filter))

    apps = query.order_by(Application.updated_at.desc()).all()

    # Aggregate status counts
    counts_by_status = {}
    for st in VALID_STATUSES:
        counts_by_status[st] = 0
    for app in apps:
        counts_by_status[app.status] = counts_by_status.get(app.status, 0) + 1

    return jsonify({
        "success": True,
        "applications": [a.to_dict() for a in apps],
        "total": len(apps),
        "status_counts": counts_by_status,
    }), 200


@applications_bp.route("", methods=["POST"])
@jwt_required()
def create_application():
    """Record an application to an opportunity."""
    user_id = int(get_jwt_identity())
    student = StudentProfile.query.filter_by(user_id=user_id).first()
    if not student:
        return jsonify({"success": False, "error": "Not Found", "message": "Student profile not found."}), 404

    data = request.get_json() or {}
    opp_id = data.get("opportunity_id")
    if not opp_id:
        return jsonify({"success": False, "error": "Validation Error", "message": "opportunity_id is required."}), 400

    opportunity = db.session.get(Opportunity, opp_id)
    if not opportunity:
        return jsonify({"success": False, "error": "Not Found", "message": "Opportunity not found."}), 404

    status = data.get("status", "Applied")
    if status not in VALID_STATUSES:
        status = "Applied"

    existing = Application.query.filter_by(student_id=student.id, opportunity_id=opp_id).first()
    if existing:
        return jsonify({
            "success": False,
            "error": "Conflict",
            "message": "You have already recorded an application for this opportunity.",
            "application": existing.to_dict(),
        }), 409

    try:
        app_record = Application(
            student_id=student.id,
            opportunity_id=opp_id,
            status=status,
            notes=data.get("notes", ""),
            interview_date=data.get("interview_date"),
        )
        db.session.add(app_record)
        db.session.commit()

        return jsonify({
            "success": True,
            "message": f"Application to {opportunity.company} recorded successfully.",
            "application": app_record.to_dict(),
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({"success": False, "error": "Database Error", "message": str(e)}), 500


@applications_bp.route("/<int:app_id>", methods=["PATCH"])
@jwt_required()
def update_application(app_id):
    """Update application status, notes, or interview date."""
    user_id = int(get_jwt_identity())
    student = StudentProfile.query.filter_by(user_id=user_id).first()
    if not student:
        return jsonify({"success": False, "error": "Not Found", "message": "Student profile not found."}), 404

    app_record = db.session.get(Application, app_id)
    if not app_record:
        return jsonify({"success": False, "error": "Not Found", "message": "Application record not found."}), 404

    # Authorization: Student must own the application
    if app_record.student_id != student.id:
        return jsonify({"success": False, "error": "Forbidden", "message": "You do not have permission to modify this application."}), 403

    data = request.get_json() or {}

    if "status" in data:
        new_status = data["status"]
        if new_status in VALID_STATUSES:
            app_record.status = new_status
        else:
            return jsonify({"success": False, "error": "Validation Error", "message": f"Invalid status '{new_status}'."}), 400

    if "notes" in data:
        app_record.notes = data["notes"]

    if "interview_date" in data:
        app_record.interview_date = data["interview_date"]

    try:
        db.session.commit()
        return jsonify({
            "success": True,
            "message": "Application status updated successfully.",
            "application": app_record.to_dict(),
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"success": False, "error": "Database Error", "message": str(e)}), 500


@applications_bp.route("/<int:app_id>", methods=["DELETE"])
@jwt_required()
def delete_application(app_id):
    """Withdraw or delete an application record."""
    user_id = int(get_jwt_identity())
    student = StudentProfile.query.filter_by(user_id=user_id).first()
    if not student:
        return jsonify({"success": False, "error": "Not Found", "message": "Student profile not found."}), 404

    app_record = db.session.get(Application, app_id)
    if not app_record:
        return jsonify({"success": False, "error": "Not Found", "message": "Application record not found."}), 404

    if app_record.student_id != student.id:
        return jsonify({"success": False, "error": "Forbidden", "message": "You cannot delete another student's application."}), 403

    try:
        db.session.delete(app_record)
        db.session.commit()
        return jsonify({
            "success": True,
            "message": "Application record removed successfully.",
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"success": False, "error": "Database Error", "message": str(e)}), 500
