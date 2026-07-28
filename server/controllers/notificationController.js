const webpush          = require('web-push');
const PushSubscription = require('../models/PushSubscription');

// Configure VAPID
webpush.setVapidDetails(
  'mailto:' + process.env.VAPID_EMAIL,
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

// POST /api/notifications/subscribe
const subscribe = async (req, res) => {
  try {
    const { subscription } = req.body;
    const memberId         = req.user?.id;

    await PushSubscription.findOneAndUpdate(
      { memberId },
      { memberId, subscription },
      { upsert: true, new: true }
    );
    res.json({ message: 'Subscription saved' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Send push to ALL subscribed members
const sendPushToAll = async (title, body, url = '/member-dashboard') => {
  try {
    const subs    = await PushSubscription.find({});
    const payload = JSON.stringify({ title, body, url });

    for (const sub of subs) {
      try {
        await webpush.sendNotification(sub.subscription, payload);
      } catch (err) {
        // Clean up expired subscriptions
        if (err.statusCode === 404 || err.statusCode === 410) {
          await PushSubscription.deleteOne({ _id: sub._id });
        }
      }
    }
    console.log(`🔔 Push notification sent to ${subs.length} subscriber(s)`);
  } catch (err) {
    console.error('Push notification error:', err.message);
  }
};

module.exports = { subscribe, sendPushToAll };