// db/db.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config(); // загружаем .env

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.mongoURI);
    console.log('✅ MongoDB connected');
  } catch (error) {
    console.error('❌ DB error:', error);
    process.exit(1);
  }
};

module.exports = connectDB;

