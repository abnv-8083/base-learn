# 🎓 Base Learn — Modern E-Learning Platform

**Base Learn** is a comprehensive, full-stack Learning Management System (LMS) designed to bridge the gap between students, faculty, and administrators. It provides a seamless environment for live classes, recorded content, assignment management, and detailed academic analysis.

---

## 🚀 Key Features

### 👥 Role-Based Access Control
- **Student Portal**: Access live classes, watch recordings, submit assignments, and track personal progression.
- **Admin Dashboard**: Full platform control, managing users (Students, Faculty, Instructors), batches, and system analytics.
- **Faculty Hub**: Create content, schedule live classes, manage assignments, and grade student submissions.
- **Instructor Panel**: High-level content pipeline management, student performance analysis, and batch coordination.

### 📚 Academic Tools
- **Live Classes**: Integrated scheduling and participation tracking for real-time learning.
- **Recorded Content**: Organized video library for self-paced study.
- **Assignments & Tests**: End-to-end management from creation to grading and feedback.
- **Analytics & Progression**: Visual insights into student performance and batch-level trends.

---

## 🛠 Tech Stack

### Frontend
- **React.js** + **Vite** for a performant, modern UI.
- **React Router 7** for smooth navigation and role-based routing.
- **Vanilla CSS** for precise, professional styling (Deep Navy & Electric Cyan).
- **Lucide React** for clean, modern iconography.
- **Axios** for robust API communication.

### Backend
- **Node.js** + **Express.js** providing a scalable REST API.
- **MongoDB** + **Mongoose** for flexible data modeling and persistence.
- **JWT & Bcrypt** for secure, stateless authentication and encryption.
- **Nodemailer** for email notifications and OTP verification.
- **Multer** for efficient file and media uploads.

---

## 📂 Project Structure

```bash
base-learn/
├── client/                # React Frontend (Vite)
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Role-specific dashboard pages
│   │   ├── context/       # Auth and Global state
│   │   └── style.css      # Design system core
├── server/                # Node.js Backend (Express)
│   ├── models/            # Mongoose schemas
│   ├── controllers/       # Business logic handlers
│   ├── routes/            # API endpoints
│   └── server.js          # Entry point
└── docs/                  # Detailed project documentation
```

---

## ⚙️ Getting Started

### Prerequisites
- Node.js (v16+)
- MongoDB (Atlas or Local)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/abnv-8083/Base-Learn.git
   cd Base-Learn
   ```

2. **Setup Server**
   ```bash
   cd server
   npm install
   # Create a .env file with your MONGO_URI, JWT_SECRET, etc.
   npm run dev
   ```

3. **Setup Client**
   ```bash
   cd ../client
   npm install
   npm run dev
   ```

---

## 📄 Documentation
For detailed information on features, API endpoints, and design system, please refer to the files in the `docs/` folder.

---

## 👨‍💻 Team
Built with ❤️ by a dedicated 3-member development team.
