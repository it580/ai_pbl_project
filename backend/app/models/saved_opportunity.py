from datetime import datetime, timezone
from app.models import db


class SavedOpportunity(db.Model):
    """Bookmarks/Saved opportunities for students."""
    __tablename__ = "saved_opportunities"

    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey("student_profiles.id"), nullable=False, index=True)
    opportunity_id = db.Column(db.Integer, db.ForeignKey("opportunities.id"), nullable=False, index=True)
    saved_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    # Unique constraint per student and opportunity
    __table_args__ = (
        db.UniqueConstraint("student_id", "opportunity_id", name="uq_student_opportunity_saved"),
    )

    # Relationships
    student = db.relationship("StudentProfile", back_populates="saved_opportunities")
    opportunity = db.relationship("Opportunity", back_populates="saved_by_students")

    def to_dict(self) -> dict:
        """Serialize saved opportunity."""
        return {
            "id": self.id,
            "student_id": self.student_id,
            "opportunity_id": self.opportunity_id,
            "saved_at": self.saved_at.isoformat() if self.saved_at else None,
            "opportunity": self.opportunity.to_dict() if self.opportunity else None,
        }
