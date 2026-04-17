# Project Evolution & Technical Summary: Base-Learn

This document provides a detailed overview of the core architectural improvements, feature implementations, and critical bug fixes completed during our development sessions.

---

## 🚀 1. Badge System Standardization
Highly accurate, role-based sidebar notifications were implemented to ensure users only see counts relevant to their scope.

- **Instructor**: Scoped content verification and marking center counts strictly to subjects assigned to the specific instructor.
- **Faculty**: Created a new logic to track pending gradings, ongoing live sessions, and rejected content waiting for resubmission.
- **Student**: Scoped live class and assignment alerts to the student's specific batch and enrollment status.

## 🔔 2. Automated Notification Core
Improved communication between user roles through automated system triggers.

- **Faculty-to-Instructor Alerts**: Integrated `notifyInstructorAsync` into the upload pipeline. Instructors now receive a real-time notification (and sidebar badge) whenever a faculty member uploads new content (Videos, Tests, Assignments, or Chapters) for verification.
- **Smart Badge Logic**: Fixed a critical bug where counts remained at zero. Updated the backend to query the `dismissedBy` array (handling global/batch notifications correctly) instead of looking for a non-existent `read` bit.

## 🖼️ 3. Brand Identity & UI/UX Polish
Modernized the platform's visual identity with specialized image processing and high-end CSS techniques.

- **Logo Integration**: Processed a new 1080x1080 master design. Used backend image processing (`Jimp`) to auto-crop the central "wide" band for header compatibility.
- **Adaptive Sidebar**: Cleaned up the navigation by removing redundant square logos, leaving a single, professional wide-format brand mark.
- **Scroll-Adaptive UI**: Implemented `mix-blend-mode` (Screen/Multiply) and CSS filters. The logo now automatically flips from **White-on-Transparent** (in the hero section) to **Dark-on-White** (on scroll), ensuring 100% visibility against all background colors.

## 🛠️ 4. Infrastructure & Deployment Stabilisation
Optimized the production environment on the E2E server for high-performance and security.

- **Large File Support**: Re-configured Nginx and proxy headers to support 5GB+ video uploads. Increased `client_max_body_size` to `10G` and extended proxy timeouts to `7200s`.
- **SSL Security**: Successfully deployed Certbot SSL for `baselearn.in` and `api.baselearn.in`.
- **CORS & Proxy Resolution**: Fixed persistent "502 Gateway" and CORS errors by standardizing Nginx reverse-proxy headers (passing `Origin`, `Host`, and `X-Forwarded-For`).

## 🐞 5. Critical Bug Fixes
- **ReferenceError Resolution**: Fixed application crashes caused by missing controller imports in `studentRoutes.js`.
- **Nginx Config Audit**: Resolved a syntax error in the site configuration that prevented server restarts.
- **Docker Orchestration**: Streamlined the deployment flow using Docker Compose for consistent environment parity.

---
> [!TIP]
> **Suggested Workflow**: After pushing changes, always run `docker compose up -d --build` to ensure the Nginx config and environment variables are refreshed.
