const mongoose = require('mongoose');

const CATEGORIES = [
  'men', 'women', 'youths',
  'men-excos', 'women-excos', 'youth-excos',
  'workers', 'ffcc', 'church-committee', 'choir',
];

const memberSchema = new mongoose.Schema({
  name:        { type: String, required: true, trim: true, maxlength: 100 },
  phone:       { type: String, required: true, unique: true, trim: true },
  dateOfBirth: { type: String, required: true }, // YYYY-MM-DD
  // select: false → the password hash is NEVER sent to the browser by accident
  password:    { type: String, required: true, select: false },
  categories:  [{ type: String, enum: CATEGORIES }],
  role:        { type: String, default: 'member' },
}, { timestamps: true });

memberSchema.index({ categories: 1 });
memberSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Member', memberSchema);
module.exports.CATEGORIES = CATEGORIES;
