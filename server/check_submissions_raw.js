const mongoose = require('mongoose');
require('dotenv').config();
const Assignment = require('./models/Assignment');

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    const asgn = await Assignment.findOne({ title: /Algebra/i });
    console.log(`Assignment ID: ${asgn._id}`);
    console.log('Submissions Raw Content:', JSON.stringify(asgn.submissions, null, 2));
    mongoose.connection.close();
  });
