# Project Evolution & Technical Summary: Base-Learn

This document provides a detailed overview of the core architectural improvements, feature implementations, and critical bug fixes completed during our development sessions.

---

## 🚀 1. Badge System Standardization
Highly accurate, role-based sidebar notifications were implemented to ensure users only see counts relevant to their scope.

### Key Implementation:
```javascript
// Example: Scoping content for Instructors
const subjectQuery = req.user.role === 'admin' ? {} : { instructor: userId };
const instructorSubjects = await Subject.find(subjectQuery).select('_id');
const subjectIds = instructorSubjects.map(s => s._id);

const [pendingVideos, pendingTests] = await Promise.all([
    RecordedClass.countDocuments({ status: 'draft', subject: { $in: subjectIds } }),
    Test.countDocuments({ status: 'draft', subject: { $in: subjectIds } })
]);
```

---

## 🔔 2. Automated Notification Core
Improved communication between user roles through automated system triggers.

### notifyInstructor Logic:
```javascript
const notifyInstructorAsync = async (contentTitle) => {
    const subject = await Subject.findById(subjectId);
    if (subject && subject.instructor) {
        await Notification.create({
            message: `Faculty uploaded new content pending verification: "${contentTitle}"`,
            type: 'info',
            recipient: subject.instructor,
            sender: req.user.userId
        });
    }
};
```

### Fixed Badge Query:
```javascript
// Correct way to count unread notifications using dismissedBy array
const unreadNotifs = await Notification.countDocuments({
    recipient: { $in: [userId, 'all'] },
    dismissedBy: { $ne: userId }
});
```

---

## 🖼️ 3. Brand Identity & UI/UX Polish
Modernized the platform's visual identity with specialized image processing and high-end CSS.

### Scroll-Adaptive Logo (CSS):
```jsx
<img 
  src="/logo-wide.png" 
  style={{ 
    mixBlendMode: scrolled ? 'multiply' : 'screen',
    filter: scrolled ? 'invert(1) grayscale(1)' : 'none',
    transition: 'all 0.2s ease'
  }} 
/>
```

---

## 🛠️ 4. Infrastructure & Deployment Stabilisation
Optimized the production environment on the E2E server.

### Nginx Optimization for 5GB+ Uploads:
```nginx
client_max_body_size 10G;
proxy_read_timeout 7200;
proxy_connect_timeout 7200;
proxy_send_timeout 7200;
```

---

## 🐞 5. Critical Bug Fixes
- **ReferenceError Resolution**: Fixed application crashes caused by missing controller imports in `studentRoutes.js`.
- **Nginx Config Audit**: Resolved a syntax error in the site configuration that prevented server restarts.
- **Docker Orchestration**: Streamlined the deployment flow using Docker Compose for consistent environment parity.

---
> [!TIP]
> **Suggested Workflow**: After pushing changes, always run `docker compose up -d --build` to ensure the Nginx config and environment variables are refreshed.
