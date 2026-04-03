# 🎓 BaseLearn — E-Learning Platform
### Full Project Blueprint & Feature Specification

---

## 📌 Table of Contents

1. [Project Overview](#project-overview)
2. [Implementation map (this repository)](#implementation-map-this-repository)
3. [Tech Stack Recommendations](#tech-stack)
4. [Portal Architecture](#portal-architecture)
5. [Landing Page](#1-landing-page)
6. [Student Portal](#2-student-portal)
7. [Faculty Portal](#3-faculty-portal)
8. [Instructor Portal](#4-instructor-portal)
9. [Admin Portal](#5-admin-portal)
10. [Cross-Portal Sync & Notifications](#cross-portal-sync)
11. [Live Class System (BigBlueButton)](#live-class-system)
12. [Authentication & Security](#authentication--security)
13. [Additional Features to Consider](#additional-features-to-consider)
14. [UI/UX Guidelines](#uiux-guidelines)
15. [Database Schema Overview](#database-schema-overview)
16. [API Structure Overview](#api-structure-overview)

---

## Project Overview

**BaseLearn** is a multi-portal e-learning platform designed for educational institutions. It supports a full lifecycle — from student enquiry and onboarding, through live and recorded learning, to assessment, grading, and analytics — across four distinct portals with role-based access control.

**Portals:**
- 🌐 Landing Page
- 🎒 Student Portal
- 👩‍🏫 Faculty Portal
- 🧑‍💼 Instructor Portal
- 🛡️ Admin Portal

---

## Implementation map (this repository)

This document is the **product blueprint** (target vision). The **`Base-Learn` repo** (`web/` + `server/`) implements a **working slice** of that vision with a few intentional stack differences.

### Stack: blueprint vs this repo

| Area | Blueprint | Implemented |
|------|-----------|-------------|
| SPA | Vite + React Router | **Next.js 16** (App Router) in `web/` |
| Data fetching | TanStack Query | **axios** + React `useEffect` (no React Query) |
| Toasts | Sonner | **react-hot-toast** (global `Providers` in `web/src/app/layout.js`) |
| API base path | `/api/v1` | **`/api`** — Next.js rewrites to Express (`web/next.config.mjs`, env `API_PROXY_TARGET`, default `http://127.0.0.1:5000`) |
| Database | PostgreSQL + Prisma | **MongoDB + Mongoose** (`server/models/`) |
| Auth | Access + refresh (httpOnly) | **JWT** Bearer in `sessionStorage` per role (`bl_token_{role}` in `web/src/store/authStore.js`) |

### Frontend routes (`web/src/app`)

| Concept | Paths |
|---------|--------|
| Public | `/` (landing), `/login`, `/register`, `/signup` → register, `/staff-login` |
| Student | `/student/dashboard`, `/student/progression`, `/student/recorded-classes`, `/student/live-classes`, `/student/assignments`, `/student/tests`, `/student/profile` |
| Faculty | `/faculty/dashboard`, `/faculty/content`, `/faculty/live-classes`, `/faculty/students`, `/faculty/assignments` |
| Instructor | `/instructor/dashboard`, `/instructor/batches`, `/instructor/students`, `/instructor/content` |
| Admin | `/admin/dashboard`, `/admin/users`, `/admin/curriculum`, `/admin/system` |

### Backend entrypoints (`server/routes/`)

| Router | Mount | Role |
|--------|-------|------|
| `authRoutes.js` | `/api/auth` | Login, logout, me, admission-enquiry, OTP, notifications, refresh |
| `studentRoutes.js` | `/api/student` | Dashboard, recordings, live classes, assignments, tests, assessments, profile |
| `facultyRoutes.js` | `/api/faculty` | Content, live classes, students, grading |
| `instructorRoutes.js` | `/api/instructor` | Subjects/chapters/videos, batches, students, assessments, notifications |
| `adminRoutes.js` | `/api/admin` | Dashboard, users, classes, subjects, **batches**, activity logs, profile requests, settings |

Concrete handlers are in `server/controllers/`; models in `server/models/`.

### Feature coverage (high level)

| Blueprint area | In repo |
|----------------|---------|
| Landing + enquiry | **Yes** — enquiry → `POST /api/auth/admission-enquiry`; delivery uses `SystemSettings` (email / WhatsApp prefs) |
| Student: My Classes / chapters / PYQ / DPP | **Partial** — recordings, progression, assignments; not full chapter/PYQ/DPP split as in spec |
| Student: calendar | **Not** as a dedicated route in `web` |
| Faculty: upload + student analysis | **Partial** — content upload **yes**; full analytics spec **TBD** |
| Instructor: batch + content | **Yes** |
| Admin: users + curriculum (batches/classes/subjects) | **Yes** |
| Admin: dedicated Enquiries CRM | **Yes** — enquiries stored in MongoDB + **`/admin/enquiries`**; status workflow (new / contacted / enrolled / dropped) |
| Forgot password | **Yes** — `POST /api/auth/forgot-password` + `reset-password`; **`/forgot-password`** page |
| Student calendar | **Yes** — **`GET /api/student/calendar`** + **`/student/calendar`** (live + assignment + test due dates) |
| Faculty / Instructor notifications UI | **Yes** — **`/faculty/notifications`**, **`/instructor/notifications`** (uses `/api/auth/notifications`) |
| Admin: payments / invoices | **Partial** — e.g. mock payment hooks; full Razorpay/Stripe as in blueprint **TBD** |
| Live: BBB at scale | **Partial** — `bbbService.js`, `LiveClass` model; Scalelite etc. **TBD** |
| Forgot password page | **Not** wired in `authRoutes` as `/forgot-password` |

### How to run locally

1. **API:** `cd server` → `npm run dev` (port **5000** by default).  
2. **Web:** `cd web` → `npm run dev` (port **3000**).  
3. Requests from the browser go to **same origin** `/api/...`; Next proxies to the API. If login returns **404**, the API is not running or `API_PROXY_TARGET` is wrong.

---

## Tech Stack

### Frontend
- **Framework:** React 18+ (with Vite as build tool)
- **Routing:** React Router v6 (with nested routes per portal)
- **Styling:** Tailwind CSS + your existing design system
- **State Management:** Zustand (lightweight, portal-scoped stores)
- **Server State / API Calls:** TanStack Query (React Query v5) — caching, refetching, loading states
- **Forms:** React Hook Form + Zod (validation)
- **Video Player:** Video.js or Plyr (with quality switching support)
- **Calendar:** FullCalendar.js
- **Charts/Analytics:** Recharts or Chart.js
- **PDF Viewer:** react-pdf
- **Notifications:** Sonner (toasts) — lightweight and beautiful
- **Modals/Dialogs:** Radix UI or Headless UI
- **Icons:** Lucide React
- **Date Handling:** Day.js

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** PostgreSQL (primary) + Redis (caching/sessions)
- **ORM:** Prisma
- **Auth:** Custom JWT (access token + refresh token rotation)
- **File Storage:** AWS S3 / Cloudflare R2 / DigitalOcean Spaces
- **Email:** Nodemailer + SendGrid / Resend
- **WhatsApp Integration:** Twilio WhatsApp API or Meta Cloud API
- **Live Classes:** BigBlueButton (self-hosted or BBB Cloud)
- **Video Processing:** FFmpeg (for transcoding + quality levels)
- **Background Jobs:** BullMQ + Redis
- **API Structure:** RESTful with `/api/v1/` prefix
- **Validation:** Zod (shared schema types between frontend and backend)
- **Logging:** Winston + Morgan

### DevOps
- **Frontend Hosting:** Netlify / Vercel (static React build)
- **Backend Hosting:** Railway / Render / DigitalOcean VPS
- **CDN:** Cloudflare
- **Monitoring:** Sentry (errors) + Posthog (analytics)
- **Environment:** `.env` per environment (dev / staging / prod)

---

## Portal Architecture

### Routing Structure (React Router v6)

```
/ (App.jsx — root)
├── /                        → Landing Page (public)
├── /login                   → Single login page (public)
├── /forgot-password         → Password reset (public)
│
├── /student/*               → Student Portal (ProtectedRoute: role=student)
│   ├── /student/classes
│   ├── /student/classes/:subjectId
│   ├── /student/classes/:subjectId/:chapterId
│   ├── /student/classes/:subjectId/:chapterId/watch/:videoId
│   ├── /student/live
│   ├── /student/assignments
│   ├── /student/calendar
│   └── /student/profile
│
├── /faculty/*               → Faculty Portal (ProtectedRoute: role=faculty)
│   ├── /faculty/upload
│   ├── /faculty/analysis
│   ├── /faculty/live
│   ├── /faculty/notifications
│   └── /faculty/profile
│
├── /instructor/*            → Instructor Portal (ProtectedRoute: role=instructor)
│   ├── /instructor/content
│   ├── /instructor/assignments
│   ├── /instructor/live
│   ├── /instructor/analytics
│   ├── /instructor/notifications
│   └── /instructor/profile
│
└── /admin/*                 → Admin Portal (ProtectedRoute: role=admin)
    ├── /admin/dashboard
    ├── /admin/users
    ├── /admin/users/:id
    ├── /admin/enquiries
    ├── /admin/payments
    ├── /admin/logs
    └── /admin/settings
```

### ProtectedRoute Logic
Each portal is wrapped in a `<ProtectedRoute>` component that:
1. Checks if a valid JWT exists in memory (or httpOnly cookie)
2. Decodes the role from the token
3. Redirects to `/login` if unauthenticated
4. Redirects to the correct portal if the role doesn't match the route

### Folder Structure (Vite + React)

```
baselearn-frontend/
├── public/
├── src/
│   ├── assets/               → Images, icons, fonts
│   ├── components/
│   │   ├── ui/               → Reusable: Button, Modal, Toast, Badge, Card...
│   │   ├── layout/           → Sidebar, Topbar, PageWrapper, Breadcrumb
│   │   └── shared/           → VideoPlayer, PDFViewer, CalendarWidget...
│   ├── pages/
│   │   ├── landing/
│   │   ├── auth/
│   │   ├── student/
│   │   ├── faculty/
│   │   ├── instructor/
│   │   └── admin/
│   ├── hooks/                → useAuth, useToast, useModal, useLiveClass...
│   ├── store/                → Zustand stores (authStore, notifStore...)
│   ├── services/             → API call functions per portal
│   ├── utils/                → formatDate, formatDuration, validators...
│   ├── constants/            → roles, routes, API endpoints
│   ├── styles/               → global.css, your design system tokens
│   ├── App.jsx               → Root with React Router setup
│   └── main.jsx              → Vite entry point
├── .env
├── vite.config.js
└── package.json
```

Each portal uses role-based access. A single `/login` page authenticates the user and React Router redirects to the correct portal based on the JWT role.

---

## 1. Landing Page

### Purpose
Public-facing page to attract students and capture leads via enquiry form.

### Sections
- **Hero Section** — tagline, CTA buttons (Enroll Now, Watch Demo)
- **About BaseLearn** — platform overview
- **Courses/Programs** — available batches/subjects preview
- **Why BaseLearn** — features highlight (Live Classes, Recorded, PYQ, etc.)
- **Testimonials** — student reviews
- **Faculty Showcase** — brief faculty profiles
- **FAQ Section**
- **Enquiry Form** (see below)
- **Footer** — links, social, contact

### Enquiry Form
**Fields:**
- Student Name *(required)*
- Class/Grade *(required)*
- School Name
- Phone Number *(required)*
- Parent/Guardian Name
- Parent Phone Number
- Email Address
- Course/Subject Interested In
- Message / How did you hear about us?

**Submission Flow:**
1. Student fills and submits the form
2. Form validates all required fields (inline error messages)
3. Success toast: *"Your enquiry has been submitted! We'll contact you soon."*
4. Confirmation modal shown with next steps
5. Enquiry is sent to:
   - **Email** configured by admin in Settings
   - **WhatsApp** number configured by admin in Settings (via API)
6. Enquiry is saved in Admin panel under **Enquiries** tab

**Admin can configure** delivery method (Email only / WhatsApp only / Both) from Admin Settings.

---

## 2. Student Portal

### Access
Students receive login credentials (email + auto-generated password) via email after registration by Admin/Instructor.

### Layout
- Sidebar navigation (collapsible on mobile)
- Top bar with notifications bell, profile avatar
- Breadcrumb navigation

---

### 2.1 My Classes

**Overview:**
Grid of Subject Cards assigned to the student's batch by the Instructor.

**Subject Card contains:**
- Subject name, icon/thumbnail
- Assigned faculty name
- Progress bar (% chapters completed)
- Click → opens Chapter List

**Chapter List:**
- Cards for each chapter assigned by Faculty
- Chapter name, description, completion status
- Click → opens Chapter Detail

**Chapter Detail — 3 Tabs:**

#### 📹 Recorded Classes
- List of recorded video lessons
- Each video card shows: title, duration, upload date, faculty name, thumbnail
- Click → Video Player Page
  - **Video Player Features:**
    - Quality selector (360p / 480p / 720p / 1080p)
    - Playback speed control (0.5x, 0.75x, 1x, 1.25x, 1.5x, 2x)
    - Progress save (resumes from last position)
    - Fullscreen support
    - Keyboard shortcuts
  - **Attached Resources tab:**
    - Notes (PDF download)
    - Assignment (PDF download/view)
    - See All Resources button → lists all attachments for that class
  - Watch time is tracked and sent to analytics

#### 📄 PYQ Questions (Previous Year Questions)
- Grid/list of PYQ PDFs uploaded by Faculty
- Each item: title, subject, year, page count
- Options:
  - 👁️ **View** — opens in-browser PDF viewer
  - ⬇️ **Download** — downloads the PDF
- Filter by year, subject, chapter

#### 📋 DPP Questions (Daily Practice Problems)
- Same layout and functions as PYQ
- Grid/list of DPP PDFs
- View and Download options
- Filter by date, chapter

---

### 2.2 Live Classes

**Overview:**
Lists all Live Class sessions assigned to the student's batch.

**Two Tabs:**
- **Ongoing** — currently live sessions (Join button active)
- **Upcoming** — scheduled sessions with date/time countdown

**Live Class Card shows:**
- Subject, Faculty name
- Scheduled date & time
- Duration estimate
- Status badge (Live Now / Upcoming / Ended)

**Joining a Live Class:**
- Clicks "Join" → opens BigBlueButton session in new tab or embedded iframe
- Student can only **view and listen** to the faculty (camera/mic off by default)
- Student can raise hand, use chat, react with emojis
- Session supports **200–300 concurrent students** (BBB scaling via load balancer)

**After Session Ends:**
- Recorded live class is automatically uploaded here
- Appears under a **Recorded Sessions** sub-tab
- Student can rewatch with full playback controls

---

### 2.3 Assignments & Tests

**Two Tabs:**
- **Upcoming** — pending assignments/tests with due date
- **Completed** — submitted ones with grade/feedback

**Assignment/Test Card shows:**
- Title, Subject, Faculty name
- Due date with countdown timer
- Total marks
- Status (Pending / Submitted / Graded)

**Submission Flow:**
1. Student clicks on assignment
2. Views the attached PDF question paper
3. Uploads answer (PDF or image)
4. Clicks Submit → confirmation modal → toast on success
5. After faculty grades it, student sees:
   - Marks obtained / Total marks
   - Faculty feedback/comments
   - Graded answer sheet (if shared)

**Test Flow:**
- If test is online (MCQ), it opens in a timed test interface
- Auto-submit on timer end
- Instant result for MCQ type
- Manual grading for subjective type by faculty

---

### 2.4 Calendar

**Features:**
- Monthly / Weekly / Daily views
- Color-coded events:
  - 🔵 Upcoming Live Classes
  - 🟠 Assignment Due Dates
  - 🟢 Test Dates
  - 🟣 Completed Items
- Click on event → quick detail popup with Join/View button
- Sync option to export to Google Calendar / iCal
- Reminder notifications 1 hour before events

---

### 2.5 Profile

**Sections:**
- **Personal Info:** Name, Email, Phone, School, Class/Grade
- **Parent Details:** Parent name, phone
- **Batch Info:** Assigned batch, enrolled subjects
- **Change Password**
- **Profile Photo Upload**
- **Notification Preferences** (Email / In-app)

---

## 3. Faculty Portal

### Access
Created by Admin. Faculty credentials sent via email. Each faculty is assigned to **one subject**.

### Layout
- Sidebar navigation
- Top bar with notifications, profile

---

### 3.1 Upload Contents

**Overview:**
Faculty uploads all learning materials organized by subject → class → chapter.

**Content Cards (mirrors Student Portal structure):**
Each card represents a chapter, with options to manage its content.

**For each Chapter Card:**
- **Recorded Classes sub-section:**
  - Upload new video (drag & drop or file picker)
  - Video processing status (Uploading → Processing → Ready)
  - Add title, description, chapter tag
  - Attach Notes (PDF)
  - Attach Assignment (PDF)
  - List of all uploaded videos with edit/delete options
  - Toggle visibility (visible to students / hidden)
  - **Sync indicator** — shows if it's visible in Student Portal

- **PYQ Questions sub-section:**
  - Upload PDF(s) — bulk upload supported
  - Add year, title, tags
  - List all uploaded PYQs
  - Edit / Delete / Toggle visibility
  
- **DPP Questions sub-section:**
  - Upload PDF(s)
  - Schedule release date (optional)
  - List all uploaded DPPs
  - Edit / Delete / Toggle visibility

**All uploads show:**
- Upload confirmation toast
- Processing spinner for videos
- Error handling with retry option

---

### 3.2 Students Analysis

**Overview:**
Detailed analytics on student engagement and activity.

**Filters:** By batch, subject, date range, individual student

**Metrics Available:**

| Metric | Details |
|---|---|
| Online Time | Total time student was active on platform |
| Video Watch Duration | How long each student watched each recorded class |
| Watch Speed | Speed at which student watched (0.5x, 1x, 2x, etc.) |
| Video Completion % | What % of each video was watched |
| Live Class Entry Time | Exact time student joined live session |
| Live Class Exit Time | Exact time student left live session |
| Network Drop Events | Auto-tracked disconnections with reconnect logs |
| Assignment Submission | On-time vs. late submissions |
| Test Scores | Per-student, per-test score history |

**Network Drop Handling:**
- If student loses connection during live class, system logs the disconnect
- Student can rejoin and session continues
- Faculty dashboard shows list of students who dropped with reason tag (Network Issue / Left Manually)
- Student does NOT get penalized for network drops

**Visualizations:**
- Bar chart: Watch time per student
- Line chart: Student engagement over time
- Heatmap: Active hours of students
- Table view with export to CSV/Excel

---

### 3.3 Live Classes

**Create Live Session:**
- Form fields: Title, Subject, Class/Batch, Date, Time, Estimated Duration
- Session type: Regular Class / FAQ Session / Doubt Session
- Click "Create" → confirmation modal → BBB session link generated
- Session appears in Student Portal calendar & Live Classes tab

**Live Session Controls (inside BBB):**
- Faculty can see all students (thumbnails in sidebar)
- Students are muted by default
- Faculty can unmute a specific student (for Q&A)
- Whiteboard with shapes, text, draw tools
- Screen sharing
- Polls / Quick quiz during session
- Breakout rooms (for small group discussions)
- Chat (faculty can moderate)
- Raise hand queue management
- Recording toggle (starts/stops recording)

**After Session:**
- "End Session" button → confirmation modal
- Recording is auto-processed and uploaded to Student Portal
- Faculty gets a toast: *"Recording is being processed and will be available shortly."*
- Session summary: duration, attendance count, peak concurrent students

**FAQ Session type:**
- Students can submit questions before the session (pre-session Q&A form)
- Faculty sees submitted questions in a panel during the live session
- Questions can be upvoted by students

---

### 3.4 Notifications

- List of all notifications from Admin and Instructor
- Filter: Unread / All / By type
- Mark as read / Mark all as read
- Notification categories: Assignment feedback, New batch assigned, Platform update, Admin message

---

### 3.5 Profile

- Name, Email, Phone, Subject specialization
- Bio / About (displayed in student portal faculty section)
- Profile photo
- Change password
- Working hours / availability (optional)

---

## 4. Instructor Portal

### Role
The Instructor is the coordinator. They manage the mapping between faculty content and student batches, handle assignment routing, and oversee live sessions and student progress.

### Layout
- Sidebar navigation
- Dashboard with summary cards

---

### 4.1 Content Assignment

**Function:**
Map faculty-uploaded content to appropriate batches.

**Workflow:**
1. View list of all faculty-uploaded content (by subject, chapter, date)
2. Select content → Assign to Batch(es)
3. Confirmation modal before assignment
4. Toast: *"Content successfully assigned to Batch [X]"*
5. Students in that batch immediately see the content in My Classes

**Filters:** By faculty, subject, chapter, batch, content type

---

### 4.2 Assignment & Test Routing

**Function:**
When a student submits an assignment/test, instructor reviews and routes it to the appropriate faculty for grading.

**Workflow:**
1. Incoming submissions appear in a queue
2. Instructor can view submission details
3. Routes to correct faculty with optional note
4. Tracks grading status (Pending → Graded)
5. Notification sent to student once graded

---

### 4.3 Live Classes

**View:**
- All live sessions created by faculties are visible
- Instructor can join any session as an observer
- Can create their own **Live Interaction Session** with students (not subject-specific, more like a general orientation/doubt clearing)

**Live Interaction Session features:**
- Same BBB integration
- Can invite specific batches or all students
- Session type tagged as "Instructor Session"

---

### 4.4 Student Analytics

**Overview:**
Macro-level view of all students across all batches.

**Features:**
- Overall performance dashboard
- Batch-wise comparison
- Students with low engagement flagged (e.g., < 30% watch time)
- Export report as PDF or Excel
- Filter by: Batch, Subject, Date range, Faculty

---

### 4.5 Notifications

- Send notifications to students, faculty, or specific batches
- Notification types: General, Reminder, Alert
- History of sent notifications

---

### 4.6 Profile

- Name, Email, Phone
- Assigned batches / subjects overview
- Change password
- Profile photo

---

## 5. Admin Portal

### Role
Full platform control. Manages users, system configuration, payments, and monitoring.

### Layout
- Sidebar with all management sections
- Dashboard with key KPIs

---

### 5.1 Dashboard

**Summary Cards:**
- Total Students / Active Students
- Total Faculty / Instructors
- Live Sessions Today
- Revenue this month
- Pending Enquiries
- Assignments pending grading

**Quick Actions:**
- Add Student, Add Faculty, Add Instructor
- View Recent Enquiries
- View System Logs

---

### 5.2 User Management

**Sub-sections:** Students | Faculty | Instructors

**For each user type, admin can:**

| Action | Details |
|---|---|
| ➕ Add | Fill registration form, auto-send credentials via email |
| ✏️ Edit | Update any user details |
| 🚫 Block | Temporarily disable login access |
| 🔓 Unblock | Re-enable access |
| 🗑️ Delete | Soft delete with confirmation modal |
| 👁️ View Details | See full profile + activity log |

**User Detail View (click on any user):**
- Full profile information
- Activity log: login history, pages visited, time spent
- For students: batch, enrolled subjects, assignment submissions, test scores, live class attendance
- For faculty: uploaded content list, live sessions conducted, grading history
- For instructors: assigned batches, content assignment history

**Batch Management:**
- Create / Edit / Delete batches
- Assign students to batches
- Assign instructors to batches
- Assign subjects to batches

**Class Management:**
- Create class/grade entries
- Link subjects to classes

---

### 5.3 Enquiries

- List of all form submissions from landing page
- Columns: Name, Phone, Email, Class, Subject Interest, Date, Status (New / Contacted / Enrolled / Dropped)
- Update status with notes
- Bulk export to Excel
- Quick action: Convert enquiry to student registration

---

### 5.4 Payment & Analytics

**Payment Dashboard:**
- Total revenue (monthly / quarterly / yearly)
- Per-student fee tracking
- Payment history table
- Pending payments / overdue
- Fee structure management (set per batch/course)
- Invoice generation (PDF)
- Payment gateway integration (Razorpay / Stripe)

**Charts:**
- Revenue trend line chart
- Batch-wise revenue breakdown
- Fee collection vs. target

---

### 5.5 System Logs

- All system events logged: logins, failed attempts, uploads, deletions, role changes
- Filter by: User, action type, date range, portal
- Log levels: Info / Warning / Error / Critical
- Export logs as CSV
- Alerts for suspicious activity (e.g., multiple failed logins)

---

### 5.6 Settings

**Categories:**

**General Settings:**
- Platform name, logo, favicon
- Primary contact email and phone
- Timezone and language

**Enquiry Form Settings:**
- Delivery method: Email / WhatsApp / Both
- Destination email address(es)
- WhatsApp number (via API)
- Email template for enquiry notification

**Email Settings:**
- SMTP configuration
- Email templates: Student Welcome, Faculty Welcome, Password Reset, Assignment Graded, etc.
- Test email sender

**WhatsApp Settings:**
- API key (Twilio / Meta)
- Message templates
- Test WhatsApp sender

**Notification Settings:**
- Global notification toggles
- Default reminder times (e.g., 1 hour before live class)

**BigBlueButton Settings:**
- BBB server URL
- API secret
- Max participants per room
- Recording storage location

**Payment Settings:**
- Gateway selection (Razorpay / Stripe)
- API keys (masked)
- Currency, tax settings

**Security Settings:**
- Password policy (min length, complexity)
- Session timeout duration
- 2FA toggle (optional)
- IP whitelist for admin access

---

## Cross-Portal Sync

### Real-time Sync Map

```
Faculty uploads content
        ↓
Instructor assigns to batch
        ↓
Student sees it in My Classes
        ↓
Student watches → Analytics updated
        ↓
Faculty sees watch stats in Students Analysis

Faculty creates Live Session
        ↓
Students see it in Live Classes + Calendar
        ↓
Admin/Instructor can join as observer
        ↓
Session ends → Recording auto-uploaded
        ↓
Students see recording in Live Classes

Student submits assignment
        ↓
Instructor routes to Faculty
        ↓
Faculty grades it
        ↓
Student gets notification + sees grade
```

### Notification Flow

| Trigger | Who Gets Notified | Channel |
|---|---|---|
| Student registered | Student | Email |
| Faculty registered | Faculty | Email |
| New content assigned | Students in batch | In-app |
| Live class scheduled | Students in batch | In-app + Calendar |
| Live class starting in 1hr | Students in batch | In-app + Email |
| Assignment due in 24hr | Student | In-app |
| Assignment graded | Student | In-app + Email |
| New enquiry submitted | Admin | Email + WhatsApp |
| Student low engagement | Instructor | In-app |

---

## Live Class System

### BigBlueButton Integration

**Architecture:**
- BBB server(s) behind a load balancer
- Scalelite (BBB's official load balancer) for distributing 200–300 concurrent students
- Separate server for recording processing

**Student View:**
- Only sees faculty video/screen
- Audio only from faculty (unless unmuted by faculty)
- Chat panel (moderated)
- Raise hand button
- Reaction emojis

**Faculty View:**
- Sees all student thumbnails (camera status)
- Full moderator controls
- Whiteboard
- Screen share
- Polls
- Raise hand queue
- Breakout rooms
- Start/Stop recording

**Recording Pipeline:**
1. Session ends
2. BBB generates raw recording files
3. Background job processes and converts to MP4
4. Multiple quality versions generated (360p, 720p, 1080p) via FFmpeg
5. Uploaded to cloud storage
6. URL saved to database
7. Appears in Student Portal and Faculty Portal

**Handling Network Drops:**
- BBB built-in reconnection logic
- Student rejoins seamlessly
- Drop event logged with timestamp
- Faculty sees indicator next to student name

---

## Authentication & Security

### Auth Flow
1. Single login page at `/login`
2. Email + password input → POST `/api/v1/auth/login`
3. Express backend validates credentials
4. Returns **access token** (short-lived, 15min) + **refresh token** (7 days, httpOnly cookie)
5. Access token stored in Zustand `authStore` (in memory — not localStorage)
6. React Router reads role from decoded token and redirects to correct portal
7. TanStack Query uses the access token in Authorization header for all API calls
8. Auto-refresh: Axios interceptor silently refreshes access token using refresh token cookie before expiry

### Password Management
- Students/Faculty receive auto-generated secure password on registration
- Forced password change on first login (optional, recommended)
- "Forgot Password" → OTP to email → reset

### Security Measures
- HTTPS everywhere
- Input validation and sanitization (frontend + backend)
- Rate limiting on login endpoint
- SQL injection protection via ORM (Prisma)
- XSS protection headers
- File upload validation (type + size limits)
- Signed URLs for private video/PDF access (not publicly accessible)
- Role-based API route protection

---

## Additional Features to Consider

These are industry-standard e-learning features you should consider adding:

### 🔔 Push Notifications
- Browser push notifications (Web Push API)
- Mobile push if you build a React Native app later

### 📊 Student Progress Reports
- Auto-generated PDF report for parents showing:
  - Subjects enrolled, attendance %, assignment scores, test history
- Can be emailed to parent/guardian monthly

### 🏆 Gamification
- Streaks (consecutive days of study)
- Badges (First Login, 10 Videos Watched, Perfect Score)
- Leaderboard per batch (opt-in)

### 📱 Mobile App (Future)
- React Native app for students and faculty
- Offline video download (DRM protected)
- Push notifications

### 🤖 AI Features (Future)
- AI-powered doubt chatbot per subject
- Auto-generate quiz questions from uploaded content
- Smart recommendations ("Watch this before your test")

### 💬 Discussion Forum
- Per-subject forum threads
- Students can post doubts, faculty can respond
- Upvote/downvote answers

### 📅 Attendance System
- Auto-mark attendance for live classes (based on join time)
- Manual attendance entry by faculty for offline classes
- Attendance % visible to students and parents
- Alert if attendance drops below threshold (e.g., 75%)

### 📧 Parent Portal (Future)
- Separate login for parents
- View ward's progress, attendance, fee payment status
- Receive reports directly

### 🔍 Search
- Global search across subjects, chapters, videos, assignments
- Search within a video (if transcripts are generated)

### ⭐ Content Rating
- Students can rate recorded classes (1–5 stars)
- Faculty sees average rating per video

### 🌐 Multi-language Support
- UI in English + regional language (Malayalam, Hindi, etc.)
- Useful for your Kerala user base

### 📤 Bulk Operations (Admin)
- Bulk import students via Excel/CSV upload
- Bulk send notifications
- Bulk generate fee invoices

---

## UI/UX Guidelines

*(Use your existing style system — these are structural UX rules)*

### Confirmations
- Any destructive action (Delete, Block) → Confirmation modal with clear warning
- Example: *"Are you sure you want to delete [Student Name]? This action cannot be undone."*
- Two buttons: Cancel (outlined) | Confirm (danger/red)

### Toast Notifications
- Success: Green toast, bottom-right, 3 second auto-dismiss
- Error: Red toast, does not auto-dismiss, has close button
- Info: Blue toast, 3 second auto-dismiss
- Warning: Orange toast, 4 second auto-dismiss

### Modals
- Backdrop blur on open
- ESC key to close (except destructive confirmations)
- Focus trap inside modal for accessibility
- Smooth open/close animation

### Loading States
- Skeleton loaders for cards and lists (not spinners)
- Progress indicators for file uploads
- Optimistic UI for like/save actions

### Empty States
- Every list/grid has a designed empty state
- Illustration + message + CTA button
- Example: "No classes assigned yet. Check back soon!"

### Error States
- Form field inline errors (below each field, red)
- Page-level error boundary with "Try Again" option
- Network error toast with retry

### Responsive Design
- Mobile-first
- Sidebar collapses to bottom nav on mobile
- Tables become card-stacks on small screens
- Video player adapts to screen size

---

## Database Schema Overview

```
Users
  - id, name, email, phone, password_hash, role, status, created_at

Students
  - id, user_id (FK), class_id, school, batch_id, parent_name, parent_phone

Faculty
  - id, user_id (FK), subject_id, bio

Instructors
  - id, user_id (FK)

Batches
  - id, name, class_id, instructor_id, created_at

Subjects
  - id, name, class_id

BatchSubjects
  - batch_id, subject_id, faculty_id

Chapters
  - id, subject_id, name, order_index

RecordedClasses
  - id, chapter_id, faculty_id, title, video_url, duration, is_visible, created_at

VideoAttachments
  - id, recorded_class_id, type (notes/assignment), file_url

PYQDocuments
  - id, chapter_id, faculty_id, title, year, file_url

DPPDocuments
  - id, chapter_id, faculty_id, title, scheduled_date, file_url

LiveSessions
  - id, title, subject_id, faculty_id, batch_id, type, scheduled_at, duration, bbb_session_id, recording_url, status

Assignments
  - id, title, subject_id, faculty_id, batch_id, file_url, total_marks, due_date

AssignmentSubmissions
  - id, assignment_id, student_id, file_url, submitted_at, marks, feedback, graded_at

WatchHistory
  - id, student_id, recorded_class_id, watch_duration, speed, last_position, created_at

LiveAttendance
  - id, session_id, student_id, join_time, leave_time, drop_count

Notifications
  - id, sender_id, target_role, target_id (nullable), message, type, read, created_at

Enquiries
  - id, name, phone, email, class_interest, subject_interest, message, status, created_at

Payments
  - id, student_id, amount, type, status, gateway_ref, created_at

SystemLogs
  - id, user_id, action, entity_type, entity_id, metadata, created_at
```

---

## API Structure Overview

### Express Server Structure

```
baselearn-backend/
├── src/
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── admin.routes.js
│   │   ├── student.routes.js
│   │   ├── faculty.routes.js
│   │   ├── instructor.routes.js
│   │   └── notification.routes.js
│   ├── controllers/          → Route handler logic
│   ├── middlewares/
│   │   ├── auth.middleware.js   → JWT verify + role check
│   │   ├── upload.middleware.js → Multer + S3
│   │   └── error.middleware.js  → Global error handler
│   ├── services/             → Business logic (separate from controllers)
│   ├── jobs/                 → BullMQ job definitions (video processing etc.)
│   ├── utils/                → email sender, whatsapp sender, bbb helper
│   ├── prisma/               → Prisma client + schema.prisma
│   └── app.js                → Express app setup
├── server.js                 → Entry point
├── .env
└── package.json
```

### API Endpoints

```
/api/v1/auth
  POST /login
  POST /logout
  POST /refresh-token
  POST /forgot-password
  POST /reset-password

/api/v1/admin
  GET  /dashboard
  CRUD /users
  CRUD /batches
  CRUD /enquiries
  GET  /payments
  GET  /logs
  CRUD /settings

/api/v1/student
  GET  /subjects
  GET  /subjects/:id/chapters
  GET  /chapters/:id/recorded-classes
  GET  /chapters/:id/pyq
  GET  /chapters/:id/dpp
  GET  /live-classes
  GET  /assignments
  POST /assignments/:id/submit
  GET  /calendar
  POST /profile/update

/api/v1/faculty
  POST /content/upload
  GET  /content/list
  POST /live/create
  GET  /live/sessions
  GET  /analytics/students
  GET  /notifications

/api/v1/instructor
  POST /content/assign
  GET  /submissions
  POST /submissions/:id/route
  GET  /live/sessions
  POST /live/create
  GET  /analytics/overview

/api/v1/notifications
  GET  /
  POST /send
  PATCH /:id/read
```

---

## Development Phases

### Phase 1 (Complete / In Progress — 30–45%)
- Vite + React project setup, React Router v6 structure
- Zustand auth store, ProtectedRoute component
- Express server setup, Prisma + PostgreSQL connected
- Admin portal base, user management
- Student registration flow
- Landing page + enquiry form

### Phase 2 (Next)
- Student portal: My Classes, recorded video player (Video.js), PYQ/DPP PDF viewer
- Faculty portal: Upload content flow (S3 integration, video processing queue)
- Instructor portal: Content assignment to batches
- TanStack Query setup for all API calls
- Basic real-time sync between portals

### Phase 3
- Live Classes (BigBlueButton integration, Scalelite for load balancing)
- Assignments & Tests full flow (submission, routing, grading)
- FullCalendar.js integration for Calendar page
- Notification system (in-app + email via Nodemailer/Resend)

### Phase 4
- Analytics dashboards (Recharts — student + instructor + admin views)
- Payment module (Razorpay integration)
- Admin Settings module complete (email, WhatsApp, BBB config)
- System logs page with Winston log viewer

### Phase 5 (Polish)
- Mobile responsiveness full audit
- Performance optimization (lazy loading routes, React.memo, query caching)
- Security hardening (rate limiting, signed S3 URLs, helmet.js)
- Email/WhatsApp integration complete and tested
- End-to-end testing + QA

---

*Last updated: 2026 | BaseLearn Platform Blueprint v1.1 — includes implementation map for the `Base-Learn` monorepo.*
