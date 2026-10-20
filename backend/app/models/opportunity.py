from datetime import datetime, timezone
from app.models import db


class Opportunity(db.Model):
    """Placement opportunity / job listing model."""
    __tablename__ = "opportunities"

    id = db.Column(db.Integer, primary_key=True)
    company = db.Column(db.String(150), nullable=False, index=True)
    title = db.Column(db.String(150), nullable=False, index=True)
    description = db.Column(db.Text, nullable=False)
    opportunity_type = db.Column(db.String(50), default="Full-Time", nullable=False)  # Full-Time, Internship
    industry = db.Column(db.String(100), default="Technology")

    # Skill Requirements
    required_skills = db.Column(db.JSON, default=list, nullable=False)
    preferred_skills = db.Column(db.JSON, default=list, nullable=False)

    # Mandatory Academic & Eligibility Criteria
    min_cgpa = db.Column(db.Float, default=0.0, nullable=False)
    max_backlogs = db.Column(db.Integer, default=0, nullable=False)
    eligible_branches = db.Column(db.JSON, default=list)  # ["Computer Science", "IT"] or ["All"]
    eligible_degrees = db.Column(db.JSON, default=list)  # ["B.Tech", "M.Tech", "MCA"]
    eligible_graduation_years = db.Column(db.JSON, default=list)  # [2025, 2026]
    experience_required_years = db.Column(db.Float, default=0.0, nullable=False)

    # Work Details
    location = db.Column(db.String(120), default="Bangalore")
    work_mode = db.Column(db.String(50), default="Hybrid")  # Remote, Hybrid, On-Site
    salary_range = db.Column(db.String(100), nullable=False)  # e.g., "₹8.5 - 12.0 LPA"
    deadline = db.Column(db.String(50), nullable=True)  # YYYY-MM-DD
    application_url = db.Column(db.String(255), nullable=True)

    is_open = db.Column(db.Boolean, default=True, nullable=False, index=True)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(
        db.DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    # Relationships
    applications = db.relationship(
        "Application",
        back_populates="opportunity",
        cascade="all, delete-orphan",
        lazy="dynamic",
    )
    saved_by_students = db.relationship(
        "SavedOpportunity",
        back_populates="opportunity",
        cascade="all, delete-orphan",
        lazy="dynamic",
    )

    def to_dict(self) -> dict:
        """Serialize opportunity data."""
        return {
            "id": self.id,
            "company": self.company,
            "title": self.title,
            "description": self.description,
            "opportunity_type": self.opportunity_type,
            "industry": self.industry,
            "required_skills": self.required_skills or [],
            "preferred_skills": self.preferred_skills or [],
            "min_cgpa": self.min_cgpa,
            "max_backlogs": self.max_backlogs,
            "eligible_branches": self.eligible_branches or [],
            "eligible_degrees": self.eligible_degrees or [],
            "eligible_graduation_years": self.eligible_graduation_years or [],
            "experience_required_years": self.experience_required_years,
            "location": self.location,
            "work_mode": self.work_mode,
            "salary_range": self.salary_range,
            "deadline": self.deadline,
            "application_url": self.application_url,
            "is_open": self.is_open,
            "applications_count": self.applications.count() if hasattr(self.applications, 'count') else 0,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }
