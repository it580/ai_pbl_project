import os
import re
from app.services.recommendation_engine import RecommendationEngine, normalize_skill
from app.services.skill_gap_service import SkillGapService


class AssistantService:
    """Intelligent Career Assistant using student profile and opportunities database."""

    @staticmethod
    def answer_query(student, opportunities, query: str) -> dict:
        """
        Process user query using rule-based contextual matching against database records.
        If an external LLM is configured (OPENAI_API_KEY / GEMINI_API_KEY), it can augment the response.
        """
        clean_q = query.strip().lower()
        engine = RecommendationEngine()
        ranked = engine.rank_opportunities(student, opportunities)

        # 1. Best matches query
        if any(w in clean_q for w in ["best match", "top match", "recommend", "suggest", "suitable", "which company", "what job"]):
            eligible = [r for r in ranked if r["eligibility_status"] == "Eligible"]
            if not eligible:
                # Check potentially eligible
                pot = [r for r in ranked if r["eligibility_status"] == "Potentially eligible"]
                if pot:
                    top = pot[0]
                    return {
                        "response": (
                            f"You don't have any fully verified eligible matches yet because your profile is missing some criteria. "
                            f"However, your top potential match is **{top['opportunity']['title']}** at **{top['opportunity']['company']}** "
                            f"with a compatibility score of **{top['compatibility_score']}%** ({top['score_category']}). "
                            f"Please fill in your missing details ({', '.join([m['criterion'] for m in top['eligibility_details']['missing_criteria']])}) to confirm eligibility."
                        ),
                        "suggested_actions": ["Complete Profile", "View Recommendations"],
                        "opportunities": [top["opportunity"]],
                    }
                else:
                    return {
                        "response": (
                            "Currently, none of the available opportunities match your mandatory criteria. "
                            "Consider checking your CGPA, branch, or backlogs in your profile editor."
                        ),
                        "suggested_actions": ["Update Profile", "Explore All Opportunities"],
                        "opportunities": [],
                    }

            top3 = eligible[:3]
            opp_summaries = []
            for r in top3:
                opp_summaries.append(
                    f"- **{r['opportunity']['title']}** at **{r['opportunity']['company']}** ({r['opportunity']['location']} • {r['opportunity']['work_mode']}): "
                    f"**{r['compatibility_score']}%** Match ({r['score_category']}). Matched skills: {', '.join(r['matched_required_skills']) or 'Foundations'}."
                )

            return {
                "response": (
                    f"Based on your profile ({student.degree} in {student.branch}, CGPA: {student.cgpa}), "
                    f"here are your top placement recommendations ranked by our AI engine:\n\n"
                    + "\n".join(opp_summaries)
                    + "\n\nWould you like me to analyze your skill gap for any of these opportunities?"
                ),
                "suggested_actions": ["Skill Gap Analysis", "Compare Top 2", "Application Tracker"],
                "opportunities": [r["opportunity"] for r in top3],
            }

        # 2. Missing skills / Skill Gap query
        elif any(w in clean_q for w in ["missing skill", "skill gap", "what should i learn", "improve", "upskill", "what to learn"]):
            # Aggregate most frequent missing required skills across top 5 opportunities
            missing_counter = {}
            for r in ranked[:5]:
                for s in r.get("missing_required_skills", []):
                    missing_counter[s] = missing_counter.get(s, 0) + 1

            if missing_counter:
                sorted_missing = sorted(missing_counter.items(), key=lambda x: x[1], reverse=True)
                top_missing_skills = [f"**{s}** (requested in {cnt} of your top opportunities)" for s, cnt in sorted_missing[:4]]
                return {
                    "response": (
                        f"Analyzing your profile against current placement drives, here are the most critical skills you are currently missing:\n\n"
                        + "\n".join([f"- {item}" for item in top_missing_skills])
                        + "\n\n**Actionable Advice:** Adding hands-on projects demonstrating these skills will substantially improve your weighted score."
                    ),
                    "suggested_actions": ["Open Skill-Gap Analyzer", "Update Skills in Profile"],
                    "opportunities": [],
                }
            else:
                return {
                    "response": (
                        "Impressive! You already possess the core technical skills for your top recommendations. "
                        "To further stand out, focus on domain-specific preferred skills like Cloud deployment (AWS/Docker) and system design."
                    ),
                    "suggested_actions": ["View Recommendations", "Track Applications"],
                    "opportunities": [],
                }

        # 3. Specific Role search query
        elif any(w in clean_q for w in ["role", "frontend", "backend", "full stack", "fullstack", "devops", "cloud", "data", "ml", "ai", "analyst"]):
            # Match role in title or industry
            matched_role_opps = []
            for r in ranked:
                title = r["opportunity"]["title"].lower()
                desc = r["opportunity"]["description"].lower()
                if any(w in title or w in desc for w in clean_q.split()):
                    matched_role_opps.append(r)

            if matched_role_opps:
                top_role = matched_role_opps[:3]
                listings = []
                for r in top_role:
                    status_badge = f"[{r['eligibility_status']}]"
                    listings.append(
                        f"- **{r['opportunity']['title']}** at **{r['opportunity']['company']}** — {r['compatibility_score']}% Match {status_badge}"
                    )
                return {
                    "response": (
                        f"Found {len(matched_role_opps)} opportunity listing(s) aligning with your query:\n\n"
                        + "\n".join(listings)
                    ),
                    "suggested_actions": ["View Opportunities", "Filter by Role"],
                    "opportunities": [r["opportunity"] for r in top_role],
                }

        # 4. Ineligible / why not eligible
        elif any(w in clean_q for w in ["ineligible", "why not", "rejected", "failed criteria", "cgpa cutoff", "backlog"]):
            ineligible = [r for r in ranked if r["eligibility_status"] == "Not eligible"]
            if ineligible:
                sample = ineligible[0]
                reasons = "; ".join([f["reason"] for f in sample["eligibility_details"]["failed_criteria"]])
                return {
                    "response": (
                        f"Eligibility checks are strict mandatory filters that prevent candidate shortlisting rejections. "
                        f"For example, for **{sample['opportunity']['title']}** at **{sample['opportunity']['company']}**, "
                        f"the mandatory criteria failed: {reasons}. "
                        f"Unlike the compatibility score, mandatory eligibility requirements cannot be compensated for by other skills."
                    ),
                    "suggested_actions": ["AI Concepts Page", "Check Profile Details"],
                    "opportunities": [sample["opportunity"]],
                }

        # 5. Default intelligent summary
        completeness = student.calculate_completeness()
        return {
            "response": (
                f"Hello {student.user.name or 'Student'}! I am CareerMatch AI, your personal placement advisor.\n\n"
                f"**Profile Status:** Your profile completeness is **{completeness['percentage']}%**.\n"
                f"**Current Placement Pool:** We have evaluated **{len(opportunities)} active opportunities** for you.\n\n"
                f"Here are questions you can ask me:\n"
                f"- *'What are my top recommendations?'*\n"
                f"- *'What skills should I learn next to increase my match score?'*\n"
                f"- *'Show opportunities for Full Stack Developer'* \n"
                f"- *'Why am I ineligible for certain roles?'*\n"
                f"- *'How can I prepare for technical interviews?'*"
            ),
            "suggested_actions": [
                "Top Recommendations",
                "What skills am I missing?",
                "Explore Opportunities",
            ],
            "opportunities": [],
        }
