const express = require('express');
const router  = express.Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');
const c = require('../controllers/adminController');

// Members can see group stats on their dashboard (login only)
router.get('/stats', protect, c.getStats);

// Everything below is admin only
router.use(protect, adminOnly);

router.get('/members',           c.getMembers);
router.get('/members/count',     c.countMembers);
router.get('/members/search',    c.searchMembers);
router.put('/members/:id',       c.updateMember);
router.delete('/members/:id',    c.deleteMember);
router.get('/birthday-settings', c.getBirthdaySettings);
router.put('/birthday-settings', c.updateBirthdaySettings);
router.get('/birthday-today',    c.getTodayBirthdays);

module.exports = router;
