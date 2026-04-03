const mongoose = require('mongoose');
const Student = require('./models/Student');
const Batch = require('./models/Batch');
const StudyClass = require('./models/StudyClass');
const Admin = require('./models/Admin');
require('dotenv').config();

async function run() {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const students = await Student.find({ role: 'student' });
    console.log(`Checking ${students.length} students...`);

    const admin = await Admin.findOne({});
    const adminId = admin ? admin._id : null;

    for (const user of students) {
        // Check if student already has a batch
        const existingBatch = await Batch.findOne({ students: user._id });
        if (existingBatch) {
            // console.log(` - ${user.name} already in batch ${existingBatch.name}`);
            continue;
        }

        if (!user.studentClass) {
            console.log(` - ${user.name} has no studentClass defined. Skipping.`);
            continue;
        }

        console.log(` - Repairing enrollment for: ${user.name} (Class: ${user.studentClass})`);

        // Apply new Robust Logic
        const studentDigit = user.studentClass.match(/\d+/) ? user.studentClass.match(/\d+/)[0] : null;
        const query = {
            $or: [
                { targetGrade: user.studentClass },
                { name: { $regex: user.studentClass, $options: 'i' } },
                { name: user.studentClass }
            ]
        };
        if (studentDigit) {
            query.$or.push({ name: { $regex: `(^|\\s)${studentDigit}($|\\s|-)`, $options: 'i' } });
            query.$or.push({ targetGrade: { $regex: `(^|\\s)${studentDigit}($|\\s|-)`, $options: 'i' } });
        }

        const matchingClasses = await StudyClass.find(query);
        
        if (matchingClasses.length === 0) {
            console.log(`   x No matching classes found for digit ${studentDigit}`);
            continue;
        }

        for (const studyClass of matchingClasses) {
            const batches = await Batch.find({ studyClass: studyClass._id });
            let availableBatch = batches.find(b => (b.students ? b.students.length : 0) < (b.capacity || 30));
            
            if (availableBatch) {
                availableBatch.students.push(user._id);
                await availableBatch.save();
                console.log(`   + Added to existing batch: ${availableBatch.name}`);
            } else {
                const newBatch = new Batch({
                    name: `${studyClass.name} - Batch ${batches.length + 1}`,
                    studyClass: studyClass._id,
                    instructor: studyClass.instructor || adminId,
                    students: [user._id],
                    capacity: 30
                });
                await newBatch.save();
                console.log(`   + Created NEW batch: ${newBatch.name}`);
            }
        }
    }

    console.log('Retroactive enrollment complete.');
    process.exit();
}

run();
