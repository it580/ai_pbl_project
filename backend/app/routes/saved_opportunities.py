from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models import db
from app.models.student import StudentProfile
from app.models.opportunity import Opportunity
from app.models.saved_opportunity import SavedOpportunity

saved_opportunities_bp = Blueprint("saved_opportunities", __name__)


@saved_opportunities_bp.route("", methods=["GET"])
@jwt_required()
def list_saved_opportunities():
    """List all opportunities bookmarked by the authenticated student."""
    user_id = int(get_jwt_identity())
    student = StudentProfile.query.filter_by(user_id=user_id).first()
    if not student:
        return jsonify({"success": False, "error": "Not Found", "message": "Student profile not found."}), 404

    saved_items = SavedOpportunity.query.filter_by(student_id=student.id).order_by(SavedOpportunity.saved_at.desc()).all()

    return jsonify({
        "success": True,
        "saved_opportunities": [item.to_dict() for item in saved_items],
        "count": len(saved_items),
    }), 200


@saved_opportunities_bp.route("/<int:opp_id>", methods=["POST"])
@jwt_required()
def save_opportunity(opp_id):
    """Save/bookmark an opportunity for later review."""
    user_id = int(get_jwt_identity())
    student = StudentProfile.query.filter_by(user_id=user_id).first()
    if not student:
        return jsonify({"success": False, "error": "Not Found", "message": "Student profile not found."}), 404

    opportunity = db.session.get(Opportunity, opp_id)
    if not opportunity:
        return jsonify({"success": False, "error": "Not Found", "message": "Opportunity not found."}), 404

    existing = SavedOpportunity.query.filter_by(student_id=student.id, opportunity_id=opp_id).first()
    if existing:
        return jsonify({
            "success": True,
            "message": "Opportunity is already saved.",
            "saved_opportunity": existing.to_dict(),
        }), 200

    try:
        saved = SavedOpportunity(student_id=student.id, opportunity_id=opp_id)
        db.session.add(saved)
        db.session.commit()

        return jsonify({
            "success": True,
            "message": f"Successfully bookmarked {opportunity.title} at {opportunity.company}.",
            "saved_opportunity": saved.to_dict(),
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({"success": False, "error": "Database Error", "message": str(e)}), 500


@saved_opportunities_bp.route("/<int:opp_id>", methods=["DELETE"])
@jwt_required()
def unsave_opportunity(opp_id):
    """Remove an opportunity from saved bookmarks."""
    user_id = int(get_jwt_identity())
    student = StudentProfile.query.filter_by(user_id=user_id).first()
    if not student:
        return jsonify({"success": False, "error": "Not Found", "message": "Student profile not found."}), 404

    saved = SavedOpportunity.query.filter_by(student_id=student.id, opportunity_id=opp_id).first()
    if not saved:
        return jsonify({"success": False, "error": "Not Found", "message": "Opportunity was not bookmarked."}), 404

    try:
        db.session.delete(saved)
        db.session.commit()
        return jsonify({
            "success": True,
            "message": "Opportunity removed from saved list.",
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"success": False, "error": "Database Error", "message": str(e)}), 500
