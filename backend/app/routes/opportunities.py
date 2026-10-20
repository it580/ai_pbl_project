from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from app.models import db
from app.models.opportunity import Opportunity
from app.utils.auth_decorators import admin_required

opportunities_bp = Blueprint("opportunities", __name__)


@opportunities_bp.route("", methods=["GET"])
def list_opportunities():
    """
    Search and filter placement opportunities with pagination.
    Publicly accessible or usable by authenticated students and admins.
    """
    query = Opportunity.query

    # Keyword search
    search = request.args.get("search", "").strip()
    if search:
        search_filter = f"%{search}%"
        query = query.filter(
            db.or_(
                Opportunity.title.ilike(search_filter),
                Opportunity.company.ilike(search_filter),
                Opportunity.description.ilike(search_filter),
                Opportunity.location.ilike(search_filter),
            )
        )

    # Opportunity Type filter
    opp_type = request.args.get("opportunity_type", "").strip()
    if opp_type and opp_type.lower() != "all":
        query = query.filter(Opportunity.opportunity_type.ilike(opp_type))

    # Work Mode filter
    work_mode = request.args.get("work_mode", "").strip()
    if work_mode and work_mode.lower() != "all":
        query = query.filter(Opportunity.work_mode.ilike(work_mode))

    # Location filter
    location = request.args.get("location", "").strip()
    if location and location.lower() != "all":
        query = query.filter(Opportunity.location.ilike(f"%{location}%"))

    # Max allowed min_cgpa filter (e.g. show jobs where min_cgpa <= student_cgpa)
    max_cgpa_cutoff = request.args.get("max_min_cgpa")
    if max_cgpa_cutoff:
        try:
            query = query.filter(Opportunity.min_cgpa <= float(max_cgpa_cutoff))
        except (ValueError, TypeError):
            pass

    # Open / Closed filter
    is_open = request.args.get("is_open")
    if is_open is not None:
        if is_open.lower() in ["true", "1"]:
            query = query.filter_by(is_open=True)
        elif is_open.lower() in ["false", "0"]:
            query = query.filter_by(is_open=False)

    # Sorting
    sort_by = request.args.get("sort", "newest")
    if sort_by == "newest":
        query = query.order_by(Opportunity.created_at.desc())
    elif sort_by == "deadline":
        query = query.order_by(Opportunity.deadline.asc())
    elif sort_by == "cgpa_asc":
        query = query.order_by(Opportunity.min_cgpa.asc())
    elif sort_by == "cgpa_desc":
        query = query.order_by(Opportunity.min_cgpa.desc())
    elif sort_by == "company":
        query = query.order_by(Opportunity.company.asc())
    else:
        query = query.order_by(Opportunity.id.desc())

    # Pagination
    page = request.args.get("page", 1, type=int)
    limit = request.args.get("limit", 12, type=int)
    limit = min(max(limit, 1), 100)

    pagination = query.paginate(page=page, per_page=limit, error_out=False)

    # Distinct locations and types for filter dropdowns
    all_opps = Opportunity.query.all()
    distinct_locations = sorted(list({o.location for o in all_opps if o.location}))
    distinct_types = sorted(list({o.opportunity_type for o in all_opps if o.opportunity_type}))
    distinct_work_modes = sorted(list({o.work_mode for o in all_opps if o.work_mode}))

    return jsonify({
        "success": True,
        "opportunities": [opp.to_dict() for opp in pagination.items],
        "pagination": {
            "total": pagination.total,
            "page": pagination.page,
            "pages": pagination.pages,
            "limit": pagination.per_page,
            "has_next": pagination.has_next,
            "has_prev": pagination.has_prev,
        },
        "filters": {
            "locations": distinct_locations,
            "types": distinct_types,
            "work_modes": distinct_work_modes,
        },
    }), 200


