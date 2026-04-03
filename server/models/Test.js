const mongoose = require('mongoose');

const testSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject' },
  chapter: { type: mongoose.Schema.Types.ObjectId, ref: 'Chapter' },
  fileUrl: { type: String, required: true }, // The test PDF/document
  faculty: { type: mongoose.Schema.Types.ObjectId, ref: 'Faculty', required: true },
  assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Instructor' },
  assignedTo: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Batch' }], // Batches
  assignedClasses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'StudyClass' }],
  assignedStudents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }],
  deadline: { type: Date },
  maxMarks: { type: Number, default: 100 },
  status: { type: String, enum: ['draft', 'published', 'rejected', 'archived', 'pending_delete'], default: 'draft' },
  rejectionReason: { type: String },
  isMain: { type: Boolean, default: false },
  publishedAt: { type: Date },
  submissions: [
    {
      studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
      fileUrl: { type: String, required: true },
      submittedAt: { type: Date, default: Date.now },
      forwardedAt: { type: Date },
      status: { type: String, enum: ['submitted', 'forwarded', 'graded'], default: 'submitted' },
      isLate: { type: Boolean, default: false },
      marks: { type: Number },
      feedback: { type: String },
      gradedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Faculty' },
      gradedAt: { type: Date }
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model('Test', testSchema);
