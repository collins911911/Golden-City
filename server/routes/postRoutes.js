const express = require('express');
const router  = express.Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');
const c = require('../controllers/postController');

// All post routes need login
router.use(protect);

router.get('/',               c.getPosts);        // ?page=1&limit=20
router.get('/unviewed-count', c.unviewedCount);
router.post('/:id/react',     c.reactToPost);
router.post('/:id/view',      c.markViewed);
router.post('/:id/share',     c.sharePost);

// Admin only
router.post('/',      adminOnly, c.createPost);
router.delete('/:id', adminOnly, c.deletePost);

module.exports = router;