@opportunities_bp.route("/<int:opp_id>", methods=["GET"])
def get_opportunity(opp_id):
    """Retrieve details of a single opportunity."""
    opp = db.session.get(Opportunity, opp_id)
    if not opp:
        return jsonify({"success": False, "error": "Not Found", "message": "Opportunity not found."}), 404

    return jsonify({
        "success": True,
        "opportunity": opp.to_dict(),
    }), 200


@opportunities_bp.route("", methods=["POST"])
@admin_required
def create_opportunity():
    """Create a new placement opportunity (Admin only)."""
    data = request.get_json() or {}

    required_fields = ["company", "title", "description", "salary_range"]
    for field in required_fields:
        if not data.get(field):
            return jsonify({
                "success": False,
                "error": "Validation Error",
                "message": f"Field '{field}' is mandatory.",
            }), 400

    try:
        opp = Opportunity(
            company=data["company"].strip(),
            title=data["title"].strip(),
            description=data["description"].strip(),
            opportunity_type=data.get("opportunity_type", "Full-Time"),
            industry=data.get("industry", "Technology"),
            required_skills=data.get("required_skills", []),
            preferred_skills=data.get("preferred_skills", []),
            min_cgpa=float(data.get("min_cgpa", 0.0)),
            max_backlogs=int(data.get("max_backlogs", 0)),
            eligible_branches=data.get("eligible_branches", ["All"]),
            eligible_degrees=data.get("eligible_degrees", ["B.Tech", "B.E.", "MCA"]),
            eligible_graduation_years=data.get("eligible_graduation_years", [2025, 2026]),
            experience_required_years=float(data.get("experience_required_years", 0.0)),
            location=data.get("location", "Bangalore"),
            work_mode=data.get("work_mode", "Hybrid"),
            salary_range=data["salary_range"].strip(),
            deadline=data.get("deadline"),
            application_url=data.get("application_url"),
            is_open=data.get("is_open", True),
        )
        db.session.add(opp)
        db.session.commit()

        return jsonify({
            "success": True,
            "message": "Placement opportunity created successfully.",
            "opportunity": opp.to_dict(),
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({"success": False, "error": "Database Error", "message": str(e)}), 500


@opportunities_bp.route("/<int:opp_id>", methods=["PUT"])
@admin_required
def update_opportunity(opp_id):
    """Update an existing placement opportunity (Admin only)."""
    opp = db.session.get(Opportunity, opp_id)
    if not opp:
        return jsonify({"success": False, "error": "Not Found", "message": "Opportunity not found."}), 404

    data = request.get_json() or {}

    fields = [
        "company", "title", "description", "opportunity_type", "industry",
        "required_skills", "preferred_skills", "eligible_branches", "eligible_degrees",
        "eligible_graduation_years", "location", "work_mode", "salary_range",
        "deadline", "application_url", "is_open"
    ]

    for f in fields:
        if f in data:
            setattr(opp, f, data[f])

    if "min_cgpa" in data:
        opp.min_cgpa = float(data["min_cgpa"])
    if "max_backlogs" in data:
        opp.max_backlogs = int(data["max_backlogs"])
    if "experience_required_years" in data:
        opp.experience_required_years = float(data["experience_required_years"])

    try:
        db.session.commit()
        return jsonify({
            "success": True,
            "message": "Opportunity updated successfully.",
            "opportunity": opp.to_dict(),
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"success": False, "error": "Database Error", "message": str(e)}), 500


@opportunities_bp.route("/<int:opp_id>", methods=["DELETE"])
@admin_required
def delete_opportunity(opp_id):
    """Delete an opportunity (Admin only)."""
    opp = db.session.get(Opportunity, opp_id)
    if not opp:
        return jsonify({"success": False, "error": "Not Found", "message": "Opportunity not found."}), 404

    try:
        db.session.delete(opp)
        db.session.commit()
        return jsonify({
            "success": True,
            "message": "Opportunity deleted successfully.",
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"success": False, "error": "Database Error", "message": str(e)}), 500
