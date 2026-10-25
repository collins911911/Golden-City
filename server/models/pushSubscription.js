const mongoose = require('mongoose');

const pushSubscriptionSchema = new mongoose.Schema({
  memberId:     { type: String, required: true }, // member OR admin id
  role:         { type: String, enum: ['member', 'admin'], default: 'member' },
  subscription: { type: Object, required: true },
}, { timestamps: true });

pushSubscriptionSchema.index({ memberId: 1 });
pushSubscriptionSchema.index({ role: 1 });

module.exports = mongoose.model('PushSubscription', pushSubscriptionSchema);
