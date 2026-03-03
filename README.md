# 🎯 Multi-Domain Socio-Economic Analytics Platform

A role-based data analytics platform providing personalized insights for students, job seekers, and government stakeholders through intelligent data processing and decision-support systems.

[![Python 3.9+](https://img.shields.io/badge/python-3.9+-blue.svg)](https://www.python.org/downloads/)
[![Flask](https://img.shields.io/badge/flask-2.0+-green.svg)](https://flask.palletsprojects.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## 🎯 Problem Statement

Different stakeholders need context-aware analytical tools for socio-economic decision-making:
- *Students* need education planning and budget-based college selection
- *Job seekers* require relocation cost analysis and financial goal tracking
- *Government analysts* need population trend analysis and scheme effectiveness evaluation

Traditional platforms offer generic dashboards without role-specific insights or comparative analytics.

---

## ✨ Key Features

### 👨‍🎓 Student Module
- *Goal Tracker*: Calculate goal achievement timelines based on daily expenses and savings patterns
- *Expense Analysis*: Track category-wise spending with downloadable CSV reports
- *College Finder*: Filter 500+ institutions by state, stream, and budget constraints
- *College Comparator*: Compare colleges on fees, placements, industry tie-ups, and location metrics

### 💼 Job Seeker Module
- *Financial Planning*: Income-based goal tracking with professional expense thresholds
- *Living Cost Analyzer*: State-wise comparison of rent, utilities, transport, and job availability indices
- *Relocation Insights*: Data-driven city comparison for career moves

### 🏛️ Government Analytics Module
- *Census Explorer*: Interactive state-level analytics (population, literacy, poverty, income)
- *Census Comparator*: Historical trend analysis (1990-2025) with computed deltas and growth indicators
- *Scheme Recommender*: Filter 200+ welfare schemes by age, state, sector, and eligibility criteria

---

## 🏗️ System Architecture
┌─────────────────────────────────────────────────────────┐
│                  Flask REST API Layer                    │
│            (JWT Authentication + Role-Based Access)      │
└─────────────────────────────────────────────────────────┘
▼
┌─────────────────────────────────────────────────────────┐
│              Data Processing Pipeline                    │
│         (Pandas + NumPy Analytics Engine)                │
│  • Filtering • Aggregation • Comparison • Trend Analysis │
└─────────────────────────────────────────────────────────┘
▼
┌─────────────────────────────────────────────────────────┐
│              Multi-Dataset Integration                   │
│  • Census Data (1991/2001/2011 formats)                 │
│  • Education Dataset (500+ colleges)                     │
│  • Cost-of-Living Indices (30+ states)                   │
│  • Government Schemes (200+ programs)                    │
└─────────────────────────────────────────────────────────┘
▼
┌─────────────────────────────────────────────────────────┐
│          SQLite + SQLAlchemy Persistence Layer          │
└─────────────────────────────────────────────────────────┘
*Architecture Highlights:*
- *Role-based access control*: Distinct data views and logic per user type
- *Unified backend*: Single codebase serving multiple user domains
- *Dataset-driven*: Analytics computed from structured CSV processing, not hardcoded logic
- *Secure*: JWT authentication with token-based session management

---

## 🚀 Quick Start

### Prerequisites
- Python 3.9+
- pip

### Installation

bash
### Clone repository
git clone https://github.com/Arithra2006/CIVISENSE.git
cd socioeconomic-analytics-platform

### Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

### Install dependencies
pip install -r requirements.txt

### Initialize database
python init_db.py

### Run application
- python app.py
- The API will be available at http://localhost:5000- 
- 📊 Dataset Overview
- All datasets are synthetic, modeled on publicly available Indian government data structures:
- Dataset
- Records
- Purpose
- Census Data
- 5,000+
- State-wise demographics (1990-2025)
- Education Dataset
- 500+
- College information (fees, placements, location)
- Cost-of-Living
- 30+ states
- Utilities, rent, transport, job indices
- Government Schemes
- 200+
- Welfare programs with eligibility criteria
- Data Processing Pipeline:
- Type normalization (string → numeric conversions)
- Missing value handling (median imputation for numeric, mode for categorical)
- Year-wise mapping (handles 1991/2001/2011 census format differences)
- Metric aggregation and comparison
- 
### 🛠️ Technology Stack
- Backend & APIs:
- Python 3.9
- Flask (RESTful API framework)
- SQLAlchemy (ORM)
- JWT (Authentication)
- Data Processing:
- Pandas (Data manipulation & analytics)
- NumPy (Numerical computations)
- Database:
- SQLite (Development)
- PostgreSQL-ready (Production migration path)
- Security:
- JWT token-based authentication
- Role-based access control (RBAC)
- Password hashing (bcrypt)
### 📈 Key Differentiators
- ✅ Multi-role architecture: Single platform serving diverse user needs
- ✅ Data-driven insights: Analytics computed from processed datasets, not hardcoded
- ✅ Comparative analysis: State-wise, year-wise, and metric-based comparisons
- ✅ Decision support: Goal timelines, eligibility checks, trend analysis
- ✅ Production-aware design: JWT security, ORM abstraction, modular structure
- vs Generic Dashboards:
- Not just visualization → Actionable insights
- Not static content → Dynamic data processing
- Not single-purpose → Multi-domain analytics

### 🤝 Contributing
Contributions welcome! Please follow these steps:
Fork the repository
Create a feature branch (git checkout -b feature/AmazingFeature)
Commit changes (git commit -m 'Add AmazingFeature')
Push to branch (git push origin feature/AmazingFeature)
Open a Pull Request
### 👤 Author
- Arithra Mayur
- 📧 Email: arithramayur@gmail.com
### 🙏 Acknowledgments
- Datasets modeled on Indian government open data structures
- Inspired by real-world socio-economic decision-support needs
- Built as a demonstration of data analytics and backend engineering
