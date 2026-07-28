// =============================================================
// GOLDEN CITY CHURCH — PROJECT FILE CHECKER
// =============================================================
// HOW TO RUN:
//   1. Copy this file into your SERVER folder
//      e.g. C:\Users\HomePC\Desktop\GOLDERN CITY\server\
//   2. Open terminal in that folder
//   3. Run:  node checkFiles.js
// =============================================================

const fs   = require('fs');
const path = require('path');

const GREEN  = '\x1b[32m';
const RED    = '\x1b[31m';
const YELLOW = '\x1b[33m';
const BOLD   = '\x1b[1m';
const RESET  = '\x1b[0m';

const REQUIRED_FILES = [
  // ── Config ──────────────────────────────────────────
  { path: 'config/db.js',                       phase: 1 },

  // ── Models ──────────────────────────────────────────
  { path: 'models/Member.js',                   phase: 1 },
  { path: 'models/Admin.js',                    phase: 1 },
  { path: 'models/Message.js',                  phase: 1 },
  { path: 'models/Agenda.js',                   phase: 1 },
  { path: 'models/Notice.js',                   phase: 1 },
  { path: 'models/WeeklyActivity.js',           phase: 1 },
  { path: 'models/BirthdaySetting.js',          phase: 3 },

  // ── Middleware ───────────────────────────────────────
  { path: 'middleware/authMiddleware.js',        phase: 1 },

  // ── Controllers ─────────────────────────────────────
  { path: 'controllers/authController.js',      phase: 1 },
  { path: 'controllers/adminController.js',     phase: 3 },
  { path: 'controllers/messageController.js',   phase: 3 },

  // ── Routes ──────────────────────────────────────────
  { path: 'routes/authRoutes.js',               phase: 1 },
  { path: 'routes/adminRoutes.js',              phase: 3 },
  { path: 'routes/messageRoutes.js',            phase: 3 },
  { path: 'routes/agendaRoutes.js',             phase: 3 },
  { path: 'routes/noticeRoutes.js',             phase: 3 },
  { path: 'routes/activityRoutes.js',           phase: 3 },

  // ── Utils ────────────────────────────────────────────
  { path: 'utils/termii.js',                    phase: 3 },
  { path: 'utils/birthdayCron.js',              phase: 3 },

  // ── Root ─────────────────────────────────────────────
  { path: 'server.js',                          phase: 1 },
  { path: 'seedAdmins.js',                      phase: 1 },
  { path: '.env',                               phase: 1 },
  { path: 'nodemon.json',                       phase: 1 },
  { path: 'package.json',                       phase: 1 },
];

const CLIENT_FILES = [
  // ── Context ──────────────────────────────────────────
  { path: '../client/src/context/AuthContext.jsx',              phase: 1 },

  // ── Utils ────────────────────────────────────────────
  { path: '../client/src/utils/axios.js',                       phase: 1 },

  // ── Components ──────────────────────────────────────
  { path: '../client/src/components/Preloader.jsx',             phase: 2 },
  { path: '../client/src/components/PageLoader.jsx',            phase: 2 },
  { path: '../client/src/components/Navbar.jsx',                phase: 2 },

  // ── Auth Pages ──────────────────────────────────────
  { path: '../client/src/pages/auth/Landing.jsx',               phase: 2 },
  { path: '../client/src/pages/auth/MemberRegister.jsx',        phase: 2 },
  { path: '../client/src/pages/auth/AdminLogin.jsx',            phase: 2 },

  // ── Admin Pages ─────────────────────────────────────
  { path: '../client/src/pages/admin/AdminDashboard.jsx',       phase: 3 },
  { path: '../client/src/pages/admin/GroupMessage.jsx',         phase: 3 },
  { path: '../client/src/pages/admin/SelectiveMessage.jsx',     phase: 3 },
  { path: '../client/src/pages/admin/MemberManagement.jsx',     phase: 3 },
  { path: '../client/src/pages/admin/MessageHistory.jsx',       phase: 3 },
  { path: '../client/src/pages/admin/BirthdaySettings.jsx',     phase: 3 },
  { path: '../client/src/pages/admin/AgendaManager.jsx',        phase: 3 },
  { path: '../client/src/pages/admin/NoticeBoard.jsx',          phase: 3 },
  { path: '../client/src/pages/admin/WeeklyActivities.jsx',     phase: 3 },

  // ── App Root ────────────────────────────────────────
  { path: '../client/src/App.jsx',                              phase: 3 },
  { path: '../client/src/main.jsx',                             phase: 1 },
  { path: '../client/src/index.css',                            phase: 1 },
  { path: '../client/tailwind.config.js',                       phase: 2 },
];

const ALL_FILES = [
  ...REQUIRED_FILES.map(f => ({ ...f, side: 'SERVER' })),
  ...CLIENT_FILES.map(f  => ({ ...f, side: 'CLIENT' })),
];

console.log(`\n${BOLD}╔═══════════════════════════════════════════╗${RESET}`);
console.log(`${BOLD}║   GOLDEN CITY CHURCH — FILE CHECKER       ║${RESET}`);
console.log(`${BOLD}╚═══════════════════════════════════════════╝${RESET}\n`);

let missingCount  = 0;
let presentCount  = 0;
let currentSide   = '';

for (const file of ALL_FILES) {
  if (file.side !== currentSide) {
    currentSide = file.side;
    console.log(`\n${BOLD}${YELLOW}── ${file.side} FILES ──────────────────────────────${RESET}`);
  }

  const fullPath = path.join(__dirname, file.path);
  const exists   = fs.existsSync(fullPath);

  if (exists) {
    presentCount++;
    console.log(`  ${GREEN}✅  ${file.path.padEnd(52)}${RESET} Phase ${file.phase}`);
  } else {
    missingCount++;
    console.log(`  ${RED}❌  ${file.path.padEnd(52)}${RESET} Phase ${file.phase}  ${YELLOW}← MISSING${RESET}`);
  }
}

console.log(`\n${BOLD}╔═══════════════════════════════════════════╗${RESET}`);
console.log(`${BOLD}║   SUMMARY                                 ║${RESET}`);
console.log(`${BOLD}╠═══════════════════════════════════════════╣${RESET}`);
console.log(`${BOLD}║  ${GREEN}✅  Present : ${String(presentCount).padEnd(28)}${RESET}${BOLD}║${RESET}`);
console.log(`${BOLD}║  ${RED}❌  Missing : ${String(missingCount).padEnd(28)}${RESET}${BOLD}║${RESET}`);

if (missingCount === 0) {
  console.log(`${BOLD}║                                           ║${RESET}`);
  console.log(`${BOLD}║  ${GREEN}🎉  All files present! Ready to build.    ${RESET}${BOLD}║${RESET}`);
} else {
  console.log(`${BOLD}║                                           ║${RESET}`);
  console.log(`${BOLD}║  ${RED}⚠️   Create the missing files above.      ${RESET}${BOLD}║${RESET}`);
}

console.log(`${BOLD}╚═══════════════════════════════════════════╝${RESET}\n`);