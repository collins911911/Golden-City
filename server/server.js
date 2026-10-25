const dotenv = require('dotenv');
dotenv.config({ quiet: true });

// Stop early with a clear message if important settings are missing
const REQUIRED = ['MONGO_URI', 'JWT_SECRET', 'ADMIN_PASSCODE'];
const missing  = REQUIRED.filter((k) => !process.env[k]);
if (missing.length) {
  console.error(`🛑 Missing in .env: ${missing.join(', ')}`);
  process.exit(1);
}

const app       = require('./app');
const connectDB = require('./config/db');
const { startBirthdayCron } = require('./utils/birthdayCron');

connectDB();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  startBirthdayCron();
});
