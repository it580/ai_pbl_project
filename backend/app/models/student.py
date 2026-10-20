from datetime import datetime, timezone
from app.models import db


class StudentProfile(db.Model):
    """Student academic, skill, and career preference profile."""
    __tablename__ = "student_profiles"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), unique=True, nullable=False)

    # Academic Details
    college = db.Column(db.String(200), nullable=True)
    degree = db.Column(db.String(100), nullable=True)  # e.g., B.Tech, B.E., M.Tech, MCA
    branch = db.Column(db.String(100), nullable=True)  # e.g., Computer Science, IT
    graduation_year = db.Column(db.Integer, nullable=True)  # e.g., 2025, 2026
    cgpa = db.Column(db.Float, nullable=True)  # 0.0 to 10.0
    backlogs_count = db.Column(db.Integer, default=0, nullable=False)

    # Skills (stored as JSON arrays)
    technical_skills = db.Column(db.JSON, default=list)  # e.g., ["Python", "React", "Docker"]
    soft_skills = db.Column(db.JSON, default=list)  # e.g., ["Communication", "Leadership"]

    # Portfolios & Accomplishments
    projects = db.Column(db.JSON, default=list)  # list of {title, description, tech_stack: [], link}
    certifications = db.Column(db.JSON, default=list)  # list of {name, issuer, year}
    experience = db.Column(db.JSON, default=list)  # list of {role, company, duration, description}

    # Preferences
    preferred_roles = db.Column(db.JSON, default=list)  # e.g., ["Frontend Developer", "ML Engineer"]
    preferred_industries = db.Column(db.JSON, default=list)  # e.g., ["Fintech", "Healthtech"]
    preferred_locations = db.Column(db.JSON, default=list)  # e.g., ["Bangalore", "Hyderabad", "Remote"]
    preferred_work_mode = db.Column(db.String(50), default="Any")  # Remote, Hybrid, On-Site, Any

    # Resume text for NLP / semantic matching
    resume_text = db.Column(db.Text, nullable=True)

    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(
        db.DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    # Relationships
    user = db.relationship("User", back_populates="student_profile")
    applications = db.relationship(
        "Application",
        back_populates="student",
        cascade="all, delete-orphan",
        lazy="dynamic",
    )
    saved_opportunities = db.relationship(
        "SavedOpportunity",
        back_populates="student",
        cascade="all, delete-orphan",
        lazy="dynamic",
    )

    def calculate_completeness(self) -> dict:
        """Calculate profile completeness score (0-100) and identify missing items."""
        sections = {
            "academics": {
                "weight": 25,
                "fields": [
                    ("college", bool(self.college and self.college.strip())),
                    ("degree", bool(self.degree and self.degree.strip())),
                    ("branch", bool(self.branch and self.branch.strip())),
                    ("graduation_year", self.graduation_year is not None),
                    ("cgpa", self.cgpa is not None),
                ],
            },
            "skills": {
                "weight": 30,
                "fields": [
                    ("technical_skills", bool(self.technical_skills and len(self.technical_skills) >= 3)),
                    ("soft_skills", bool(self.soft_skills and len(self.soft_skills) >= 1)),
                ],
            },
            "portfolio": {
                "weight": 25,
                "fields": [
                    ("projects", bool(self.projects and len(self.projects) >= 1)),
                    ("certifications", bool(self.certifications and len(self.certifications) >= 1)),
                ],
            },
            "preferences": {
                "weight": 20,
                "fields": [
                    ("preferred_roles", bool(self.preferred_roles and len(self.preferred_roles) >= 1)),
                    ("preferred_locations", bool(self.preferred_locations and len(self.preferred_locations) >= 1)),
                    ("work_mode", bool(self.preferred_work_mode)),
                ],
            },
        }

        total_score = 0
        missing_fields = []

        for sec_name, sec_data in sections.items():
            completed_in_sec = sum(1 for _, is_valid in sec_data["fields"] if is_valid)
            total_in_sec = len(sec_data["fields"])
            sec_score = (completed_in_sec / total_in_sec) * sec_data["weight"]
            total_score += sec_score

            for f_name, is_valid in sec_data["fields"]:
                if not is_valid:
                    missing_fields.append(f_name)

        return {
            "percentage": round(total_score, 1),
            "missing_fields": missing_fields,
            "is_complete": total_score >= 80,
        }

    def to_dict(self) -> dict:
        """Serialize student profile data."""
        return {
            "id": self.id,
            "user_id": self.user_id,
            "name": self.user.name if self.user else None,
            "email": self.user.email if self.user else None,
            "college": self.college,
            "degree": self.degree,
            "branch": self.branch,
            "graduation_year": self.graduation_year,
            "cgpa": self.cgpa,
            "backlogs_count": self.backlogs_count,
            "technical_skills": self.technical_skills or [],
            "soft_skills": self.soft_skills or [],
            "projects": self.projects or [],
            "certifications": self.certifications or [],
            "experience": self.experience or [],
            "preferred_roles": self.preferred_roles or [],
            "preferred_industries": self.preferred_industries or [],
            "preferred_locations": self.preferred_locations or [],
            "preferred_work_mode": self.preferred_work_mode or "Any",
            "resume_text": self.resume_text,
            "completeness": self.calculate_completeness(),
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }
