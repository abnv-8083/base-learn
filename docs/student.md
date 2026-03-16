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