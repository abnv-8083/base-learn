const mongoose = require('mongoose');

const recordedClassSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  subject: { type: mongoose.Schema.Types.Mixed, ref: 'Subject' },
  chapter: { type: mongoose.Schema.Types.ObjectId, ref: 'Chapter' },
  videoUrl: { type: String, required: true },
  assignmentUrl: { type: String }, // Optional supplementary assignment file (PDF)
  thumbnail: { type: String },
  faculty: { type: mongoose.Schema.Types.ObjectId, ref: 'Faculty', required: true },
  liveClass: { type: mongoose.Schema.Types.ObjectId, ref: 'LiveClass' },
  contentType: { type: String, enum: ['lecture', 'faq', 'liveRecording', 'liveNotes'], default: 'lecture' },
  status: { type: String, enum: ['draft', 'published', 'rejected', 'archived', 'pending_delete'], default: 'draft' },
  totalViews: { type: Number, default: 0 },
  totalClicks: { type: Number, default: 0 },
  rejectionReason: { type: String },
  assignedTo: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Batch' }], // Array of batch IDs
  publishedAt: { type: Date, default: Date.now },
  scheduledFor: { type: Date }, // Time it becomes visible to students
  watchProgress: [
    {
      student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
      watchPercentage: { type: Number, default: 0 },
      lastWatchedAt: { type: Date, default: Date.now },
      rewatchCount: { type: Number, default: 0 },
      durationWatched: { type: Number, default: 0 }, // in seconds
      playbackSpeed: { type: Number, default: 1 }
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model('RecordedClass', recordedClassSchema);
