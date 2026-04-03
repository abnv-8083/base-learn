const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
  chapter: { type: mongoose.Schema.Types.ObjectId, ref: 'Chapter' },
  fileUrl: { type: String }, // For direct file uploads
  facultyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Faculty', required: true },
  assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Instructor' },
  status: { type: String, enum: ['draft', 'published', 'rejected', 'archived', 'pending_delete'], default: 'draft' },
  rejectionReason: { type: String },
  isMain: { type: Boolean, default: false },
  batchId: { type: String }, // Legacy, keep for now
  assignedBatches: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Batch' }],
  assignedClasses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'StudyClass' }],
  assignedStudents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }],
  deadline: { type: Date, required: true },
  maxMarks: { type: Number, default: 100 },
  allowedFileTypes: [{ type: String, default: ['pdf'] }], // e.g. 'pdf', 'docx'
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

module.exports = mongoose.model('Assignment', assignmentSchema);
