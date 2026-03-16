# 👨‍🏫 PORTAL 2: INSTRUCTOR SIDE

---

### PAGE 1 — Instructor Login
**URL:** `/instructor/login`
- Email + Password
- 2FA option (OTP)
- Role confirmation badge "Instructor Portal"
- Clean minimal layout, professional tone

---

### PAGE 2 — Instructor Dashboard
**URL:** `/instructor/dashboard`
**Layout:** Sidebar + Stats + Activity

**Sidebar Navigation:**
- 🏠 Dashboard
- 🎬 My Courses
- ⬆️ Upload Class
- 📝 Assignments
- 🧪 Tests & Quizzes
- 👥 My Students
- 📊 Analytics
- 💬 Doubts Inbox
- 📢 Announcements
- ⚙️ Settings

**Top Stats Row (4 cards):**
- Total Recorded Classes Uploaded | Total Students Enrolled | Avg Student Score | Pending Doubts

**Content this Week:**
- Uploaded classes: list with view counts
- New student enrollments count
- Pending assignment submissions to review

**Student Engagement Chart:**
- Line chart: Daily active students watching your classes

**Top Performing Students:**
- Table: Name | Grade | Avg Score | Classes Watched | Last Seen

**Pending Actions:**
- Ungraded assignments count → link
- Unanswered doubts count → link

---

### PAGE 3 — My Courses (Instructor View)
**URL:** `/instructor/courses`
**Layout:** Sidebar + Grid

**Course Cards (Instructor variant):**
- Thumbnail + Title
- Grade tags (8 / 9 / 10)
- Total enrolled students
- Total chapters | Total duration
- Avg completion %
- Status: Published | Draft | Archived
- Edit | View Analytics | Manage buttons

**Create New Course Button (sticky):**
- Opens multi-step form:
  1. Basic Info: Title, Subject, Grade(s), Description, Thumbnail upload
  2. Structure: Add Units → Add Chapters per unit (drag to reorder)
  3. Pricing: Free / Paid (set price)
  4. Publish settings: Immediate / Schedule / Draft

---

### PAGE 4 — Upload Recorded Class
**URL:** `/instructor/upload`
**Layout:** Sidebar + Upload Wizard

**Step 1 — Video Upload:**
- Drag & drop zone or file browser
- Supported: MP4, MOV, MKV (max 4GB)
- Upload progress bar with ETA
- Thumbnail auto-generated (or manual upload)

**Step 2 — Class Details:**
- Title (e.g., "Chapter 4: Linear Equations — Part 1")
- Subject selector
- Grade selector
- Chapter/Unit selector (from existing course structure)
- Description / learning objectives (rich text)
- Tags (e.g., #algebra #equations #grade9)

**Step 3 — Chapters & Timestamps:**
- Add chapter markers with timestamps (e.g., 0:00 Intro, 4:30 Main Concept, 18:00 Examples)
- These appear as clickable markers in the video player for students

**Step 4 — Attachments:**
- Upload supporting PDFs, notes, formula sheets
- These link to the class in the Resources tab

**Step 5 — Publish:**
- Preview how it looks on student side
- Choose: Publish Now / Schedule / Save Draft
- Notify enrolled students toggle

---

### PAGE 5 — Assignments Management
**URL:** `/instructor/assignments`
**Layout:** Sidebar + Table

**Tabs:** Active | Drafts | Archived

**Assignment Table:**
- Title | Subject | Grade | Due Date | Submissions (X/Y) | Avg Score | Status | Actions

**Create Assignment (`/instructor/assignments/create`):**
- Title + Subject + Grade
- Rich text question editor
- Attach files, images, videos
- Rubric/marking scheme (optional)
- Due date & time picker
- Assign to: All students / specific sections
- [Save Draft] [Publish]

**Submissions Review (`/instructor/assignments/:id/submissions`):**
- Table: Student Name | Submission Date | Status | Score | Actions
- Click row → open submission:
  - Student's answer displayed
  - Inline comment tool
  - Score input + feedback box
  - [Save Grade] button
- Bulk grade option for MCQ-type

---

### PAGE 6 — Tests & Quizzes Builder
**URL:** `/instructor/tests`
**Layout:** Sidebar + Content

**Test List:** Table with title, subject, grade, date, completion %, avg score

**Create Test (`/instructor/tests/create`):**

*Step 1 — Test Settings:*
- Title + Subject + Grade
- Test type: MCQ / Descriptive / Mixed
- Duration (minutes)
- Total marks
- Pass percentage
- Randomize questions toggle
- Show answers after: Immediately / After deadline / Never
- Schedule: Start date & end date

*Step 2 — Question Builder:*
- Add Question button → question type picker:
  - **MCQ:** Question text + 4 options + correct answer marker + explanation
  - **True/False**
  - **Short Answer:** Question + keyword-based auto-check
  - **Long Answer:** Question + suggested answer (for manual grading)
  - **Match the Following:** left-right pair builder
  - **Fill in the Blank**
- Marks per question input
- Difficulty tag: Easy / Medium / Hard
- Chapter tag
- Image/diagram attach
- Drag to reorder questions
- Question bank: save to bank / import from bank

*Step 3 — Preview & Publish:*
- Live preview of student experience
- [Publish] [Save Draft] [Schedule]

**Test Results View (`/instructor/tests/:id/results`):**
- Score distribution histogram
- Per-question difficulty analysis (% correct per question)
- Individual student scores table
- Download results as Excel/CSV

---

### PAGE 7 — My Students
**URL:** `/instructor/students`
**Layout:** Sidebar + Table

**Filter:** Grade 8 / 9 / 10, Active/Inactive, Date Enrolled

**Student Table:**
- Avatar | Name | Grade | Enrolled Date | Classes Watched | Avg Score | Last Seen | Actions

**Student Detail Drawer:**
- Profile mini-card
- Progress per chapter
- Test history + scores
- Assignment submission history
- Personal notes field (instructor private)

---

### PAGE 8 — Analytics
**URL:** `/instructor/analytics`
**Layout:** Sidebar + Dashboard

**Date Range Picker:** Last 7 days / 30 days / Custom

**Charts:**
- Video views over time (area chart)
- Avg watch completion % per video
- Test score distribution (histogram)
- Student engagement funnel: Enrolled → Watched > 50% → Completed → Tested
- Most & least watched chapters (horizontal bar chart)
- Dropout points in specific videos (heatmap timeline)

---

### PAGE 9 — Doubts Inbox
**URL:** `/instructor/doubts`
**Layout:** Sidebar + Two-panel (list + detail)

**Left — Doubt List:**
- Filter: Unanswered | Answered | All | By Subject
- Doubt item: Student name + subject + question preview + timestamp
- Color dot: Red = unanswered, Green = answered

**Right — Doubt Detail:**
- Full question + attached image
- Student info chip
- Reply text editor (rich text, supports LaTeX for math)
- Previous replies thread
- [Mark Resolved] button

---

### PAGE 10 — Announcements
**URL:** `/instructor/announcements`
**Layout:** Sidebar + Content

**Create Announcement:**
- Title + rich text body
- Target: All students / Grade 8 only / Grade 9 only / etc.
- Urgency: Normal / Important / Urgent (controls badge color)
- Attach file optional
- Schedule or post now

**Past Announcements Table:**
- Title | Target | Sent Date | Read Rate | Actions (Edit/Delete)

---

### PAGE 11 — Instructor Profile & Settings
**URL:** `/instructor/settings`
- Profile info (bio, photo, qualifications, subject specialty)
- Password & security
- Notification preferences
- Availability schedule (used for live class scheduling)

---
---