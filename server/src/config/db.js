const mongoose = require('mongoose');

let mongoMemoryServer = null;

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/dayflow_hrms';
    
    // Set connection options
    const options = {
      serverSelectionTimeoutMS: 3000, // Fast timeout for fallback
    };

    try {
      console.log(`📡 Attempting MongoDB connection to ${mongoUri}...`);
      await mongoose.connect(mongoUri, options);
      console.log(`✅ MongoDB Connected successfully: ${mongoose.connection.host}`);
    } catch (primaryErr) {
      console.warn(`⚠️ Could not connect to primary MongoDB (${primaryErr.message}).`);
      console.log(`🚀 Starting in-memory embedded MongoDB for reliable zero-config hackathon demo...`);
      
      const { MongoMemoryServer } = require('mongodb-memory-server');
      mongoMemoryServer = await MongoMemoryServer.create();
      const memUri = mongoMemoryServer.getUri();
      
      await mongoose.connect(memUri);
      console.log(`✅ Embedded MongoDB Memory Server Connected: ${memUri}`);
    }

    // Auto-seed if database is empty
    const User = require('../models/User');
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('🌱 Database is empty. Seeding initial demo HR and employee accounts...');
      const { seedDatabase } = require('../utils/seedData');
      await seedDatabase(false);
    }
  } catch (error) {
    console.error(`❌ MongoDB Connection Fatal Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
