class EligibilityService:
    """Evaluates mandatory student eligibility against an opportunity."""

    @staticmethod
    def evaluate(student, opportunity) -> dict:
        """
        Evaluate if a student satisfies the mandatory eligibility rules for an opportunity.
        Returns:
            dict containing:
            - status: "Eligible" | "Potentially eligible" | "Not eligible"
            - passed_criteria: list of satisfied conditions
            - failed_criteria: list of violated mandatory conditions
            - missing_criteria: list of attributes missing from the student profile
            - details: dictionary breakdown of each criterion
        """
        passed_criteria = []
        failed_criteria = []
        missing_criteria = []
        details = {}

        # 1. CGPA Check
        min_cgpa = opportunity.min_cgpa or 0.0
        if min_cgpa > 0.0:
            if student.cgpa is None:
                missing_criteria.append({
                    "criterion": "CGPA",
                    "required": f">= {min_cgpa}",
                    "current": "Not specified",
                    "reason": "CGPA is required to evaluate academic eligibility.",
                })
                details["cgpa"] = {"status": "missing", "required": min_cgpa, "current": None}
            elif student.cgpa >= min_cgpa:
                passed_criteria.append(f"CGPA meets threshold ({student.cgpa} >= {min_cgpa})")
                details["cgpa"] = {"status": "passed", "required": min_cgpa, "current": student.cgpa}
            else:
                failed_criteria.append({
                    "criterion": "Minimum CGPA",
                    "required": f">= {min_cgpa}",
                    "current": student.cgpa,
                    "reason": f"Your CGPA ({student.cgpa}) is below the minimum required ({min_cgpa}).",
                })
                details["cgpa"] = {"status": "failed", "required": min_cgpa, "current": student.cgpa}
        else:
            details["cgpa"] = {"status": "not_applicable", "current": student.cgpa}

        # 2. Backlogs Check
        max_backlogs = opportunity.max_backlogs if opportunity.max_backlogs is not None else 0
        student_backlogs = student.backlogs_count or 0
        if student_backlogs <= max_backlogs:
            passed_criteria.append(f"Backlog criteria met ({student_backlogs} <= {max_backlogs} allowed)")
            details["backlogs"] = {"status": "passed", "max_allowed": max_backlogs, "current": student_backlogs}
        else:
            failed_criteria.append({
                "criterion": "Active Backlogs",
                "required": f"<= {max_backlogs}",
                "current": student_backlogs,
                "reason": f"You have {student_backlogs} backlog(s), maximum permitted is {max_backlogs}.",
            })
            details["backlogs"] = {"status": "failed", "max_allowed": max_backlogs, "current": student_backlogs}

        # 3. Degree Check
        eligible_degrees = [d.strip().lower() for d in (opportunity.eligible_degrees or []) if d.strip()]
        if eligible_degrees and "all" not in eligible_degrees:
            if not student.degree or not student.degree.strip():
                missing_criteria.append({
                    "criterion": "Degree",
                    "required": opportunity.eligible_degrees,
                    "current": "Not specified",
                    "reason": "Degree is missing in your profile.",
                })
                details["degree"] = {"status": "missing", "required": opportunity.eligible_degrees, "current": None}
            else:
                student_deg = student.degree.strip().lower()
                # Check for direct or substring match (e.g., 'B.Tech' matches 'B.Tech Computer Science')
                matches_degree = any(deg in student_deg or student_deg in deg for deg in eligible_degrees)
                if matches_degree:
                    passed_criteria.append(f"Degree matches eligible list ({student.degree})")
                    details["degree"] = {"status": "passed", "required": opportunity.eligible_degrees, "current": student.degree}
                else:
                    failed_criteria.append({
                        "criterion": "Degree",
                        "required": opportunity.eligible_degrees,
                        "current": student.degree,
                        "reason": f"Degree '{student.degree}' is not in the eligible list ({', '.join(opportunity.eligible_degrees)}).",
                    })
                    details["degree"] = {"status": "failed", "required": opportunity.eligible_degrees, "current": student.degree}
        else:
            details["degree"] = {"status": "all_eligible", "current": student.degree}

        # 4. Branch Check
        eligible_branches = [b.strip().lower() for b in (opportunity.eligible_branches or []) if b.strip()]
        if eligible_branches and "all" not in eligible_branches:
            if not student.branch or not student.branch.strip():
                missing_criteria.append({
                    "criterion": "Branch",
                    "required": opportunity.eligible_branches,
                    "current": "Not specified",
                    "reason": "Academic branch is missing in your profile.",
                })
                details["branch"] = {"status": "missing", "required": opportunity.eligible_branches, "current": None}
            else:
                student_br = student.branch.strip().lower()
                matches_branch = any(br in student_br or student_br in br for br in eligible_branches)
                if matches_branch:
                    passed_criteria.append(f"Branch matches eligible list ({student.branch})")
                    details["branch"] = {"status": "passed", "required": opportunity.eligible_branches, "current": student.branch}
                else:
                    failed_criteria.append({
                        "criterion": "Branch",
                        "required": opportunity.eligible_branches,
                        "current": student.branch,
                        "reason": f"Branch '{student.branch}' is not in the eligible branches list.",
                    })
                    details["branch"] = {"status": "failed", "required": opportunity.eligible_branches, "current": student.branch}
        else:
            details["branch"] = {"status": "all_eligible", "current": student.branch}

        # 5. Graduation Year Check
        eligible_years = [int(y) for y in (opportunity.eligible_graduation_years or []) if str(y).strip().isdigit()]
        if eligible_years:
            if student.graduation_year is None:
                missing_criteria.append({
                    "criterion": "Graduation Year",
                    "required": eligible_years,
                    "current": "Not specified",
                    "reason": "Graduation year is not specified in your profile.",
                })
                details["grad_year"] = {"status": "missing", "required": eligible_years, "current": None}
            elif student.graduation_year in eligible_years:
                passed_criteria.append(f"Graduation batch eligible ({student.graduation_year})")
                details["grad_year"] = {"status": "passed", "required": eligible_years, "current": student.graduation_year}
            else:
                failed_criteria.append({
                    "criterion": "Graduation Year",
                    "required": eligible_years,
                    "current": student.graduation_year,
                    "reason": f"Graduation year {student.graduation_year} is not among the eligible batches ({', '.join(map(str, eligible_years))}).",
                })
                details["grad_year"] = {"status": "failed", "required": eligible_years, "current": student.graduation_year}
        else:
            details["grad_year"] = {"status": "all_eligible", "current": student.graduation_year}

        # 6. Experience Requirement Check
        exp_req = opportunity.experience_required_years or 0.0
        if exp_req > 0.0:
            student_exp_list = student.experience or []
            # Calculate rough experience in years (each entry defaults to ~0.5 year if internship or specified)
            est_years = len(student_exp_list) * 0.5
            if not student_exp_list:
                missing_criteria.append({
                    "criterion": "Experience",
                    "required": f">= {exp_req} years",
                    "current": "0 recorded entries",
                    "reason": "Opportunity requires prior experience, but no experience entries are recorded.",
                })
                details["experience"] = {"status": "missing", "required": exp_req, "current": 0}
            elif est_years >= exp_req:
                passed_criteria.append(f"Experience satisfies threshold (~{est_years} yrs >= {exp_req} yrs)")
                details["experience"] = {"status": "passed", "required": exp_req, "current": est_years}
            else:
                failed_criteria.append({
                    "criterion": "Experience",
                    "required": f">= {exp_req} years",
                    "current": f"~{est_years} years",
                    "reason": f"Experience is less than {exp_req} years required.",
                })
                details["experience"] = {"status": "failed", "required": exp_req, "current": est_years}
        else:
            details["experience"] = {"status": "freshers_welcome", "current": len(student.experience or [])}

        # Determine overall status
        if failed_criteria:
            status = "Not eligible"
        elif missing_criteria:
            status = "Potentially eligible"
        else:
            status = "Eligible"

        return {
            "status": status,
            "is_eligible": status == "Eligible",
            "is_potentially_eligible": status == "Potentially eligible",
            "passed_criteria": passed_criteria,
            "failed_criteria": failed_criteria,
            "missing_criteria": missing_criteria,
            "details": details,
        }
