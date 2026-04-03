const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const RecordedClass = require('./models/RecordedClass');

const checkVideos = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        const videos = await RecordedClass.find({ status: 'published' }).lean();
        console.log('Total Published Videos:', videos.length);

        videos.forEach(v => {
            console.log(`Video: ${v.title}, URL: ${v.videoUrl}`);
        });

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

checkVideos();
