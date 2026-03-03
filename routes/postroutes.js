const express = require("express");
const multer = require("multer");
const { createPost, getPosts } = require("../controllers/postcontroller");

const router = express.Router();

// Multer setup
const upload = multer({ dest: "uploads/" });

// Routes
router.get("/", (req, res) => {
  res.render("home");
});



router.post("/create-post", upload.single("image"), createPost);
router.get("/posts", getPosts);

module.exports = router;

