from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models import db
from app.models.student import StudentProfile
from app.models.opportunity import Opportunity
from app.services.recommendation_engine import RecommendationEngine

recommendations_bp = Blueprint("recommendations", __name__)


@recommendations_bp.route("", methods=["GET"])
@recommendations_bp.route("/generate", methods=["POST"])
@jwt_required()
def get_recommendations():
    """
    Generate personalized recommendations for the logged-in student.
    Ranks opportunities by eligibility gate and multi-factor weighted score.
    """
    user_id = int(get_jwt_identity())
    student = StudentProfile.query.filter_by(user_id=user_id).first()
    if not student:
        return jsonify({"success": False, "error": "Not Found", "message": "Student profile not found. Please complete onboarding."}), 404

    # Optional custom weights from request body
    custom_weights = None
    if request.method == "POST":
        data = request.get_json(silent=True) or {}
        custom_weights = data.get("weights")

    engine = RecommendationEngine(weights=custom_weights)

    # Fetch open opportunities
    opportunities = Opportunity.query.filter_by(is_open=True).all()

    # Calculate recommendations
    ranked = engine.rank_opportunities(student, opportunities)

    eligible_list = [r for r in ranked if r["eligibility_status"] == "Eligible"]
    potentially_list = [r for r in ranked if r["eligibility_status"] == "Potentially eligible"]
    ineligible_list = [r for r in ranked if r["eligibility_status"] == "Not eligible"]

    # Filter by minimum score if query parameter present
    min_score = request.args.get("min_score", type=float)
    if min_score is not None:
        ranked = [r for r in ranked if r["compatibility_score"] >= min_score]

    # Category filter
    category = request.args.get("category")
    if category and category.lower() != "all":
        ranked = [r for r in ranked if r["score_category"].lower() == category.lower()]

    # Eligibility filter
    elig_filter = request.args.get("eligibility")
    if elig_filter and elig_filter.lower() != "all":
        ranked = [r for r in ranked if r["eligibility_status"].lower() == elig_filter.lower()]

    return jsonify({
        "success": True,
        "recommendations": ranked,
        "summary": {
            "total_evaluated": len(opportunities),
            "eligible_count": len(eligible_list),
            "potentially_eligible_count": len(potentially_list),
            "ineligible_count": len(ineligible_list),
            "average_compatibility": round(
                sum(r["compatibility_score"] for r in ranked) / len(ranked) if ranked else 0.0,
                1,
            ),
            "top_match": eligible_list[0] if eligible_list else (ranked[0] if ranked else None),
        },
        "weights_applied": engine.weights,
    }), 200


@recommendations_bp.route("/<int:opp_id>/explanation", methods=["GET"])
@jwt_required()
def get_recommendation_explanation(opp_id):
    """Retrieve detailed scoring and eligibility explanation for a single opportunity."""
    user_id = int(get_jwt_identity())
    student = StudentProfile.query.filter_by(user_id=user_id).first()
    if not student:
        return jsonify({"success": False, "error": "Not Found", "message": "Student profile not found."}), 404

    opportunity = db.session.get(Opportunity, opp_id)
    if not opportunity:
        return jsonify({"success": False, "error": "Not Found", "message": "Opportunity not found."}), 404

    engine = RecommendationEngine()
    result = engine.calculate_compatibility(student, opportunity)

    return jsonify({
        "success": True,
        "recommendation_detail": result,
    }), 200
