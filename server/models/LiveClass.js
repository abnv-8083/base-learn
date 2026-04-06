const mongoose = require('mongoose');

const deviceEventSchema = new mongoose.Schema({
    type: { type: String, enum: ['camera_on', 'camera_off', 'mic_on', 'mic_off'], required: true },
    timestamp: { type: Date, default: Date.now }
}, { _id: false });

const liveClassSchema = new mongoose.Schema({
  title: { type: String, required: true },
  subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
  faculty: { type: mongoose.Schema.Types.ObjectId, ref: 'Faculty', required: true },
  batches: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Batch' }],
  description: { type: String },
  meetingLink: { type: String, required: true },
  scheduledAt: { type: Date, required: true },
  duration: { type: Number, required: true }, // minutes
  status: { type: String, enum: ['upcoming', 'ongoing', 'completed', 'cancelled'], default: 'upcoming' },
  type: { type: String, enum: ['lecture', 'faq'], default: 'lecture' },
  chapter: { type: mongoose.Schema.Types.ObjectId, ref: 'Chapter' }, 
  recordingUrl: { type: String },
  presentationUrl: { type: String },
  processed: { type: Boolean, default: false }, // Flag for post-session automation
  attendance: [
    {
      studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
      attended: { type: Boolean, default: false },
      status: { type: String, enum: ['present', 'absent', 'late'], default: 'absent' },
      joinTime: { type: Date },
      leaveTime: { type: Date },
      totalDurationSeconds: { type: Number, default: 0 }, // computed on leave
      cameraOnDurationSeconds: { type: Number, default: 0 }, // computed on leave
      micOnDurationSeconds: { type: Number, default: 0 }, // computed on leave
      deviceEvents: [deviceEventSchema] // timeline of camera/mic toggles
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model('LiveClass', liveClassSchema);
