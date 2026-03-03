const cloudinary = require('cloudinary').v2;
const Post = require('../models/post'); // your collection model
const imagestorage = require('../models/imagestorage'); // your collection model


// Create Post
exports.createPost = async (req, res) => {
  try {
    console.log("Received post request");
    console.log("File:", req.file);
    console.log("Body:", req.body);

    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const result = await cloudinary.uploader.upload(req.file.path);

    const newPost = new Post({
      caption: req.body.caption,
      imageUrl: result.secure_url
    });

    await newPost.save();

    res.status(201).json(newPost);
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ error: err.message });
  }
};

// Get Posts
exports.getPosts = async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    console.error("Error fetching posts:", err);
    res.status(500).json({ error: err.message });
  }
};