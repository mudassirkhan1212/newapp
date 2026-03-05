const cloudinary = require('cloudinary').v2;
const Post = require('../models/post');

// Create Post
exports.createPost = async (req, res) => {
  try {
    console.log("Received post request");
    console.log("File:", req.file);
    console.log("Body:", req.body);

    const caption = req.body.caption?.trim();

    // ✅ Reject only if BOTH image and caption are missing
    if (!req.file && !caption) {
      return res.status(400).json({ error: "Post must have an image or caption" });
    }

    let imageUrl = null;
    let publicId = null;

    // ✅ Only upload to Cloudinary if image exists
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'posts',
        resource_type: 'image',
      });

      publicId = result.public_id;

      imageUrl = cloudinary.url(publicId, {
        transformation: [
          {
            overlay: 'myapp_watermark',
            gravity: 'south_east',
            width: '0.15',
            flags: 'relative',
            opacity: 60,
          },
        ],
        secure: true,
      });
    }

    // ✅ Save post — imageUrl will be null for text-only posts
    const newPost = new Post({
      caption: caption || null,
      imageUrl: imageUrl,   // null if no image
      publicId: publicId,   // null if no image
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