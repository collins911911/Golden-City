const express   = require('express');
const dotenv    = require('dotenv');
const cors      = require('cors');
const connectDB = require('./config/db');
const { startBirthdayCron } = require('./utils/birthdayCron');

dotenv.config();
connectDB();

const app = express();

app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());

// ── Routes ────────────────────────────────────────────────────
app.use('/api/auth',          require('./routes/authRoutes'));
app.use('/api/admin',         require('./routes/adminRoutes'));
app.use('/api/messages',      require('./routes/messageRoutes'));
app.use('/api/agenda',        require('./routes/agendaRoutes'));
app.use('/api/notices',       require('./routes/noticeRoutes'));
app.use('/api/activities',    require('./routes/activityRoutes'));
app.use('/api/posts',         require('./routes/postRoutes'));         // ← NEW
app.use('/api/notifications', require('./routes/notificationRoutes')); // ← push notifications

app.get('/', (req, res) => res.send('Golden City Church API running ✝️'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  startBirthdayCron();
});