const express = require("express");
const multer = require("multer");
const { createPost, getPosts, deletePost } = require("../controllers/postcontroller");
const authMiddleware = require("../middleware/auth"); // ✅ import it

const router = express.Router();

// Multer setup
const upload = multer({ dest: "uploads/" });

// Routes
router.get("/", (req, res) => {
  res.render("home");
});



router.post("/create-post", authMiddleware, upload.single("image"), createPost);
router.get("/posts", getPosts);
router.delete("/posts/:id", authMiddleware, deletePost);


module.exports = router;

