const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Student = require('./models/Student');
const Batch = require('./models/Batch');
const Subject = require('./models/Subject');
const Chapter = require('./models/Chapter');
const RecordedClass = require('./models/RecordedClass');

dotenv.config();

const debug = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        const student = await Student.findOne({ name: /Anshad/i }).lean();
        if (!student) {
            console.log('Student not found');
            process.exit(0);
        }
        console.log('Student ID:', student._id);

        const batch = await Batch.findOne({ students: student._id }).lean();
        if (!batch) {
            console.log('Batch not found for student');
            process.exit(0);
        }
        console.log('Batch ID:', batch._id);
        console.log('Batch Name:', batch.name);

        const subjects = await Subject.find({ assignedTo: batch._id }).lean();
        console.log('Explicitly Assigned Subjects Count:', subjects.length);
        subjects.forEach(s => console.log(' - Subject:', s.name, s._id));

        const videos = await RecordedClass.find({
            status: 'published',
            assignedTo: { $in: [batch._id] }
        }).lean();
        console.log('Videos Assigned to Batch Count:', videos.length);
        
        const implicitSubjectIds = [...new Set(videos.map(v => v.subject?._id || v.subject))].filter(Boolean);
        console.log('Implicit Subject IDs from videos:', implicitSubjectIds);

        const chapters = await Chapter.find({
            $or: [
                { assignedTo: { $in: [batch._id] } },
                { subject: { $in: subjects.map(s => s._id).concat(implicitSubjectIds) } }
            ]
        }).lean();
        console.log('Relevant Chapters Count:', chapters.length);

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

debug();
