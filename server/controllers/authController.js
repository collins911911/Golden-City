const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');
const Admin  = require('../models/Admin');
const Member = require('../models/Member');

// ── ADMIN LOGIN ──────────────────────────────────────────────
const adminLogin = async (req, res) => {
  const { username, password, passcode } = req.body;
  if (passcode !== process.env.ADMIN_PASSCODE) {
    return res.status(403).json({ message: 'Invalid admin passcode' });
  }
  try {
    const admin = await Admin.findOne({ username });
    if (!admin) return res.status(404).json({ message: 'Admin not found' });
    const match = await bcrypt.compare(password, admin.password);
    if (!match) return res.status(401).json({ message: 'Wrong password' });
    const token = jwt.sign(
      { id: admin._id, role: 'admin', name: admin.name, title: admin.title },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );
    res.json({ token, name: admin.name, title: admin.title, role: 'admin' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── MEMBER REGISTER ──────────────────────────────────────────
const memberRegister = async (req, res) => {
  const { name, phone, dateOfBirth, password, categories } = req.body;

  if (!name || !phone || !dateOfBirth || !password || !categories) {
    return res.status(400).json({ message: 'All fields are required.' });
  }
  if (password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters.' });
  }

  try {
    // Duplicate phone check
    const existing = await Member.findOne({ phone: phone.trim() });
    if (existing) {
      return res.status(400).json({
        message: 'This phone number is already registered. Please log in instead.',
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const member = await Member.create({
      name: name.trim(),
      phone: phone.trim(),
      dateOfBirth,
      password: hashedPassword,
      categories,
    });

    const token = jwt.sign(
      { id: member._id, role: 'member', name: member.name, categories: member.categories },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // ── WELCOME SMS — fires 1 hour after registration ────────
    setTimeout(async () => {
      try {
        const { sendSMS } = require('../utils/termii');
        const Message     = require('../models/Message');

        const welcomeText =
          `Welcome to CPM Golden City Church, ${member.name}! 🙏✝️ ` +
          `We are so glad to have you join our family. ` +
          `As you worship with us, may God's grace surround you always ` +
          `and may you continually be blessed in His presence. ` +
          `Welcome home! — Golden City Church Family 🌟`;

        const results = await sendSMS([member.phone], welcomeText);

        await Message.create({
          sentBy:         'System (Auto-Welcome)',
          recipients:     [member.phone],
          content:        welcomeText,
          type:           'selective',
          deliveryStatus: [{
            phone:  member.phone,
            status: results[0]?.status === 'success' ? 'delivered' : 'pending',
          }],
        });

        console.log(`👋 Welcome SMS sent to ${member.name} (${member.phone})`);
      } catch (err) {
        console.error('Welcome SMS error:', err.message);
      }
    }, 60 * 60 * 1000); // 1 hour = 3,600,000 ms
    // ── END WELCOME SMS ──────────────────────────────────────

    res.status(201).json({
      token,
      name:       member.name,
      role:       'member',
      categories: member.categories,
    });

  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({
        message: 'This phone number is already registered. Please log in instead.',
      });
    }
    res.status(500).json({ message: err.message });
  }
};

// ── MEMBER LOGIN ─────────────────────────────────────────────
const memberLogin = async (req, res) => {
  const { phone, password } = req.body;
  if (!phone || !password) {
    return res.status(400).json({ message: 'Phone number and password are required.' });
  }
  try {
    const member = await Member.findOne({ phone: phone.trim() });
    if (!member) {
      return res.status(404).json({
        message: 'No account found with this phone number. Please register first.',
      });
    }
    const match = await bcrypt.compare(password, member.password);
    if (!match) {
      return res.status(401).json({ message: 'Incorrect password. Please try again.' });
    }
    const token = jwt.sign(
      { id: member._id, role: 'member', name: member.name, categories: member.categories },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    res.json({
      token,
      name:       member.name,
      role:       'member',
      categories: member.categories,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { adminLogin, memberRegister, memberLogin };