def test_list_opportunities(client, sample_opportunity):
    res = client.get("/api/opportunities")
    assert res.status_code == 200
    data = res.get_json()
    assert data["success"] is True
    assert len(data["opportunities"]) >= 1
    assert data["opportunities"][0]["company"] == "CyberTech Labs"


def test_opportunity_filters(client, sample_opportunity):
    res = client.get("/api/opportunities?work_mode=Hybrid")
    assert res.status_code == 200
    data = res.get_json()
    assert len(data["opportunities"]) >= 1

    res_empty = client.get("/api/opportunities?work_mode=NonExistentMode")
    assert res_empty.status_code == 200
    assert len(res_empty.get_json()["opportunities"]) == 0


def test_admin_create_opportunity(client, admin_headers):
    res = client.post("/api/opportunities", headers=admin_headers, json={
        "company": "NextGen AI",
        "title": "AI Research Associate",
        "description": "Work on state-of-the-art vision and language models.",
        "salary_range": "₹15.0 - 20.0 LPA",
        "required_skills": ["Python", "PyTorch"],
        "min_cgpa": 8.0,
    })
    assert res.status_code == 201
    data = res.get_json()
    assert data["success"] is True
    assert data["opportunity"]["company"] == "NextGen AI"


def test_student_cannot_create_opportunity(client, student_headers):
    res = client.post("/api/opportunities", headers=student_headers, json={
        "company": "Hacker Corp",
        "title": "Unauthorized Role",
        "description": "Should be blocked.",
        "salary_range": "₹10 LPA",
    })
    assert res.status_code == 403
    assert res.get_json()["success"] is False
