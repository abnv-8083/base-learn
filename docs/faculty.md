# 👩‍💼 PORTAL 3: FACULTY SIDE
*(Faculty = Subject Head / Department Head / Academic Coordinator)*

---

### PAGE 1 — Faculty Login
**URL:** `/faculty/login`
- Email + Password + 2FA
- Role badge: "Faculty Portal"

---

### PAGE 2 — Faculty Dashboard
**URL:** `/faculty/dashboard`
**Layout:** Sidebar + Analytics-focused layout

**Sidebar Navigation:**
- 🏠 Dashboard
- 👥 Student Management
- 👨‍🏫 Instructor Management
- 📚 Course Oversight
- 📊 Reports & Analytics
- 📋 Curriculum Planner
- 📢 Announcements
- 🔔 Notifications
- ⚙️ Settings

**KPI Cards Row:**
- Total Active Students | Total Courses Running | Overall Avg Score | Classes Uploaded This Week

**Grade-wise Performance Overview:**
- 3 tabs (Grade 8 / 9 / 10)
- Subject-wise avg score bar chart
- Completion rates per subject

**Instructor Activity Feed:**
- Recent uploads, tests published, announcements

**Alerts/Action Required:**
- Courses with < 50% student completion (red alert)
- Instructors with no uploads in 7 days
- Students with low attendance

---

### PAGE 3 — Student Management
**URL:** `/faculty/students`
**Layout:** Sidebar + Table with deep filters

**Filters:** Grade | Subject | Performance Band (Top/Mid/Low) | Active Status | Joined Date

**Student Table:**
- Avatar | Name | Grade | Enrolled Courses | Avg Score | Attendance % | Risk Flag

**Risk Flags:**
- 🔴 Low Performer (avg < 40%)
- 🟡 Disengaged (no activity in 7 days)
- 🟢 Star Performer

**Bulk Actions:**
- Send announcement to selected students
- Export list
- Assign to special batch

**Student Profile View:**
- Full academic history
- Subject-wise progress charts
- Test score timeline
- Instructor notes about the student
- Faculty notes field (add notes)

---

### PAGE 4 — Instructor Management
**URL:** `/faculty/instructors`
**Layout:** Sidebar + Grid + Table

**Instructor Cards:**
- Photo | Name | Subjects | Grade coverage
- Classes uploaded: 24 | Students: 340 | Avg Rating: 4.7⭐
- Status: Active / Inactive
- [View Profile] [Message] [View Analytics]

**Performance Table:**
- Uploads this month | Doubts resolved | Avg video rating | Student satisfaction %

**Add New Instructor:**
- Invite via email
- Assign subjects + grades
- Set permissions

---

### PAGE 5 — Course Oversight
**URL:** `/faculty/courses`
**Layout:** Sidebar + Table

**Course List with Status:**
- Course Title | Subject | Grade | Instructor | Chapters | Enrolled | Completion % | Status

**Content Review:**
- Flag to review: Videos pending faculty approval before publishing
- Review interface: Watch video, check against curriculum, Approve / Request Edit (with comment)

**Curriculum Coverage Tracker:**
- Grid: Chapter × Topic → ✅ Covered / ⚠️ Partially / ❌ Not Covered
- Auto-filled based on uploaded content tags

---

### PAGE 6 — Reports & Analytics
**URL:** `/faculty/reports`
**Layout:** Sidebar + Tabbed dashboard

**Report Tabs:**

*Student Performance:*
- Grade-wise score heatmap
- Subject-wise pass/fail rate
- Score distribution bell curve
- Top 10 / Bottom 10 students

*Content Analytics:*
- Most watched videos
- Avg completion rates
- Drop-off points
- Subject engagement comparison

*Instructor Productivity:*
- Upload frequency per instructor
- Student engagement per instructor
- Doubt resolution rate

**Export Options:**
- Download as PDF, Excel, CSV
- Schedule automated email reports

---

### PAGE 7 — Curriculum Planner
**URL:** `/faculty/curriculum`
**Layout:** Sidebar + Kanban/Gantt

**Subject selector → Grade selector:**

**Kanban Board:**
- Columns: Planned | In Progress | Recorded | Published | Review
- Cards: Chapter topics with assigned instructor

**Gantt Chart View:**
- Timeline of when each chapter should be covered
- Color-coded by subject
- Drag to reschedule

---

### PAGE 8 — Announcements
**URL:** `/faculty/announcements`
- Create system-wide or grade-specific announcements
- Targeted to: Students + Instructors / Faculty only
- Urgency levels + scheduling
- Analytics: Read receipt tracking per announcement

---

### PAGE 9 — Faculty Settings
**URL:** `/faculty/settings`
- Profile (name, photo, role, department)
- Password & 2FA settings
- Notification preferences
- Access control: what instructors they manage

---
---