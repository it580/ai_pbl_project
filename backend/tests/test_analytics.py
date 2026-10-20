def test_student_dashboard_analytics(client, student_headers, sample_opportunity):
    res = client.get("/api/analytics/student-dashboard", headers=student_headers)
    assert res.status_code == 200
    data = res.get_json()
    assert data["success"] is True
    assert "metrics" in data
    assert "profile_completeness" in data["metrics"]
    assert "top_recommendations" in data


def test_admin_dashboard_analytics(client, admin_headers, sample_opportunity):
    res = client.get("/api/analytics/admin-dashboard", headers=admin_headers)
    assert res.status_code == 200
    data = res.get_json()
    assert data["success"] is True
    assert "metrics" in data
    assert data["metrics"]["total_opportunities"] >= 1
    assert "top_skills" in data
