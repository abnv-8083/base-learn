const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
  title: { type: String, required: true },
  url: { type: String, required: true },
  description: { type: String, default: '' },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Faculty', required: true },
  uploadedAt: { type: Date, default: Date.now },
  publishedAt: { type: Date },
  status: { type: String, enum: ['draft', 'published', 'rejected', 'pending_delete'], default: 'draft' },
  rejectionReason: { type: String },
  assignedTo: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Batch' }]
});

const chapterSchema = new mongoose.Schema({
    name: { type: String, required: true },
    subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
    assignedTo: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Batch' }],
    notes: [resourceSchema],
    liveNotes: [resourceSchema],
    dpps: [resourceSchema],
    pyqs: [resourceSchema]
}, { timestamps: true });

module.exports = mongoose.model('Chapter', chapterSchema);
