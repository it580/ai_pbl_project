from collections import Counter
from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.user import User
from app.models.student import StudentProfile
from app.models.opportunity import Opportunity
from app.models.application import Application
from app.models.saved_opportunity import SavedOpportunity
from app.services.recommendation_engine import RecommendationEngine, normalize_skill
from app.utils.auth_decorators import admin_required

analytics_bp = Blueprint("analytics", __name__)


@analytics_bp.route("/student-dashboard", methods=["GET"])
@jwt_required()
def get_student_dashboard_analytics():
    """Aggregate live metrics for the authenticated student's dashboard."""
    user_id = int(get_jwt_identity())
    student = StudentProfile.query.filter_by(user_id=user_id).first()
    if not student:
        return jsonify({"success": False, "error": "Not Found", "message": "Student profile not found."}), 404

    # 1. Profile Completeness
    completeness = student.calculate_completeness()

    # 2. Opportunities Pool
    all_opps = Opportunity.query.filter_by(is_open=True).all()

    # 3. Recommendations Analysis
    engine = RecommendationEngine()
    ranked = engine.rank_opportunities(student, all_opps)

    eligible = [r for r in ranked if r["eligibility_status"] == "Eligible"]
    potentially = [r for r in ranked if r["eligibility_status"] == "Potentially eligible"]
    avg_score = round(sum(r["compatibility_score"] for r in ranked) / len(ranked), 1) if ranked else 0.0

    # 4. Saved Opportunities
    saved_count = SavedOpportunity.query.filter_by(student_id=student.id).count()

    # 5. Applications Pipeline
    apps = Application.query.filter_by(student_id=student.id).all()
    apps_by_status = {}
    for a in apps:
        apps_by_status[a.status] = apps_by_status.get(a.status, 0) + 1

    # 6. Skill Market Demand vs Student Skills
    market_skills = Counter()
    for opp in all_opps:
        for s in (opp.required_skills or []):
            market_skills[s] += 2
        for s in (opp.preferred_skills or []):
            market_skills[s] += 1

    student_skills_set = {normalize_skill(s) for s in (student.technical_skills or []) if s}
    top_market_skills = []
    for skill_name, demand_count in market_skills.most_common(8):
        top_market_skills.append({
            "skill": skill_name,
            "demand_count": demand_count,
            "student_has": normalize_skill(skill_name) in student_skills_set,
        })

    # Recent applications (last 5)
    recent_apps = Application.query.filter_by(student_id=student.id).order_by(Application.updated_at.desc()).limit(5).all()

    return jsonify({
        "success": True,
        "metrics": {
            "profile_completeness": completeness["percentage"],
            "missing_fields": completeness["missing_fields"],
            "is_profile_complete": completeness["is_complete"],
            "total_open_opportunities": len(all_opps),
            "eligible_opportunities_count": len(eligible),
            "potentially_eligible_count": len(potentially),
            "average_compatibility": avg_score,
            "saved_opportunities_count": saved_count,
            "total_applications": len(apps),
            "offers_count": apps_by_status.get("Offer", 0),
            "interviews_count": apps_by_status.get("Interview", 0),
        },
        "applications_by_status": apps_by_status,
        "top_market_skills": top_market_skills,
        "top_recommendations": eligible[:4] if eligible else ranked[:4],
        "recent_applications": [a.to_dict() for a in recent_apps],
    }), 200


@analytics_bp.route("/admin-dashboard", methods=["GET"])
@admin_required
def get_admin_dashboard_analytics():
    """Aggregate system-wide placement statistics for administrator overview."""
    total_users = User.query.count()
    total_students = StudentProfile.query.count()
    total_opportunities = Opportunity.query.count()
    open_opportunities = Opportunity.query.filter_by(is_open=True).count()
    closed_opportunities = total_opportunities - open_opportunities
    total_applications = Application.query.count()

    # Applications by status
    all_apps = Application.query.all()
    status_counts = Counter(a.status for a in all_apps)

    # In-demand skills across all opportunities
    all_opps = Opportunity.query.all()
    skills_counter = Counter()
    roles_counter = Counter()
    locations_counter = Counter()

    for opp in all_opps:
        for s in (opp.required_skills or []):
            skills_counter[s] += 2
        for s in (opp.preferred_skills or []):
            skills_counter[s] += 1
        roles_counter[opp.title] += 1
        locations_counter[opp.location] += 1

    top_skills = [{"skill": s, "count": c} for s, c in skills_counter.most_common(10)]
    popular_roles = [{"role": r, "count": c} for r, c in roles_counter.most_common(6)]
    top_locations = [{"location": l, "count": c} for l, c in locations_counter.most_common(6)]

    # Academic benchmarks across students
    all_students = StudentProfile.query.all()
    cgpas = [s.cgpa for s in all_students if s.cgpa is not None]
    avg_cgpa = round(sum(cgpas) / len(cgpas), 2) if cgpas else 0.0

    return jsonify({
        "success": True,
        "metrics": {
            "total_users": total_users,
            "total_students": total_students,
            "total_opportunities": total_opportunities,
            "open_opportunities": open_opportunities,
            "closed_opportunities": closed_opportunities,
            "total_applications": total_applications,
            "total_offers": status_counts.get("Offer", 0),
            "average_student_cgpa": avg_cgpa,
        },
        "applications_by_status": dict(status_counts),
        "top_skills": top_skills,
        "popular_roles": popular_roles,
        "top_locations": top_locations,
    }), 200
