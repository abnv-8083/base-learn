const mongoose = require('mongoose');

const recordedClassSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject' },
  chapter: { type: mongoose.Schema.Types.ObjectId, ref: 'Chapter' },
  videoUrl: { type: String, required: true },
  assignmentUrl: { type: String }, // Optional supplementary assignment file (PDF)
  thumbnail: { type: String },
  faculty: { type: mongoose.Schema.Types.ObjectId, ref: 'Faculty', required: true },
  contentType: { type: String, enum: ['lecture', 'faq'], default: 'lecture' },
  status: { type: String, enum: ['draft', 'published', 'archived'], default: 'draft' },
  assignedTo: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Batch' }], // Array of batch IDs
  publishedAt: { type: Date, default: Date.now },
  scheduledFor: { type: Date }, // Time it becomes visible to students
  watchProgress: [
    {
      student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
      watchPercentage: { type: Number, default: 0 },
      lastWatchedAt: { type: Date, default: Date.now },
      rewatchCount: { type: Number, default: 0 }
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model('RecordedClass', recordedClassSchema);
