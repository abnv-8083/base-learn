const mongoose = require('mongoose');
require('dotenv').config();
const Assignment = require('./models/Assignment');
const Batch = require('./models/Batch');
const Student = require('./models/Student');

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    // 1. Find the student
    const student = await Student.findOne({ name: /Student/i }) || await Student.findOne();
    if (!student) { console.log('No student found'); return; }
    console.log(`Student: ${student.name} (${student._id})`);

    // 2. Find the batch the student is in
    const batch = await Batch.findOne({ students: student._id });
    if (!batch) { console.log('Student not in any batch'); }
    else { console.log(`Batch: ${batch.name} (${batch._id})`); }

    // 3. Find assignments the student sees
    const assignments = await Assignment.find({ title: /Algebra/i });
    assignments.forEach(a => {
        console.log(`Assignment ID: ${a._id}, Title: ${a.title}`);
        console.log(`  Assigned Batches: ${a.assignedBatches}`);
        console.log(`  Assigned Classes: ${a.assignedClasses}`);
        console.log(`  Assigned Students: ${a.assignedStudents}`);
        console.log(`  Submissions: ${a.submissions.length}`);
    });
    mongoose.connection.close();
  })
  .catch(err => {
    console.error('DB Error:', err);
    process.exit(1);
  });
