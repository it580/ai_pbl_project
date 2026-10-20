from app.services.recommendation_engine import normalize_skill
from app.services.eligibility_service import EligibilityService


# Curated learning resource recommendations by skill domain
SKILL_LEARNING_GUIDES = {
    "python": {"difficulty": "Beginner", "time_est": "2-3 weeks", "topic": "Backend & Scripting", "resource": "Official Python docs, Corey Schafer tutorials"},
    "react": {"difficulty": "Intermediate", "time_est": "3-4 weeks", "topic": "Frontend Development", "resource": "React.dev interactive tutorial, FullStackOpen"},
    "docker": {"difficulty": "Intermediate", "time_est": "1-2 weeks", "topic": "DevOps & Containers", "resource": "Docker for Beginners by Nana, Docker Labs"},
    "kubernetes": {"difficulty": "Advanced", "time_est": "4 weeks", "topic": "Cloud Infrastructure", "resource": "Kubernetes.io docs, Mumshad Mannambeth CKA course"},
    "aws": {"difficulty": "Intermediate", "time_est": "3-4 weeks", "topic": "Cloud Computing", "resource": "AWS Cloud Practitioner / Solutions Architect Guide"},
    "sql": {"difficulty": "Beginner", "time_est": "1-2 weeks", "topic": "Database Systems", "resource": "Mode Analytics SQL Tutorial, LeetCode Database problems"},
    "postgresql": {"difficulty": "Intermediate", "time_est": "2 weeks", "topic": "Relational Databases", "resource": "PostgreSQL Official Tutorial, indexing deep-dive"},
    "mongodb": {"difficulty": "Beginner", "time_est": "1 week", "topic": "NoSQL Databases", "resource": "MongoDB University M001"},
    "node.js": {"difficulty": "Intermediate", "time_est": "2-3 weeks", "topic": "Backend JavaScript", "resource": "Node.js official docs, The Odin Project"},
    "flask": {"difficulty": "Beginner", "time_est": "1-2 weeks", "topic": "Python Web Framework", "resource": "Flask Mega-Tutorial by Miguel Grinberg"},
    "django": {"difficulty": "Intermediate", "time_est": "3-4 weeks", "topic": "Full-Stack Python", "resource": "Django official tutorial, MDN Django Web Framework"},
    "machine learning": {"difficulty": "Advanced", "time_est": "6-8 weeks", "topic": "AI & Modeling", "resource": "Andrew Ng Machine Learning Specialization, Scikit-learn docs"},
    "deep learning": {"difficulty": "Advanced", "time_est": "8 weeks", "topic": "Neural Networks", "resource": "DeepLearning.AI specialization, fast.ai"},
    "git": {"difficulty": "Beginner", "time_est": "3-5 days", "topic": "Version Control", "resource": "Pro Git Book, GitHub Skills"},
    "tailwind css": {"difficulty": "Beginner", "time_est": "1 week", "topic": "Modern UI Styling", "resource": "TailwindCSS official docs & video crash courses"},
    "typescript": {"difficulty": "Intermediate", "time_est": "2 weeks", "topic": "Typed JavaScript", "resource": "Total TypeScript by Matt Pocock, TS Handbook"},
}


class SkillGapService:
    """Detailed skill gap analysis between a student profile and an opportunity."""

    @staticmethod
    def analyze(student, opportunity) -> dict:
        """
        Analyze skill matches, gaps, unverified requirements, and prioritized learning steps.
        """
        student_raw = student.technical_skills or []
        student_skills = {normalize_skill(s) for s in student_raw if s}

        opp_required = opportunity.required_skills or []
        opp_preferred = opportunity.preferred_skills or []

        # 1. Matched vs Missing
        matched_required = []
        missing_required = []
        for s in opp_required:
            if normalize_skill(s) in student_skills:
                matched_required.append(s)
            else:
                missing_required.append(s)

        matched_preferred = []
        missing_preferred = []
        for s in opp_preferred:
            if normalize_skill(s) in student_skills:
                matched_preferred.append(s)
            else:
                missing_preferred.append(s)

        # 2. Total Coverage Percentage
        total_skills_count = len(opp_required) + len(opp_preferred)
        total_matched_count = len(matched_required) + len(matched_preferred)
        coverage_percentage = round(
            (total_matched_count / total_skills_count * 100.0) if total_skills_count > 0 else 100.0,
            1,
        )

        # 3. Unverified / Missing Profile Requirements
        eligibility = EligibilityService.evaluate(student, opportunity)
        unverified_criteria = eligibility["missing_criteria"]

        # 4. Prioritized Learning Roadmap
        learning_priorities = []

        # High Priority: Missing Mandatory Skills
        for skill in missing_required:
            norm = normalize_skill(skill)
            guide = SKILL_LEARNING_GUIDES.get(
                norm,
                {
                    "difficulty": "Intermediate",
                    "time_est": "2-3 weeks",
                    "topic": "Core Requirement",
                    "resource": f"Comprehensive documentation and tutorials for {skill}",
                },
            )
            learning_priorities.append({
                "skill": skill,
                "priority": "High",
                "urgency_level": 1,
                "type": "Mandatory Requirement",
                "difficulty": guide["difficulty"],
                "estimated_time": guide["time_est"],
                "focus_area": guide["topic"],
                "recommended_resource": guide["resource"],
                "action_item": f"Complete a hands-on project module implementing {skill} before applying.",
            })

        # Medium Priority: Missing Preferred Skills
        for skill in missing_preferred:
            norm = normalize_skill(skill)
            guide = SKILL_LEARNING_GUIDES.get(
                norm,
                {
                    "difficulty": "Intermediate",
                    "time_est": "1-2 weeks",
                    "topic": "Bonus Qualification",
                    "resource": f"Crash course and overview tutorials for {skill}",
                },
            )
            learning_priorities.append({
                "skill": skill,
                "priority": "Medium",
                "urgency_level": 2,
                "type": "Preferred / Bonus",
                "difficulty": guide["difficulty"],
                "estimated_time": guide["time_est"],
                "focus_area": guide["topic"],
                "recommended_resource": guide["resource"],
                "action_item": f"Gain foundational familiarity with {skill} to discuss in technical interviews.",
            })

        # 5. Summary Insights
        if not missing_required and not missing_preferred:
            readiness_verdict = "Ready to Apply: You possess 100% of the required and preferred skills."
            readiness_class = "ready"
        elif not missing_required:
            readiness_verdict = f"Strong Candidate: You have all mandatory skills and {len(matched_preferred)}/{len(opp_preferred)} preferred skills."
            readiness_class = "strong"
        elif len(matched_required) >= len(missing_required):
            readiness_verdict = f"Competitive with Gaps: You match {len(matched_required)}/{len(opp_required)} mandatory skills. Close key gaps to maximize shortlisting."
            readiness_class = "moderate"
        else:
            readiness_verdict = f"Major Skill Gap: You match only {len(matched_required)}/{len(opp_required)} mandatory skills. Substantial upskilling is recommended."
            readiness_class = "gap"

        return {
            "opportunity_id": opportunity.id,
            "opportunity_title": opportunity.title,
            "company": opportunity.company,
            "student_possessed_skills": student_raw,
            "matched_required_skills": matched_required,
            "missing_required_skills": missing_required,
            "matched_preferred_skills": matched_preferred,
            "missing_preferred_skills": missing_preferred,
            "coverage_percentage": coverage_percentage,
            "unverified_criteria": unverified_criteria,
            "readiness_verdict": readiness_verdict,
            "readiness_class": readiness_class,
            "learning_priorities": learning_priorities,
        }
