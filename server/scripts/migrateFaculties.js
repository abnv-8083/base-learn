const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Faculty = require('../models/Faculty');

dotenv.config();

async function migrate() {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/baselearn');
        console.log('Connected to MongoDB for migration...');

        const faculties = await Faculty.find({});
        console.log(`Found ${faculties.length} faculties to check.`);

        let migratedCount = 0;
        for (const faculty of faculties) {
            // Check if there is old data in 'assignedInstructor' (Mongoose might not show it in the doc if it's not in schema)
            // But we can access it via _doc or if we haven't strictly removed it from the DB yet.
            const raw = faculty.toObject({ virtuals: false });
            const oldInstructor = raw.assignedInstructor;

            if (oldInstructor && (!faculty.assignedInstructors || faculty.assignedInstructors.length === 0)) {
                faculty.assignedInstructors = [oldInstructor];
                // Using $unset to remove the old field from the document in DB
                await Faculty.updateOne(
                    { _id: faculty._id },
                    { 
                        $set: { assignedInstructors: [oldInstructor] },
                        $unset: { assignedInstructor: "" } 
                    }
                );
                migratedCount++;
            }
        }

        console.log(`Migration complete. Migrated ${migratedCount} faculties.`);
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
}

migrate();
