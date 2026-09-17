# 🦕 Dino_Mate — Full-Stack Job Marketplace & Real-Time 150+ Platform Aggregator

[![Frontend](https://img.shields.io/badge/Frontend-Vercel-black?style=for-the-badge&logo=vercel)](https://dino-mate-jar4.vercel.app/)
[![Backend](https://img.shields.io/badge/Backend-Render-46E3B7?style=for-the-badge&logo=render)](https://dinomate.onrender.com/)
[![Health Check](https://img.shields.io/badge/Health%20Route-200%20OK-brightgreen?style=for-the-badge)](https://dinomate.onrender.com/health)
[![Java](https://img.shields.io/badge/Java-17-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)](https://www.oracle.com/java/)
[![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.x-6DB33F?style=for-the-badge&logo=spring-boot&logoColor=white)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)

A complete **full-stack job portal and aggregation platform** built with **Java Spring Boot (Backend)**, **React + Vite (Frontend)**, and **PostgreSQL**.  
It supports **secure authentication**, role-based access for job seekers and employers, and a **real-time job aggregator engine** capable of ingesting live job postings from **150+ platforms** (Greenhouse, Lever, Ashby, LinkedIn, Google, Internshala, etc.) directly into the database.

---

## 🚀 Live Demo & Production Deployments

| Component | Service Platform | Live URL | Status |
| :--- | :--- | :--- | :--- |
| **🌐 Frontend Web App** | **Vercel** | [https://dino-mate-jar4.vercel.app/](https://dino-mate-jar4.vercel.app/) | ✅ Online |
| **⚡ Backend REST API** | **Render (Docker)** | [https://dinomate.onrender.com/](https://dinomate.onrender.com/) | ✅ Online |
| **🩺 Health Check Route** | **Render** | [https://dinomate.onrender.com/health](https://dinomate.onrender.com/health) | 🟢 `200 OK` |

---

📁 **Project:** Dino_Mate | Real-Time Job Aggregator & Portal  
---

## 📖 About the Project

**Dino_Mate** combines the interactive experience of platforms like LinkedIn or Indeed with an automated job ingestion engine:
- **Real-Time 150+ Platform Aggregator:** Scrape verified engineering and tech jobs directly from ATS feeds (Greenhouse, Lever, Ashby) and major platforms via UI or CLI command, with automatic deduplication and direct PostgreSQL storage.
- **REST API Backend:** Built in Spring Boot with JWT authentication, rate-limiting (Bucket4j), and async event-driven email notifications (Observer Pattern).
- **Interactive React UI:** Built with Vite and Tailwind CSS featuring a dedicated Dino Aggregator dashboard and full employer/seeker workflows.  

The project required:  
- Building a **REST API** with authentication, file upload handling, and relational data modeling in the backend.  
- Designing and implementing a **responsive React UI** from scratch without pre-made templates.  
- Managing **real-time-like updates** (e.g., notifications, application status changes).  
- Writing clean, maintainable code with modular architecture.

---
## 🛠️ Built With

### 🧠 Backend
- Java 17
- Spring Boot
- Spring Security with JWT + OAuth2
- Hibernate (JPA)
- PostgreSQL
- Cloudinary (cloud file storage)
- Docker & Docker Compose
- Lombok

For the full backend documentation and implementation details,  
please navigate to the [Backend README](./Backend/README.md).

### 🎨 Frontend
- React.js
- Vite
- Axios
- Formik
- Context API
- Tailwind CSS

### ☁️ Production Deployment
- **Vercel** — Frontend Production App: [https://dino-mate-jar4.vercel.app/](https://dino-mate-jar4.vercel.app/)
- **Render** — Backend Dockerized Web Service: [https://dinomate.onrender.com/](https://dinomate.onrender.com/)
- **Health Check API** — Public Health & Status Route: [https://dinomate.onrender.com/health](https://dinomate.onrender.com/health)
- **Cloudinary** — Secure Cloud Storage for Resumes & Profile Pictures
- **PostgreSQL / H2** — Database with HikariCP connection pooling

---

## ✨ Features

### 👤 Job Seeker
- **Authentication:** Secure sign up, sign in, and logout flows.
- **Job Discovery:** Browse, filter, and search jobs by title, location, and type.
- **Job Details:** View full job descriptions, responsibilities, and required skills.
- **Job Saving:** Save and unsave jobs with instant visual feedback.
- **Applications:** Apply to jobs, answer optional screening questions, and upload a resume.
- **Tracking:** View saved jobs, applied jobs, and detailed application status.
- **Management:** Withdraw applications at any time.
- **Profile Editing:** Update profile picture, resume, username, email, etc.
- **Notifications:** Get notified when application status changes, and mark notifications as read.

### 🧑‍💼 Employer
- **Authentication:** Sign up, sign in, and logout.
- **Job Posting:** Create and publish jobs with full details, responsibilities, skills, and optional screening questions.
- **Job Management:** Edit and delete posted jobs.
- **Applicant Management:** View applicants per job or across all jobs.
- **Decision Making:** Accept or reject applicants and notify them automatically.
- **Resume Review:** View resumes directly in-browser.
- **Dashboard:** View statistics for total jobs, applicants, accepted, rejected, and pending applications.

---
## 🌟 Why This Project Stands Out

- **60+ unique UI screens** designed and implemented manually.
- **Fully functional backend** with clean service-layer architecture and DTO separation (request/response).
- **Real database integration** (PostgreSQL) with optimized queries and entity relationships.
- **Cloud file storage** via Cloudinary for profile pictures and resume uploads.
- **Pagination** on all job listing endpoints for optimized performance and reduced server load.
- **Notification system** that mimics real-time updates using efficient state management.
- **Role-based access control** with @PreAuthorize annotations protecting every endpoint (JOB_SEEKER / EMPLOYER).
- **Global exception handling** ensuring consistent, proper error responses across the app.
- **Dockerized backend** for consistent and portable deployment.
- **CORS security** configured with secure pattern matching across local and production origins.
- **Responsive design** that adapts to all screen sizes including mobile.
- **Live production deployment** — Frontend live at [dino-mate-jar4.vercel.app](https://dino-mate-jar4.vercel.app/) and Backend live at [dinomate.onrender.com](https://dinomate.onrender.com/).


---

## 📂 Repository Architecture & Project Structure

```plaintext
DinoMate/
├── 📁 Backend/                         # Spring Boot 3.x REST API & Aggregation Engine
│   ├── 📁 src/main/java/com/job/
│   │   ├── 📁 config/                  # Security, CORS, Async, Mail & Cloudinary configurations
│   │   ├── 📁 controller/              # REST Endpoints (Health, Auth, Jobs, Apps, Aggregator)
│   │   ├── 📁 dto/                     # Request & Response Data Transfer Objects (DTOs)
│   │   ├── 📁 entity/                  # JPA Entities (User, JobSeeker, Employer, Job, Application)
│   │   ├── 📁 enums/                   # Role, JobType, WorkMode, ApplicationStatus
│   │   ├── 📁 exception/               # GlobalExceptionHandler & custom exception classes
│   │   ├── 📁 filter/                  # Bucket4j AuthRateLimitFilter (DDoS & Brute-force protection)
│   │   ├── 📁 repository/              # Spring Data JPA interfaces with optimized JPQL queries
│   │   ├── 📁 security/                # Stateless JWT AuthFilter & JwtUtil token provider
│   │   └── 📁 service/                 # Business logic & 150+ platform ingestion pipeline
│   ├── 📁 src/main/resources/          # application.properties & database schemas
│   ├── 🐳 Dockerfile                   # Multi-stage production container build
│   └── 📄 pom.xml                      # Maven dependencies & build configuration
│
├── 📁 Frontend/                        # React 18 + Vite SPA Client
│   ├── 📁 src/
│   │   ├── 📁 api/                     # Axios HTTP client, baseURL & interceptors
│   │   ├── 📁 assets/                  # Logos, icons & brand media
│   │   ├── 📁 components/              # Reusable UI (Navbar, JobCard, JobDetails, Badges)
│   │   ├── 📁 context/                 # Global state (AuthContext, NotificationContext)
│   │   ├── 📁 modals/                  # AuthModal, ApplyModal & Confirmation dialogs
│   │   ├── 📁 pages/                   # Landing, Jobs, DinoAggregator, Dashboards, Profile
│   │   └── 📁 utils/                   # Client-side multi-tier caching (SWR/TTL)
│   ├── 📄 vercel.json                  # Single-Page Application rewrite rules for Vercel
│   ├── 📄 vite.config.js               # Vite build & plugin settings
│   └── 📄 package.json                 # NPM scripts & dependencies
│
├── 📁 ScreenShots/                     # Visual walkthrough assets & feature demos
├── 📜 Full_Walkthrough.md              # Detailed 60+ UI screenshot documentation
├── ⚙️ dino-job-sync.ps1                # Automated PowerShell job ingestion script
├── ⚙️ dino-job-sync.bat                # Windows batch runner for scheduled sync
└── 📘 README.md                        # Master repository documentation
```

### 🧱 Core Architecture Layers

| Layer | Technologies | Responsibilities |
| :--- | :--- | :--- |
| **Client (Frontend)** | React 18, Vite, Tailwind CSS | Single-page UI, real-time client-side SWR caching, authentication state management, responsive job search & employer dashboards |
| **API & Security** | Spring Security, JWT, Bucket4j | Stateless token authorization, rate-limiting, CORS origin validation, public health check probes (`/health`) |
| **Business Logic** | Spring Boot Service Layer | Application workflow processing, resume upload orchestration via Cloudinary, email delivery |
| **Ingestion Matrix** | Aggregator Service, RestTemplate | Scrapes & normalizes postings from 150+ ATS platforms (Greenhouse, Lever, Ashby, LinkedIn) with SHA-256 deduplication |
| **Persistence** | PostgreSQL, Hibernate, HikariCP | Relational data persistence, indexed search queries, ACID transactions |
| **Container & Cloud** | Docker, Render, Vercel | Multi-stage containerized backend with zero-downtime health probes on Render; global edge CDN frontend on Vercel |

---

## 📄 Full Walkthrough & Documentation
To explore **all 60+ screenshots** with step-by-step explanations for both Job Seeker and Employer workflows:  
➡️ [**View Full Screenshot Walkthrough Guide**](./Full_Walkthrough.md)

