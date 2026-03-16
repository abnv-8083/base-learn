# Base Learn 🚀

Welcome to the central repository for **Base Learn**, our next-generation e-learning platform. This project utilizes a modular monorepo architecture to house our distinct portals (Admin, Student, Instructor, Faculty) alongside our backend services.

## 🛠 Tech Stack

* **Frontend:** React, React Router
* **Backend:** Node.js, Express.js
* **Databases:** * PostgreSQL / Supabase (Relational data, auth, roles)
    * MongoDB (High-speed granular video analytics)

---

## 📂 Project Structure

This repository is organized as a monorepo. Everything lives here!

```text
antigravity/
│
├── frontend/                 # All React applications
│   ├── student-portal/
│   ├── admin-portal/
│   ├── instructor-portal/
│   └── shared-components/    # Reusable UI elements (buttons, video players)
│
├── backend/                  # Node/Express API
│   ├── src/
│   │   ├── UserManagement/
│   │   ├── CourseApprovals/
│   │   └── VideoAnalytics/
│   └── package.json
│
└── README.md