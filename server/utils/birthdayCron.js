const cron            = require('node-cron');
const BirthdaySetting = require('../models/BirthdaySetting');
const Member          = require('../models/Member');
const Message         = require('../models/Message');
const { sendSMS }     = require('./termii');

// Today's month/day in Lagos time (server may run in UTC on Render)
const lagosMonthDay = () => {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Africa/Lagos', month: '2-digit', day: '2-digit',
  }).formatToParts(new Date());
  const mm = parts.find((p) => p.type === 'month').value;
  const dd = parts.find((p) => p.type === 'day').value;
  return { mm, dd };
};

// dateOfBirth is stored as YYYY-MM-DD → match the end of the string
const findTodayBirthdays = () => {
  const { mm, dd } = lagosMonthDay();
  return Member.find({ dateOfBirth: { $regex: `-${mm}-${dd}$` } }).lean();
};

const runBirthdayJob = async () => {
  try {
    const settings = await BirthdaySetting.findOne({}).lean();
    if (!settings || !settings.enabled) {
      console.log('🎂 Birthday SMS is disabled — skipping.');
      return;
    }

    const people = await findTodayBirthdays();
    if (people.length === 0) {
      console.log('🎂 No birthdays today.');
      return;
    }

    for (const member of people) {
      const text    = settings.template.replace(/{name}/gi, member.name);
      const results = await sendSMS([member.phone], text);
      await Message.create({
        sentBy:         'System (Auto-Birthday)',
        recipients:     [member.phone],
        content:        text,
        type:           'birthday',
        deliveryStatus: [{ phone: member.phone, status: results[0]?.status === 'success' ? 'delivered' : 'pending' }],
      });
    }
    console.log(`🎂 Birthday SMS sent to ${people.length} member(s).`);
  } catch (err) {
    console.error('🎂 Birthday cron error:', err.message);
  }
};

const startBirthdayCron = () => {
  cron.schedule('0 8 * * *', runBirthdayJob, { timezone: 'Africa/Lagos' });
  console.log('🎂 Birthday cron job scheduled — fires daily at 8:00 AM (Lagos time)');
};

module.exports = { startBirthdayCron, findTodayBirthdays, runBirthdayJob };
