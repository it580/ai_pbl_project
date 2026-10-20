from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models import db
from app.models.student import StudentProfile
from app.models.opportunity import Opportunity
from app.services.skill_gap_service import SkillGapService

skill_gaps_bp = Blueprint("skill_gaps", __name__)


@skill_gaps_bp.route("/analyze", methods=["GET", "POST"])
@jwt_required()
def analyze_skill_gap():
    """
    Perform deep skill gap analysis between authenticated student and a selected opportunity.
    Accepts opportunity_id via JSON body or query parameter.
    """
    user_id = int(get_jwt_identity())
    student = StudentProfile.query.filter_by(user_id=user_id).first()
    if not student:
        return jsonify({"success": False, "error": "Not Found", "message": "Student profile not found."}), 404

    opp_id = None
    if request.method == "POST":
        data = request.get_json(silent=True) or {}
        opp_id = data.get("opportunity_id")

    if not opp_id:
        opp_id = request.args.get("opportunity_id", type=int)

    if not opp_id:
        return jsonify({"success": False, "error": "Validation Error", "message": "An opportunity_id is required."}), 400

    opportunity = db.session.get(Opportunity, opp_id)
    if not opportunity:
        return jsonify({"success": False, "error": "Not Found", "message": "Opportunity not found."}), 404

    analysis = SkillGapService.analyze(student, opportunity)

    return jsonify({
        "success": True,
        "analysis": analysis,
    }), 200
