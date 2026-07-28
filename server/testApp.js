// ============================================================
// GOLDEN CITY CHURCH — FULL APP TEST SUITE
// ============================================================
// HOW TO RUN:
//   1. Make sure your server is running (npm run dev)
//   2. Copy this file into your server/ folder
//   3. Run: node testApp.js
// ============================================================

const axios  = require('axios');
const BASE   = 'http://localhost:5000/api';

// ── Colors for terminal output ───────────────────────────────
const G = '\x1b[32m'; // green
const R = '\x1b[31m'; // red
const Y = '\x1b[33m'; // yellow
const B = '\x1b[34m'; // blue
const W = '\x1b[37m'; // white
const X = '\x1b[0m';  // reset
const BOLD = '\x1b[1m';

let passed = 0;
let failed = 0;
let warned = 0;

const pass  = (msg) => { passed++; console.log(`  ${G}✅ PASS${X}  ${msg}`); };
const fail  = (msg) => { failed++; console.log(`  ${R}❌ FAIL${X}  ${msg}`); };
const warn  = (msg) => { warned++; console.log(`  ${Y}⚠️  WARN${X}  ${msg}`); };
const info  = (msg) => console.log(`  ${B}ℹ️  INFO${X}  ${msg}`);
const title = (msg) => console.log(`\n${BOLD}${W}── ${msg} ${'─'.repeat(Math.max(0, 45 - msg.length))}${X}`);

// ── Test helper ──────────────────────────────────────────────
const test = async (label, fn) => {
  try {
    await fn();
  } catch (err) {
    fail(`${label} — ${err.message}`);
  }
};

// ── Stored tokens for authenticated tests ───────────────────
let adminToken  = '';
let memberToken = '';
let testMemberId = '';
let testNoticeId = '';
let testAgendaId = '';
let testActivityId = '';

