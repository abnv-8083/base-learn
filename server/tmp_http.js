const mongoose = require('mongoose');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const Student = require('./models/Student');
const http = require('http');

dotenv.config();

mongoose.connect(process.env.MONGO_URI, {})
  .then(async () => {
     console.log('connected to db');
     const student = await Student.findOne();
     if (!student) {
        console.log('No student');
        process.exit();
     }
     const token = jwt.sign(
        { id: student._id, role: student.role },
        process.env.JWT_ACCESS_SECRET || 'access_fallback',
        { expiresIn: '1d' }
     );
     
     // perform HTTP GET
     const options = {
        hostname: '127.0.0.1',
        port: 6000,
        path: '/api/student/progression',
        method: 'GET',
        headers: {
           'Authorization': `Bearer ${token}`
        }
     };

     const req = http.request(options, (res) => {
        let data = '';
        console.log(`STATUS: ${res.statusCode}`);
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
           console.log(`BODY: ${data}`);
           process.exit();
        });
     });

     req.on('error', (e) => {
        console.error(`problem with request: ${e.message}`);
        process.exit();
     });

     req.end();
  });
