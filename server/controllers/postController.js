const Post = require('../models/Post');
const { sendPushToMembers } = require('../utils/push');
const { httpError } = require('../utils/validate');

const REACTIONS = ['likes', 'loves', 'amens'];

// Turn a raw post into a small object for the browser:
// counts instead of full id lists + "what did I react with".
const shape = (p, uid) => {
  const myReaction = REACTIONS.find((t) => (p[t] || []).includes(uid)) || null;
  return {
    _id:           p._id,
    text:          p.text || p.caption || '', // old media posts had "caption"
    postedBy:      p.postedBy,
    postedByTitle: p.postedByTitle,
    createdAt:     p.createdAt,
    likes:         (p.likes || []).length,
    loves:         (p.loves || []).length,
    amens:         (p.amens || []).length,
    views:         (p.views || []).length,
    shares:        p.shares || 0,
    myReaction,
    viewed:        (p.views || []).includes(uid),
  };
};

// GET /api/posts?page=1&limit=20
const getPosts = async (req, res) => {
  const uid   = String(req.user.id);
  const page  = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 20));

  const [posts, total] = await Promise.all([
    Post.find({ text: { $exists: true, $ne: '' } })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Post.countDocuments({ text: { $exists: true, $ne: '' } }),
  ]);

  res.json({
    posts:   posts.map((p) => shape(p, uid)),
    page,
    total,
    hasMore: page * limit < total,
  });
};

// GET /api/posts/unviewed-count → { count }
const unviewedCount = async (req, res) => {
  const uid   = String(req.user.id);
  const count = await Post.countDocuments({ text: { $exists: true, $ne: '' }, views: { $ne: uid } });
  res.json({ count });
};

// POST /api/posts  (admin)  body: { text }
const createPost = async (req, res) => {
  const text = String(req.body.text || '').trim();
  if (!text) throw httpError(400, 'Write something before posting.');
  if (text.length > 1000) throw httpError(400, 'Posts can be at most 1000 characters.');

  const post = await Post.create({
    text,
    authorId:      String(req.user.id),
    postedBy:      req.user.name,
    postedByTitle: req.user.title || '',
  });

  // Notify members in the background
  sendPushToMembers(
    `New post from ${post.postedBy}`,
    text.length > 120 ? text.slice(0, 120) + '…' : text,
    '/member-posts'
  );

  res.status(201).json(shape(post.toObject(), String(req.user.id)));
};

// POST /api/posts/:id/view
const markViewed = async (req, res) => {
  const uid  = String(req.user.id);
  const post = await Post.findByIdAndUpdate(
    req.params.id,
    { $addToSet: { views: uid } },
    { returnDocument: 'after' }
  ).lean();
  if (!post) throw httpError(404, 'Post not found');
  res.json({ views: post.views.length });
};

// POST /api/posts/:id/react   body: { type: 'likes' | 'loves' | 'amens' }
// One reaction per user. Same reaction again removes it.
const reactToPost = async (req, res) => {
  const uid  = String(req.user.id);
  const type = req.body.type;
  if (!REACTIONS.includes(type)) throw httpError(400, 'Invalid reaction type');

  const current = await Post.findById(req.params.id, { likes: 1, loves: 1, amens: 1 }).lean();
  if (!current) throw httpError(404, 'Post not found');

  const already = (current[type] || []).includes(uid);

  // Remove the user from every reaction list, then add the new one (if not toggling off)
  await Post.updateOne({ _id: req.params.id }, { $pull: { likes: uid, loves: uid, amens: uid } });
  if (!already) {
    await Post.updateOne({ _id: req.params.id }, { $addToSet: { [type]: uid } });
  }

  const updated = await Post.findById(req.params.id, { likes: 1, loves: 1, amens: 1 }).lean();
  res.json({
    likes: updated.likes.length,
    loves: updated.loves.length,
    amens: updated.amens.length,
    myReaction: already ? null : type,
  });
};

// POST /api/posts/:id/share → counts shares
const sharePost = async (req, res) => {
  const post = await Post.findByIdAndUpdate(
    req.params.id,
    { $inc: { shares: 1 } },
    { returnDocument: 'after' }
  ).lean();
  if (!post) throw httpError(404, 'Post not found');
  res.json({ shares: post.shares });
};

// DELETE /api/posts/:id  (admin)
const deletePost = async (req, res) => {
  const post = await Post.findByIdAndDelete(req.params.id);
  if (!post) throw httpError(404, 'Post not found');
  res.json({ message: 'Post deleted' });
};

module.exports = {
  getPosts, unviewedCount, createPost, markViewed, reactToPost, sharePost, deletePost,
};
