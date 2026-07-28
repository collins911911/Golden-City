const cron = require('node-cron');

const startBirthdayCron = () => {
  // Runs every day at exactly 8:00 AM
  cron.schedule('0 8 * * *', async () => {
    console.log('🎂 Birthday cron fired at 8:00 AM —', new Date().toLocaleString());

    try {
      const BirthdaySetting = require('../models/BirthdaySetting');
      const Member          = require('../models/Member');
      const Message         = require('../models/Message');
      const { sendSMS }     = require('./termii');

      // Check if auto-birthday SMS is enabled
      const settings = await BirthdaySetting.findOne({});
      if (!settings || !settings.enabled) {
        console.log('🎂 Birthday SMS is disabled — skipping.');
        return;
      }

      // Get today's month and day
      const today = new Date();
      const mm    = String(today.getMonth() + 1).padStart(2, '0');
      const dd    = String(today.getDate()).padStart(2, '0');

      // Find all members whose birthday is today
      // dateOfBirth stored as YYYY-MM-DD
      const allMembers     = await Member.find({});
      const birthdayPeople = allMembers.filter((m) => {
        if (!m.dateOfBirth) return false;
        const parts = m.dateOfBirth.split('-');
        // parts[1] = month, parts[2] = day
        return parts[1] === mm && parts[2] === dd;
      });

      if (birthdayPeople.length === 0) {
        console.log('🎂 No birthdays today.');
        return;
      }

      console.log(`🎂 Found ${birthdayPeople.length} birthday(s) today — sending SMS...`);

      // Send a personalised SMS to each birthday person
      for (const member of birthdayPeople) {
        const personalMessage = settings.template.replace(/{name}/gi, member.name);

        const results = await sendSMS([member.phone], personalMessage);
        const status  = results[0]?.status === 'success' ? 'delivered' : 'pending';

        // Log the message in history
        await Message.create({
          sentBy:         'System (Auto-Birthday)',
          recipients:     [member.phone],
          content:        personalMessage,
          type:           'birthday',
          deliveryStatus: [{ phone: member.phone, status }],
        });

        console.log(`🎂 Birthday SMS sent to ${member.name} (${member.phone}) — ${status}`);
      }

    } catch (err) {
      console.error('🎂 Birthday cron error:', err.message);
    }
  }, {
    timezone: 'Africa/Lagos', // ✅ Nigerian time
  });

  console.log('🎂 Birthday cron job scheduled — fires daily at 8:00 AM (Lagos time)');
};

module.exports = { startBirthdayCron };