// ════════════════════════════════════════════════════════════
const runTests = async () => {

  console.log(`\n${BOLD}╔══════════════════════════════════════════════════╗`);
  console.log(`║   GOLDEN CITY CHURCH — APP TEST SUITE            ║`);
  console.log(`╚══════════════════════════════════════════════════╝${X}`);
  console.log(`  Testing against: ${Y}${BASE}${X}\n`);

  // ──────────────────────────────────────────────────────────
  title('1. SERVER HEALTH');
  // ──────────────────────────────────────────────────────────

  await test('Server is reachable', async () => {
    const res = await axios.get('http://localhost:5000/');
    if (res.status === 200) pass('Server is running on port 5000');
    else fail('Server returned unexpected status');
  });

  await test('Environment variables loaded', async () => {
    // We test this indirectly — if admin login works, JWT_SECRET and ADMIN_PASSCODE are set
    info('Will verify via admin login test below');
  });

  // ──────────────────────────────────────────────────────────
  title('2. ADMIN AUTHENTICATION');
  // ──────────────────────────────────────────────────────────

  await test('Admin login — wrong passcode rejected', async () => {
    try {
      await axios.post(`${BASE}/auth/admin/login`, {
        username: 'headpastor', password: 'wrong', passcode: 'WRONGCODE',
      });
      fail('Should have rejected wrong passcode');
    } catch (err) {
      if (err.response?.status === 403) pass('Wrong passcode correctly rejected (403)');
      else fail(`Unexpected status: ${err.response?.status}`);
    }
  });

  await test('Admin login — valid credentials', async () => {
    try {
      const res = await axios.post(`${BASE}/auth/admin/login`, {
        username: 'collinsxc',          // ← change to your actual admin username
        password: 'collinsxc@1',        // ← change to your actual admin password
        passcode: process.env.ADMIN_PASSCODE || 'GC2024ADMIN',
      });
      if (res.data.token && res.data.role === 'admin') {
        adminToken = res.data.token;
        pass(`Admin login successful — welcome ${res.data.name}`);
      } else {
        fail('Token or role missing in response');
      }
    } catch (err) {
      fail(`Admin login failed — check username/password in testApp.js: ${err.response?.data?.message || err.message}`);
    }
  });

  // ──────────────────────────────────────────────────────────
  title('3. MEMBER AUTHENTICATION');
  // ──────────────────────────────────────────────────────────

  const testPhone = '08099999999'; // test number — will be cleaned up

  await test('Member register — duplicate phone rejected', async () => {
    // First register
    try {
      await axios.post(`${BASE}/auth/member/register`, {
        name: 'Test Member GC', phone: testPhone,
        dateOfBirth: '1995-06-15', password: 'test123',
        categories: ['youths'],
      });
    } catch { /* may already exist */ }

    // Try to register same number again
    try {
      await axios.post(`${BASE}/auth/member/register`, {
        name: 'Duplicate Test', phone: testPhone,
        dateOfBirth: '1995-06-15', password: 'test123',
        categories: ['youths'],
      });
      warn('Duplicate phone was not rejected — check authController.js');
    } catch (err) {
      if (err.response?.status === 400) pass('Duplicate phone correctly rejected (400)');
      else fail(`Unexpected response: ${err.response?.status}`);
    }
  });

  await test('Member login — wrong password rejected', async () => {
    try {
      await axios.post(`${BASE}/auth/member/login`, {
        phone: testPhone, password: 'wrongpassword',
      });
      fail('Should have rejected wrong password');
    } catch (err) {
      if (err.response?.status === 401) pass('Wrong password correctly rejected (401)');
      else fail(`Unexpected status: ${err.response?.status}`);
    }
  });

  await test('Member login — valid credentials', async () => {
    try {
      const res = await axios.post(`${BASE}/auth/member/login`, {
        phone: testPhone, password: 'test123',
      });
      if (res.data.token && res.data.role === 'member') {
        memberToken = res.data.token;
        pass(`Member login successful — welcome ${res.data.name}`);
      } else {
        fail('Token or role missing');
      }
    } catch (err) {
      fail(`Member login failed: ${err.response?.data?.message || err.message}`);
    }
  });

  // ──────────────────────────────────────────────────────────
  title('4. ADMIN ROUTES (Protected)');
  // ──────────────────────────────────────────────────────────

  const adminHeader = { headers: { Authorization: `Bearer ${adminToken}` } };
  const memberHeader = { headers: { Authorization: `Bearer ${memberToken}` } };

  await test('Get stats — admin can access', async () => {
    if (!adminToken) { warn('Skipped — no admin token'); return; }
    const res = await axios.get(`${BASE}/admin/stats`, adminHeader);
    if (res.data.totalMembers !== undefined) pass(`Stats fetched — ${res.data.totalMembers} total members`);
    else fail('totalMembers missing from stats response');
  });

  await test('Get stats — member can access (public stats)', async () => {
    if (!memberToken) { warn('Skipped — no member token'); return; }
    const res = await axios.get(`${BASE}/admin/stats`, memberHeader);
    if (res.data.totalMembers !== undefined) pass('Member can read stats correctly');
    else fail('Stats not accessible to members');
  });

  await test('Get all members — admin only', async () => {
    if (!adminToken) { warn('Skipped — no admin token'); return; }
    const res = await axios.get(`${BASE}/admin/members`, adminHeader);
    if (Array.isArray(res.data)) {
      pass(`Member list fetched — ${res.data.length} members in database`);
      // Save test member id for cleanup
      const testMember = res.data.find((m) => m.phone === testPhone);
      if (testMember) testMemberId = testMember._id;
    } else fail('Expected array of members');
  });

  await test('Get members — blocked for regular member (403)', async () => {
    if (!memberToken) { warn('Skipped — no member token'); return; }
    try {
      await axios.get(`${BASE}/admin/members`, memberHeader);
      fail('Member should NOT access admin members list');
    } catch (err) {
      if (err.response?.status === 403) pass('Members list correctly blocked for members (403)');
      else fail(`Unexpected status: ${err.response?.status}`);
    }
  });

  await test('Search members', async () => {
    if (!adminToken) { warn('Skipped — no admin token'); return; }
    const res = await axios.get(`${BASE}/admin/members/search?q=Test`, adminHeader);
    if (Array.isArray(res.data)) pass(`Search working — found ${res.data.length} result(s)`);
    else fail('Search returned unexpected format');
  });

  await test('Birthday settings — get', async () => {
    if (!adminToken) { warn('Skipped — no admin token'); return; }
    const res = await axios.get(`${BASE}/admin/birthday-settings`, adminHeader);
    if (res.data.template && res.data.sendTime) pass('Birthday settings loaded correctly');
    else fail('Birthday settings missing fields');
  });

  await test('Birthday today — endpoint works', async () => {
    if (!adminToken) { warn('Skipped — no admin token'); return; }
    const res = await axios.get(`${BASE}/admin/birthday-today`, adminHeader);
    if (Array.isArray(res.data)) pass(`Birthday check working — ${res.data.length} birthday(s) today`);
    else fail('Birthday today returned unexpected format');
  });

  // ──────────────────────────────────────────────────────────
  title('5. NOTICES');
  // ──────────────────────────────────────────────────────────

  await test('Post notice — admin can post', async () => {
    if (!adminToken) { warn('Skipped — no admin token'); return; }
    const res = await axios.post(`${BASE}/notices`, {
      title: 'TEST NOTICE — DELETE ME',
      body:  'This is an automated test notice. Safe to delete.',
      important: false,
      postedBy: 'Test Suite',
    }, adminHeader);
    if (res.data._id) {
      testNoticeId = res.data._id;
      pass('Notice created successfully');
    } else fail('Notice creation failed');
  });

  await test('Get notices — member can read', async () => {
    if (!memberToken) { warn('Skipped — no member token'); return; }
    const res = await axios.get(`${BASE}/notices`, memberHeader);
    if (Array.isArray(res.data)) pass(`Notices readable by members — ${res.data.length} notice(s)`);
    else fail('Notices not accessible to members');
  });

  await test('Delete test notice', async () => {
    if (!adminToken || !testNoticeId) { warn('Skipped — no notice to delete'); return; }
    await axios.delete(`${BASE}/notices/${testNoticeId}`, adminHeader);
    pass('Test notice cleaned up');
  });

  // ──────────────────────────────────────────────────────────
  title('6. AGENDA');
  // ──────────────────────────────────────────────────────────

  await test('Post agenda item', async () => {
    if (!adminToken) { warn('Skipped — no admin token'); return; }
    const res = await axios.post(`${BASE}/agenda`, {
      title: 'TEST EVENT — DELETE ME',
      date:  '2099-12-31',
      time:  '10:00',
      year:  2099,
      description: 'Automated test event',
    }, adminHeader);
    if (res.data._id) { testAgendaId = res.data._id; pass('Agenda item created'); }
    else fail('Agenda creation failed');
  });

  await test('Get agenda — accessible', async () => {
    if (!memberToken) { warn('Skipped — no member token'); return; }
    const res = await axios.get(`${BASE}/agenda`, memberHeader);
    if (Array.isArray(res.data)) pass(`Agenda readable — ${res.data.length} event(s)`);
    else fail('Agenda not accessible');
  });

  await test('Delete test agenda item', async () => {
    if (!adminToken || !testAgendaId) { warn('Skipped'); return; }
    await axios.delete(`${BASE}/agenda/${testAgendaId}`, adminHeader);
    pass('Test agenda item cleaned up');
  });

  // ──────────────────────────────────────────────────────────
  title('7. WEEKLY ACTIVITIES');
  // ──────────────────────────────────────────────────────────

  await test('Post activity', async () => {
    if (!adminToken) { warn('Skipped — no admin token'); return; }
    const res = await axios.post(`${BASE}/activities`, {
      title: 'TEST ACTIVITY — DELETE ME',
      day:   'Sunday',
      time:  '09:00',
    }, adminHeader);
    if (res.data._id) { testActivityId = res.data._id; pass('Activity created'); }
    else fail('Activity creation failed');
  });

  await test('Get activities — accessible', async () => {
    if (!memberToken) { warn('Skipped — no member token'); return; }
    const res = await axios.get(`${BASE}/activities`, memberHeader);
    if (Array.isArray(res.data)) pass(`Activities readable — ${res.data.length} activity/activities`);
    else fail('Activities not accessible');
  });

  await test('Delete test activity', async () => {
    if (!adminToken || !testActivityId) { warn('Skipped'); return; }
    await axios.delete(`${BASE}/activities/${testActivityId}`, adminHeader);
    pass('Test activity cleaned up');
  });

  // ──────────────────────────────────────────────────────────
  title('8. MESSAGE HISTORY');
  // ──────────────────────────────────────────────────────────

  await test('Message history — admin can access', async () => {
    if (!adminToken) { warn('Skipped — no admin token'); return; }
    const res = await axios.get(`${BASE}/messages/history`, adminHeader);
    if (Array.isArray(res.data)) pass(`Message history accessible — ${res.data.length} message(s) logged`);
    else fail('Message history returned unexpected format');
  });

  await test('Message history — blocked for members', async () => {
    if (!memberToken) { warn('Skipped — no member token'); return; }
    try {
      await axios.get(`${BASE}/messages/history`, memberHeader);
      fail('Member should NOT access message history');
    } catch (err) {
      if (err.response?.status === 403) pass('Message history correctly blocked for members (403)');
      else fail(`Unexpected status: ${err.response?.status}`);
    }
  });

  // ──────────────────────────────────────────────────────────
  title('9. CLEANUP — Remove Test Member');
  // ──────────────────────────────────────────────────────────

  await test('Delete test member from database', async () => {
    if (!adminToken || !testMemberId) { warn('Skipped — test member ID not found'); return; }
    await axios.delete(`${BASE}/admin/members/${testMemberId}`, adminHeader);
    pass('Test member removed from database');
  });

  // ──────────────────────────────────────────────────────────
  title('10. ENVIRONMENT CHECKS');
  // ──────────────────────────────────────────────────────────

  const dotenv = require('dotenv');
  dotenv.config();

  const checkEnv = (key, label) => {
    const val = process.env[key];
    if (!val || val.includes('your_') || val.includes('paste_')) {
      warn(`${label} (${key}) — not set or still placeholder`);
    } else {
      pass(`${label} is configured`);
    }
  };

  checkEnv('MONGO_URI',         'MongoDB URI');
  checkEnv('JWT_SECRET',        'JWT Secret');
  checkEnv('ADMIN_PASSCODE',    'Admin Passcode');
  checkEnv('TERMII_API_KEY',    'Termii API Key');
  checkEnv('TERMII_SENDER_ID',  'Termii Sender ID');
  checkEnv('VAPID_PUBLIC_KEY',  'VAPID Public Key (push notifications)');
  checkEnv('VAPID_PRIVATE_KEY', 'VAPID Private Key (push notifications)');
  checkEnv('VAPID_EMAIL',       'VAPID Email (push notifications)');

  // ──────────────────────────────────────────────────────────
  // FINAL REPORT
  // ──────────────────────────────────────────────────────────

  const total = passed + failed + warned;
  console.log(`\n${BOLD}╔══════════════════════════════════════════════════╗`);
  console.log(`║   TEST RESULTS                                   ║`);
  console.log(`╠══════════════════════════════════════════════════╣`);
  console.log(`║  ${G}✅ Passed : ${String(passed).padEnd(37)}${X}${BOLD}║`);
  console.log(`║  ${R}❌ Failed : ${String(failed).padEnd(37)}${X}${BOLD}║`);
  console.log(`║  ${Y}⚠️  Warned : ${String(warned).padEnd(37)}${X}${BOLD}║`);
  console.log(`║  Total   : ${String(total).padEnd(38)}║`);
  console.log(`╠══════════════════════════════════════════════════╣`);

  if (failed === 0) {
    console.log(`║  ${G}🎉 All tests passed! App is ready to launch.    ${X}${BOLD}║`);
  } else {
    console.log(`║  ${R}⚠️  ${failed} test(s) failed. Check output above.     ${X}${BOLD}║`);
  }
  console.log(`╚══════════════════════════════════════════════════╝${X}\n`);
};

// ── Run everything ───────────────────────────────────────────
runTests().catch((err) => {
  console.error(`\n${R}Fatal error running tests:${X}`, err.message);
  process.exit(1);
});