const mongoose = require('mongoose');
const { CATEGORIES } = require('./Member');

// A request to join the church. An admin approves (→ becomes a Member)
// or rejects it. The person gets an SMS either way.
const registrationSchema = new mongoose.Schema({
  name:        { type: String, required: true, trim: true, maxlength: 100 },
  phone:       { type: String, required: true, trim: true },
  dateOfBirth: { type: String, required: true },
  password:    { type: String, required: true, select: false }, // already hashed
  categories:  [{ type: String, enum: CATEGORIES }],

  status:      { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  reason:      { type: String, default: '' },   // rejection reason
  reviewedBy:  { type: String, default: '' },   // admin name
  reviewedAt:  { type: Date },
}, { timestamps: true });

registrationSchema.index({ phone: 1 });
registrationSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('Registration', registrationSchema);
