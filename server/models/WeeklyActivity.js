const mongoose = require('mongoose');

const weeklyActivitySchema = new mongoose.Schema({
  title: { type: String, required: true },
  day: {
    type: String,
    enum: ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'],
    required: true
  },
  time: { type: String, required: true },
  location: { type: String },
  description: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('WeeklyActivity', weeklyActivitySchema);