const bcrypt       = require('bcryptjs');
const jwt          = require('jsonwebtoken');
const Admin        = require('../models/Admin');
const Member       = require('../models/Member');
const Registration = require('../models/Registration');
const { sendPushToAdmins } = require('../utils/push');
const {
  httpError, normalisePhone, isValidPhone, isValidDate,
} = require('../utils/validate');

const signToken = (payload, expiresIn) =>
  jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });

// Match a phone however it was typed when the member registered
const phoneVariants = (raw) => {
  const trimmed = String(raw || '').trim();
  return [...new Set([trimmed, normalisePhone(trimmed)])];
};

// ── ADMIN LOGIN ──────────────────────────────────────────────
// POST /api/auth/admin/login
const adminLogin = async (req, res) => {
  const { username, password, passcode } = req.body;
  if (!username || !password || !passcode) throw httpError(400, 'Username, password and passcode are required.');
  if (passcode !== process.env.ADMIN_PASSCODE) throw httpError(403, 'Invalid admin passcode');

  const admin = await Admin.findOne({ username: String(username).trim() });
  if (!admin) throw httpError(404, 'Admin not found');

  const match = await bcrypt.compare(password, admin.password);
  if (!match) throw httpError(401, 'Wrong password');

  const token = signToken(
    { id: admin._id, role: 'admin', name: admin.name, title: admin.title },
    '1d'
  );
  res.json({ token, id: admin._id, name: admin.name, title: admin.title, role: 'admin' });
};

// ── MEMBER REGISTER → creates a PENDING request ──────────────
// POST /api/auth/member/register
const memberRegister = async (req, res) => {
  const { name, dateOfBirth, password, categories } = req.body;
  const phone = normalisePhone(req.body.phone);

  if (!name || !phone || !dateOfBirth || !password || !Array.isArray(categories) || categories.length === 0) {
    throw httpError(400, 'All fields are required, including at least one group.');
  }
  if (!isValidPhone(phone)) throw httpError(400, 'Enter a valid Nigerian phone number, e.g. 08012345678.');
  if (!isValidDate(dateOfBirth)) throw httpError(400, 'Enter a valid date of birth.');
  if (String(password).length < 6) throw httpError(400, 'Password must be at least 6 characters.');

  // Already a member?
  if (await Member.exists({ phone: { $in: phoneVariants(phone) } })) {
    throw httpError(400, 'This phone number is already registered. Please log in instead.');
  }

  // Already waiting?
  const existing = await Registration.findOne({ phone }).sort({ createdAt: -1 });
  if (existing && existing.status === 'pending') {
    throw httpError(400, 'You already have a request waiting for approval. You will get an SMS once an admin reviews it.');
  }

  const hashed = await bcrypt.hash(password, 10);
  const data = {
    name: String(name).trim(),
    phone,
    dateOfBirth,
    password: hashed,
    categories,
    status: 'pending',
    reason: '',
    reviewedBy: '',
    reviewedAt: undefined,
  };

  // A previously rejected person can apply again — reuse their record
  let registration;
  if (existing && existing.status === 'rejected') {
    existing.set(data);
    registration = await existing.save();
  } else {
    registration = await Registration.create(data);
  }

  // Tell ADMINS only (not members) — don't wait for it
  sendPushToAdmins('New registration request', `${registration.name} wants to join Golden City.`);

  res.status(201).json({
    status:  'pending',
    name:    registration.name,
    message: 'Your request has been submitted. An admin will review it and you will receive an SMS.',
  });
};

// ── MEMBER LOGIN ─────────────────────────────────────────────
// POST /api/auth/member/login
const memberLogin = async (req, res) => {
  const { password } = req.body;
  if (!req.body.phone || !password) throw httpError(400, 'Phone number and password are required.');

  const variants = phoneVariants(req.body.phone);
  const member   = await Member.findOne({ phone: { $in: variants } }).select('+password');

  if (!member) {
    // Not a member yet — explain why
    const reg = await Registration.findOne({ phone: { $in: variants } }).sort({ createdAt: -1 }).lean();
    if (reg?.status === 'pending') {
      throw httpError(403, 'Your registration is still waiting for admin approval. You will get an SMS once it is approved.');
    }
    if (reg?.status === 'rejected') {
      throw httpError(403, `Your registration was not approved${reg.reason ? `: ${reg.reason}` : '.'} You can register again or contact the church office.`);
    }
    throw httpError(404, 'No account found with this phone number. Please register first.');
  }

  const match = await bcrypt.compare(password, member.password);
  if (!match) throw httpError(401, 'Incorrect password. Please try again.');

  const token = signToken(
    { id: member._id, role: 'member', name: member.name, categories: member.categories },
    '7d'
  );
  res.json({
    token,
    id:         member._id,
    name:       member.name,
    role:       'member',
    categories: member.categories,
  });
};

module.exports = { adminLogin, memberRegister, memberLogin };
