const express     = require('express');
const router      = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { subscribe } = require('../controllers/notificationController');

router.post('/subscribe', protect, subscribe);

module.exports = router;