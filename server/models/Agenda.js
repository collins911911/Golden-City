const mongoose = require('mongoose');

const agendaSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  date: { type: String, required: true },
  time: { type: String },
  year: { type: Number, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Agenda', agendaSchema);