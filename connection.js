const mongoose = require('mongoose')




const MongoDBconnection = async () => {
  try {
    if (!process.env.MONGO_URL) {
      throw new Error('MONGO_URL is not defined in environment variables');
    }

    const conn = await mongoose.connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    process.exit(1); // Exit process with failure
  }
};

module.exports = MongoDBconnection;