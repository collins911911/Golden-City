const express    = require('express');
const router     = express.Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');
const Notice     = require('../models/Notice');
const { sendPushToAll } = require('../controllers/notificationController');

// GET — all members can read notices
router.get('/', protect, async (req, res) => {
  try { res.json(await Notice.find({}).sort({ createdAt: -1 })); }
  catch (err) { res.status(500).json({ message: err.message }); }
});

// POST — admin posts a notice → triggers push notification
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const notice = await Notice.create(req.body);

    // 🔔 Push notification fires to all subscribed members
    const pushTitle = notice.important
      ? `🚨 Important: ${notice.title}`
      : `📌 ${notice.title}`;
    const pushBody  = notice.body.length > 120
      ? notice.body.slice(0, 120) + '...'
      : notice.body;

    await sendPushToAll(pushTitle, pushBody, '/member-notice');

    res.status(201).json(notice);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// PUT — edit notice
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    res.json(await Notice.findByIdAndUpdate(req.params.id, req.body, { new: true }));
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// DELETE
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    await Notice.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;