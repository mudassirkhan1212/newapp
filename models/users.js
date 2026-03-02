



const userSchema = new mongoose.Schema({
  email: { type: String, unique: true },
  password: String,
  googleId: String
});