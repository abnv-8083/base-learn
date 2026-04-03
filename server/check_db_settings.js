const mongoose = require('mongoose');
require('dotenv').config({ path: 'd:/Base-Learn/server/.env' });
const SystemSettings = require('./models/SystemSettings');

async function check() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const settings = await SystemSettings.getSettings();
        console.log('--- System Settings ---');
        console.log('Preference:', settings.notificationPreference);
        console.log('WhatsApp Number:', settings.admissionContactWhatsApp);
        console.log('Email:', settings.admissionContactEmail);
        console.log('---');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

check();
