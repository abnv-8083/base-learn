const mongoose = require('mongoose');
const Faculty = require('./models/Faculty');
const Instructor = require('./models/Instructor');
require('dotenv').config();

async function run() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // Clean up existing demo users if they exist
        await Faculty.deleteOne({ email: 'demo.faculty@baselearn.com' });
        await Instructor.deleteOne({ email: 'demo.instructor@baselearn.com' });

        // Create Demo Faculty
        const faculty = new Faculty({
            name: 'Demo Faculty',
            email: 'demo.faculty@baselearn.com',
            password: 'Password123',
            department: 'Computer Science',
            phone: '9876543210',
            qualification: 'PhD in Education',
            experience: '10 Years'
        });
        await faculty.save();
        console.log('Demo Faculty created!');

        // Create Demo Instructor
        const instructor = new Instructor({
            name: 'Demo Instructor',
            email: 'demo.instructor@baselearn.com',
            password: 'Password123',
            phone: '8765432109',
            qualification: 'M.Tech',
            experience: '5 Years'
        });
        await instructor.save();
        console.log('Demo Instructor created!');

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

run();
