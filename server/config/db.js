const mongoose = require('mongoose');
const dns      = require('dns');

// Some internet providers' DNS can't answer the SRV lookup that
// "mongodb+srv://" connection strings need (error: querySrv ENOTFOUND).
// Using Google + Cloudflare DNS for Node's lookups fixes it.
dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);

const MAX_RETRIES = 5;

const connectDB = async (attempt = 1) => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB connection failed (attempt ${attempt}/${MAX_RETRIES}): ${error.message}`);
    if (attempt < MAX_RETRIES) {
      console.log('⏳ Retrying in 5 seconds...');
      setTimeout(() => connectDB(attempt + 1), 5000);
    } else {
      console.error('🛑 Could not connect to MongoDB. Check your internet, MONGO_URI, and Atlas Network Access.');
      process.exit(1);
    }
  }
};

module.exports = connectDB;
