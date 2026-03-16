# 🎓 LearnGo: Unified E-Learning Platform

LearnGo is a high-performance, scalable E-Learning system featuring four distinct portals for Students, Instructors, Faculty, and Administrators. This project is architected for maximum speed, modern aesthetics, and seamless team collaboration.

---

## 🏗️ Architecture: Micro-Frontend x Shared Design System
LearnGo follows a **Shared-Asset Micro-Frontend** pattern. Each portal in the `apps/` directory is an independent application that shares a common Design System.

- **Frontend**: Lightweight Vanilla HTML/CSS for sub-second load times.
- **Backend**: Node.js/Express API foundation ready for database integration.
- **Design System**: Atomic CSS principles with central HSL color tokens.

---

## 📂 Project Structure
```text
├── apps/               # Main Platform Applications
│   ├── student/        # Learning Dashboard & Progress Tracking
│   ├── instructor/     # Live Class & Resource Management
│   ├── admin/          # Platform Metrics & System Health
│   └── faculty/        # Curriculum & Departmental Governance
├── assets/             # Shared Global Assets
│   ├── css/            # global.css (Design System & CSS Variables)
│   └── img/            # Optimized shared media and logos
├── backend/            # Express.js API Foundation
├── docs/               # Architecture & Setup Guides
├── README.md           # Main project overview
└── .gitignore          # Repository cleanliness configuration
```

---

## 🚀 Getting Started

### 1. View the Front-End Portals
No complex setup required for the UI. Navigate to any folder in `apps/` and open the `.html` file:
- [Student Portal](apps/student/student-portal.html)
- [Admin Portal](apps/admin/admin-portal.html)
- [Instructor Portal](apps/instructor/instructor-portal.html)
- [Faculty Portal](apps/faculty/faculty-portal.html)

### 2. Run the API Backend
The backend provides the logic layer for authentication and data management.
```bash
cd backend
npm install
npm start
```
*Verify API Status*: Visit `http://localhost:5000/api/v1/status`

---

## 🧑‍💻 Technical Stack
| Layer | Technologies |
| :--- | :--- |
| **Frontend** | HTML5, CSS3, Phosphor Icons (CDN) |
| **Backend** | Node.js, Express, Helmet (Security), Morgan (Logging) |
| **Architecture** | Micro-Frontend, Atomic CSS, REST API |
| **Tooling** | Git, GitHub, Dotenv |

---

## 🤝 Team Collaboration Policy
This repository is pre-configured for a **3-member team**:
1. **Consistency**: Always use variables from `assets/css/global.css` for colors and spacing.
2. **Branching**: Follow the standard feature-branch workflow (`feature/name`).
3. **Icons**: Use the [Phosphor Icons](https://phosphoricons.com) library exclusively.

---

**Developed for Scalability and Performance.**
