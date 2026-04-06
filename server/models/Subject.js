const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, default: '' },
    targetGrade: { type: String, default: 'Class 10' },
    faculty: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Faculty' }],
    assignedTo: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Batch' }],
    instructor: { type: mongoose.Schema.Types.ObjectId, ref: 'Instructor', required: true }
}, { timestamps: true });

module.exports = mongoose.model('Subject', subjectSchema);
