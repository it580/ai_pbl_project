from app.services.eligibility_service import EligibilityService


# Known skill aliases for normalization
SKILL_ALIASES = {
    "react": "react",
    "react.js": "react",
    "reactjs": "react",
    "node": "node.js",
    "node.js": "node.js",
    "nodejs": "node.js",
    "js": "javascript",
    "javascript": "javascript",
    "ts": "typescript",
    "typescript": "typescript",
    "py": "python",
    "python": "python",
    "postgres": "postgresql",
    "postgresql": "postgresql",
    "k8s": "kubernetes",
    "kubernetes": "kubernetes",
    "aws": "aws",
    "amazon web services": "aws",
    "gcp": "gcp",
    "google cloud": "gcp",
    "google cloud platform": "gcp",
    "ml": "machine learning",
    "machine learning": "machine learning",
    "ai": "artificial intelligence",
    "artificial intelligence": "artificial intelligence",
    "rest": "rest api",
    "rest api": "rest api",
    "restful": "rest api",
    "restful api": "rest api",
    "tailwind": "tailwind css",
    "tailwindcss": "tailwind css",
}


def normalize_skill(skill: str) -> str:
    """Normalize skill string for robust matching."""
    if not skill:
        return ""
    clean = skill.strip().lower()
    return SKILL_ALIASES.get(clean, clean)


