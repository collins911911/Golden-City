const express = require('express');
const router  = express.Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');
const {
  getStats, getMembers, searchMembers, updateMember, deleteMember,
  getBirthdaySettings, updateBirthdaySettings, getTodayBirthdays,
} = require('../controllers/adminController');

// ✅ This route only needs login (not admin role)
// Members can see stats on their dashboard
router.get('/stats', protect, getStats);

// Everything below requires admin role
router.use(protect, adminOnly);

router.get('/members',           getMembers);
router.get('/members/search',    searchMembers);
router.put('/members/:id',       updateMember);
router.delete('/members/:id',    deleteMember);
router.get('/birthday-settings', getBirthdaySettings);
router.put('/birthday-settings', updateBirthdaySettings);
router.get('/birthday-today',    getTodayBirthdays);

module.exports = router;