const mongoose = require('mongoose');

const admissionEnquirySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    studentClass: { type: String, default: '' },
    school: { type: String, default: '' },
    dob: { type: String, default: '' },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    parentName: { type: String, default: '' },
    parentPhone: { type: String, default: '' },
    district: { type: String, default: '' },
    message: { type: String, default: '' },
    status: {
      type: String,
      enum: ['new', 'contacted', 'enrolled', 'dropped'],
      default: 'new',
    },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('AdmissionEnquiry', admissionEnquirySchema);
