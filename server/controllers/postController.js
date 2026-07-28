const Post           = require('../models/Post');
const { cloudinary } = require('../middleware/cloudinary');

// POST /api/posts — admin uploads image or video
const createPost = async (req, res) => {
  try {
    console.log('📸 Upload attempt by:', req.user?.name);
    console.log('📁 File received:', req.file ? `${req.file.originalname} (${req.file.mimetype})` : 'NO FILE');
    console.log('📝 Caption:', req.body?.caption || 'none');

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded. Please select an image or video.' });
    }

    console.log('☁️  Cloudinary URL:', req.file.path);
    console.log('☁️  Cloudinary public_id:', req.file.filename);

    const isVideo   = req.file.mimetype.startsWith('video/');
    const mediaType = isVideo ? 'video' : 'image';

    const post = await Post.create({
      postedBy:      req.user.name,
      postedByTitle: req.user.title || '',
      mediaUrl:      req.file.path,
      publicId:      req.file.filename,
      mediaType,
      caption:       req.body.caption || '',
    });

    console.log('✅ Post created:', post._id);
    res.status(201).json(post);

  } catch (err) {
    // Proper error logging — shows the actual message not [object Object]
    console.error('❌ Post upload error:', err.message);
    console.error('❌ Full error:', JSON.stringify(err, null, 2));
    res.status(500).json({ message: err.message || 'Upload failed' });
  }
};

// GET /api/posts — all posts newest first
const getPosts = async (req, res) => {
  try {
    const posts = await Post.find({}).sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    console.error('❌ Get posts error:', err.message);
    res.status(500).json({ message: err.message });
  }
};

// POST /api/posts/:id/view — mark viewed once per member
const markViewed = async (req, res) => {
  try {
    const memberId = req.user.id;
    const post = await Post.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { views: memberId } },
      { returnDocument: 'after' }
    );
    if (!post) return res.status(404).json({ message: 'Post not found' });
    res.json({ views: post.views.length });
  } catch (err) {
    console.error('❌ Mark viewed error:', err.message);
    res.status(500).json({ message: err.message });
  }
};

// POST /api/posts/:id/react — ONE reaction per user
const reactToPost = async (req, res) => {
  try {
    const memberId = req.user.id;
    const { type } = req.body;

    if (!['likes', 'loves', 'amens'].includes(type)) {
      return res.status(400).json({ message: 'Invalid reaction type' });
    }

    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const allTypes     = ['likes', 'loves', 'amens'];
    const existingType = allTypes.find((t) => post[t].includes(memberId));

    if (existingType === type) {
      // Same reaction — toggle off
      post[type] = post[type].filter((id) => id !== memberId);
    } else {
      // Different or no reaction — remove old, add new
      if (existingType) {
        post[existingType] = post[existingType].filter((id) => id !== memberId);
      }
      post[type].push(memberId);
    }

    await post.save();

    res.json({
      likes: post.likes.length,
      loves: post.loves.length,
      amens: post.amens.length,
      userReactions: {
        liked:  post.likes.includes(memberId),
        loved:  post.loves.includes(memberId),
        amened: post.amens.includes(memberId),
      },
    });
  } catch (err) {
    console.error('❌ React error:', err.message);
    res.status(500).json({ message: err.message });
  }
};

// DELETE /api/posts/:id
const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const resourceType = post.mediaType === 'video' ? 'video' : 'image';
    await cloudinary.uploader.destroy(post.publicId, { resource_type: resourceType });
    await Post.findByIdAndDelete(req.params.id);

    res.json({ message: 'Post deleted successfully' });
  } catch (err) {
    console.error('❌ Delete post error:', err.message);
    res.status(500).json({ message: err.message });
  }
};

module.exports = { createPost, getPosts, markViewed, reactToPost, deletePost };