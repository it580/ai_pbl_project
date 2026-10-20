# API Documentation — CareerMatch AI
## Complete REST API Endpoint Specification

**Base URL:** `http://127.0.0.1:5000/api`

---

## 1. Authentication Endpoints

### 1.1 Register Account
- **Endpoint:** `POST /api/auth/register`
- **Auth Required:** No
- **Request Body:**
  ```json
  {
    "name": "Jane Doe",
    "email": "jane.doe@college.edu",
    "password": "Password123",
    "role": "student",
    "college": "Apex Institute of Technology",
    "degree": "B.Tech",
    "branch": "Computer Science",
    "graduation_year": 2026,
    "cgpa": 8.5
  }
  ```
- **Response (201 Created):**
  ```json
  {
    "success": true,
    "message": "Registration successful.",
    "access_token": "<jwt_access_token>",
    "user": {
      "id": 1,
      "name": "Jane Doe",
      "email": "jane.doe@college.edu",
      "role": "student",
      "has_profile": true
    }
  }
  ```

### 1.2 User Login
- **Endpoint:** `POST /api/auth/login`
- **Auth Required:** No
- **Request Body:**
  ```json
  {
    "email": "student@college.edu",
    "password": "Student@123"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Login successful.",
    "access_token": "<jwt_access_token>",
    "user": { "id": 1, "name": "Aarav Sharma", "email": "aarav.sharma@college.edu", "role": "student" }
  }
  ```

### 1.3 Get Current User Session
- **Endpoint:** `GET /api/auth/me`
- **Auth Required:** Yes (Bearer Token)
- **Response (200 OK):** Returns current user and profile summary.

---

## 2. Student Profile Endpoints

### 2.1 Get My Profile
- **Endpoint:** `GET /api/students/me`
- **Auth Required:** Yes (Student Role)
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "profile": {
      "id": 1,
      "user_id": 1,
      "name": "Aarav Sharma",
      "college": "Apex Institute of Technology",
      "degree": "B.Tech",
      "branch": "Computer Science & Engineering",
      "graduation_year": 2026,
      "cgpa": 9.15,
      "backlogs_count": 0,
      "technical_skills": ["Python", "React", "Docker", "PostgreSQL"],
      "soft_skills": ["Communication", "Agile"],
      "projects": [...],
      "completeness": { "percentage": 95.0, "is_complete": true }
    }
  }
  ```

### 2.2 Update Profile
- **Endpoint:** `PUT /api/students/me`
- **Auth Required:** Yes (Student Role)
- **Request Body:** Partial or complete profile dictionary.

### 2.3 NLP Resume Skill Extraction
- **Endpoint:** `POST /api/students/me/parse-resume`
- **Auth Required:** Yes
- **Request Body:** `{ "resume_text": "Experienced in React, Python, Flask, and Docker..." }`
- **Response (200 OK):** Returns array of recognized skills.

---

## 3. Opportunities Directory Endpoints

### 3.1 List Opportunities
- **Endpoint:** `GET /api/opportunities`
- **Auth Required:** Optional
- **Query Parameters:**
  - `search`: Keyword string
  - `work_mode`: `Remote` | `Hybrid` | `On-Site`
  - `opportunity_type`: `Full-Time` | `Internship`
  - `sort`: `newest` | `deadline` | `cgpa_asc` | `cgpa_desc`
  - `page`: Integer (default 1)
  - `limit`: Integer (default 12)

### 3.2 Get Opportunity Details
- **Endpoint:** `GET /api/opportunities/<int:id>`
- **Auth Required:** Optional

### 3.3 Create Opportunity (Admin Only)
- **Endpoint:** `POST /api/opportunities`
- **Auth Required:** Yes (Admin Role)

### 3.4 Update Opportunity (Admin Only)
- **Endpoint:** `PUT /api/opportunities/<int:id>`
- **Auth Required:** Yes (Admin Role)

### 3.5 Delete Opportunity (Admin Only)
- **Endpoint:** `DELETE /api/opportunities/<int:id>`
- **Auth Required:** Yes (Admin Role)

---

## 4. AI Recommendation & Skill-Gap Endpoints

### 4.1 Generate Recommendations
- **Endpoint:** `GET /api/recommendations` or `POST /api/recommendations/generate`
- **Auth Required:** Yes (Student Role)
- **Optional POST Body:** Custom weights dictionary `{ "weights": { "required_skills": 0.40, ... } }`
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "recommendations": [
      {
        "opportunity_id": 1,
        "opportunity": { "company": "Krypton Cloud Technologies", "title": "Full Stack Cloud Engineer" },
        "compatibility_score": 92.5,
        "score_category": "Excellent",
        "eligibility_status": "Eligible",
        "matched_required_skills": ["Python", "React", "Docker", "REST API"],
        "missing_required_skills": [],
        "components": {
          "required_skills": { "score": 100.0, "weighted_contribution": 35.0 },
          "preferred_skills": { "score": 75.0, "weighted_contribution": 11.25 },
          "academic_fit": { "score": 95.0, "weighted_contribution": 14.25 },
          "projects_certs": { "score": 85.0, "weighted_contribution": 12.75 },
          "role_industry": { "score": 100.0, "weighted_contribution": 10.0 },
          "location_workmode": { "score": 100.0, "weighted_contribution": 10.0 }
        },
        "explanation": "You fully meet the mandatory academic and batch requirements...",
        "suggested_next_steps": ["Review job description and prepare for system design interview rounds!"]
      }
    ],
    "summary": { "eligible_count": 18, "average_compatibility": 74.2 }
  }
  ```

### 4.2 Deep Skill-Gap Analysis
- **Endpoint:** `POST /api/skill-gaps/analyze`
- **Auth Required:** Yes (Student Role)
- **Request Body:** `{ "opportunity_id": 1 }`
- **Response (200 OK):** Returns matched skills, missing mandatory skills, missing preferred skills, and prioritized learning roadmap with estimated qualification times.

---

## 5. Application Pipeline & Saved Opportunities

### 5.1 List Tracked Applications
- **Endpoint:** `GET /api/applications`
- **Auth Required:** Yes (Student Role)

### 5.2 Record Application
- **Endpoint:** `POST /api/applications`
- **Auth Required:** Yes (Student Role)
- **Request Body:** `{ "opportunity_id": 1, "status": "Applied", "notes": "Interview scheduled" }`

### 5.3 Update Application Status
- **Endpoint:** `PATCH /api/applications/<int:id>`
- **Auth Required:** Yes (Student Role)
- **Request Body:** `{ "status": "Interview", "interview_date": "2026-11-05" }`

### 5.4 Saved / Bookmarked Opportunities
- `GET /api/saved-opportunities`
- `POST /api/saved-opportunities/<int:id>`
- `DELETE /api/saved-opportunities/<int:id>`

---

## 6. AI Assistant Chatbot Endpoint

### 6.1 Conversational Query
- **Endpoint:** `POST /api/assistant/chat`
- **Auth Required:** Yes (Student Role)
- **Request Body:** `{ "query": "What are my top recommendations?" }`
- **Response (200 OK):** Grounded natural language response referencing database records.
