const express = require('express');
const router  = express.Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');
const c = require('../controllers/messageController');

router.use(protect, adminOnly);

router.post('/group',     c.sendGroupMessage);
router.post('/selective', c.sendSelectiveMessage);
router.get('/history',    c.getHistory);

module.exports = router;
