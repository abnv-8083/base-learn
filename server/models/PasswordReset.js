const mongoose = require('mongoose');

const passwordResetSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, index: true },
    role: { type: String, required: true, enum: ['student', 'faculty', 'instructor', 'admin'] },
    code: { type: String, required: true },
    expiresAt: { type: Date, required: true },
    used: { type: Boolean, default: false },
  },
  { timestamps: true }
);

passwordResetSchema.index({ email: 1, createdAt: -1 });

module.exports = mongoose.model('PasswordReset', passwordResetSchema);
