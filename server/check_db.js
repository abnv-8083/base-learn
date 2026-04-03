const mongoose = require('mongoose');
const Student = require('./models/Student');
const Batch = require('./models/Batch');
const StudyClass = require('./models/StudyClass');
require('dotenv').config();

async function check() {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const classes = await StudyClass.find();
    console.log('\nCLASSES:');
    classes.forEach(c => console.log(` - _id: ${c._id}, name: "${c.name}", targetGrade: "${c.targetGrade}"`));

    const students = await Student.find({ role: 'student' }).sort({ createdAt: -1 }).limit(3);
    console.log('\nRECENT STUDENTS:');
    for (const s of students) {
        const batch = await Batch.findOne({ students: s._id });
        console.log(` - ${s.name} (${s.email}), Class: "${s.studentClass}", Batch: ${batch ? batch.name : 'NONE'}`);
    }

    process.exit();
}

check();
