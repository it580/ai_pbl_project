import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

import pytest
from app import create_app, db
from app.models.user import User
from app.models.student import StudentProfile
from app.models.opportunity import Opportunity
from flask_jwt_extended import create_access_token


@pytest.fixture
def app():
    """Create application configured for testing."""
    test_app = create_app("testing")
    with test_app.app_context():
        db.create_all()
        yield test_app
        db.session.remove()
        db.drop_all()


@pytest.fixture
def client(app):
    """Test HTTP client."""
    return app.test_client()


@pytest.fixture
def admin_user(app):
    """Create test admin user."""
    admin = User(name="Test Admin", email="admin@test.com", role="admin")
    admin.set_password("AdminPass123")
    db.session.add(admin)
    db.session.commit()
    return admin


@pytest.fixture
def student_user(app):
    """Create test student user with profile."""
    user = User(name="Test Student", email="student@test.com", role="student")
    user.set_password("StudentPass123")
    db.session.add(user)
    db.session.flush()

    profile = StudentProfile(
        user_id=user.id,
        college="Test Tech",
        degree="B.Tech",
        branch="Computer Science",
        graduation_year=2026,
        cgpa=8.5,
        backlogs_count=0,
        technical_skills=["Python", "React", "Docker", "SQL"],
        soft_skills=["Communication"],
        projects=[{"title": "Test Project", "tech_stack": ["Python", "React"]}],
        preferred_roles=["Full Stack Developer"],
        preferred_locations=["Bangalore"],
        preferred_work_mode="Hybrid",
    )
    db.session.add(profile)
    db.session.commit()
    return user


@pytest.fixture
def admin_headers(app, admin_user):
    """Auth headers for admin user."""
    token = create_access_token(identity=str(admin_user.id))
    return {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}


@pytest.fixture
def student_headers(app, student_user):
    """Auth headers for student user."""
    token = create_access_token(identity=str(student_user.id))
    return {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}


@pytest.fixture
def sample_opportunity(app):
    """Create a sample placement opportunity."""
    opp = Opportunity(
        company="CyberTech Labs",
        title="Full Stack Engineer",
        description="Develop scalable web platforms in Python and React.",
        opportunity_type="Full-Time",
        industry="Technology",
        required_skills=["Python", "React"],
        preferred_skills=["Docker", "AWS"],
        min_cgpa=7.0,
        max_backlogs=0,
        eligible_branches=["Computer Science", "Information Technology"],
        eligible_degrees=["B.Tech"],
        eligible_graduation_years=[2026],
        experience_required_years=0.0,
        location="Bangalore",
        work_mode="Hybrid",
        salary_range="₹10.0 - 14.0 LPA",
        deadline="2026-12-31",
        is_open=True,
    )
    db.session.add(opp)
    db.session.commit()
    return opp
