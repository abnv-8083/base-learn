const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const RecordedClass = require('./models/RecordedClass');

const normalizeVideos = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        const currentPort = process.env.PORT || 6000;
        const videos = await RecordedClass.find({ status: 'published' });
        console.log('Total Videos to check:', videos.length);

        let updatedCount = 0;
        for (const video of videos) {
            let updated = false;
            // Normalize localhost:5000 to localhost:6000
            if (video.videoUrl && video.videoUrl.includes('localhost:5000')) {
                video.videoUrl = video.videoUrl.replace('localhost:5000', `localhost:${currentPort}`);
                updated = true;
            }
            // Normalize 127.0.0.1 to localhost for consistency (optional but helps with CORS)
            if (video.videoUrl && video.videoUrl.includes('127.0.0.1')) {
                video.videoUrl = video.videoUrl.replace('127.0.0.1', `localhost`);
                updated = true;
            }

            if (updated) {
                await video.save();
                console.log(`Updated Video: ${video.title} -> ${video.videoUrl}`);
                updatedCount++;
            }
        }

        console.log(`Successfully updated ${updatedCount} video URLs.`);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

normalizeVideos();
