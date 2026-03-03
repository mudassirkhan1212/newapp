const cloudinary = require('cloudinary').v2;
const Post = require('../models/post'); // your post model

// Create Post with Watermark
exports.createPost = async (req, res) => {
  try {
    console.log("Received post request");
    console.log("File:", req.file);
    console.log("Body:", req.body);

    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // 1️⃣ Upload ORIGINAL image to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'posts',         // optional folder
      resource_type: 'image',
    });

    const publicId = result.public_id; // save this for DB

    // 2️⃣ Generate WATERMARKED URL dynamically
    const watermarkedUrl = cloudinary.url(publicId, {
      transformation: [
        {
          overlay: 'myapp_watermark', // must exist in Cloudinary
          gravity: 'south_east',      // bottom-right
          width: '0.15',              // 15% of image width
          flags: 'relative',
          opacity: 60,
        },
      ],
      secure: true,
    });

    // 3️⃣ Save the watermarked URL in MongoDB
    const newPost = new Post({
      caption: req.body.caption,
      imageUrl: watermarkedUrl,
      publicId: publicId, // optional: store original public_id
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