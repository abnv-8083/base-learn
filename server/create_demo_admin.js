const mongoose = require('mongoose');
const Admin = require('./models/Admin');
require('dotenv').config();

async function run() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // Clean up existing demo admin if it exists
        await Admin.deleteOne({ email: 'admin@baselearn.com' });

        // Create Demo Admin
        const admin = new Admin({
            name: 'Demo Admin',
            email: 'admin@baselearn.com',
            password: 'Password123'
        });
        await admin.save();
        console.log('Demo Admin created! (admin@baselearn.com / Password123)');

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

run();
