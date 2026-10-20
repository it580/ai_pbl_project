# CareerMatch AI — Placement Opportunity Recommendation System
### Artificial Intelligence Project-Based Learning (AI PBL)

> **“Your Skills. Your Potential. Your Next Opportunity.”**

CareerMatch AI is a full-stack web application and AI-driven placement recommendation platform. It combines **mandatory institutional eligibility filtering** with a **6-factor normalized weighted compatibility scoring engine**, an **explainable skill-gap roadmap matrix**, and a **context-grounded career advisor chatbot**.

---

## 🌟 Key Capabilities & Features

1. **Mandatory Eligibility Filtration Gates**:
   - Enforces hard corporate Boolean constraints: minimum CGPA thresholds, backlog tolerances, degree & branch specifications, and graduation batch year.
   - Prevents candidate disappointment by strictly categorizing records into *Eligible*, *Potentially eligible (missing info)*, or *Not eligible*.
2. **6-Factor Normalized Scoring Engine**:
   - Technical Skill Coverage (35%)
   - Preferred / Bonus Tool Compatibility (15%)
   - Academic Fit & CGPA Surplus (15%)
   - Projects Portfolio & Certifications (15%)
   - Target Role & Industry Alignment (10%)
   - Location & Work Mode Fit (10%)
   - Real-time interactive weight tuning allows students and evaluators to adjust scoring weights on the fly.
3. **Deep Skill-Gap Matrix**:
   - Identifies exact missing mandatory vs. preferred skills.
   - Generates prioritized upskilling roadmaps with difficulty ratings, time estimates, and curated learning resources.
4. **Interactive Opportunity Comparison**:
   - Side-by-side comparison of 2 to 3 placement drives across compensation, cutoffs, and AI fit.
5. **Full Application Pipeline Tracker**:
   - Tracks stages: *Saved*, *Planning to Apply*, *Applied*, *Assessment*, *Interview*, *Offer*, *Rejected*, *Withdrawn*.
   - Includes interview date scheduler and feedback note log.
6. **NLP Resume Text Keyword Extractor**:
   - Parses pasted resume summaries using natural language term frequency extraction to automatically update profile skills.
7. **Grounded Career Assistant**:
   - Chatbot grounded in student profile and opportunity database records without live hiring hallucination.
8. **Placement Officer / Admin Portal**:
   - Institutional dashboard with placement statistics, in-demand skill frequency charts, and complete CRUD opportunity management.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Vite, Tailwind CSS, Lucide React, Recharts, React Router 6, Axios |
| **Backend** | Python 3.12, Flask, Flask-SQLAlchemy, Flask-JWT-Extended, Flask-CORS, Werkzeug |
| **Database** | SQLite (development prototype) with SQLAlchemy ORM (modular for PostgreSQL) |
| **Testing** | Pytest test suite with in-memory database isolation |

---

## 🚀 Quick Start Guide

### Prerequisites
- Python 3.10+ (tested on Python 3.12)
- Node.js 18+ and npm

---

### Step 1: Backend Setup & Database Seeding

Open a terminal in the project root:

```powershell
# 1. Create and activate Python virtual environment
python -m venv backend/venv

# Windows PowerShell:
.\backend\venv\Scripts\Activate.ps1
# (Or on Linux/macOS: source backend/venv/bin/activate)

# 2. Install Python dependencies
pip install -r backend/requirements.txt

# 3. Seed database with synthetic placement drives & diverse student profiles
python backend/seed.py

# 4. Start the Flask Backend Server (runs on http://127.0.0.1:5000)
python backend/run.py
```

---

### Step 2: Frontend Setup & Startup

Open a **second terminal** in the project root:

```powershell
# 1. Navigate to frontend directory
cd frontend

# 2. Install NPM dependencies
npm.cmd install
# (Or on Linux/macOS: npm install)

# 3. Start the Vite React Development Server (runs on http://localhost:5173)
npm.cmd run dev
# (Or on Linux/macOS: npm run dev)
```

