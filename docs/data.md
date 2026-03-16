# 🎓 EduSpark — Complete UX Design Prompt
### Modern E-Learning Platform for Grade 8, 9 & 10 Students
#### All 4 Portals · Full Page Architecture · Design System

---

## 🎨 MASTER DESIGN SYSTEM

### Brand Identity
- **Platform Name:** EduSpark (or your custom name)
- **Target Audience:** Students aged 13–16 (Grades 8, 9, 10)
- **Primary Goal:** Engaging, distraction-free online recorded class experience
- **Tone:** Energetic yet focused — smart, youthful, trustworthy, motivating

### Color Palette
```
Primary:     #6C47FF  (Electric Violet — primary brand)
Secondary:   #FF6B35  (Tangerine — highlights, CTAs)
Accent:      #00D4AA  (Mint — success, progress)
Dark BG:     #0D0E1A  (Deep Navy — main dark background)
Surface:     #161728  (Dark card surface)
Surface 2:   #1E2035  (Slightly lighter surface)
Text 1:      #F0F1FF  (Primary text)
Text 2:      #9A9EC8  (Secondary/muted text)
Warning:     #FFB020  (Amber — alerts)
Error:       #FF4560  (Red — errors)
```

### Typography
```
Display:     "Clash Display" or "Space Grotesk Bold" — headings, hero text
Body:        "Plus Jakarta Sans" — regular content, UI text
Mono:        "JetBrains Mono" — code, timestamps, IDs
```

### Design Principles
1. **Card-first layout** — all content in elevated glass-morphism cards
2. **Progress everywhere** — show learning streaks, % complete, XP bars
3. **Mobile-first** — responsive for phones (students use phones primarily)
4. **Dark mode default** with optional light mode toggle
5. **Micro-animations** — page transitions, hover lifts, loading skeletons
6. **Gamification** — badges, streaks, leaderboard always visible
7. **Zero friction** — max 2 clicks to resume any class

### Reusable Components (Design Once, Use Everywhere)
- `<NavSidebar>` — collapsible, icon + label, role-aware
- `<TopBar>` — search, notifications bell, user avatar
- `<CourseCard>` — thumbnail, subject tag, progress bar, instructor name
- `<VideoPlayer>` — custom-skinned player with chapters, speed control, notes
- `<ProgressRing>` — circular SVG progress indicators
- `<BadgePill>` — subject/grade/status tags
- `<StatCard>` — metric + icon + trend arrow
- `<EmptyState>` — illustrated empty states per context
- `<SkeletonLoader>` — bone-white shimmer placeholders
- `<Toast>` — bottom-right notification toasts
- `<ConfirmModal>` — destructive action confirmations

---

---

# 👨‍🎓 PORTAL 1: STUDENT (USER) SIDE
## Target: Grade 8, 9, 10 Students

---

### PAGE 1 — Landing / Marketing Page
**URL:** `/`
**Layout:** Full-width, single-scroll, no sidebar

**Sections:**
- **Hero:** Bold headline "Learn. Score. Repeat." with animated gradient text, rotating subject icons (Math, Science, English, Social), CTA buttons: "Start Learning Free" + "Watch Demo"
- **Floating 3D book/atom illustration** with particle trail animation
- **Subject Cards Row:** 6 animated cards (Math, Physics, Chemistry, Biology, English, Social Studies) with hover flip effect showing syllabus topics
- **How It Works:** 3-step horizontal flow — Sign Up → Pick Subject → Watch & Score
- **Stats Bar:** Live counters — "12,000+ Students", "500+ Recorded Classes", "95% Score Improvement"
- **Testimonial Carousel:** Student photos, star rating, short quote (auto-scrolling)
- **Sample Video Preview:** Embedded player preview with lock overlay (register to unlock full video)
- **Class-wise Packages:** Grade 8 / Grade 9 / Grade 10 pricing cards with feature list
- **FAQ Accordion:** 8 common questions
- **Footer:** Links, social icons, contact

