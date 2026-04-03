const mongoose = require('mongoose');
require('dotenv').config();
const Assignment = require('./models/Assignment');

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('Connected to DB');
    const assignments = await Assignment.find({ title: /Algebra/i });
    console.log(`Found ${assignments.length} assignments with 'Algebra' in title`);
    assignments.forEach(a => {
      console.log(`ID: ${a._id}, Title: ${a.title}, Submissions: ${a.submissions.length}`);
      a.submissions.forEach(s => {
        console.log(`  - Student: ${s.studentId}, Status: ${s.status}, Date: ${s.submittedAt}`);
      });
    });
    mongoose.connection.close();
  })
  .catch(err => {
    console.error('DB Error:', err);
    process.exit(1);
  });
