const Member          = require('../models/Member');
const Registration    = require('../models/Registration');
const BirthdaySetting = require('../models/BirthdaySetting');
const { CATEGORIES }  = require('../models/Member');
const { findTodayBirthdays } = require('../utils/birthdayCron');
const { httpError, pick, escapeRegex, normalisePhone } = require('../utils/validate');

const DEFAULT_TEMPLATE =
  'Happy Birthday {name}! 🎉🎂 The Golden City Church family celebrates you today. ' +
  'May God bless you abundantly and grant you many more glorious years. We love you! 🙏✝️';

// GET /api/admin/stats — group counts (all counts run in parallel)
const getStats = async (req, res) => {
  const counts = await Promise.all(CATEGORIES.map((c) => Member.countDocuments({ categories: c })));
  const stats  = Object.fromEntries(CATEGORIES.map((c, i) => [c, counts[i]]));
  stats.totalMembers = await Member.countDocuments({});

  // Admins also see how many requests are waiting
  if (req.user?.role === 'admin') {
    stats.pendingRegistrations = await Registration.countDocuments({ status: 'pending' });
  }
  res.json(stats);
};

// GET /api/admin/members
const getMembers = async (req, res) => {
  res.json(await Member.find({}).sort({ createdAt: -1 }).lean());
};

// GET /api/admin/members/count?groups=men,choir → { count } (each person once)
const countMembers = async (req, res) => {
  const groups = String(req.query.groups || '').split(',').map((g) => g.trim()).filter(Boolean);
  const filter = groups.length === 0 || groups.includes('all') ? {} : { categories: { $in: groups } };
  res.json({ count: await Member.countDocuments(filter) });
};

// GET /api/admin/members/search?q=
const searchMembers = async (req, res) => {
  const q = String(req.query.q || '').trim();
  if (!q) return res.json([]);
  const rx = { $regex: escapeRegex(q), $options: 'i' };
  res.json(await Member.find({ $or: [{ name: rx }, { phone: rx }] }).limit(20).lean());
};

// PUT /api/admin/members/:id — only these fields can be changed
const updateMember = async (req, res) => {
  const updates = pick(req.body, ['name', 'phone', 'dateOfBirth', 'categories']);
  if (updates.phone) updates.phone = normalisePhone(updates.phone);
  const updated = await Member.findByIdAndUpdate(req.params.id, updates, {
    returnDocument: 'after', runValidators: true,
  }).lean();
  if (!updated) throw httpError(404, 'Member not found');
  res.json(updated);
};

// DELETE /api/admin/members/:id
const deleteMember = async (req, res) => {
  const deleted = await Member.findByIdAndDelete(req.params.id);
  if (!deleted) throw httpError(404, 'Member not found');
  res.json({ message: 'Member deleted successfully' });
};

// GET /api/admin/birthday-settings
const getBirthdaySettings = async (req, res) => {
  let settings = await BirthdaySetting.findOne({}).lean();
  if (!settings) {
    settings = (await BirthdaySetting.create({ template: DEFAULT_TEMPLATE, sendTime: '08:00', enabled: true })).toObject();
  }
  res.json(settings);
};

// PUT /api/admin/birthday-settings
const updateBirthdaySettings = async (req, res) => {
  const updates  = pick(req.body, ['template', 'sendTime', 'enabled']);
  const settings = await BirthdaySetting.findOneAndUpdate({}, updates, {
    returnDocument: 'after', upsert: true, setDefaultsOnInsert: true,
  }).lean();
  res.json(settings);
};

// GET /api/admin/birthday-today
const getTodayBirthdays = async (req, res) => {
  res.json(await findTodayBirthdays());
};

module.exports = {
  getStats, getMembers, countMembers, searchMembers, updateMember, deleteMember,
  getBirthdaySettings, updateBirthdaySettings, getTodayBirthdays,
};
