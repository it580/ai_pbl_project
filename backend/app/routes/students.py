from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models import db
from app.models.user import User
from app.models.student import StudentProfile
from app.services.resume_service import ResumeService

students_bp = Blueprint("students", __name__)


@students_bp.route("/me", methods=["GET"])
@jwt_required()
def get_my_profile():
    """Get the current student's complete profile."""
    user_id = int(get_jwt_identity())
    student = StudentProfile.query.filter_by(user_id=user_id).first()
    if not student:
        return jsonify({"success": False, "error": "Not Found", "message": "Student profile not found."}), 404

    return jsonify({
        "success": True,
        "profile": student.to_dict(),
    }), 200


@students_bp.route("/me", methods=["PUT"])
@jwt_required()
def update_my_profile():
    """Update profile fields for the authenticated student."""
    user_id = int(get_jwt_identity())
    student = StudentProfile.query.filter_by(user_id=user_id).first()
    if not student:
        # Create if missing
        student = StudentProfile(user_id=user_id)
        db.session.add(student)

    data = request.get_json() or {}

    # Academic details
    if "college" in data:
        student.college = data["college"]
    if "degree" in data:
        student.degree = data["degree"]
    if "branch" in data:
        student.branch = data["branch"]
    if "graduation_year" in data:
        student.graduation_year = int(data["graduation_year"]) if data["graduation_year"] is not None else None
    if "cgpa" in data:
        try:
            student.cgpa = float(data["cgpa"]) if data["cgpa"] is not None else None
        except (ValueError, TypeError):
            pass
    if "backlogs_count" in data:
        try:
            student.backlogs_count = int(data["backlogs_count"]) if data["backlogs_count"] is not None else 0
        except (ValueError, TypeError):
            pass

    # Skills
    if "technical_skills" in data:
        student.technical_skills = list(data["technical_skills"]) if isinstance(data["technical_skills"], list) else []
    if "soft_skills" in data:
        student.soft_skills = list(data["soft_skills"]) if isinstance(data["soft_skills"], list) else []

    # Portfolio
    if "projects" in data:
        student.projects = list(data["projects"]) if isinstance(data["projects"], list) else []
    if "certifications" in data:
        student.certifications = list(data["certifications"]) if isinstance(data["certifications"], list) else []
    if "experience" in data:
        student.experience = list(data["experience"]) if isinstance(data["experience"], list) else []

    # Career Preferences
    if "preferred_roles" in data:
        student.preferred_roles = list(data["preferred_roles"]) if isinstance(data["preferred_roles"], list) else []
    if "preferred_industries" in data:
        student.preferred_industries = list(data["preferred_industries"]) if isinstance(data["preferred_industries"], list) else []
    if "preferred_locations" in data:
        student.preferred_locations = list(data["preferred_locations"]) if isinstance(data["preferred_locations"], list) else []
    if "preferred_work_mode" in data:
        student.preferred_work_mode = data["preferred_work_mode"]
    if "resume_text" in data:
        student.resume_text = data["resume_text"]

    try:
        db.session.commit()
        return jsonify({
            "success": True,
            "message": "Profile updated successfully.",
            "profile": student.to_dict(),
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"success": False, "error": "Database Error", "message": str(e)}), 500


@students_bp.route("/me/completeness", methods=["GET"])
@jwt_required()
def get_completeness():
    """Retrieve completeness metrics and missing information breakdown."""
    user_id = int(get_jwt_identity())
    student = StudentProfile.query.filter_by(user_id=user_id).first()
    if not student:
        return jsonify({"success": False, "error": "Not Found", "message": "Student profile not found."}), 404

    return jsonify({
        "success": True,
        "completeness": student.calculate_completeness(),
    }), 200


@students_bp.route("/me/parse-resume", methods=["POST"])
@jwt_required()
def parse_resume():
    """Parse resume text to auto-extract technical skills."""
    data = request.get_json() or {}
    text = data.get("resume_text", "")
    if not text:
        return jsonify({"success": False, "error": "Validation Error", "message": "Resume text is empty."}), 400

    extracted = ResumeService.extract_keywords(text)
    return jsonify({
        "success": True,
        "extracted_skills": extracted,
        "count": len(extracted),
    }), 200
