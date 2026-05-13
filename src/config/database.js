'use strict';

const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGO_URI || process.env.MONGO_URI_LOCAL;

  if (!uri) {
    console.error('No MongoDB URI defined. Set MONGO_URI or MONGO_URI_LOCAL in .env');
    process.exit(1);
  }

  try {
    await mongoose.connect(uri);
    console.log(`MongoDB connected: ${mongoose.connection.host}`);
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  }
};

module.exports = { connectDB };
