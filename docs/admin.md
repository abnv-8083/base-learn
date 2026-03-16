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