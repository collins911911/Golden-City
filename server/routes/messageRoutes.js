const express = require('express');
const router  = express.Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');
const {
  sendGroupMessage,
  sendSelectiveMessage,
  getHistory,
} = require('../controllers/messageController');

router.use(protect, adminOnly);

router.post('/group',     sendGroupMessage);
router.post('/selective', sendSelectiveMessage);
router.get('/history',    getHistory);

module.exports = router;
