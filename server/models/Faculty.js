const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const facultySchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: 'faculty' },
    department: { type: String },
    phone: { type: String },
    district: { type: String },
    qualification: { type: String, default: '' },
    experience: { type: String, default: '' },
    specialization: { type: String, default: '' },
    about: { type: String, default: 'Passionate educator dedicated to shaping the next generation of learners.' },
    isVerified: { type: Boolean, default: true },
    profilePhoto: { type: String, default: '' },
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

facultySchema.pre('save', async function () {
    if (!this.isModified('password')) return;
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

facultySchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('Faculty', facultySchema);
