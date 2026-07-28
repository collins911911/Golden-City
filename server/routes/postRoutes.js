const express    = require('express');
const router     = express.Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');
const { upload } = require('../middleware/cloudinary');
const {
  createPost,
  getPosts,
  markViewed,
  reactToPost,
  deletePost,
} = require('../controllers/postController');

// All routes require login
router.use(protect);

// GET all posts — admin and member
router.get('/', getPosts);

// POST react to a post
router.post('/:id/react', reactToPost);

// POST mark as viewed
router.post('/:id/view', markViewed);

// Admin only
router.post('/',      adminOnly, upload.single('media'), createPost);
router.delete('/:id', adminOnly, deletePost);

module.exports = router;