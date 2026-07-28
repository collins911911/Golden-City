const mongoose = require('mongoose');

const pushSubscriptionSchema = new mongoose.Schema({
  memberId: {
    type: mongoose.Schema.Types.ObjectId,
    ref:  'Member',
  },
  subscription: {
    type:     Object,
    required: true,
  },
}, { timestamps: true });

module.exports = mongoose.model('PushSubscription', pushSubscriptionSchema);