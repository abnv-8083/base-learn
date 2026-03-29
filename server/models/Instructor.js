const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const instructorSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: 'instructor' },
    phone: { type: String },
    experience: { type: String },
    qualification: { type: String },
    teachingMode: { type: String, enum: ['online', 'offline', 'hybrid'], default: 'online' },
    isVerified: { type: Boolean, default: true },
    profilePhoto: { type: String, default: '' },
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

instructorSchema.pre('save', async function () {
    if (!this.isModified('password')) return;
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

instructorSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('Instructor', instructorSchema);