Now open your browser and navigate to: **`http://localhost:5173`**

---

## 🔑 Demonstration Test Credentials

The database seed script automatically populates diverse test accounts designed for comprehensive demonstration:

| Role / Profile | Email | Password | Academic & Skill Context |
|---|---|---|---|
| **Administrator (Placement Officer)** | `admin@careermatch.ai` | `Admin@123` | Full admin privileges, institutional dashboard, opportunity CRUD |
| **Aarav Sharma (High Match CS)** | `aarav.sharma@college.edu` | `Student@123` | CGPA: 9.15, CS, MERN Stack, Docker, AWS, 0 Backlogs (Top eligible matches) |
| **Priya Patel (AI / Data Science)** | `priya.patel@college.edu` | `Student@123` | CGPA: 7.85, IT, Python, ML, Pandas, SQL (High fit for AI/ML roles) |
| **Rohan Verma (ECE / Embedded)** | `rohan.verma@college.edu` | `Student@123` | CGPA: 6.45, ECE, C++, Linux (Shows eligibility boundaries & lower cutoffs) |
| **Ananya Singh (1 Backlog Test)** | `ananya.singh@college.edu` | `Student@123` | CGPA: 8.52, CS, Java, Spring Boot, **1 active backlog** (Demonstrates backlog gate) |
| **Dev Test Student** | `dev.test@college.edu` | `Student@123` | General test account |

> **Pro-Tip:** The login page (`/login`) includes **one-click quick-fill buttons** for Aarav, Priya, Rohan, and Admin for instantaneous testing!

---

## 🧪 Running the Backend Automated Test Suite

To run the complete automated test suite on an isolated in-memory test database:

```powershell
# In the project root with virtual environment activated:
.\backend\venv\Scripts\pytest.exe backend/tests -v
```

All 19 test modules verify:
- Authentication & password hashing
- Role-based route authorization
- Student profile updates & completeness calculation
- Opportunity filtering & search
- Recommendation ranking & 6-factor scoring math
- Mandatory eligibility gate filtration
- Skill-gap coverage & prioritized roadmap generation
- Application tracking & bookmarking
- Analytics aggregations

---

## 📁 Repository Directory Structure

