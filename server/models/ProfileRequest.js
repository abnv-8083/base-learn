const mongoose = require('mongoose');

const profileRequestSchema = new mongoose.Schema({
  faculty: { type: mongoose.Schema.Types.ObjectId, ref: 'Faculty', required: true },
  type: { type: String, enum: ['email', 'password'], required: true },
  newValue: { type: String }, // For email updates
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  adminComment: { type: String }, // For rejection reasons or notes
}, { timestamps: true });

module.exports = mongoose.model('ProfileRequest', profileRequestSchema);
