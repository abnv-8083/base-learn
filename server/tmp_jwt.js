const mongoose = require('mongoose');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const Student = require('./models/Student');

dotenv.config();

mongoose.connect(process.env.MONGO_URI, {})
  .then(async () => {
     console.log('connected');
     const student = await Student.findOne({});
     if (!student) {
        console.log('No student');
        process.exit();
     }
     const token = jwt.sign(
        { id: student._id, role: student.role },
        process.env.JWT_ACCESS_SECRET || 'access_fallback',
        { expiresIn: '1d' }
     );
     console.log(token);
     process.exit();
  });
