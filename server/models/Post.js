const mongoose = require('mongoose');

// A text post ("tweet") written by an admin.
// No images or videos, so no Cloudinary needed.
const postSchema = new mongoose.Schema({
  text:          { type: String, required: true, trim: true, maxlength: 1000 },
  authorId:      { type: String, default: '' },
  postedBy:      { type: String, required: true },
  postedByTitle: { type: String, default: '' },

  // Reactions — arrays of user ids (one reaction per user)
  likes:  [{ type: String }],
  loves:  [{ type: String }],
  amens:  [{ type: String }],

  views:  [{ type: String }], // user ids who have seen it
  shares: { type: Number, default: 0 },
}, { timestamps: true });

postSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Post', postSchema);
