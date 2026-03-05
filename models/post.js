const mongoose = require('mongoose');
const dotenv = require("dotenv");
dotenv.config();

const postSchema = new mongoose.Schema({
  user:      { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  caption:   { type: String, default: null },   // ✅ null instead of ''
  imageUrl:  { type: String, default: null },   // ✅ null instead of ''
  publicId:  { type: String, default: null },   // ✅ added for Cloudinary
  createdAt: { type: Date, default: Date.now },
});

const Post = mongoose.model("Post", postSchema);

module.exports = Post;