import re
import math
from collections import Counter


COMMON_TECH_KEYWORDS = [
    "python", "javascript", "typescript", "react", "react.js", "node", "node.js",
    "flask", "django", "fastapi", "express", "sql", "postgresql", "mysql",
    "mongodb", "redis", "docker", "kubernetes", "aws", "gcp", "azure", "git",
    "github", "rest api", "graphql", "tailwind css", "html", "css", "c++",
    "java", "spring boot", "machine learning", "deep learning", "nlp", "pandas",
    "numpy", "scikit-learn", "tensorflow", "pytorch", "ci/cd", "linux", "agile"
]


class ResumeService:
    """Extracts skills and evaluates semantic overlap between resume text and job postings."""

    @staticmethod
    def extract_keywords(text: str) -> list:
        """Extract recognized tech keywords from raw resume text."""
        if not text:
            return []
        lower_text = text.lower()
        extracted = []
        for kw in COMMON_TECH_KEYWORDS:
            # Word boundary check or exact inclusion for multi-word keywords
            if " " in kw:
                if kw in lower_text:
                    extracted.append(kw)
            else:
                pattern = r"\b" + re.escape(kw) + r"\b"
                if re.search(pattern, lower_text):
                    extracted.append(kw)
        return sorted(list(set(extracted)))

    @staticmethod
    def compute_similarity(resume_text: str, job_description: str) -> dict:
        """
        Compute text similarity using term-frequency cosine vector comparison
        between resume text and opportunity job description.
        """
        if not resume_text or not job_description:
            return {"similarity_score": 0.0, "matching_keywords": [], "missing_keywords": []}

        # Tokenize and filter simple alphabetic words (length >= 3)
        def tokenize(s):
            return re.findall(r"\b[a-zA-Z]{3,}\b", s.lower())

        resume_tokens = tokenize(resume_text)
        job_tokens = tokenize(job_description)

        if not resume_tokens or not job_tokens:
            return {"similarity_score": 0.0, "matching_keywords": [], "missing_keywords": []}

        # Count frequencies
        vec_r = Counter(resume_tokens)
        vec_j = Counter(job_tokens)

        # Intersection
        common_words = set(vec_r.keys()).intersection(set(vec_j.keys()))
        dot_product = sum(vec_r[w] * vec_j[w] for w in common_words)

        mag_r = math.sqrt(sum(count ** 2 for count in vec_r.values()))
        mag_j = math.sqrt(sum(count ** 2 for count in vec_j.values()))

        if mag_r == 0 or mag_j == 0:
            sim = 0.0
        else:
            sim = dot_product / (mag_r * mag_j)

        sim_score = round(min(100.0, sim * 100.0 * 2.5), 1)  # scaled for readability

        # Extract tech keywords present in both
        resume_kws = set(ResumeService.extract_keywords(resume_text))
        job_kws = set(ResumeService.extract_keywords(job_description))

        matching_kws = list(resume_kws.intersection(job_kws))
        missing_kws = list(job_kws.difference(resume_kws))

        return {
            "similarity_score": sim_score,
            "matching_keywords": matching_kws,
            "missing_keywords": missing_kws,
            "total_job_keywords": len(job_kws),
        }
