def test_skill_gap_analysis(client, student_headers, sample_opportunity):
    res = client.post("/api/skill-gaps/analyze", headers=student_headers, json={
        "opportunity_id": sample_opportunity.id,
    })
    assert res.status_code == 200
    data = res.get_json()
    assert data["success"] is True
    analysis = data["analysis"]
    assert "Python" in analysis["matched_required_skills"]
    assert "React" in analysis["matched_required_skills"]
    assert "Docker" in analysis["matched_preferred_skills"]
    assert "AWS" in analysis["missing_preferred_skills"]
    assert len(analysis["learning_priorities"]) >= 1
    assert "coverage_percentage" in analysis
