const express     = require('express');
const cors        = require('cors');
const helmet      = require('helmet');
const compression = require('compression');
const rateLimit   = require('express-rate-limit');
const sanitize    = require('./middleware/sanitize');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();

// Render/Railway sit behind a proxy — needed so rate limits see real IPs
app.set('trust proxy', 1);
app.disable('x-powered-by');

// ── SECURITY ─────────────────────────────────────────────────
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

// Allowed frontends: localhost + CLIENT_URL (comma-separated for several)
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:4173',
  ...(process.env.CLIENT_URL || '').split(',').map((s) => s.trim()).filter(Boolean),
];
app.use(cors({
  origin: (origin, cb) => {
    // allow server-to-server / curl (no origin) and listed sites
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    const err = new Error(`CORS: ${origin} is not allowed`);
    err.status = 403;
    cb(err);
  },
  credentials: true,
}));

// Rate limits — generous overall (church Wi-Fi = many people, one IP),
// strict on login/register to stop password guessing.
const skipInTests = () => process.env.NODE_ENV === 'test';
app.use('/api', rateLimit({
  windowMs: 15 * 60 * 1000, limit: 1000, standardHeaders: true, legacyHeaders: false,
  message: { message: 'Too many requests. Please wait a few minutes and try again.' },
  skip: skipInTests,
}));
// Only FAILED attempts count, so a whole church on one Wi-Fi can still log in.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, limit: 15, standardHeaders: true, legacyHeaders: false,
  skipSuccessfulRequests: true,
  message: { message: 'Too many failed attempts. Please wait 15 minutes and try again.' },
  skip: skipInTests,
});
app.use(['/api/auth/admin/login', '/api/auth/member/login', '/api/auth/member/register'], authLimiter);

// ── SPEED + PARSING ──────────────────────────────────────────
app.use(compression());                    // gzip responses → faster on mobile data
app.use(express.json({ limit: '100kb' })); // no file uploads any more → small bodies
app.use(sanitize);                         // NoSQL injection + XSS + param pollution

// ── ROUTES ───────────────────────────────────────────────────
app.get('/', (req, res) => res.send('Golden City Church API running ✝️'));
app.get('/api/health', (req, res) => res.json({ ok: true, time: new Date().toISOString() }));

app.use('/api/auth',          require('./routes/authRoutes'));
app.use('/api/registrations', require('./routes/registrationRoutes'));
app.use('/api/admin',         require('./routes/adminRoutes'));
app.use('/api/messages',      require('./routes/messageRoutes'));
app.use('/api/agenda',        require('./routes/agendaRoutes'));
app.use('/api/notices',       require('./routes/noticeRoutes'));
app.use('/api/activities',    require('./routes/activityRoutes'));
app.use('/api/posts',         require('./routes/postRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));

app.use('/api', notFound);
app.use(errorHandler);

module.exports = app;
