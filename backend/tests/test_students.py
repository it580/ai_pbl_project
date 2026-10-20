def test_get_my_profile(client, student_headers):
    res = client.get("/api/students/me", headers=student_headers)
    assert res.status_code == 200
    data = res.get_json()
    assert data["success"] is True
    assert data["profile"]["cgpa"] == 8.5
    assert "Python" in data["profile"]["technical_skills"]


def test_update_my_profile(client, student_headers):
    res = client.put("/api/students/me", headers=student_headers, json={
        "cgpa": 9.2,
        "technical_skills": ["Python", "React", "Docker", "Kubernetes", "AWS"],
        "preferred_work_mode": "Remote",
    })
    assert res.status_code == 200
    data = res.get_json()
    assert data["success"] is True
    assert data["profile"]["cgpa"] == 9.2
    assert "Kubernetes" in data["profile"]["technical_skills"]
    assert data["profile"]["preferred_work_mode"] == "Remote"


def test_profile_completeness_endpoint(client, student_headers):
    res = client.get("/api/students/me/completeness", headers=student_headers)
    assert res.status_code == 200
    data = res.get_json()
    assert data["success"] is True
    assert data["completeness"]["percentage"] > 0
    assert "missing_fields" in data["completeness"]
