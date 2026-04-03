const mongoose = require('mongoose');
require('dotenv').config();
const Assignment = require('./models/Assignment');

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    const asgn = await Assignment.findOne({ title: /Algebra/i });
    console.log(`Assignment Title: ${asgn.title}`);
    console.log(`Faculty ID (Assignment): ${asgn.facultyId}`);
    console.log(`Submissions:`, JSON.stringify(asgn.submissions, null, 2));
    mongoose.connection.close();
  });
