const mongoose = require('mongoose');
require('dotenv').config({ path: 'd:/Base-Learn/server/.env' });
const Student = require('./models/Student');

async function find() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const student = await Student.findOne({ isVerified: true });
        if (student) {
            console.log('--- Student Found ---');
            console.log('Email:', student.email);
            console.log('Name:', student.name);
        } else {
            console.log('No verified student found');
        }
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

find();
