// ─────────────────────────────────────────────────────────────
// Golden City API tests
//
// Run:  npm test
// Needs MONGO_URI_TEST in .env pointing at an EMPTY TEST database,
// e.g. mongodb+srv://.../golden-city-test   (NEVER your real database —
// the tests wipe it).
// ─────────────────────────────────────────────────────────────
require('dotenv').config({ quiet: true });
process.env.NODE_ENV       = 'test';
process.env.JWT_SECRET     = process.env.JWT_SECRET || 'test-secret';
process.env.ADMIN_PASSCODE = 'test-passcode';
delete process.env.TERMII_API_KEY;    // never send real SMS from tests
delete process.env.VAPID_PRIVATE_KEY; // never send real push from tests

const { test, before, after } = require('node:test');
const assert   = require('node:assert/strict');
const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const URI = process.env.MONGO_URI_TEST;
if (!URI) {
  console.log('⚠️  Skipping API tests: set MONGO_URI_TEST in .env to a TEST database.');
  process.exit(0);
}

const app    = require('../app');
const Admin  = require('../models/Admin');
const Member = require('../models/Member');

let server;
let base;
let adminToken;
let memberToken;

const api = async (method, path, body, token) => {
  const res = await fetch(base + path, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  let data = null;
  try { data = await res.json(); } catch { /* not json */ }
  return { status: res.status, data };
};

before(async () => {
  await mongoose.connect(URI);
  await mongoose.connection.db.dropDatabase();
  await Admin.create({
    name: 'Test Pastor', username: 'tester', title: 'Head Pastor',
    password: await bcrypt.hash('secret123', 10),
  });
  await new Promise((resolve) => {
    server = app.listen(0, () => {
      base = `http://127.0.0.1:${server.address().port}/api`;
      resolve();
    });
  });
});

after(async () => {
  await mongoose.connection.db.dropDatabase();
  await mongoose.disconnect();
  server.close();
});

// ── Security ─────────────────────────────────────────────────
test('health check works and security headers are set', async () => {
  const res = await fetch(base + '/health');
  assert.equal(res.status, 200);
  assert.ok(res.headers.get('x-content-type-options'), 'helmet headers missing');
  assert.equal(res.headers.get('x-powered-by'), null);
});

test('unknown route returns 404 JSON', async () => {
  const r = await api('GET', '/does-not-exist');
  assert.equal(r.status, 404);
});

test('NoSQL injection in login is blocked', async () => {
  const r = await api('POST', '/auth/member/login', { phone: { $ne: null }, password: { $ne: null } });
  assert.notEqual(r.status, 200);
});

test('protected routes need a token', async () => {
  assert.equal((await api('GET', '/posts')).status, 401);
  assert.equal((await api('GET', '/registrations')).status, 401);
});

// ── Admin login ──────────────────────────────────────────────
test('admin login: wrong passcode rejected, right one works', async () => {
  const bad = await api('POST', '/auth/admin/login', { username: 'tester', password: 'secret123', passcode: 'nope' });
  assert.equal(bad.status, 403);
  const ok = await api('POST', '/auth/admin/login', { username: 'tester', password: 'secret123', passcode: 'test-passcode' });
  assert.equal(ok.status, 200);
  assert.ok(ok.data.token);
  assert.ok(ok.data.id);
  adminToken = ok.data.token;
});

// ── Registration approval flow ───────────────────────────────
const newMember = {
  name: 'Ada <b>Obi</b>', phone: '0803 123 4567', dateOfBirth: '1995-10-25',
  password: 'pass123', categories: ['women', 'choir'],
};

test('register creates a PENDING request (no login token)', async () => {
  const r = await api('POST', '/auth/member/register', newMember);
  assert.equal(r.status, 201);
  assert.equal(r.data.status, 'pending');
  assert.equal(r.data.token, undefined);
  assert.equal(r.data.name, 'Ada Obi', 'HTML should be stripped');
});

test('registering twice while pending is refused', async () => {
  const r = await api('POST', '/auth/member/register', newMember);
  assert.equal(r.status, 400);
});

test('invalid phone is refused', async () => {
  const r = await api('POST', '/auth/member/register', { ...newMember, phone: '123' });
  assert.equal(r.status, 400);
});

test('pending person cannot log in and is told why', async () => {
  const r = await api('POST', '/auth/member/login', { phone: '08031234567', password: 'pass123' });
  assert.equal(r.status, 403);
  assert.match(r.data.message, /waiting for admin approval/i);
});

let regId;
test('admin sees the pending request and count', async () => {
  const count = await api('GET', '/registrations/count', null, adminToken);
  assert.equal(count.data.pending, 1);
  const list = await api('GET', '/registrations?status=pending', null, adminToken);
  assert.equal(list.status, 200);
  assert.equal(list.data.length, 1);
  assert.equal(list.data[0].password, undefined, 'password hash must never be sent');
  regId = list.data[0]._id;
});

test('admin approves → member created → member can log in', async () => {
  const r = await api('POST', `/registrations/${regId}/approve`, {}, adminToken);
  assert.equal(r.status, 200);
  assert.equal(await Member.countDocuments({ phone: '08031234567' }), 1);

  const again = await api('POST', `/registrations/${regId}/approve`, {}, adminToken);
  assert.equal(again.status, 400, 'cannot approve twice');

  const login = await api('POST', '/auth/member/login', { phone: '+2348031234567', password: 'pass123' });
  assert.equal(login.status, 200);
  assert.ok(login.data.id);
  memberToken = login.data.token;
});

test('member cannot use admin routes', async () => {
  assert.equal((await api('GET', '/registrations', null, memberToken)).status, 403);
  assert.equal((await api('POST', '/posts', { text: 'hi' }, memberToken)).status, 403);
});

test('reject flow: rejected person is told the reason, and can re-apply', async () => {
  await api('POST', '/auth/member/register', { ...newMember, phone: '08099998888', name: 'Bayo' });
  const list = await api('GET', '/registrations?status=pending', null, adminToken);
  const id   = list.data.find((x) => x.phone === '08099998888')._id;

  const rej = await api('POST', `/registrations/${id}/reject`, { reason: 'Please visit the church office first' }, adminToken);
  assert.equal(rej.status, 200);

  const login = await api('POST', '/auth/member/login', { phone: '08099998888', password: 'pass123' });
  assert.equal(login.status, 403);
  assert.match(login.data.message, /church office first/);

  const reapply = await api('POST', '/auth/member/register', { ...newMember, phone: '08099998888', name: 'Bayo' });
  assert.equal(reapply.status, 201);
});

test('admin member list never includes password hashes', async () => {
  const r = await api('GET', '/admin/members', null, adminToken);
  assert.equal(r.status, 200);
  assert.ok(r.data.length >= 1);
  assert.equal(r.data[0].password, undefined);
});

test('stats, member count and search work', async () => {
  const stats = await api('GET', '/admin/stats', null, adminToken);
  assert.equal(stats.data.totalMembers, 1);
  assert.equal(stats.data.women, 1);
  assert.equal(stats.data.pendingRegistrations, 1);

  const count = await api('GET', '/admin/members/count?groups=women,choir', null, adminToken);
  assert.equal(count.data.count, 1);

  const search = await api('GET', '/admin/members/search?q=' + encodeURIComponent('(.*'), null, adminToken);
  assert.equal(search.status, 200, 'regex characters must not crash search');
});

test('birthday-today finds members born on this day', async () => {
  const r = await api('GET', '/admin/birthday-today', null, adminToken);
  assert.equal(r.status, 200);
  assert.ok(Array.isArray(r.data));
});

// ── Posts (tweets) ───────────────────────────────────────────
let postId;
test('admin writes a text post', async () => {
  const empty = await api('POST', '/posts', { text: '   ' }, adminToken);
  assert.equal(empty.status, 400);

  const r = await api('POST', '/posts', { text: 'Sunday service starts at 8am. Come early! 🙏' }, adminToken);
  assert.equal(r.status, 201);
  assert.equal(r.data.likes, 0);
  postId = r.data._id;
});

test('member sees the post and the unviewed count', async () => {
  const unv = await api('GET', '/posts/unviewed-count', null, memberToken);
  assert.equal(unv.data.count, 1);
  const r = await api('GET', '/posts', null, memberToken);
  assert.equal(r.data.posts.length, 1);
  assert.equal(r.data.posts[0].viewed, false);
  assert.equal(r.data.posts[0].myReaction, null);
  assert.equal(r.data.posts[0].likes, 0);
});

test('view is counted once per person', async () => {
  await api('POST', `/posts/${postId}/view`, {}, memberToken);
  const r = await api('POST', `/posts/${postId}/view`, {}, memberToken);
  assert.equal(r.data.views, 1);
  const unv = await api('GET', '/posts/unviewed-count', null, memberToken);
  assert.equal(unv.data.count, 0);
});

test('reactions: one per person, switch, and toggle off', async () => {
  let r = await api('POST', `/posts/${postId}/react`, { type: 'likes' }, memberToken);
  assert.deepEqual([r.data.likes, r.data.loves, r.data.amens, r.data.myReaction], [1, 0, 0, 'likes']);

  r = await api('POST', `/posts/${postId}/react`, { type: 'amens' }, memberToken);
  assert.deepEqual([r.data.likes, r.data.loves, r.data.amens, r.data.myReaction], [0, 0, 1, 'amens']);

  r = await api('POST', `/posts/${postId}/react`, { type: 'loves' }, adminToken);
  assert.deepEqual([r.data.loves, r.data.amens], [1, 1]);

  r = await api('POST', `/posts/${postId}/react`, { type: 'amens' }, memberToken);
  assert.deepEqual([r.data.amens, r.data.myReaction], [0, null]);

  const bad = await api('POST', `/posts/${postId}/react`, { type: 'hates' }, memberToken);
  assert.equal(bad.status, 400);
});

test('reaction is remembered after reload', async () => {
  await api('POST', `/posts/${postId}/react`, { type: 'loves' }, memberToken);
  const r = await api('GET', '/posts', null, memberToken);
  assert.equal(r.data.posts[0].myReaction, 'loves');
  assert.equal(r.data.posts[0].loves, 2);
});

test('share counter goes up', async () => {
  const r = await api('POST', `/posts/${postId}/share`, {}, memberToken);
  assert.equal(r.data.shares, 1);
});

test('invalid post id gives a clean 400', async () => {
  const r = await api('POST', '/posts/not-an-id/react', { type: 'likes' }, memberToken);
  assert.equal(r.status, 400);
});

test('admin deletes the post', async () => {
  assert.equal((await api('DELETE', `/posts/${postId}`, null, adminToken)).status, 200);
  const r = await api('GET', '/posts', null, memberToken);
  assert.equal(r.data.posts.length, 0);
});

// ── Notices / agenda / activities ────────────────────────────
test('notices: public read, admin write, postedBy filled in', async () => {
  const c = await api('POST', '/notices', { title: 'Choir practice', body: 'Saturday 4pm', important: true }, adminToken);
  assert.equal(c.status, 201);
  assert.equal(c.data.postedBy, 'Test Pastor');
  const list = await api('GET', '/notices');
  assert.equal(list.data.length, 1);
  const forbidden = await api('POST', '/notices', { title: 'x', body: 'y' }, memberToken);
  assert.equal(forbidden.status, 403);
});

test('agenda and activities CRUD', async () => {
  const a = await api('POST', '/agenda', { title: 'Harvest', date: '2026-11-20', year: 2026 }, adminToken);
  assert.equal(a.status, 201);
  const u = await api('PUT', `/agenda/${a.data._id}`, { title: 'Harvest Thanksgiving' }, adminToken);
  assert.equal(u.data.title, 'Harvest Thanksgiving');
  assert.equal((await api('DELETE', `/agenda/${a.data._id}`, null, adminToken)).status, 200);

  const w = await api('POST', '/activities', { title: 'Bible Study', day: 'Wednesday', time: '17:00' }, adminToken);
  assert.equal(w.status, 201);
  assert.equal((await api('GET', '/activities')).data.length, 1);
});

test('SMS endpoints validate input', async () => {
  const r = await api('POST', '/messages/group', { groups: ['women'], content: '' }, adminToken);
  assert.equal(r.status, 400);
  const ok = await api('POST', '/messages/group', { groups: ['women'], content: 'Hello women' }, adminToken);
  assert.equal(ok.status, 201);
  assert.equal(ok.data.count, 1);
});