```text
ai_pbl_project/
├── backend/
│   ├── app/
│   │   ├── __init__.py               # Flask application factory, CORS, JWT error handlers
│   │   ├── config.py                 # Configuration classes (Dev, Test, Prod)
│   │   ├── models/                   # SQLAlchemy database models
│   │   │   ├── user.py               # User account model (student/admin)
│   │   │   ├── student.py            # Student profile with JSON skill arrays & completeness
│   │   │   ├── opportunity.py        # Placement opportunity listing model
│   │   │   ├── application.py        # Student application pipeline model
│   │   │   └── saved_opportunity.py  # Student bookmarks model
│   │   ├── routes/                   # Modular REST API blueprints
│   │   │   ├── auth.py               # /api/auth (register, login, me)
│   │   │   ├── students.py           # /api/students (profile, completeness, NLP resume parse)
│   │   │   ├── opportunities.py      # /api/opportunities (search, filter, pagination, admin CRUD)
│   │   │   ├── recommendations.py    # /api/recommendations (6-factor ranked placements)
│   │   │   ├── skill_gaps.py         # /api/skill-gaps (coverage & upskilling priorities)
│   │   │   ├── saved_opportunities.py# /api/saved-opportunities (bookmarks)
│   │   │   ├── applications.py       # /api/applications (application pipeline tracker)
│   │   │   ├── analytics.py          # /api/analytics (student & admin dashboards)
│   │   │   ├── admin.py              # /api/admin (user & system overview)
│   │   │   └── assistant.py          # /api/assistant (grounded career advisor chat)
│   │   ├── services/                 # Recommendation engine & analytical logic
│   │   │   ├── eligibility_service.py# Mandatory Boolean criteria evaluation
│   │   │   ├── recommendation_engine.py # 6-factor compatibility scoring formula
│   │   │   ├── skill_gap_service.py  # Prioritized roadmap matrix
│   │   │   ├── resume_service.py     # NLP keyword extraction
│   │   │   └── assistant_service.py  # Grounded career advisor response generator
│   │   └── utils/
│   │       └── auth_decorators.py    # @admin_required, @student_required
│   ├── tests/                        # 19 automated Pytest test cases
│   ├── seed.py                       # 24 synthetic opportunities & 5 student profiles
│   ├── requirements.txt              # Backend dependencies
│   ├── run.py                        # Backend server entry point
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── components/common/        # Reusable Navbar, Sidebar, ScoreBadge, EligibilityBadge, Toasts
│   │   ├── context/                  # AuthContext, ToastContext
│   │   ├── layouts/                  # AppLayout (responsive navigation frame)
│   │   ├── pages/                    # 16 full-featured pages
│   │   │   ├── LandingPage.jsx       # Hero, tagline, live metrics, quick-login buttons
│   │   │   ├── LoginPage.jsx         # Sign in with instant demo fill shortcuts
│   │   │   ├── RegisterPage.jsx      # Student registration & academic background
│   │   │   ├── StudentOnboardingPage.jsx # Multi-step skill & preference setup wizard
│   │   │   ├── StudentDashboardPage.jsx  # Live metrics, readiness score, top recommendations
│   │   │   ├── StudentProfilePage.jsx    # Complete profile editor & NLP resume parser
│   │   │   ├── OpportunitiesPage.jsx     # Search, filter, and paginated directory
│   │   │   ├── OpportunityDetailPage.jsx # Job details, AI score callout, skill matrix
│   │   │   ├── RecommendationsPage.jsx   # Ranked matches with interactive weights tuner
│   │   │   ├── SkillGapPage.jsx          # Deep skill coverage & learning roadmap
│   │   │   ├── OpportunityComparePage.jsx # Side-by-side multi-opportunity comparison
│   │   │   ├── SavedOpportunitiesPage.jsx# Bookmarked opportunities management
│   │   │   ├── ApplicationTrackerPage.jsx# Status pipeline tracker & notes log
│   │   │   ├── CareerAssistantPage.jsx   # Conversational AI advisor chatbot
│   │   │   ├── AIArchitecturePage.jsx    # System architecture & interactive formula simulator
│   │   │   ├── AdminDashboardPage.jsx    # Institutional analytics & demand charts
│   │   │   ├── AdminOpportunitiesPage.jsx# Admin CRUD opportunities table
│   │   │   └── AccountSettingsPage.jsx   # Account credentials & token info
│   │   ├── services/
│   │   │   └── api.js                # Axios client with JWT interceptor & API endpoints
│   │   ├── App.jsx                   # React Router routing hierarchy
│   │   ├── index.css                 # Custom glassmorphism, styling tokens, scrollbars
│   │   └── main.jsx
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── .env.example
│
├── docs/
│   ├── system_architecture.md        # Architecture diagrams, math formulas, data flow
│   └── api_documentation.md          # Full REST endpoint schemas & payloads
│
├── README.md
└── .gitignore
```

---

## 🛠️ Common Troubleshooting

1. **PowerShell Script Execution Restriction**:
   If `npm` or `venv` scripts fail due to execution policy, use `npm.cmd` directly or run:
   ```powershell
   Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
   ```
2. **Port Conflicts**:
   - Backend defaults to port `5000`. You can customize via `PORT=5001` in `.env`.
   - Frontend defaults to port `5173`.
3. **Database Re-seeding**:
   To reset the database at any time with fresh synthetic opportunities and demonstration accounts, simply run:
   ```powershell
   python backend/seed.py
   ```

---

## 📄 Academic Project Details
- **Project Title:** Placement Opportunity Recommendation System (CareerMatch AI)
- **Course / Domain:** Artificial Intelligence Project-Based Learning (PBL)
- **Tagline:** *“Your Skills. Your Potential. Your Next Opportunity.”*
