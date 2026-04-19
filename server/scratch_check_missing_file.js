const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const Assignment = require('./models/Assignment');
const Test = require('./models/Test');
const Chapter = require('./models/Chapter');
const RecordedClass = require('./models/RecordedClass');

async function check() {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to DB');

    const searchStr = 'assignment-1776523208207-52a20a39-d3a2-4b4a-8d24-15806b8b6dab.pdf';
    
    console.log(`Searching for: ${searchStr}`);

    const assignment = await Assignment.findOne({ fileUrl: { $regex: searchStr } });
    if (assignment) {
        console.log('Found in Assignment:');
        console.log(JSON.stringify(assignment, null, 2));
    } else {
        console.log('Not found in Assignment');
    }

    const test = await Test.findOne({ fileUrl: { $regex: searchStr } });
    if (test) {
        console.log('Found in Test:');
        console.log(JSON.stringify(test, null, 2));
    } else {
        console.log('Not found in Test');
    }

    const chapter = await Chapter.findOne({
        $or: [
            { 'notes.url': { $regex: searchStr } },
            { 'liveNotes.url': { $regex: searchStr } },
            { 'dpps.url': { $regex: searchStr } },
            { 'pyqs.url': { $regex: searchStr } }
        ]
    });
    if (chapter) {
        console.log('Found in Chapter:');
        console.log(`Chapter: ${chapter.name} (${chapter._id})`);
        const r = [...chapter.notes, ...chapter.liveNotes, ...chapter.dpps, ...chapter.pyqs].find(r => r.url && r.url.includes(searchStr));
        console.log(JSON.stringify(r, null, 2));
    } else {
        console.log('Not found in Chapter');
    }

    const recorded = await RecordedClass.findOne({ assignmentUrl: { $regex: searchStr } });
    if (recorded) {
        console.log('Found in RecordedClass:');
        console.log(JSON.stringify(recorded, null, 2));
    } else {
        console.log('Not found in RecordedClass');
    }

    await mongoose.disconnect();
}

check().catch(console.error);
