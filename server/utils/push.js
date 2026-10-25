const webpush          = require('web-push');
const PushSubscription = require('../models/pushSubscription');

// Only configure web-push when the keys exist (tests / local without keys)
const pushEnabled = Boolean(process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY);
if (pushEnabled) {
  webpush.setVapidDetails(
    'mailto:' + (process.env.VAPID_EMAIL || 'admin@goldencity.church'),
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
}

const sendTo = async (filter, title, body, url) => {
  if (!pushEnabled) return 0;
  try {
    const subs    = await PushSubscription.find(filter).lean();
    const payload = JSON.stringify({ title, body, url });

    await Promise.all(subs.map(async (sub) => {
      try {
        await webpush.sendNotification(sub.subscription, payload);
      } catch (err) {
        // Phone unsubscribed / expired → remove it
        if (err.statusCode === 404 || err.statusCode === 410) {
          await PushSubscription.deleteOne({ _id: sub._id });
        }
      }
    }));
    console.log(`🔔 Push "${title}" sent to ${subs.length} device(s)`);
    return subs.length;
  } catch (err) {
    console.error('Push notification error:', err.message);
    return 0;
  }
};

// Members only (old subscriptions without a role count as members)
const sendPushToMembers = (title, body, url = '/member-dashboard') =>
  sendTo({ role: { $ne: 'admin' } }, title, body, url);

// Admins only — e.g. "new registration waiting"
const sendPushToAdmins = (title, body, url = '/admin-registrations') =>
  sendTo({ role: 'admin' }, title, body, url);

module.exports = { sendPushToMembers, sendPushToAdmins, pushEnabled };
