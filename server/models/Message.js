const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sentBy: { type: String, required: true },
  recipients: [{ type: String }],
  group: { type: String },
  content: { type: String, required: true },
  type: {
    type: String,
    enum: ['group', 'selective', 'birthday', 'all'],
    default: 'group'
  },
  deliveryStatus: [{
    phone: String,
    status: { type: String, default: 'pending' }
  }]
}, { timestamps: true });

module.exports = mongoose.model('Message', messageSchema);