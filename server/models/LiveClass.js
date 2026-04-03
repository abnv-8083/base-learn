const mongoose = require('mongoose');

const liveClassSchema = new mongoose.Schema({
  title: { type: String, required: true },
  subject: { type: String, required: true },
  faculty: { type: mongoose.Schema.Types.ObjectId, ref: 'Faculty', required: true },
  batch: { type: mongoose.Schema.Types.ObjectId, ref: 'Batch' },
  meetingLink: { type: String, required: true },
  scheduledAt: { type: Date, required: true },
  duration: { type: Number, required: true }, // minutes
  status: { type: String, enum: ['upcoming', 'ongoing', 'completed', 'cancelled'], default: 'upcoming' },
  type: { type: String, enum: ['lecture', 'faq'], default: 'lecture' },
  chapter: { type: mongoose.Schema.Types.ObjectId, ref: 'Chapter' }, 
  recordingUrl: { type: String }, // For BBB recording link
  presentationUrl: { type: String }, // For lecture notes/presentation
  attendance: [
    {
      studentId: { type: String }, // Clerk User ID
      attended: { type: Boolean, default: false },
      joinTime: { type: Date },
      leaveTime: { type: Date }
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model('LiveClass', liveClassSchema);