class RecommendationEngine:
    """Calculates weighted compatibility scores and ranks opportunities for a student."""

    DEFAULT_WEIGHTS = {
        "required_skills": 0.35,
        "preferred_skills": 0.15,
        "academic_fit": 0.15,
        "projects_certs": 0.15,
        "role_industry": 0.10,
        "location_workmode": 0.10,
    }

    def __init__(self, weights=None):
        self.weights = weights or self.DEFAULT_WEIGHTS

    @staticmethod
    def get_score_category(score: float) -> str:
        """Map score to human-readable prototype category."""
        if score >= 80.0:
            return "Excellent"
        elif score >= 65.0:
            return "Good"
        elif score >= 45.0:
            return "Moderate"
        else:
            return "Low"

    def calculate_compatibility(self, student, opportunity) -> dict:
        """
        Evaluate full compatibility between a student profile and an opportunity.
        Includes mandatory eligibility, multi-factor normalized scoring, and explainability.
        """
        # Step A: Mandatory Eligibility Evaluation
        eligibility = EligibilityService.evaluate(student, opportunity)

        # Student skills set
        student_raw_skills = student.technical_skills or []
        student_skill_set = {normalize_skill(s) for s in student_raw_skills if s}

        # Opportunity required & preferred skills
        opp_required_raw = opportunity.required_skills or []
        opp_preferred_raw = opportunity.preferred_skills or []

        matched_required = []
        missing_required = []
        for req in opp_required_raw:
            if normalize_skill(req) in student_skill_set:
                matched_required.append(req)
            else:
                missing_required.append(req)

        matched_preferred = []
        missing_preferred = []
        for pref in opp_preferred_raw:
            if normalize_skill(pref) in student_skill_set:
                matched_preferred.append(pref)
            else:
                missing_preferred.append(pref)

        # -------------------------------------------------------------
        # Step B: Multi-Component Normalized Compatibility Scoring (0-100 each)
        # -------------------------------------------------------------

        # 1. Required Technical-Skill Coverage (Weight: 35%)
        if opp_required_raw:
            req_coverage_score = (len(matched_required) / len(opp_required_raw)) * 100.0
        else:
            req_coverage_score = 100.0  # No required skills specified

        # 2. Preferred-Skill Compatibility (Weight: 15%)
        if opp_preferred_raw:
            pref_coverage_score = (len(matched_preferred) / len(opp_preferred_raw)) * 100.0
        else:
            # If no preferred skills are listed, grant a neutral baseline
            pref_coverage_score = 80.0

        # 3. Academic & Qualification Fit (Weight: 15%)
        # Combines CGPA surplus/margin + branch match
        academic_score = 50.0  # neutral starting point
        has_academic_info = student.cgpa is not None and bool(student.branch)

        if student.cgpa is not None:
            min_cgpa = opportunity.min_cgpa or 6.0
            if student.cgpa >= min_cgpa:
                # 6.0 min -> 9.0 student gets bonus
                surplus = min(student.cgpa - min_cgpa, 3.0)
                academic_score = 70.0 + (surplus / 3.0) * 30.0
            else:
                academic_score = max(0.0, (student.cgpa / min_cgpa) * 50.0)

        # Branch alignment adjustment
        if student.branch and opportunity.eligible_branches:
            st_br = student.branch.lower()
            opp_brs = [b.lower() for b in opportunity.eligible_branches]
            if "all" in opp_brs or any(b in st_br or st_br in b for b in opp_brs):
                academic_score = min(100.0, academic_score * 1.1)
            else:
                academic_score = academic_score * 0.7

        # 4. Projects & Certifications (Weight: 15%)
        # Evaluates relevant project tech stack overlap + certifications
        projects = student.projects or []
        certifications = student.certifications or []
        project_skills = set()
        for p in projects:
            p_techs = p.get("tech_stack", [])
            for pt in p_techs:
                project_skills.add(normalize_skill(pt))

        opp_all_skills = {normalize_skill(s) for s in (opp_required_raw + opp_preferred_raw)}
        overlap_project_skills = project_skills.intersection(opp_all_skills)

        # Base score from having projects and certifications
        proj_base = min(len(projects) * 20.0, 60.0)
        cert_base = min(len(certifications) * 15.0, 30.0)
        proj_relevance_bonus = min(len(overlap_project_skills) * 10.0, 25.0)

        projects_certs_score = min(100.0, proj_base + cert_base + proj_relevance_bonus)

        # 5. Role & Industry Preference (Weight: 10%)
        preferred_roles = [r.lower() for r in (student.preferred_roles or [])]
        preferred_industries = [i.lower() for i in (student.preferred_industries or [])]

        role_match = False
        opp_title_lower = (opportunity.title or "").lower()
        opp_type_lower = (opportunity.opportunity_type or "").lower()
        for r in preferred_roles:
            if r in opp_title_lower or opp_title_lower in r:
                role_match = True
                break

        industry_match = False
        opp_ind_lower = (opportunity.industry or "").lower()
        for ind in preferred_industries:
            if ind in opp_ind_lower or opp_ind_lower in ind:
                industry_match = True
                break

        if role_match and industry_match:
            role_industry_score = 100.0
        elif role_match:
            role_industry_score = 80.0
        elif industry_match:
            role_industry_score = 65.0
        elif not preferred_roles and not preferred_industries:
            role_industry_score = 50.0  # missing preference info
        else:
            role_industry_score = 40.0

        # 6. Location & Work-Mode Preference (Weight: 10%)
        preferred_locs = [l.lower() for l in (student.preferred_locations or [])]
        preferred_mode = (student.preferred_work_mode or "any").lower()

        opp_loc_lower = (opportunity.location or "").lower()
        opp_mode_lower = (opportunity.work_mode or "").lower()

        mode_match = (
            preferred_mode == "any"
            or preferred_mode in opp_mode_lower
            or opp_mode_lower in preferred_mode
            or opp_mode_lower == "remote"
        )

        loc_match = (
            not preferred_locs
            or "any" in preferred_locs
            or any(loc in opp_loc_lower or opp_loc_lower in loc for loc in preferred_locs)
            or opp_mode_lower == "remote"
        )

        if mode_match and loc_match:
            loc_mode_score = 100.0
        elif mode_match or loc_match:
            loc_mode_score = 70.0
        elif not preferred_locs and preferred_mode == "any":
            loc_mode_score = 60.0
        else:
            loc_mode_score = 30.0

        # Component breakdown dictionary
        components = {
            "required_skills": {
                "score": round(req_coverage_score, 1),
                "weight": self.weights["required_skills"],
                "weighted_contribution": round(req_coverage_score * self.weights["required_skills"], 2),
                "matched": matched_required,
                "missing": missing_required,
            },
            "preferred_skills": {
                "score": round(pref_coverage_score, 1),
                "weight": self.weights["preferred_skills"],
                "weighted_contribution": round(pref_coverage_score * self.weights["preferred_skills"], 2),
                "matched": matched_preferred,
                "missing": missing_preferred,
            },
            "academic_fit": {
                "score": round(academic_score, 1),
                "weight": self.weights["academic_fit"],
                "weighted_contribution": round(academic_score * self.weights["academic_fit"], 2),
                "student_cgpa": student.cgpa,
                "min_cgpa": opportunity.min_cgpa,
            },
            "projects_certs": {
                "score": round(projects_certs_score, 1),
                "weight": self.weights["projects_certs"],
                "weighted_contribution": round(projects_certs_score * self.weights["projects_certs"], 2),
                "project_overlap": list(overlap_project_skills),
            },
            "role_industry": {
                "score": round(role_industry_score, 1),
                "weight": self.weights["role_industry"],
                "weighted_contribution": round(role_industry_score * self.weights["role_industry"], 2),
                "role_match": role_match,
                "industry_match": industry_match,
            },
            "location_workmode": {
                "score": round(loc_mode_score, 1),
                "weight": self.weights["location_workmode"],
                "weighted_contribution": round(loc_mode_score * self.weights["location_workmode"], 2),
                "loc_match": loc_match,
                "mode_match": mode_match,
            },
        }

        # Final Score Formula: Σ (Component Score × Component Weight)
        final_score = sum(comp["weighted_contribution"] for comp in components.values())
        final_score = round(max(0.0, min(100.0, final_score)), 1)
        category = self.get_score_category(final_score)

        # Confidence / Information Completeness
        completeness = student.calculate_completeness()["percentage"]

        # -------------------------------------------------------------
        # Step C: Explainability & Actionable Next Steps
        # -------------------------------------------------------------
        explanation = self._build_explanation(
            student,
            opportunity,
            eligibility,
            final_score,
            category,
            matched_required,
            missing_required,
            matched_preferred,
            components,
        )

        suggested_steps = self._build_suggested_steps(
            eligibility,
            missing_required,
            missing_preferred,
            projects,
            certifications,
        )

        return {
            "opportunity_id": opportunity.id,
            "opportunity": opportunity.to_dict(),
            "compatibility_score": final_score,
            "score_category": category,
            "eligibility_status": eligibility["status"],
            "is_eligible": eligibility["is_eligible"],
            "is_potentially_eligible": eligibility["is_potentially_eligible"],
            "eligibility_details": eligibility,
            "matched_required_skills": matched_required,
            "missing_required_skills": missing_required,
            "matched_preferred_skills": matched_preferred,
            "missing_preferred_skills": missing_preferred,
            "components": components,
            "profile_completeness_pct": completeness,
            "explanation": explanation,
            "suggested_next_steps": suggested_steps,
        }

    def _build_explanation(
        self,
        student,
        opportunity,
        eligibility,
        score,
        category,
        matched_req,
        missing_req,
        matched_pref,
        components,
    ) -> str:
        """Generate human-readable AI explanation for the match score."""
        parts = []

        # Eligibility opening
        if eligibility["status"] == "Eligible":
            parts.append(
                f"You fully meet the mandatory academic and batch requirements for {opportunity.company}."
            )
        elif eligibility["status"] == "Potentially eligible":
            missing_str = ", ".join([m["criterion"] for m in eligibility["missing_criteria"]])
            parts.append(
                f"You are potentially eligible for {opportunity.company}, but your profile lacks {missing_str}."
            )
        else:
            fail_str = "; ".join([f["reason"] for f in eligibility["failed_criteria"]])
            parts.append(
                f"You are currently ineligible for {opportunity.company} due to mandatory criteria: {fail_str}."
            )

        # Technical skill commentary
        total_req = len(opportunity.required_skills or [])
        if total_req > 0:
            if len(matched_req) == total_req:
                parts.append(
                    f"Strong technical match: you possess all {total_req} mandatory skill(s) ({', '.join(matched_req)})."
                )
            elif matched_req:
                parts.append(
                    f"Partial skill match: you cover {len(matched_req)} of {total_req} required skills ({', '.join(matched_req)}), with {len(missing_req)} skill gaps ({', '.join(missing_req)})."
                )
            else:
                parts.append(
                    f"Critical skill gap: your profile currently does not list the primary required skills ({', '.join(missing_req)})."
                )

        # Preferred skills & projects commentary
        if matched_pref:
            parts.append(
                f"Bonus qualification: you also match preferred skill(s) ({', '.join(matched_pref)})."
            )

        overlap = components["projects_certs"].get("project_overlap", [])
        if overlap:
            parts.append(
                f"Your project portfolio validates practical experience with {', '.join(overlap)}."
            )

        return " ".join(parts)

    def _build_suggested_steps(
        self,
        eligibility,
        missing_req,
        missing_pref,
        projects,
        certifications,
    ) -> list:
        """Generate actionable recommendations to improve applicant ranking."""
        steps = []

        # Step for missing profile fields
        for m in eligibility.get("missing_criteria", []):
            steps.append(f"Update your profile to specify your {m['criterion']} ({m['reason']}).")

        # Step for primary required skills
        if missing_req:
            top_missing = missing_req[:3]
            steps.append(
                f"Focus on acquiring core required skills: {', '.join(top_missing)}. Build small proof-of-concept projects."
            )

        # Step for preferred skills
        if missing_pref and not missing_req:
            steps.append(
                f"Enhance your competitiveness by picking up bonus tools: {', '.join(missing_pref[:2])}."
            )

        # Project recommendation
        if len(projects) < 2:
            steps.append(
                "Add at least one full-stack or production-grade project showcasing your primary skills and GitHub link."
            )

        # Certification recommendation
        if not certifications:
            steps.append(
                "Consider completing a recognized foundational certification in your target domain to boost credential weight."
            )

        if not steps:
            steps.append(
                "Your profile aligns exceptionally well. Review the job description and prepare your interview talking points!"
            )

        return steps

    def rank_opportunities(self, student, opportunities) -> list:
        """
        Rank all opportunities for a student:
        1. Eligible opportunities, sorted by compatibility_score DESC
        2. Potentially eligible opportunities, sorted by compatibility_score DESC
        3. Ineligible opportunities, sorted by compatibility_score DESC
        """
        results = [self.calculate_compatibility(student, opp) for opp in opportunities]

        eligible = [r for r in results if r["eligibility_status"] == "Eligible"]
        potentially_eligible = [r for r in results if r["eligibility_status"] == "Potentially eligible"]
        ineligible = [r for r in results if r["eligibility_status"] == "Not eligible"]

        eligible.sort(key=lambda x: x["compatibility_score"], reverse=True)
        potentially_eligible.sort(key=lambda x: x["compatibility_score"], reverse=True)
        ineligible.sort(key=lambda x: x["compatibility_score"], reverse=True)

        return eligible + potentially_eligible + ineligible
