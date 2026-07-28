const mongoose = require('mongoose');

const birthdaySettingSchema = new mongoose.Schema({
  template: {
    type:    String,
    required: true,
    default: "Happy Birthday {name}! 🎉🎂 The Golden City Church family celebrates you today. May God bless you abundantly and grant you many more glorious years. We love you! 🙏✝️",
  },
  sendTime: {
    type:    String,
    default: '08:00',
  },
  enabled: {
    type:    Boolean,
    default: true,
  },
}, { timestamps: true });

module.exports = mongoose.model('BirthdaySetting', birthdaySettingSchema);