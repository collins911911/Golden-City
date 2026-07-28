const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  // Who posted it
  postedBy:     { type: String, required: true },
  postedByTitle: { type: String, default: '' },

  // Media
  mediaUrl:     { type: String, required: true }, // Cloudinary URL
  mediaType:    { type: String, enum: ['image', 'video'], required: true },
  publicId:     { type: String, required: true }, // Cloudinary public_id for deletion
  caption:      { type: String, default: '' },

  // Reactions — store array of member IDs per reaction type
  likes:  [{ type: String }], // array of member IDs
  loves:  [{ type: String }],
  amens:  [{ type: String }],

  // Views — array of member IDs who have viewed
  views: [{ type: String }],

}, { timestamps: true });

module.exports = mongoose.model('Post', postSchema);