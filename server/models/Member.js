const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  phone: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  dateOfBirth: {
    type: String,
    required: true,
  },
  // ── PASSWORD added ──────────────────────────────────────
  password: {
    type: String,
    required: true,
  },
  categories: [{
    type: String,
    enum: [
      'men', 'women', 'youths',
      'men-excos', 'women-excos', 'youth-excos',
      'workers', 'ffcc', 'church-committee', 'choir',
    ],
  }],
  role: {
    type: String,
    default: 'member',
  },
}, { timestamps: true });

module.exports = mongoose.model('Member', memberSchema);