**Interactive Elements:**
- Parallax scrolling on hero background
- Counter animation on stats when scrolled into view
- Subject card 3D tilt on hover

---

### PAGE 2 — Student Login / Registration
**URL:** `/login` & `/register`
**Layout:** Split-screen (60/40)

**Left Panel (Illustration):**
- Animated scene: student at desk with floating subject icons, glowing screen
- Motivational quote rotates every 5s
- Platform logo + tagline

**Right Panel (Form):**

*Login Tab:*
- Email / Phone input
- Password input with show/hide toggle
- "Remember Me" checkbox
- Forgot Password link → modal (OTP via email/SMS)
- Login button (gradient)
- Divider: "or continue with"
- Google OAuth button
- "New Student? Register Here" link

*Register Tab:*
- Full Name
- Class/Grade selector (8 / 9 / 10) — styled as large toggle pills
- School Name (optional)
- Phone Number (+ country code)
- Email
- Password + Confirm Password
- Profile Photo upload (optional, avatar picker if skipped)
- Terms checkbox
- Register CTA

*After Register:*
- OTP verification page (6-digit, auto-focus, resend timer)
- "Welcome aboard!" animation → redirect to onboarding

---

### PAGE 3 — Onboarding Flow (First Login Only)
**URL:** `/onboarding`
**Layout:** Full-screen step wizard (4 steps, progress dots)

**Step 1 — Choose Your Grade:**
- Three large illustrated cards: Grade 8 / Grade 9 / Grade 10
- Hover highlights card, click selects

**Step 2 — Pick Your Subjects:**
- Grid of subject toggles with subject icons
- Selected ones glow with accent color
- "You can change these anytime" note

**Step 3 — Set Your Goal:**
- "What's your main goal?" — choose 1 of 4:
  - 🎯 Score 90%+ in boards
  - 📚 Understand tough concepts
  - ⚡ Finish syllabus fast
  - 🏆 Top the class
- Personalization hint shown based on selection

**Step 4 — Meet Your Dashboard:**
- Brief animated tour overlay: highlights sidebar, course section, progress ring
- "Let's Go!" button → Dashboard

---

### PAGE 4 — Student Dashboard (Home)
**URL:** `/dashboard`
**Layout:** Sidebar (280px) + Main Content + optional Right Panel (320px)

**Top Bar:**
- Logo, Search (expands on click), Notification bell with badge, Avatar → dropdown menu

**Sidebar Navigation:**
- 🏠 Dashboard
- 📚 My Courses
- ▶️ Recorded Classes
- 📅 Live Schedule
- 📝 Assignments
- 🧪 Tests & Quizzes
- 📊 My Progress
- 🏆 Leaderboard
- 💬 Doubt Forum
- 📁 Study Materials
- ⚙️ Settings

**Main Content:**

