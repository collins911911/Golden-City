const express = require('express');
const router  = express.Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');
const Agenda  = require('../models/Agenda');

router.get('/', protect, async (req, res) => {
  try { res.json(await Agenda.find({}).sort({ date: 1 })); }
  catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/', protect, adminOnly, async (req, res) => {
  try { res.status(201).json(await Agenda.create(req.body)); }
  catch (err) { res.status(500).json({ message: err.message }); }
});

router.put('/:id', protect, adminOnly, async (req, res) => {
  try { res.json(await Agenda.findByIdAndUpdate(req.params.id, req.body, { new: true })); }
  catch (err) { res.status(500).json({ message: err.message }); }
});

router.delete('/:id', protect, adminOnly, async (req, res) => {
  try { await Agenda.findByIdAndDelete(req.params.id); res.json({ message: 'Deleted' }); }
  catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;