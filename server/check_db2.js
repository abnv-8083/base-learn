require('dotenv').config();
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URI).then(async () => {
    const db = mongoose.connection.db;
    const chapter = await db.collection('chapters').findOne({ 
        $or: [
            {'notes.title': /bakvdygdv/i}, 
            {'liveNotes.title': /bakvdygdv/i}, 
            {'dpps.title': /bakvdygdv/i}, 
            {'pyqs.title': /bakvdygdv/i}
        ] 
    });
    console.log(JSON.stringify(chapter, null, 2));
    process.exit(0);
});
