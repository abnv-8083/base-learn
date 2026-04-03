const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Batch = require('./models/Batch');
const Instructor = require('./models/Instructor');

dotenv.config();

const checkBatches = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const instructors = await Instructor.find({});
        console.log(`Found ${instructors.length} instructors:`);
        instructors.forEach(i => console.log(`- ${i.name} (${i._id})`));

        const batches = await Batch.find({}).populate('instructor');
        console.log(`\nFound ${batches.length} total batches:`);
        batches.forEach(b => {
             console.log(`- Batch: ${b.name}, Instructor: ${b.instructor ? b.instructor.name : 'NONE'} (${b.instructor ? b.instructor._id : 'N/A'})`);
        });

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

checkBatches();
