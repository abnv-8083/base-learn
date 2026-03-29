require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const mongoose = require('mongoose');
const Instructor = require('./models/Instructor');
const Faculty = require('./models/Faculty');
const Student = require('./models/Student');
const Batch = require('./models/Batch');
const RecordedClass = require('./models/RecordedClass');

async function seed() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB Atlas");

        // 1. Create Instructor
        let instructor = await Instructor.findOne({ email: 'instructor@demo.com' });
        if (!instructor) {
            instructor = new Instructor({
                name: "Demo Instructor",
                email: "instructor@demo.com",
                password: "password123",
                role: "instructor"
            });
            await instructor.save();
            console.log("Created Demo Instructor");
        } else {
            console.log("Instructor already exists");
        }

        // 2. Create Faculty
        let faculty = await Faculty.findOne({ email: 'faculty@demo.com' });
        if (!faculty) {
            faculty = new Faculty({
                name: "Dr. Demo Faculty",
                email: "faculty@demo.com",
                password: "password123",
                role: "faculty",
                department: "Computer Science"
            });
            await faculty.save();
            console.log("Created Demo Faculty");
        }

        // 3. Create Students
        const students = [];
        for(let i=1; i<=3; i++) {
            let s = await Student.findOne({ email: `student${i}@demo.com` });
            if (!s) {
                s = new Student({
                    name: `Demo Student ${i}`,
                    email: `student${i}@demo.com`,
                    password: "password123",
                    role: "student",
                    studentId: `ST00${i}`,
                    isVerified: true,
                    instructorNotes: [
                        { note: `Needs to focus more on assignments.`, date: new Date() }
                    ]
                });
                await s.save();
            }
            students.push(s);
        }
        console.log("Created Demo Students");

        // 4. Create Classes and Batches
        const StudyClass = require('./models/StudyClass');
        await StudyClass.deleteMany({ name: { $in: ['Foundation Mathematics', 'Physics Advanced'] }});
        await Batch.deleteMany({ name: { $in: ['Demo Batch Alpha', 'Demo Batch Beta'] }});
        
        const mathClass = new StudyClass({
            name: "Foundation Mathematics",
            targetGrade: "Class 8",
            instructor: instructor._id
        });
        await mathClass.save();

        const physClass = new StudyClass({
            name: "Physics Advanced",
            targetGrade: "Class 10",
            instructor: instructor._id
        });
        await physClass.save();
        
        const batch1 = new Batch({
            name: "Demo Batch Alpha",
            studyClass: mathClass._id,
            instructor: instructor._id,
            students: [students[0]._id, students[1]._id],
            capacity: 30
        });
        await batch1.save();
        
        const batch2 = new Batch({
            name: "Demo Batch Beta",
            studyClass: physClass._id,
            instructor: instructor._id,
            students: [students[2]._id],
            capacity: 30
        });
        await batch2.save();
        console.log("Created Demo Classes and Batches");

        // 5. Create Recorded Classes
        await RecordedClass.deleteMany({ title: { $in: ['Data Structures - Arrays', 'Algorithms - Sorting', 'React Fundamentals'] } });

        // Pending (Draft)
        const pending1 = new RecordedClass({
            title: "Data Structures - Arrays",
            description: "Introduction to arrays",
            videoUrl: "https://example.com/video1.mp4",
            faculty: faculty._id,
            status: "draft" // "pending" approval in instructor pipeline
        });
        await pending1.save();

        const pending2 = new RecordedClass({
            title: "Algorithms - Sorting",
            description: "Bubble, Merge, Quick sort",
            videoUrl: "https://example.com/video2.mp4",
            faculty: faculty._id,
            status: "draft"
        });
        await pending2.save();

        // Published
        const published1 = new RecordedClass({
            title: "React Fundamentals",
            description: "Hooks and State",
            videoUrl: "https://example.com/video3.mp4",
            faculty: faculty._id,
            status: "published",
            assignedTo: [batch1._id.toString()]
        });
        await published1.save();
        console.log("Created Demo Recorded Classes (Pending and Published)");

        console.log("\n=================================");
        console.log("DEMO DATA SEEDED SUCCESSFULLY!");
        console.log("Log in with these credentials at http://localhost:5173/staff-login");
        console.log("Instructor: instructor@demo.com / password123");
        console.log("Faculty:    faculty@demo.com / password123");
        console.log("Student:    student1@demo.com / password123 (at /login)");
        console.log("=================================\n");
        
    } catch(err) {
        console.error("Seeding failed:", err.message);
        if (err.message.includes("Could not connect")) {
            console.log("\n[WARNING] It looks like MongoDB Atlas is blocking the connection.");
            console.log("Please make sure your IP address is whitelisted in MongoDB Atlas under Network Access (0.0.0.0/0).");
        }
    } finally {
        await mongoose.disconnect();
    }
}

seed();
