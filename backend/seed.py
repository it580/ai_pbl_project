"""
CareerMatch AI — Database Seeding Script
Populates the database with synthetic placement opportunities, diverse student profiles,
applications, bookmarks, and a default administrator account.
"""

import sys
import os
from datetime import datetime, timezone

# Ensure project root is on sys.path
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from app import create_app, db
from app.models.user import User
from app.models.student import StudentProfile
from app.models.opportunity import Opportunity
from app.models.application import Application
from app.models.saved_opportunity import SavedOpportunity


def seed_database():
    app = create_app("development")
    with app.app_context():
        print("Resetting and creating all database tables...")
        db.drop_all()
        db.create_all()

        # -------------------------------------------------------------
        # 1. Administrator Account
        # -------------------------------------------------------------
        print("Creating Administrator account...")
        admin_user = User(
            name="Placement Officer Admin",
            email="admin@careermatch.ai",
            role="admin",
        )
        admin_user.set_password("Admin@123")
        db.session.add(admin_user)

        # -------------------------------------------------------------
        # 2. Diverse Student Accounts
        # -------------------------------------------------------------
        print("Creating synthetic student profiles...")

        students_data = [
            {
                "user": {"name": "Aarav Sharma", "email": "aarav.sharma@college.edu"},
                "password": "Student@123",
                "profile": {
                    "college": "Apex Institute of Technology",
                    "degree": "B.Tech",
                    "branch": "Computer Science & Engineering",
                    "graduation_year": 2026,
                    "cgpa": 9.15,
                    "backlogs_count": 0,
                    "technical_skills": ["Python", "React", "Node.js", "Docker", "PostgreSQL", "JavaScript", "TypeScript", "Git", "REST API", "Tailwind CSS"],
                    "soft_skills": ["Technical Communication", "Agile Collaboration", "Problem Solving", "Leadership"],
                    "projects": [
                        {
                            "title": "CloudMetrics Distributed Monitoring Dashboard",
                            "description": "High-throughput telemetry collector using React, Node.js, and Docker microservices with PostgreSQL time-series storage.",
                            "tech_stack": ["React", "Node.js", "Docker", "PostgreSQL"],
                            "live_url": "https://github.com/example/cloudmetrics",
                        },
                        {
                            "title": "FinFlow Algorithmic Trading Analytics",
                            "description": "Real-time portfolio backtesting pipeline in Python and Flask with interactive charting and RESTful endpoints.",
                            "tech_stack": ["Python", "Flask", "REST API"],
                            "live_url": "https://github.com/example/finflow",
                        },
                    ],
                    "certifications": [
                        {"name": "AWS Certified Cloud Practitioner", "issuer": "Amazon Web Services", "year": "2025"},
                        {"name": "Meta Front-End Developer Professional Certificate", "issuer": "Coursera / Meta", "year": "2024"},
                    ],
                    "experience": [
                        {"role": "Full Stack Engineering Intern", "company": "Nova Labs", "duration": "3 months", "description": "Built reactive customer portal components in React and optimized PostgreSQL queries."}
                    ],
                    "preferred_roles": ["Full Stack Developer", "Software Engineer", "Frontend Engineer", "Cloud Engineer"],
                    "preferred_industries": ["Fintech", "Cloud Infrastructure", "Enterprise SaaS"],
                    "preferred_locations": ["Bangalore", "Hyderabad", "Remote"],
                    "preferred_work_mode": "Hybrid",
                    "resume_text": "Aarav Sharma. Computer Science graduate skilled in Python, React, Node.js, Docker, PostgreSQL, REST APIs. Built distributed monitoring tools and fintech analytics pipelines. AWS Certified.",
                },
            },
            {
                "user": {"name": "Priya Patel", "email": "priya.patel@college.edu"},
                "password": "Student@123",
                "profile": {
                    "college": "State College of Engineering",
                    "degree": "B.Tech",
                    "branch": "Information Technology",
                    "graduation_year": 2026,
                    "cgpa": 7.85,
                    "backlogs_count": 0,
                    "technical_skills": ["Python", "SQL", "Machine Learning", "Pandas", "NumPy", "Scikit-Learn", "Flask", "Data Visualization", "Git"],
                    "soft_skills": ["Analytical Thinking", "Cross-Functional Collaboration", "Presentation"],
                    "projects": [
                        {
                            "title": "Predictive Customer Churn Classifier",
                            "description": "Trained ensemble gradient-boosted trees on 50,000 telco records with 89% accuracy; deployed Flask inference endpoint.",
                            "tech_stack": ["Python", "Machine Learning", "Flask", "SQL"],
                            "live_url": "https://github.com/example/churn-ml",
                        },
                        {
                            "title": "HealthScan Medical Imaging Pipeline",
                            "description": "Exploratory data analysis and convolutional feature extraction using Scikit-Learn and Pandas.",
                            "tech_stack": ["Python", "Pandas", "NumPy"],
                            "live_url": "https://github.com/example/healthscan",
                        },
                    ],
                    "certifications": [
                        {"name": "IBM Data Science Professional Certificate", "issuer": "IBM", "year": "2024"},
                    ],
                    "experience": [],
                    "preferred_roles": ["Data Scientist", "Machine Learning Engineer", "Data Analyst", "AI Engineer"],
                    "preferred_industries": ["Healthtech", "E-commerce", "AI & Robotics"],
                    "preferred_locations": ["Bangalore", "Pune", "Mumbai"],
                    "preferred_work_mode": "Hybrid",
                    "resume_text": "Priya Patel. B.Tech IT student focusing on Machine Learning, Python, SQL, Pandas, Flask. Deployed predictive customer churn model and health image analysis pipelines.",
                },
            },
            {
                "user": {"name": "Rohan Verma", "email": "rohan.verma@college.edu"},
                "password": "Student@123",
                "profile": {
                    "college": "Metropolitan Institute of Technology",
                    "degree": "B.Tech",
                    "branch": "Electronics & Communication",
                    "graduation_year": 2025,
                    "cgpa": 6.45,
                    "backlogs_count": 0,
                    "technical_skills": ["C++", "Python", "SQL", "Linux", "Git", "Embedded Systems"],
                    "soft_skills": ["Troubleshooting", "Curiosity", "Resilience"],
                    "projects": [
                        {
                            "title": "Smart IoT Environmental Logger",
                            "description": "Microcontroller sensor node streaming environmental metrics via MQTT and Python subscriber to SQLite database.",
                            "tech_stack": ["C++", "Python", "SQL"],
                            "live_url": "https://github.com/example/iot-logger",
                        }
                    ],
                    "certifications": [],
                    "experience": [],
                    "preferred_roles": ["Software Engineer", "Embedded Engineer", "QA Engineer", "Backend Developer"],
                    "preferred_industries": ["Automotive", "Telecom", "Hardware Tech"],
                    "preferred_locations": ["Pune", "Chennai", "Bangalore"],
                    "preferred_work_mode": "On-Site",
                    "resume_text": "Rohan Verma. Electronics engineer with strong programming foundation in C++, Python, Linux, and embedded systems. Seeking entry-level software opportunities.",
                },
            },
            {
                "user": {"name": "Ananya Singh", "email": "ananya.singh@college.edu"},
                "password": "Student@123",
                "profile": {
                    "college": "Apex Institute of Technology",
                    "degree": "B.Tech",
                    "branch": "Computer Science & Engineering",
                    "graduation_year": 2026,
                    "cgpa": 8.52,
                    "backlogs_count": 1,  # 1 active backlog for eligibility testing
                    "technical_skills": ["Java", "Spring Boot", "SQL", "React", "JavaScript", "Git", "REST API"],
                    "soft_skills": ["Teamwork", "Adaptability", "Time Management"],
                    "projects": [
                        {
                            "title": "Enterprise Inventory Management System",
                            "description": "Role-based inventory tracker built with Java Spring Boot and React frontend.",
                            "tech_stack": ["Java", "Spring Boot", "React", "SQL"],
                            "live_url": "https://github.com/example/enterprise-inventory",
                        }
                    ],
                    "certifications": [
                        {"name": "Oracle Certified Associate Java SE", "issuer": "Oracle", "year": "2024"}
                    ],
                    "experience": [],
                    "preferred_roles": ["Java Developer", "Backend Developer", "Full Stack Developer"],
                    "preferred_industries": ["Fintech", "Banking", "Enterprise SaaS"],
                    "preferred_locations": ["Bangalore", "Noida", "Gurgaon"],
                    "preferred_work_mode": "Hybrid",
                    "resume_text": "Ananya Singh. Java and Spring Boot backend developer with experience in React and SQL databases. Oracle certified with enterprise web application projects.",
                },
            },
            {
                "user": {"name": "Dev Test Student", "email": "dev.test@college.edu"},
                "password": "Student@123",
                "profile": {
                    "college": "National Institute of Science & Tech",
                    "degree": "B.Tech",
                    "branch": "Computer Science",
                    "graduation_year": 2026,
                    "cgpa": 8.10,
                    "backlogs_count": 0,
                    "technical_skills": ["Python", "JavaScript", "React", "SQL", "Git", "Flask"],
                    "soft_skills": ["Communication", "Problem Solving"],
                    "projects": [
                        {
                            "title": "Campus Placement Portal",
                            "description": "Student management web app in Flask and React.",
                            "tech_stack": ["Python", "Flask", "React", "SQL"],
                            "live_url": "https://github.com/example/placement-portal",
                        }
                    ],
                    "certifications": [],
                    "experience": [],
                    "preferred_roles": ["Full Stack Developer", "Software Engineer"],
                    "preferred_industries": ["Technology", "EdTech"],
                    "preferred_locations": ["Bangalore", "Remote"],
                    "preferred_work_mode": "Hybrid",
                    "resume_text": "Dev Test Student. CS senior with experience in Python, Flask, React, and SQL.",
                },
            },
        ]

        created_students = []
        for s_info in students_data:
            user = User(
                name=s_info["user"]["name"],
                email=s_info["user"]["email"],
                role="student",
            )
            user.set_password(s_info["password"])
            db.session.add(user)
            db.session.flush()

            profile = StudentProfile(
                user_id=user.id,
                **s_info["profile"]
            )
            db.session.add(profile)
            db.session.flush()
            created_students.append(profile)

        # -------------------------------------------------------------
        # 3. 24 Synthetic Placement Opportunities
        # -------------------------------------------------------------
        print("Creating 24 synthetic placement opportunities...")

        opportunities_data = [
            # 1. High match for Aarav (Full Stack / Cloud)
            {
                "company": "Krypton Cloud Technologies",
                "title": "Full Stack Cloud Engineer",
                "description": "Join our core infrastructure team building scalable microservices and developer dashboard interfaces. You will develop backend REST APIs in Node.js and Python, containerize services using Docker, and construct high-performance frontends with React and TypeScript.",
                "opportunity_type": "Full-Time",
                "industry": "Cloud Infrastructure",
                "required_skills": ["Python", "React", "Docker", "REST API"],
                "preferred_skills": ["PostgreSQL", "TypeScript", "Node.js", "Kubernetes"],
                "min_cgpa": 7.5,
                "max_backlogs": 0,
                "eligible_branches": ["Computer Science & Engineering", "Information Technology", "Computer Science"],
                "eligible_degrees": ["B.Tech", "B.E.", "M.Tech"],
                "eligible_graduation_years": [2025, 2026],
                "experience_required_years": 0.0,
                "location": "Bangalore",
                "work_mode": "Hybrid",
                "salary_range": "₹12.0 - 16.0 LPA",
                "deadline": "2026-11-30",
                "application_url": "https://kryptoncloud.example.com/careers/fs-2026",
                "is_open": True,
            },
            # 2. Top Tier Fintech (High CGPA 8.5+ gate)
            {
                "company": "Apex Financial Systems",
                "title": "Associate Software Engineer — Trading Infrastructure",
                "description": "Apex Financial Systems is seeking top analytical talent to optimize low-latency transaction processing pipelines and financial risk analytics. Ideal candidates demonstrate elite algorithmic proficiency and solid database engineering.",
                "opportunity_type": "Full-Time",
                "industry": "Fintech",
                "required_skills": ["Python", "PostgreSQL", "SQL", "Git"],
                "preferred_skills": ["Docker", "Linux", "REST API"],
                "min_cgpa": 8.5,  # Filters out Priya (7.85) and Rohan (6.45)
                "max_backlogs": 0,  # Filters out Ananya (1 backlog)
                "eligible_branches": ["Computer Science & Engineering", "Information Technology", "Computer Science"],
                "eligible_degrees": ["B.Tech", "B.E."],
                "eligible_graduation_years": [2026],
                "experience_required_years": 0.0,
                "location": "Bangalore",
                "work_mode": "On-Site",
                "salary_range": "₹18.0 - 24.0 LPA",
                "deadline": "2026-11-15",
                "application_url": "https://apexfin.example.com/campus/trading",
                "is_open": True,
            },
            # 3. High match for Priya (AI / ML)
            {
                "company": "NeuraHealth Diagnostics",
                "title": "Junior Machine Learning Engineer",
                "description": "NeuraHealth applies deep neural networks and computer vision to healthcare analytics. In this role, you will preprocess clinical imaging datasets, train gradient boosted and convolutional classifiers, and construct RESTful prediction endpoints.",
                "opportunity_type": "Full-Time",
                "industry": "Healthtech",
                "required_skills": ["Python", "Machine Learning", "Pandas", "SQL"],
                "preferred_skills": ["Scikit-Learn", "Flask", "Docker"],
                "min_cgpa": 7.0,
                "max_backlogs": 0,
                "eligible_branches": ["Information Technology", "Computer Science & Engineering", "Computer Science", "Data Science"],
                "eligible_degrees": ["B.Tech", "B.E.", "M.Tech"],
                "eligible_graduation_years": [2025, 2026],
                "experience_required_years": 0.0,
                "location": "Pune",
                "work_mode": "Hybrid",
                "salary_range": "₹9.5 - 13.5 LPA",
                "deadline": "2026-12-05",
                "application_url": "https://neurahealth.example.com/jobs/ml-jr",
                "is_open": True,
            },
            # 4. Open to ECE / Electronics / All Branches (Moderate CGPA 6.0)
            {
                "company": "Vortex Embedded Robotics",
                "title": "Embedded Software & Firmware Engineer",
                "description": "Develop hardware-level drivers and sensor communications for modern autonomous industrial robotics. Requires sound familiarity with C++, Linux environments, embedded protocols, and basic Python automation scripting.",
                "opportunity_type": "Full-Time",
                "industry": "Hardware Tech",
                "required_skills": ["C++", "Linux", "Git"],
                "preferred_skills": ["Python", "Embedded Systems", "SQL"],
                "min_cgpa": 6.0,  # Rohan is eligible!
                "max_backlogs": 0,
                "eligible_branches": ["Electronics & Communication", "Electrical Engineering", "Computer Science", "Information Technology", "All"],
                "eligible_degrees": ["B.Tech", "B.E."],
                "eligible_graduation_years": [2025, 2026],
                "experience_required_years": 0.0,
                "location": "Pune",
                "work_mode": "On-Site",
                "salary_range": "₹6.5 - 9.0 LPA",
                "deadline": "2026-11-20",
                "application_url": "https://vortexrobotics.example.com/careers/firmware",
                "is_open": True,
            },
            # 5. Java / Enterprise match for Ananya (Permits 1 Backlog!)
            {
                "company": "GlobalEdge Consulting & Solutions",
                "title": "Enterprise Java Application Developer",
                "description": "GlobalEdge builds foundational ERP and financial workflow platforms for Fortune 500 enterprises. We are recruiting talented Java developers with strong object-oriented principles, Spring Boot familiarity, and relational database mastery.",
                "opportunity_type": "Full-Time",
                "industry": "Enterprise SaaS",
                "required_skills": ["Java", "Spring Boot", "SQL"],
                "preferred_skills": ["React", "REST API", "Docker"],
                "min_cgpa": 7.0,
                "max_backlogs": 1,  # Permits Ananya!
                "eligible_branches": ["Computer Science & Engineering", "Information Technology", "Computer Science"],
                "eligible_degrees": ["B.Tech", "B.E.", "MCA"],
                "eligible_graduation_years": [2025, 2026],
                "experience_required_years": 0.0,
                "location": "Noida",
                "work_mode": "Hybrid",
                "salary_range": "₹8.0 - 11.0 LPA",
                "deadline": "2026-11-25",
                "application_url": "https://globaledge.example.com/campus/java",
                "is_open": True,
            },
            # 6. Remote Frontend Developer
            {
                "company": "PixelCraft Studio",
                "title": "Frontend React Developer",
                "description": "PixelCraft crafts modern web applications and component libraries. You will collaborate closely with UI/UX designers to implement pixel-perfect, accessible React interfaces with smooth micro-animations using Tailwind CSS.",
                "opportunity_type": "Full-Time",
                "industry": "Technology",
                "required_skills": ["React", "JavaScript", "Tailwind CSS"],
                "preferred_skills": ["TypeScript", "Git", "REST API"],
                "min_cgpa": 6.5,
                "max_backlogs": 0,
                "eligible_branches": ["All"],
                "eligible_degrees": ["B.Tech", "B.E.", "BCA", "MCA"],
                "eligible_graduation_years": [2025, 2026],
                "experience_required_years": 0.0,
                "location": "Remote",
                "work_mode": "Remote",
                "salary_range": "₹7.5 - 11.5 LPA",
                "deadline": "2026-12-15",
                "application_url": "https://pixelcraft.example.com/apply/react",
                "is_open": True,
            },
            # 7. Backend Python / API Engineer
            {
                "company": "StrataScale Systems",
                "title": "Backend Python / Microservices Engineer",
                "description": "Design and maintain high-throughput asynchronous services and event-driven architectures. Focus on database query optimization, Redis caching, and robust RESTful API contracts.",
                "opportunity_type": "Full-Time",
                "industry": "Enterprise SaaS",
                "required_skills": ["Python", "Flask", "SQL", "REST API"],
                "preferred_skills": ["Docker", "PostgreSQL", "Git"],
                "min_cgpa": 7.0,
                "max_backlogs": 0,
                "eligible_branches": ["Computer Science & Engineering", "Information Technology", "Computer Science"],
                "eligible_degrees": ["B.Tech", "B.E."],
                "eligible_graduation_years": [2025, 2026],
                "experience_required_years": 0.0,
                "location": "Hyderabad",
                "work_mode": "Hybrid",
                "salary_range": "₹10.0 - 14.0 LPA",
                "deadline": "2026-12-10",
                "application_url": "https://stratascale.example.com/careers/backend",
                "is_open": True,
            },
            # 8. Data Analyst / BI
            {
                "company": "OmniInsights Analytics",
                "title": "Business Intelligence & Data Analyst",
                "description": "Extract actionable business narratives from massive transactional data warehouses. You will craft complex SQL aggregations, build interactive executive dashboards, and automate reporting pipelines.",
                "opportunity_type": "Full-Time",
                "industry": "E-commerce",
                "required_skills": ["SQL", "Python", "Data Visualization"],
                "preferred_skills": ["Pandas", "Power BI", "Git"],
                "min_cgpa": 6.8,
                "max_backlogs": 0,
                "eligible_branches": ["All"],
                "eligible_degrees": ["B.Tech", "B.E.", "B.Sc", "MCA"],
                "eligible_graduation_years": [2025, 2026],
                "experience_required_years": 0.0,
                "location": "Bangalore",
                "work_mode": "Hybrid",
                "salary_range": "₹7.0 - 9.5 LPA",
                "deadline": "2026-11-28",
                "application_url": "https://omniinsights.example.com/jobs/bi-analyst",
                "is_open": True,
            },
            # 9. Cloud DevOps Engineer (Missing skill test for many: Kubernetes)
            {
                "company": "AetherCloud Solutions",
                "title": "Cloud DevOps & Platform Engineer",
                "description": "Automate CI/CD delivery pipelines and manage multi-region Kubernetes clusters. You will implement Infrastructure-as-Code, manage container registries, and monitor service telemetry.",
                "opportunity_type": "Full-Time",
                "industry": "Cloud Infrastructure",
                "required_skills": ["Docker", "Kubernetes", "Linux", "Git"],
                "preferred_skills": ["Python", "AWS", "CI/CD"],
                "min_cgpa": 7.2,
                "max_backlogs": 0,
                "eligible_branches": ["Computer Science & Engineering", "Information Technology", "Computer Science"],
                "eligible_degrees": ["B.Tech", "B.E."],
                "eligible_graduation_years": [2025, 2026],
                "experience_required_years": 0.0,
                "location": "Hyderabad",
                "work_mode": "Remote",
                "salary_range": "₹11.0 - 15.0 LPA",
                "deadline": "2026-12-20",
                "application_url": "https://aethercloud.example.com/devops",
                "is_open": True,
            },
            # 10. QA Automation Engineer
            {
                "company": "Reliant Quality Labs",
                "title": "SDET / QA Automation Engineer",
                "description": "Formulate automated integration test suites and end-to-end regression frameworks. Create resilient test scripts in Python/Selenium for web applications and API validation.",
                "opportunity_type": "Full-Time",
                "industry": "Technology",
                "required_skills": ["Python", "SQL", "Git"],
                "preferred_skills": ["Docker", "REST API", "Selenium"],
                "min_cgpa": 6.2,
                "max_backlogs": 0,
                "eligible_branches": ["All"],
                "eligible_degrees": ["B.Tech", "B.E.", "MCA"],
                "eligible_graduation_years": [2025, 2026],
                "experience_required_years": 0.0,
                "location": "Chennai",
                "work_mode": "Hybrid",
                "salary_range": "₹6.0 - 8.5 LPA",
                "deadline": "2026-11-22",
                "application_url": "https://reliantqa.example.com/sdet",
                "is_open": True,
            },
            # 11. Summer 2026 Software Internship (High Stipend)
            {
                "company": "Zephyr Technologies",
                "title": "Software Engineering Intern — Summer 2026",
                "description": "Accelerate your career through a rigorous 6-month software engineering internship. Work directly alongside senior architects developing real-time distributed web systems with full conversion PPO potential.",
                "opportunity_type": "Internship",
                "industry": "Technology",
                "required_skills": ["Python", "JavaScript", "SQL"],
                "preferred_skills": ["React", "Git", "REST API"],
                "min_cgpa": 7.5,
                "max_backlogs": 0,
                "eligible_branches": ["Computer Science & Engineering", "Information Technology", "Computer Science"],
                "eligible_degrees": ["B.Tech", "B.E."],
                "eligible_graduation_years": [2026],
                "experience_required_years": 0.0,
                "location": "Bangalore",
                "work_mode": "Hybrid",
                "salary_range": "₹45,000 / month Stipend (PPO: ₹14 LPA)",
                "deadline": "2026-11-10",
                "application_url": "https://zephyr.example.com/internships",
                "is_open": True,
            },
            # 12. Cybersecurity Analyst
            {
                "company": "Fortress Cyber Defense",
                "title": "Cybersecurity Operations & Threat Analyst",
                "description": "Safeguard cloud infrastructure against advanced network intrusions and security vulnerabilities. Perform security audits, inspect firewall logs, and implement automated vulnerability scanning scripts.",
                "opportunity_type": "Full-Time",
                "industry": "Cybersecurity",
                "required_skills": ["Linux", "Python", "Networking"],
                "preferred_skills": ["Git", "Docker", "Wireshark"],
                "min_cgpa": 6.8,
                "max_backlogs": 0,
                "eligible_branches": ["Computer Science & Engineering", "Information Technology", "Electronics & Communication"],
                "eligible_degrees": ["B.Tech", "B.E."],
                "eligible_graduation_years": [2025, 2026],
                "experience_required_years": 0.0,
                "location": "Bangalore",
                "work_mode": "On-Site",
                "salary_range": "₹8.0 - 11.5 LPA",
                "deadline": "2026-12-08",
                "application_url": "https://fortresscyber.example.com/threat-analyst",
                "is_open": True,
            },
            # 13. Mobile Application Developer
            {
                "company": "AppPulse Interactive",
                "title": "React Native Mobile Developer",
                "description": "Build snappy, cross-platform iOS and Android apps using React Native and TypeScript. Integrate RESTful backend services, push notifications, and local offline caching.",
                "opportunity_type": "Full-Time",
                "industry": "Technology",
                "required_skills": ["React", "JavaScript", "TypeScript"],
                "preferred_skills": ["REST API", "Git", "Redux"],
                "min_cgpa": 6.5,
                "max_backlogs": 0,
                "eligible_branches": ["All"],
                "eligible_degrees": ["B.Tech", "B.E.", "MCA"],
                "eligible_graduation_years": [2025, 2026],
                "experience_required_years": 0.0,
                "location": "Mumbai",
                "work_mode": "Hybrid",
                "salary_range": "₹7.5 - 10.5 LPA",
                "deadline": "2026-11-29",
                "application_url": "https://apppulse.example.com/mobile-dev",
                "is_open": True,
            },
            # 14. Deep Learning / NLP Research Intern
            {
                "company": "Synapse Cognitive AI",
                "title": "NLP & Generative AI Research Intern",
                "description": "Collaborate on fine-tuning large language models and building retrieval-augmented generation (RAG) vector pipelines. Practical experience with PyTorch and Python required.",
                "opportunity_type": "Internship",
                "industry": "Artificial Intelligence",
                "required_skills": ["Python", "Machine Learning", "Deep Learning"],
                "preferred_skills": ["PyTorch", "Git", "Transformers"],
                "min_cgpa": 8.0,
                "max_backlogs": 0,
                "eligible_branches": ["Computer Science & Engineering", "Information Technology", "Data Science"],
                "eligible_degrees": ["B.Tech", "M.Tech"],
                "eligible_graduation_years": [2026],
                "experience_required_years": 0.0,
                "location": "Bangalore",
                "work_mode": "Hybrid",
                "salary_range": "₹55,000 / month Stipend (PPO: ₹18 LPA)",
                "deadline": "2026-11-18",
                "application_url": "https://synapseai.example.com/nlp-intern",
                "is_open": True,
            },
            # 15. EdTech Full Stack Engineer
            {
                "company": "EduSphere Learning Labs",
                "title": "Full Stack Web Developer — Student Experience",
                "description": "Empower millions of learners worldwide through seamless interactive classroom portals. Deliver responsive React frontends paired with modular Node.js/PostgreSQL backends.",
                "opportunity_type": "Full-Time",
                "industry": "EdTech",
                "required_skills": ["React", "Node.js", "PostgreSQL"],
                "preferred_skills": ["Tailwind CSS", "REST API", "Docker"],
                "min_cgpa": 6.8,
                "max_backlogs": 0,
                "eligible_branches": ["All"],
                "eligible_degrees": ["B.Tech", "B.E.", "MCA"],
                "eligible_graduation_years": [2025, 2026],
                "experience_required_years": 0.0,
                "location": "Bangalore",
                "work_mode": "Remote",
                "salary_range": "₹9.0 - 13.0 LPA",
                "deadline": "2026-12-12",
                "application_url": "https://edusphere.example.com/careers/fs-eng",
                "is_open": True,
            },
            # 16. Closed Opportunity for testing filter
            {
                "company": "Legacy Systems Corp",
                "title": "Mainframe & Legacy Maintenance Associate",
                "description": "Support legacy enterprise banking architectures. This recruitment drive is now completed.",
                "opportunity_type": "Full-Time",
                "industry": "Banking",
                "required_skills": ["SQL", "C++"],
                "preferred_skills": ["Linux"],
                "min_cgpa": 6.0,
                "max_backlogs": 2,
                "eligible_branches": ["All"],
                "eligible_degrees": ["B.Tech", "B.E."],
                "eligible_graduation_years": [2024, 2025],
                "experience_required_years": 0.0,
                "location": "Chennai",
                "work_mode": "On-Site",
                "salary_range": "₹5.0 - 7.0 LPA",
                "deadline": "2026-09-01",
                "application_url": "https://legacycorp.example.com/closed",
                "is_open": False,  # Closed opportunity
            },
            # 17. High Experience Requirement (Filters out freshers)
            {
                "company": "Apex Senior Engineering",
                "title": "Senior Solutions Architect",
                "description": "Lead enterprise cloud transformations. Requires at least 2.5 years of professional industrial experience.",
                "opportunity_type": "Full-Time",
                "industry": "Enterprise SaaS",
                "required_skills": ["Python", "Docker", "Kubernetes", "AWS"],
                "preferred_skills": ["PostgreSQL", "System Design"],
                "min_cgpa": 7.0,
                "max_backlogs": 0,
                "eligible_branches": ["All"],
                "eligible_degrees": ["B.Tech", "M.Tech"],
                "eligible_graduation_years": [2023, 2024],
                "experience_required_years": 2.5,  # Filters freshers!
                "location": "Bangalore",
                "work_mode": "Hybrid",
                "salary_range": "₹25.0 - 35.0 LPA",
                "deadline": "2026-12-01",
                "application_url": "https://apexsenior.example.com/architect",
                "is_open": True,
            },
            # 18. E-Commerce Backend (Flask / Postgres)
            {
                "company": "CartSwift Logistics",
                "title": "Backend Orders & Inventory Engineer",
                "description": "Scale real-time checkout pipelines and warehouse dispatch queuing. Build high-availability microservices in Python Flask and PostgreSQL.",
                "opportunity_type": "Full-Time",
                "industry": "E-commerce",
                "required_skills": ["Python", "Flask", "PostgreSQL"],
                "preferred_skills": ["Docker", "Redis", "Git"],
                "min_cgpa": 7.0,
                "max_backlogs": 0,
                "eligible_branches": ["Computer Science & Engineering", "Information Technology"],
                "eligible_degrees": ["B.Tech", "B.E."],
                "eligible_graduation_years": [2025, 2026],
                "experience_required_years": 0.0,
                "location": "Bangalore",
                "work_mode": "Hybrid",
                "salary_range": "₹11.0 - 15.0 LPA",
                "deadline": "2026-11-26",
                "application_url": "https://cartswift.example.com/backend-eng",
                "is_open": True,
            },
            # 19. Computer Vision Engineer
            {
                "company": "OpticSens Robotics",
                "title": "Autonomous Vision Algorithms Engineer",
                "description": "Develop 3D spatial mapping and object detection pipelines for industrial automated sorting drones.",
                "opportunity_type": "Full-Time",
                "industry": "AI & Robotics",
                "required_skills": ["Python", "C++", "Machine Learning"],
                "preferred_skills": ["OpenCV", "Deep Learning", "Linux"],
                "min_cgpa": 7.8,
                "max_backlogs": 0,
                "eligible_branches": ["Computer Science & Engineering", "Electronics & Communication"],
                "eligible_degrees": ["B.Tech", "M.Tech"],
                "eligible_graduation_years": [2025, 2026],
                "experience_required_years": 0.0,
                "location": "Hyderabad",
                "work_mode": "On-Site",
                "salary_range": "₹13.0 - 17.5 LPA",
                "deadline": "2026-12-22",
                "application_url": "https://opticsens.example.com/vision-eng",
                "is_open": True,
            },
            # 20. Microservices Go / Node
            {
                "company": "HyperFlow Data Mesh",
                "title": "Distributed Streaming Systems Engineer",
                "description": "High-throughput telemetry routing using Kafka, Docker, and distributed Node.js/Go message brokers.",
                "opportunity_type": "Full-Time",
                "industry": "Cloud Infrastructure",
                "required_skills": ["Node.js", "Docker", "Git"],
                "preferred_skills": ["Kafka", "Kubernetes", "PostgreSQL"],
                "min_cgpa": 7.5,
                "max_backlogs": 0,
                "eligible_branches": ["Computer Science & Engineering", "Information Technology"],
                "eligible_degrees": ["B.Tech", "B.E."],
                "eligible_graduation_years": [2026],
                "experience_required_years": 0.0,
                "location": "Bangalore",
                "work_mode": "Hybrid",
                "salary_range": "₹14.0 - 19.0 LPA",
                "deadline": "2026-12-05",
                "application_url": "https://hyperflow.example.com/stream-dev",
                "is_open": True,
            },
            # 21. Entry Level Web Trainee (Very low threshold)
            {
                "company": "BrightPath Digital",
                "title": "Graduate Web Development Trainee",
                "description": "Comprehensive 3-month structured bootcamp followed by deployment onto client web applications. Open to freshers eager to grow in frontend development.",
                "opportunity_type": "Full-Time",
                "industry": "Technology",
                "required_skills": ["JavaScript", "Git"],
                "preferred_skills": ["React", "HTML", "CSS"],
                "min_cgpa": 5.5,
                "max_backlogs": 1,
                "eligible_branches": ["All"],
                "eligible_degrees": ["B.Tech", "B.E.", "BCA", "B.Sc", "MCA"],
                "eligible_graduation_years": [2025, 2026],
                "experience_required_years": 0.0,
                "location": "Indore",
                "work_mode": "On-Site",
                "salary_range": "₹4.5 - 6.0 LPA",
                "deadline": "2026-12-30",
                "application_url": "https://brightpath.example.com/grad-trainee",
                "is_open": True,
            },
            # 22. Database Administrator Trainee
            {
                "company": "DataCore Storage Labs",
                "title": "Junior Database Administrator",
                "description": "Monitor relational database health, configure replication, analyze slow query logs, and maintain automated backup schedules.",
                "opportunity_type": "Full-Time",
                "industry": "Enterprise SaaS",
                "required_skills": ["SQL", "PostgreSQL", "Linux"],
                "preferred_skills": ["Python", "Docker", "Git"],
                "min_cgpa": 6.5,
                "max_backlogs": 0,
                "eligible_branches": ["All"],
                "eligible_degrees": ["B.Tech", "B.E.", "MCA"],
                "eligible_graduation_years": [2025, 2026],
                "experience_required_years": 0.0,
                "location": "Chennai",
                "work_mode": "Hybrid",
                "salary_range": "₹6.5 - 9.0 LPA",
                "deadline": "2026-11-24",
                "application_url": "https://datacore.example.com/dba-jr",
                "is_open": True,
            },
            # 23. M.Tech Specialized Role (Filters out B.Tech students)
            {
                "company": "QuantumDeep Research Labs",
                "title": "Research Scientist — Algorithmic Optimization",
                "description": "Conduct cutting-edge algorithmic complexity modeling. Requires postgraduate degree in computer science or applied mathematics.",
                "opportunity_type": "Full-Time",
                "industry": "Artificial Intelligence",
                "required_skills": ["Python", "C++", "Machine Learning"],
                "preferred_skills": ["Linear Algebra", "Optimization"],
                "min_cgpa": 8.5,
                "max_backlogs": 0,
                "eligible_branches": ["Computer Science & Engineering"],
                "eligible_degrees": ["M.Tech", "Ph.D."],  # Filters B.Tech!
                "eligible_graduation_years": [2025, 2026],
                "experience_required_years": 0.0,
                "location": "Bangalore",
                "work_mode": "Hybrid",
                "salary_range": "₹22.0 - 30.0 LPA",
                "deadline": "2026-12-15",
                "application_url": "https://quantumdeep.example.com/research",
                "is_open": True,
            },
            # 24. Healthtech Full Stack
            {
                "company": "CuraSync Health Tech",
                "title": "Full Stack Health Informatics Developer",
                "description": "Develop secure telehealth patient communication portals compliant with HIPAA standards. Construct React components and secure Python REST APIs.",
                "opportunity_type": "Full-Time",
                "industry": "Healthtech",
                "required_skills": ["Python", "React", "REST API"],
                "preferred_skills": ["PostgreSQL", "Docker", "TypeScript"],
                "min_cgpa": 7.0,
                "max_backlogs": 0,
                "eligible_branches": ["All"],
                "eligible_degrees": ["B.Tech", "B.E."],
                "eligible_graduation_years": [2025, 2026],
                "experience_required_years": 0.0,
                "location": "Bangalore",
                "work_mode": "Remote",
                "salary_range": "₹10.5 - 14.5 LPA",
                "deadline": "2026-12-18",
                "application_url": "https://curasync.example.com/careers/health-dev",
                "is_open": True,
            },
        ]

        created_opps = []
        for opp_info in opportunities_data:
            opp = Opportunity(**opp_info)
            db.session.add(opp)
            db.session.flush()
            created_opps.append(opp)

        # -------------------------------------------------------------
        # 4. Pre-Populate Saved Opportunities and Applications
        # -------------------------------------------------------------
        print("Populating sample applications and bookmarks...")

        aarav = created_students[0]
        priya = created_students[1]
        ananya = created_students[3]

        # Aarav applications & saved
        saved1 = SavedOpportunity(student_id=aarav.id, opportunity_id=created_opps[0].id)  # Krypton
        saved2 = SavedOpportunity(student_id=aarav.id, opportunity_id=created_opps[1].id)  # Apex Financial
        db.session.add_all([saved1, saved2])

        app1 = Application(
            student_id=aarav.id,
            opportunity_id=created_opps[0].id,
            status="Interview",
            notes="Completed round 1 technical coding assessment on trees and graphs. Final system design round scheduled.",
            interview_date="2026-11-05",
        )
        app2 = Application(
            student_id=aarav.id,
            opportunity_id=created_opps[1].id,
            status="Applied",
            notes="Submitted online resume through campus placement portal.",
        )
        app3 = Application(
            student_id=aarav.id,
            opportunity_id=created_opps[6].id,  # StrataScale
            status="Assessment",
            notes="Take-home coding challenge received.",
        )
        db.session.add_all([app1, app2, app3])

        # Priya applications & saved
        saved_p1 = SavedOpportunity(student_id=priya.id, opportunity_id=created_opps[2].id)  # NeuraHealth
        app_p1 = Application(
            student_id=priya.id,
            opportunity_id=created_opps[2].id,
            status="Offer",
            notes="Received formal offer letter! ₹11 LPA base package.",
        )
        db.session.add_all([saved_p1, app_p1])

        # Ananya applications
        app_an1 = Application(
            student_id=ananya.id,
            opportunity_id=created_opps[4].id,  # GlobalEdge Java
            status="Planning to Apply",
            notes="Reviewing Java Spring Boot security and JPA concepts before test.",
        )
        db.session.add(app_an1)

        db.session.commit()
        print("\n=======================================================")
        print("CareerMatch AI Database Seeded Successfully!")
        print(f"Users created: {User.query.count()} (Admin: 1, Students: {len(created_students)})")
        print(f"Opportunities created: {Opportunity.query.count()}")
        print(f"Applications created: {Application.query.count()}")
        print(f"Saved Opportunities: {SavedOpportunity.query.count()}")
        print("\nDemo Accounts:")
        print("  Administrator: admin@careermatch.ai / Admin@123")
        print("  Student (High Match Tech): aarav.sharma@college.edu / Student@123")
        print("  Student (AI/Data): priya.patel@college.edu / Student@123")
        print("  Student (ECE/Embedded): rohan.verma@college.edu / Student@123")
        print("  Student (1 Backlog): ananya.singh@college.edu / Student@123")
        print("  Student (Dev Test): dev.test@college.edu / Student@123")
        print("=======================================================\n")


if __name__ == "__main__":
    seed_database()
