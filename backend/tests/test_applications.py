def test_create_and_update_application(client, student_headers, sample_opportunity):
    # 1. Create Application
    res = client.post("/api/applications", headers=student_headers, json={
        "opportunity_id": sample_opportunity.id,
        "status": "Applied",
        "notes": "Submitted application.",
    })
    assert res.status_code == 201
    data = res.get_json()
    assert data["success"] is True
    app_id = data["application"]["id"]

    # 2. Prevent duplicate application
    res_dup = client.post("/api/applications", headers=student_headers, json={
        "opportunity_id": sample_opportunity.id,
    })
    assert res_dup.status_code == 409

    # 3. Patch application status
    res_patch = client.patch(f"/api/applications/{app_id}", headers=student_headers, json={
        "status": "Interview",
        "interview_date": "2026-11-15",
    })
    assert res_patch.status_code == 200
    assert res_patch.get_json()["application"]["status"] == "Interview"

    # 4. List applications
    res_list = client.get("/api/applications", headers=student_headers)
    assert res_list.status_code == 200
    assert len(res_list.get_json()["applications"]) == 1


def test_save_and_unsave_opportunity(client, student_headers, sample_opportunity):
    # Save
    res_save = client.post(f"/api/saved-opportunities/{sample_opportunity.id}", headers=student_headers)
    assert res_save.status_code in [200, 201]

    # List saved
    res_list = client.get("/api/saved-opportunities", headers=student_headers)
    assert res_list.status_code == 200
    assert len(res_list.get_json()["saved_opportunities"]) == 1

    # Unsave
    res_unsave = client.delete(f"/api/saved-opportunities/{sample_opportunity.id}", headers=student_headers)
    assert res_unsave.status_code == 200

    # Verify empty
    res_list_after = client.get("/api/saved-opportunities", headers=student_headers)
    assert len(res_list_after.get_json()["saved_opportunities"]) == 0
