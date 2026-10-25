const PushSubscription = require('../models/pushSubscription');
const { httpError }    = require('../utils/validate');

// POST /api/notifications/subscribe   body: { subscription }
// Saves this phone/browser so it can receive push notifications.
// The role decides who gets what: members get posts/notices,
// admins get "new registration" alerts.
const subscribe = async (req, res) => {
  const { subscription } = req.body;
  if (!subscription?.endpoint) throw httpError(400, 'Invalid subscription');

  await PushSubscription.findOneAndUpdate(
    { 'subscription.endpoint': subscription.endpoint },
    {
      memberId: String(req.user.id),
      role:     req.user.role === 'admin' ? 'admin' : 'member',
      subscription,
    },
    { upsert: true }
  );
  res.json({ message: 'Subscription saved' });
};

// GET /api/notifications/public-key — lets the app fetch the VAPID key
const publicKey = (req, res) => {
  res.json({ key: process.env.VAPID_PUBLIC_KEY || '' });
};

module.exports = { subscribe, publicKey };
