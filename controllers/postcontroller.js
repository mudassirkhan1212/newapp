const cloudinary = require("cloudinary").v2;
const Post = require("../models/post");
const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

// Image Processing Helper 
async function processImage(filePath) {
  // 1. Validate MIME type by reading magic bytes (not trusting extension)
  const buffer = fs.readFileSync(filePath);
  const allowedSignatures = {
    jpeg: [0xff, 0xd8, 0xff],
    png:  [0x89, 0x50, 0x4e, 0x47],
    webp: [0x52, 0x49, 0x46, 0x46],
    gif:  [0x47, 0x49, 0x46],
  };

  const isValidImage = Object.values(allowedSignatures).some((sig) =>
    sig.every((byte, i) => buffer[i] === byte),
  );

  if (!isValidImage) {
    throw new Error(
      "Invalid image file. Only JPEG, PNG, WebP, and GIF are allowed.",
    );
  }

  // 2. Resize to square (1080x1080 max), no upscaling, strip EXIF, convert to WebP
  const outputPath = filePath + "_processed.webp";

  await sharp(filePath)
    .resize(1080, 1080, {
      fit: "inside", // Maintains aspect ratio, fits within 1080x1080
      withoutEnlargement: true, // No upscaling if image is smaller
    })
    .webp({ quality: 80 }) // Convert to WebP at 80% quality (~75-85% sweet spot)
    .withMetadata(false) // Strip ALL EXIF metadata (GPS, device info, timestamps)
    .toFile(outputPath);

  return outputPath;
}

// ─── Create Post ───────────────────────────────────────────────────────────────
exports.createPost = async (req, res) => {
  let processedImagePath = null;
  try {
    console.log("Received post request");
    console.log("File:", req.file);
    console.log("Body:", req.body);
    const caption = req.body.caption?.trim();
    // Reject if BOTH image and caption are missing
    if (!req.file && !caption) {
      return res
        .status(400)
        .json({ error: "Post must have an image or caption" });
    }
    let imageUrl = null;
    let publicId = null;
    if (req.file) {
      // Process image before uploading
      processedImagePath = await processImage(req.file.path);

      // Upload the processed WebP image to Cloudinary
      const result = await cloudinary.uploader.upload(processedImagePath, {
        folder: "posts",
        resource_type: "image",
        format: "webp", // Ensure Cloudinary stores it as WebP
        overwrite: true,
      });

      publicId = result.public_id;

      imageUrl = cloudinary.url(publicId, {
        transformation: [
          {
            overlay: "myapp_watermark",
            gravity: "south_east",
            width: "0.15",
            flags: "relative",
            opacity: 60,
          },
        ],
        secure: true,
      });
    }

    const newPost = new Post({
      caption: caption || null,
      imageUrl: imageUrl,
      publicId: publicId,
    });

    await newPost.save();

    res.status(201).json(newPost);
  } catch (err) {
    console.error("Error:", err);

    // Return a clean error for invalid file type
    if (err.message.includes("Invalid image file")) {
      return res.status(400).json({ error: err.message });
    }

    res.status(500).json({ error: err.message });
  } finally {
    // Always clean up temp files (original + processed)
    if (req.file?.path) {
      fs.unlink(req.file.path, () => {});
    }
    if (processedImagePath) {
      fs.unlink(processedImagePath, () => {});
    }
  }
};

// ─── Get Posts ─────────────────────────────────────────────────────────────────
exports.getPosts = async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    console.error("Error fetching posts:", err);
    res.status(500).json({ error: err.message });
  }
};
