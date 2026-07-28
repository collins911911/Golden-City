const express  = require('express');
const router   = express.Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');
const Activity = require('../models/WeeklyActivity');

router.get('/', protect, async (req, res) => {
  try { res.json(await Activity.find({}).sort({ day: 1, time: 1 })); }
  catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/', protect, adminOnly, async (req, res) => {
  try { res.status(201).json(await Activity.create(req.body)); }
  catch (err) { res.status(500).json({ message: err.message }); }
});

router.put('/:id', protect, adminOnly, async (req, res) => {
  try { res.json(await Activity.findByIdAndUpdate(req.params.id, req.body, { new: true })); }
  catch (err) { res.status(500).json({ message: err.message }); }
});

router.delete('/:id', protect, adminOnly, async (req, res) => {
  try { await Activity.findByIdAndDelete(req.params.id); res.json({ message: 'Deleted' }); }
  catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;