const express = require('express');
const router  = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { subscribe, publicKey } = require('../controllers/notificationController');

router.get('/public-key', publicKey);
router.post('/subscribe', protect, subscribe);

module.exports = router;
