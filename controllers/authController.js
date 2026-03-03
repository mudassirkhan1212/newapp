const jwt = require("jsonwebtoken");
const User = require("../models/users");
const { OAuth2Client } = require("google-auth-library");

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);


// ── Helper: Sign JWT ──
const signToken = (user) =>
  jwt.sign(
    { id: user._id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

// ── Sign Up ──
exports.signup = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ error: "Email and password are required." });

  if (password.length < 6)
    return res.status(400).json({ error: "Password must be at least 6 characters." });

  try {
    if (await User.findOne({ email }))
      return res.status(409).json({ error: "Email is already registered." });

    const user = await User.create({ email, password });

    const token = signToken(user);

    res.status(201).json({
      token,
      user: { id: user._id, email: user.email }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error." });
  }
};

// ── Sign In ──
exports.signin = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ error: "Email and password are required." });

  try {
    const user = await User.findOne({ email });

    if (!user || !user.password)
      return res.status(401).json({ error: "Invalid credentials." });

    const match = await user.comparePassword(password);

    if (!match)
      return res.status(401).json({ error: "Invalid credentials." });

    const token = signToken(user);

    res.json({
      token,
      user: { id: user._id, email: user.email }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error." });
  }
};

// ── Google Auth ──
exports.googleAuth = async (req, res) => {
  const { idToken } = req.body;

  if (!idToken)
    return res.status(400).json({ error: "Google ID token is required." });

  try {
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const { sub: googleId, email, picture } = ticket.getPayload();

    let user = await User.findOne({
      $or: [{ googleId }, { email }]
    });

    if (!user) {
      user = await User.create({
        email,
        googleId,
        avatar: picture
      });
    } else if (!user.googleId) {
      user.googleId = googleId;
      await user.save();
    }

    const token = signToken(user);

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        avatar: user.avatar
      }
    });

  } catch (err) {
    console.error(err);
    res.status(401).json({ error: "Google authentication failed." });
  }
};