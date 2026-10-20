from app.models import db
from app.models.opportunity import Opportunity
from app.services.recommendation_engine import RecommendationEngine
from app.services.eligibility_service import EligibilityService


def test_recommendation_ranking_and_scoring(client, student_headers, sample_opportunity):
    res = client.get("/api/recommendations", headers=student_headers)
    assert res.status_code == 200
    data = res.get_json()
    assert data["success"] is True
    recs = data["recommendations"]
    assert len(recs) >= 1

    top = recs[0]
    assert top["eligibility_status"] == "Eligible"
    assert top["compatibility_score"] > 70.0
    assert "Python" in top["matched_required_skills"]
    assert "explanation" in top
    assert len(top["suggested_next_steps"]) >= 1


def test_eligibility_gates(student_user):
    profile = student_user.student_profile

    # Case 1: Ineligible due to higher CGPA requirement (e.g. 9.0 min while student has 8.5)
    opp_high_cgpa = Opportunity(
        company="Quant Hedge Fund",
        title="Quant Developer",
        description="Elite algorithms.",
        min_cgpa=9.0,
        max_backlogs=0,
        required_skills=["Python"],
        salary_range="₹25 LPA",
    )
    result = EligibilityService.evaluate(profile, opp_high_cgpa)
    assert result["status"] == "Not eligible"
    assert any("CGPA" in f["criterion"] for f in result["failed_criteria"])

    # Case 2: Ineligible due to backlog restriction (student has 1 backlog, opp allows 0)
    profile.backlogs_count = 1
    opp_zero_backlog = Opportunity(
        company="Strict Policy Tech",
        title="Software Engineer",
        description="Strict zero backlog policy.",
        min_cgpa=7.0,
        max_backlogs=0,
        salary_range="₹8 LPA",
    )
    result_backlog = EligibilityService.evaluate(profile, opp_zero_backlog)
    assert result_backlog["status"] == "Not eligible"
    assert any("Backlogs" in f["criterion"] for f in result_backlog["failed_criteria"])

    # Case 3: Potentially eligible due to missing degree in student profile
    profile.backlogs_count = 0
    profile.degree = None
    opp_degree_req = Opportunity(
        company="Degree Specific Inc",
        title="Engineer",
        description="Requires M.Tech only.",
        eligible_degrees=["M.Tech"],
        min_cgpa=6.0,
        salary_range="₹8 LPA",
    )
    result_missing = EligibilityService.evaluate(profile, opp_degree_req)
    assert result_missing["status"] == "Potentially eligible"
    assert any("Degree" in m["criterion"] for m in result_missing["missing_criteria"])
