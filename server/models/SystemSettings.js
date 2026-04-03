const mongoose = require('mongoose');

const systemSettingsSchema = new mongoose.Schema({
    platformName: { type: String, default: 'Base Learn' },
    supportEmail: { type: String, default: '' },
    maintenanceMode: { type: Boolean, default: false },
    maxUploadSizeMB: { type: Number, default: 50 },
    allowRegistration: { type: Boolean, default: false },
    admissionContactEmail: {
        type: String,
        default: 'admin@baselearn.com'
    },
    admissionContactWhatsApp: {
        type: String,
        default: '919876543210'
    },
    notificationPreference: {
        type: String,
        enum: ['email', 'whatsapp', 'both'],
        default: 'whatsapp'
    }
}, { timestamps: true });

// Ensure only one settings document exists
systemSettingsSchema.statics.getSettings = async function() {
    let settings = await this.findOne();
    if (!settings) {
        settings = await this.create({});
    }
    return settings;
};

module.exports = mongoose.model('SystemSettings', systemSettingsSchema);