*Welcome Section:*
- "Good Morning, Arjun 👋" with date
- Daily streak badge (🔥 5-day streak)
- Quick action pills: [Resume Last Class] [Start Today's Test] [View Schedule]

*Progress Overview Row (3 StatCards):*
- Classes Watched This Week: 12/15
- Assignment Score Average: 84%
- Current Rank: #7 in your class

*Continue Learning:*
- 2–3 course cards with "Continue" CTA, % progress bar, last watched chapter label

*Today's Schedule:*
- Timeline of today's live sessions (if any) + self-paced goals

*Subject-wise Progress (Horizontal Bar Chart):*
- Math 72% | Physics 88% | Chemistry 65% | Biology 90% | English 95%

*Recent Activity Feed:*
- "You completed Chapter 3 - Quadratic Equations"
- "Test Score: 78/100 in Chemistry"
- "Assignment submitted: History Essay"

*Right Panel:*
- 🔥 Streak Calendar (GitHub-style heatmap for the month)
- 🏅 Recent Badges earned
- 📢 Announcements from faculty/instructor

---

### PAGE 5 — My Courses
**URL:** `/courses`
**Layout:** Sidebar + Grid

**Filter Bar:**
- Tabs: All | Enrolled | Completed | Bookmarked
- Subject filter chips (Math, Science, etc.)
- Grade filter (if multi-grade)
- Sort: Recently Accessed | Most Progress | A–Z

**Course Grid (3 columns desktop, 1 mobile):**

Each Course Card contains:
- Thumbnail with subject color overlay + play icon on hover
- Subject badge (colored pill)
- Course Title (e.g., "Mathematics — Chapter 5: Polynomials")
- Instructor name + avatar
- Progress bar: "Chapter 7 of 12 · 58% complete"
- Last accessed: "2 days ago"
- CTA: [Continue] or [Start]

**Empty State:**
- Illustrated student browsing shelves
- "No courses yet — browse our catalog" + [Explore Courses] button

---

### PAGE 6 — Course Catalog / Browse Courses
**URL:** `/catalog`
**Layout:** Sidebar + Content

**Hero Banner:** Rotating subject banners with featured new course

**Search & Filters:**
- Full-text search
- Filter by: Subject | Grade | Duration | Instructor | Rating

**Featured Courses:** Horizontal scroll row

**All Courses Grid:**
- Extended course cards with: rating stars, number of chapters, total duration, enrolled count, price or "Free"

**Course Detail Preview (side drawer on click):**
- Full chapter list (accordion)
- Sample video preview
- Instructor bio
- Enrollment CTA

---

### PAGE 7 — Course Detail Page
**URL:** `/courses/:courseId`
**Layout:** Full width, no sidebar during video playback (zen mode)

**Header:**
- Breadcrumb: Home > My Courses > Mathematics
- Course Title + Subject badge + Grade badge
- Instructor info row: avatar, name, "150 students enrolled"
- Progress bar: overall % complete

**Main Split (70/30):**

*Left — Video Player:*
- Custom dark-themed video player
- Progress scrubber with chapter markers
- Controls: Play/Pause, Volume, Playback Speed (0.5x–2x), Quality selector, Full Screen, Picture-in-Picture
- Chapter jump buttons below player
- "Take a Note" button → opens sticky note panel

*Right — Chapter List:*
- Collapsible sections (e.g., "Unit 1: Number System")
- Each chapter: icon (✅ done, ▶ current, 🔒 locked), title, duration
- "Mark as Complete" button
- Resources tab: PDFs, Notes, links per chapter

**Below Video:**
- Tabs: [Overview] [Notes] [Discussions] [Resources]
  - Overview: Course description, learning outcomes, syllabus summary
  - Notes: Student's personal notes (editable, per timestamp)
  - Discussions: Thread of questions on this specific chapter
  - Resources: Downloadable PDFs, formula sheets, reference images

---

### PAGE 8 — Recorded Classes Library
**URL:** `/recorded-classes`
**Layout:** Sidebar + Content

**Search & Filter:**
- Search by topic, subject, keyword
- Filter: Subject | Grade | Chapter | Duration | Watched/Unwatched
- Sort: Newest | Most Viewed | Duration

**List / Grid Toggle**

**Class Cards:**
- Thumbnail with duration badge
- Subject color tag
- Title: "Triangles & Congruence — Part 2"
- Instructor + upload date
- View count + rating
- Watch progress (if partially watched): "Watched 14/42 min"
- Bookmark icon

**Sidebar Quick Filter:**
- Subject tree (accordion) with chapter count per subject

---

### PAGE 9 — Assignments
**URL:** `/assignments`
**Layout:** Sidebar + Table/Card list

**Status Tabs:** Pending | Submitted | Graded | Overdue

**Assignment Cards:**
- Subject color strip
- Title + Subject badge
- Due date with countdown ("Due in 2 days" in amber, "Overdue" in red)
- Assigned by: [Instructor Name]
- Submission type: [Text] [File Upload] [MCQ]
- Status badge
- CTA: [Submit Now] / [View Feedback]

**Assignment Detail Page (`/assignments/:id`):**
- Question/Prompt with attached resources
- Answer area (rich text editor or file drop zone)
- Submission history
- Instructor feedback (after grading) with inline comments

---

### PAGE 10 — Tests & Quizzes
**URL:** `/tests`
**Layout:** Sidebar + Cards

**Tabs:** Upcoming | In Progress | Completed | Practice

**Test Cards:**
- Subject + Type (MCQ / Descriptive / Mixed)
- Duration + Total Marks
- Scheduled Date & Time
- Status badge
- CTA: [Start Test] / [Review Answers]

**Test Taking Page (`/tests/:testId/attempt`):**
- Full-screen zen mode (no sidebar, no distractions)
- Header: Subject name + Timer (countdown, turns red at <5 min) + Q counter "14/30"
- Left panel: Question navigator grid (green=answered, gray=unanswered, yellow=flagged)
- Right panel: Question text + options (MCQ) or text area (descriptive)
- Flag for Review button
- Previous / Next navigation
- Submit button (confirm modal)

**Results Page (`/tests/:testId/result`):**
- Score hero: animated circular ring showing percentage
- Performance breakdown: Correct / Wrong / Skipped
- Section-wise analysis bar chart
- Question-by-question review with correct answer highlighted and explanation
- Comparison: Your score vs class average (line chart)
- [Retake Practice] CTA

---

### PAGE 11 — My Progress
**URL:** `/progress`
**Layout:** Sidebar + Analytics Dashboard

**Overall Stats Row:**
- Total Classes Watched | Assignments Submitted | Tests Taken | Avg Score

**Subject Performance Chart:**
- Radar/Spider chart showing all subjects

**Monthly Study Time Heatmap:**
- GitHub-style calendar grid, colored by hours studied

**Score Trend Line Chart:**
- Per-subject score over time (last 10 tests per subject)

**Chapter Completion Matrix:**
- Grid: Subjects (rows) × Chapters (columns), cell = completion %

**Badges & Achievements Section:**
- All earned badges (glowing cards) + locked badges (greyed, with unlock hint)

**Learning Streak:**
- Flame animation, current streak, longest streak, week view

---

### PAGE 12 — Leaderboard
**URL:** `/leaderboard`
**Layout:** Sidebar + Centered Content

**Scope Toggle:** Class | School | Platform

**Period Filter:** This Week | This Month | All Time

**Top 3 Podium:**
- Animated podium: Gold (1st), Silver (2nd), Bronze (3rd) with avatars and XP scores

**Full Rankings Table:**
- Rank | Avatar | Name | Grade | XP Points | Streak | Badges
- Current student's row highlighted in accent color
- Smooth scroll to student's position button

**Subject-wise Mini Leaderboards:**
- Horizontal scroll of 6 subject leaderboards (top 5 per subject)

---

### PAGE 13 — Doubt Forum / Q&A
**URL:** `/doubts`
**Layout:** Sidebar + Forum layout

**Ask a Doubt (Sticky top):**
- Subject selector, Chapter selector, Question text area, Attach image
- [Post Doubt] button

**Filter/Sort:** Newest | Most Upvoted | Unanswered | My Doubts | By Subject

**Doubt Thread Card:**
- Student avatar + name + "Grade 9"
- Subject + Chapter tag
- Question title (truncated)
- Attached image thumbnail (if any)
- Stats: 👍 5 upvotes | 💬 3 replies | ✅ Resolved badge
- Timestamp

**Doubt Detail (`/doubts/:id`):**
- Full question with image
- Answer thread (instructor answers highlighted with ⭐ badge)
- Reply input
- Mark as Resolved button (by original poster)

---

### PAGE 14 — Study Materials
**URL:** `/materials`
**Layout:** Sidebar + File Browser

**Filter:** Subject | Grade | Type (Notes / Formulas / Reference / Previous Year Papers)

**Grid of Material Cards:**
- File type icon (PDF/Image/Doc)
- Title + Subject tag
- Uploaded by + date
- File size
- Download count
- [Download] + [Preview] buttons

**Preview Drawer:**
- In-browser PDF/image preview
- Bookmark option
- Share link

---

### PAGE 15 — Notifications
**URL:** `/notifications`
**Layout:** Sidebar + Timeline list

**Filter Tabs:** All | Academic | Tests | Assignments | Announcements | System

**Notification Items:**
- Icon (type-based) + Title + Body preview
- Timestamp + "Mark as Read" dot
- Action link (Go to Test, View Assignment, etc.)
- Bulk actions: Mark all read | Clear all

---

### PAGE 16 — Student Profile & Settings
**URL:** `/profile` & `/settings`
**Layout:** Sidebar + Content

**Profile Page:**
- Cover banner (editable gradient)
- Avatar (upload/change)
- Name, Grade, School, Join date
- Stats: Total XP | Classes Watched | Tests Taken | Badges Earned
- Badge shelf (recent 6 badges)
- Subject performance summary

**Settings Page (Tabbed):**
- *Account:* Name, email, phone, password change
- *Appearance:* Dark/Light mode, accent color picker, font size (accessibility)
- *Notifications:* Toggle each type (email, push, in-app)
- *Privacy:* Show on leaderboard, show profile to classmates
- *Subscription:* Current plan, renewal date, upgrade/cancel
- *Language:* (English, Hindi, Malayalam, etc.)

---
---

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

# 🛡️ PORTAL 4: ADMIN SIDE

---

### PAGE 1 — Admin Login
**URL:** `/admin/login`
- Email + Password + mandatory 2FA (authenticator app or OTP)
- Login attempt monitoring (lockout after 5 fails)
- Admin badge with shield icon
- IP whitelist indicator

---

### PAGE 2 — Admin Dashboard
**URL:** `/admin/dashboard`
**Layout:** Full-width sidebar + data-heavy layout

**Sidebar Navigation:**
- 🏠 Dashboard
- 👥 User Management
- 👨‍🏫 Instructor Management
- 👩‍💼 Faculty Management
- 📚 Course & Content
- 💳 Payments & Subscriptions
- 📊 Reports & Analytics
- 🔔 Notifications Center
- ⚙️ Platform Settings
- 🔐 Roles & Permissions
- 🛠️ System & Logs
- 📧 Email & Templates

**Live Metrics Row (real-time):**
- Active Users Right Now (pulsing green dot)
- New Registrations Today
- Revenue Today
- Classes Watched Today

**KPI Summary Cards:**
- Total Students | Total Instructors | Total Faculty | Total Courses | Total Revenue (MTD)

**User Growth Chart:**
- Area chart: Daily registrations (last 30 days)

**Revenue Chart:**
- Bar chart: Monthly revenue + line for target

**Platform Health Monitor:**
- Server status indicators (green/red)
- Storage used / available
- Video streaming uptime %
- API response time

**Recent Activity Log:**
- Live feed: new signups, payments, new uploads, reported content

---

### PAGE 3 — User Management (Students)
**URL:** `/admin/users`
**Layout:** Sidebar + Advanced Table

**Search:** By name, email, phone, ID
**Filters:** Grade | Status (Active/Suspended/Pending) | Plan (Free/Paid) | Join Date | Last Login

**Student Table:**
- ID | Avatar | Name | Grade | Email | Phone | Plan | Status | Joined | Last Login | Actions

**Actions per student:**
- View full profile
- Edit details
- Reset password
- Suspend / Reactivate
- Upgrade / Downgrade plan
- Delete account (with confirmation)
- Impersonate (view as this student)

**Bulk Actions:**
- Export selected to CSV
- Send email to selected
- Change plan for selected
- Suspend selected

**Student Detail Panel (drawer):**
- Full profile
- Subscription history
- Login history
- Content access log
- Admin notes

---

### PAGE 4 — Instructor Management
**URL:** `/admin/instructors`
**Layout:** Sidebar + Table

- Approve new instructor applications
- View instructor profile + content stats
- Suspend / Reactivate
- Assign to subject/grade
- Set commission/payout (if applicable)
- View all uploaded content by instructor
- Download performance report

**Invite Instructor:**
- Email invite with role link
- Auto-send welcome email

---

### PAGE 5 — Faculty Management
**URL:** `/admin/faculty`
**Layout:** Sidebar + Table

- Add / Edit / Remove faculty members
- Assign grade ranges + subjects each faculty oversees
- Set reporting hierarchy
- Activity log per faculty member

---

### PAGE 6 — Course & Content Management
**URL:** `/admin/content`
**Layout:** Sidebar + Table + Preview panel

**Course Table:**
- Course ID | Title | Subject | Grade | Instructor | Videos | Students | Status | Created | Actions

**Content Moderation Queue:**
- Videos pending review (flagged or new)
- Preview + Approve / Reject with reason
- Reported content inbox

**Content Stats:**
- Total videos | Total storage used | Avg video length | Most popular videos

**Bulk Operations:**
- Archive old courses
- Move courses between instructors

---

### PAGE 7 — Payments & Subscriptions
**URL:** `/admin/payments`
**Layout:** Sidebar + Finance Dashboard

**Revenue Summary:**
- Today / This Month / All Time revenue cards
- MRR (Monthly Recurring Revenue) trend

**Transaction Table:**
- Transaction ID | Student Name | Plan | Amount | Date | Method | Status (Success/Failed/Refunded)

**Subscription Plans Manager:**
- View / Edit / Create plans
- Plan: Name | Grade | Features | Price | Duration | Active subscribers

**Refund Management:**
- Pending refund requests
- Approve / Reject with reason

**Instructor Payouts (if rev-share):**
- Payout table per instructor
- Mark as paid

**Payment Gateway Status:**
- Razorpay / Stripe connection status
- Failed payment alerts

---

### PAGE 8 — Reports & Analytics
**URL:** `/admin/reports`
**Layout:** Sidebar + Comprehensive Dashboard

**Global Filters:** Date range, Grade, Subject

**Tabs:**

*Business Metrics:*
- Revenue by month (bar chart)
- Subscription growth (line chart)
- Churn rate
- LTV (Lifetime Value) avg

*Academic Metrics:*
- Avg score platform-wide
- Subject performance comparison (all grades)
- Test completion rates
- Assignment submission rates

*Content Metrics:*
- Most & least watched content
- Upload frequency trend
- Storage growth

*User Metrics:*
- DAU/MAU (Daily/Monthly Active Users)
- Retention cohort analysis
- Grade-wise user distribution pie chart

**Export All Reports:** PDF / Excel

---

### PAGE 9 — Notifications Center
**URL:** `/admin/notifications`
**Layout:** Sidebar + Content

**Compose Notification:**
- Type: Push / Email / In-app / SMS
- Target: All users / Students only / Grade 8 only / Specific user ID
- Title + Body + CTA link
- Schedule or send now

**Notification History Table:**
- Title | Target | Channel | Sent Date | Delivered % | Read % | Actions

**Notification Templates Manager:**
- Pre-built templates for: Welcome, Assignment reminder, Test alert, Subscription renewal, etc.
- Edit template (rich text + variable placeholders like {{student_name}})

---

### PAGE 10 — Platform Settings
**URL:** `/admin/settings`
**Layout:** Sidebar + Tabbed settings

*General:*
- Platform name, logo, favicon
- Default language
- Time zone
- Support email

*Academic:*
- Active grades (which grades are enabled)
- Subjects list (add/remove/rename)
- Semester / term configuration

*Feature Flags:*
- Toggle: Live Classes, Leaderboard, Gamification, Doubt Forum, Community
- Maintenance mode toggle

*Appearance:*
- Brand colors (primary, secondary)
- Landing page layout toggle

*Integrations:*
- Payment gateway keys (Razorpay / Stripe)
- Email provider (SendGrid, Mailgun)
- SMS provider (Twilio, MSG91)
- Video CDN settings (Bunny CDN, Cloudflare)
- Analytics (Google Analytics, Mixpanel)

*Security:*
- Session timeout duration
- Password policy settings
- IP whitelist for admin
- 2FA enforcement per role

---

### PAGE 11 — Roles & Permissions
**URL:** `/admin/roles`
**Layout:** Sidebar + Matrix

**Roles Table:**
- Role Name | Users Count | Created | Actions

**Permission Matrix:**
- Rows = Roles (Student, Instructor, Faculty, Admin, Super Admin)
- Columns = Permissions (View Courses, Upload Video, Grade Assignments, Manage Users, etc.)
- Toggle cells: ✅ / ❌

**Custom Role Creator:**
- Name the role
- Pick permissions from checklist
- Assign to specific users

---

### PAGE 12 — System & Logs
**URL:** `/admin/system`
**Layout:** Sidebar + Technical Dashboard

**System Health:**
- CPU, Memory, Disk usage gauges
- CDN bandwidth usage
- DB query performance

**Audit Log:**
- Who did what and when (full history)
- Filter by user, action type, date
- Export logs

**Error Log:**
- Application errors with stack trace
- Frequency chart
- Mark as resolved

---

### PAGE 13 — Email & Templates
**URL:** `/admin/emails`
**Layout:** Sidebar + Template Editor

**Trigger-based Email List:**
- Welcome Email | OTP Email | Assignment Reminder | Test Result | Subscription Renewal | Password Reset | Announcement

**Template Editor:**
- WYSIWYG visual editor
- Variable tokens: {{name}}, {{grade}}, {{course}}, {{score}}
- Preview desktop + mobile
- Send test email
- Version history

---

## 🗺️ COMPLETE PAGE COUNT SUMMARY

| Portal | Total Pages |
|---|---|
| Student (User) | 16 pages |
| Instructor | 11 pages |
| Faculty | 9 pages |
| Admin | 13 pages |
| **TOTAL** | **49 pages** |

---

## ⚡ TECHNICAL STACK RECOMMENDATION

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router) + TypeScript |
| UI Framework | Tailwind CSS + Shadcn/UI |
| State | Zustand / React Query |
| Video Player | Video.js (custom skin) or Plyr |
| Charts | Recharts / Chart.js |
| Auth | NextAuth.js + JWT |
| Backend | Node.js + Express or NestJS |
| Database | PostgreSQL + Prisma ORM |
| File Storage | AWS S3 / Cloudflare R2 |
| Video CDN | Bunny CDN / Cloudflare Stream |
| Notifications | Firebase Cloud Messaging |
| Payments | Razorpay (India) / Stripe |
| Search | Algolia / Typesense |

---

## 🚀 DEVELOPMENT PRIORITY ORDER

**Phase 1 (MVP):**
1. Student login/register + dashboard
2. Course catalog + video player
3. Instructor upload + course creation
4. Admin user management + basic settings

**Phase 2 (Core):**
5. Tests & Assignments (both sides)
6. Progress tracking + analytics
7. Doubt forum
8. Payments & subscriptions

**Phase 3 (Engagement):**
9. Gamification (badges, leaderboard, streaks)
10. Live classes integration
11. Advanced admin analytics
12. Email/notification system

---

*EduSpark UX Prompt — Designed for Grade 8, 9, 10 Students*
*All 4 Portals · 49 Total Pages · Full Design System Included*