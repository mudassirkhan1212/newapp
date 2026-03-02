const mongoose = require('mongoose')
const multer = require("multer");
const dotenv = require("dotenv");
dotenv.config();



// Post Schema
const postSchema = new mongoose.Schema({
  caption: String,
  imageUrl: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Post = new mongoose.model("Post", postSchema);

module.exports = Post;


