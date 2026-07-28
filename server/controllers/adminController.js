const Member          = require('../models/Member');
const BirthdaySetting = require('../models/BirthdaySetting');

// GET /api/admin/stats
const getStats = async (req, res) => {
  try {
    const categories = [
      'men', 'women', 'youths', 'men-excos', 'women-excos',
      'youth-excos', 'workers', 'ffcc', 'church-committee', 'choir',
    ];

    const stats = {};

    // Count how many members belong to each group
    for (const cat of categories) {
      stats[cat] = await Member.countDocuments({ categories: cat });
    }

    // ✅ Total UNIQUE registered people — one person = 1, no matter how many groups
    stats.totalMembers = await Member.countDocuments({});

    res.json(stats);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/admin/members
const getMembers = async (req, res) => {
  try {
    const members = await Member.find({}).sort({ createdAt: -1 });
    res.json(members);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/admin/members/search?q=
const searchMembers = async (req, res) => {
  try {
    const q = req.query.q || '';
    const members = await Member.find({
      $or: [
        { name:  { $regex: q, $options: 'i' } },
        { phone: { $regex: q, $options: 'i' } },
      ],
    }).limit(20);
    res.json(members);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/admin/members/:id
const updateMember = async (req, res) => {
  try {
    const updated = await Member.findByIdAndUpdate(
      req.params.id, req.body, { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE /api/admin/members/:id
const deleteMember = async (req, res) => {
  try {
    await Member.findByIdAndDelete(req.params.id);
    res.json({ message: 'Member deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/admin/birthday-settings
const getBirthdaySettings = async (req, res) => {
  try {
    let settings = await BirthdaySetting.findOne({});
    if (!settings) {
      settings = await BirthdaySetting.create({
        template: "Happy Birthday {name}! 🎉🎂 The Golden City Church family celebrates you today. May God bless you abundantly and grant you many more glorious years. We love you! 🙏✝️",
        sendTime: '08:00',
        enabled: true,
      });
    }
    res.json(settings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/admin/birthday-settings
const updateBirthdaySettings = async (req, res) => {
  try {
    let settings = await BirthdaySetting.findOne({});
    if (!settings) {
      settings = await BirthdaySetting.create(req.body);
    } else {
      settings = await BirthdaySetting.findOneAndUpdate({}, req.body, { new: true });
    }
    res.json(settings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/admin/birthday-today
const getTodayBirthdays = async (req, res) => {
  try {
    const today = new Date();
    const mm    = String(today.getMonth() + 1).padStart(2, '0');
    const dd    = String(today.getDate()).padStart(2, '0');
    const members = await Member.find({});
    const birthdays = members.filter((m) => {
      if (!m.dateOfBirth) return false;
      const parts = m.dateOfBirth.split('-');
      return parts[1] === mm && parts[2] === dd;
    });
    res.json(birthdays);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getStats, getMembers, searchMembers, updateMember, deleteMember,
  getBirthdaySettings, updateBirthdaySettings, getTodayBirthdays,
};
