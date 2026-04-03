const mongoose = require('mongoose');
const dotenv = require('dotenv');
const RecordedClass = require('./models/RecordedClass');
const Test = require('./models/Test');
const Assignment = require('./models/Assignment');
const Chapter = require('./models/Chapter');

dotenv.config();

const cleanUp = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const vRes = await RecordedClass.deleteMany({ status: 'pending_delete' });
        console.log(`Deleted ${vRes.deletedCount} RecordedClasses`);

        const tRes = await Test.deleteMany({ status: 'pending_delete' });
        console.log(`Deleted ${tRes.deletedCount} Tests`);

        const aRes = await Assignment.deleteMany({ status: 'pending_delete' });
        console.log(`Deleted ${aRes.deletedCount} Assignments`);

        // Clean chapters resources
        const chapters = await Chapter.find({});
        let resourceDeletes = 0;
        for (const chap of chapters) {
            let changed = false;
            ['notes', 'liveNotes', 'dpps', 'pyqs'].forEach(field => {
                const initialLen = chap[field].length;
                chap[field] = chap[field].filter(r => r.status !== 'pending_delete');
                if (chap[field].length < initialLen) {
                    resourceDeletes += (initialLen - chap[field].length);
                    changed = true;
                }
            });
            if (changed) await chap.save();
        }
        console.log(`Deleted ${resourceDeletes} Chapter Resources`);

        console.log('Cleanup complete');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

cleanUp();
