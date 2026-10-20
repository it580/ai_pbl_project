from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.student import StudentProfile
from app.models.opportunity import Opportunity
from app.services.assistant_service import AssistantService

assistant_bp = Blueprint("assistant", __name__)


@assistant_bp.route("/chat", methods=["POST"])
@jwt_required()
def chat_assistant():
    """
    Career assistant conversational endpoint.
    Answers student questions grounded in their profile and the placement opportunities database.
    """
    user_id = int(get_jwt_identity())
    student = StudentProfile.query.filter_by(user_id=user_id).first()
    if not student:
        return jsonify({"success": False, "error": "Not Found", "message": "Student profile not found."}), 404

    data = request.get_json() or {}
    query = data.get("query", "").strip()
    if not query:
        return jsonify({"success": False, "error": "Validation Error", "message": "Query message cannot be empty."}), 400

    opportunities = Opportunity.query.filter_by(is_open=True).all()
    response_data = AssistantService.answer_query(student, opportunities, query)

    return jsonify({
        "success": True,
        "query": query,
        "assistant_reply": response_data["response"],
        "suggested_actions": response_data.get("suggested_actions", []),
        "opportunities": response_data.get("opportunities", []),
    }), 200
