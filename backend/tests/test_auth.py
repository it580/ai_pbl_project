from app.models.user import User


def test_registration_success(client):
    res = client.post("/api/auth/register", json={
        "name": "Jane Doe",
        "email": "jane@example.com",
        "password": "Password123",
        "role": "student",
        "college": "Global Tech",
        "degree": "B.Tech",
    })
    assert res.status_code == 201
    data = res.get_json()
    assert data["success"] is True
    assert "access_token" in data
    assert data["user"]["email"] == "jane@example.com"
    assert "password_hash" not in data["user"]


def test_registration_duplicate_email(client, student_user):
    res = client.post("/api/auth/register", json={
        "name": "Another",
        "email": "student@test.com",
        "password": "Password123",
    })
    assert res.status_code == 409
    assert res.get_json()["success"] is False


def test_login_success(client, student_user):
    res = client.post("/api/auth/login", json={
        "email": "student@test.com",
        "password": "StudentPass123",
    })
    assert res.status_code == 200
    data = res.get_json()
    assert data["success"] is True
    assert "access_token" in data
    assert data["user"]["role"] == "student"


def test_login_invalid_password(client, student_user):
    res = client.post("/api/auth/login", json={
        "email": "student@test.com",
        "password": "WrongPassword",
    })
    assert res.status_code == 401
    assert res.get_json()["success"] is False


def test_auth_me_endpoint(client, student_headers):
    res = client.get("/api/auth/me", headers=student_headers)
    assert res.status_code == 200
    data = res.get_json()
    assert data["success"] is True
    assert data["user"]["email"] == "student@test.com"
    assert data["student_profile"] is not None
