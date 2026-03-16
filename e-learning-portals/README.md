# E-Learning Platform Portals

A modern, responsive e-learning platform featuring four distinct portals: Student, Instructor, Admin, and Faculty.

## 🚀 Team Collaboration
This repository is pre-structured for a 3-member development team to ensure clean code separation and consistent styling across all portals.

## 📂 Project Structure
```text
/e-learning-portals/
├── assets/             # Shared assets across all portals
│   ├── css/            # global.css (central variables & resets)
│   └── img/            # Shared images and icons
├── apps/               # The 4 main platform portals
│   ├── student/        # Student experience portal
│   ├── admin/          # Administration & System Health
│   ├── instructor/     # Class & Resource management
│   └── faculty/        # Departmental & Curriculum dashboard
├── docs/               # Technical documentation
└── backend/            # Placeholder for future API services
```

## 🛠️ Getting Started
1. **Clone the repo**: `git clone <repo-url>`
2. **Open a Portal**: Double-click any `.html` file inside the `apps/` folders to view it in your browser.
3. **Shared Styles**: All dashboards inherit styles from `/assets/css/global.css`. Edit this file for global design changes.

## 🧑‍💻 Technical Stack
- **Frontend**: HTML5, CSS3 (Vanilla), Phosphor Icons.
- **Design System**: Atomic CSS principles, HSL-based color tokens, and rounded geometry.
