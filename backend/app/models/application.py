from datetime import datetime, timezone
from app.models import db


class Application(db.Model):
    """Job application record tracked by a student."""
    __tablename__ = "applications"

    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey("student_profiles.id"), nullable=False, index=True)
    opportunity_id = db.Column(db.Integer, db.ForeignKey("opportunities.id"), nullable=False, index=True)

    # Status: 'Saved', 'Planning to Apply', 'Applied', 'Assessment', 'Interview', 'Offer', 'Rejected', 'Withdrawn'
    status = db.Column(db.String(50), default="Applied", nullable=False)
    applied_date = db.Column(db.String(50), default=lambda: datetime.now(timezone.utc).strftime("%Y-%m-%d"))
    notes = db.Column(db.Text, nullable=True)
    interview_date = db.Column(db.String(50), nullable=True)

    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(
        db.DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    # Unique constraint per student and opportunity
    __table_args__ = (
        db.UniqueConstraint("student_id", "opportunity_id", name="uq_student_opportunity_application"),
    )

    # Relationships
    student = db.relationship("StudentProfile", back_populates="applications")
    opportunity = db.relationship("Opportunity", back_populates="applications")

    def to_dict(self) -> dict:
        """Serialize application record."""
        return {
            "id": self.id,
            "student_id": self.student_id,
            "opportunity_id": self.opportunity_id,
            "status": self.status,
            "applied_date": self.applied_date,
            "notes": self.notes,
            "interview_date": self.interview_date,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
            "opportunity": self.opportunity.to_dict() if self.opportunity else None,
            "student_name": self.student.user.name if self.student and self.student.user else None,
            "student_email": self.student.user.email if self.student and self.student.user else None,
        }
