const Member  = require('../models/Member');
const Message = require('../models/Message');
const { sendSMS } = require('../utils/termii');

// POST /api/messages/group
// Now supports single group OR multiple groups
const sendGroupMessage = async (req, res) => {
  const { group, groups, content, sentBy } = req.body;
  // Support both single group (string) and multiple groups (array)
  const targetGroups = groups && groups.length > 0
    ? groups
    : group === 'all' ? ['all'] : [group];

  try {
    let members = [];

    if (targetGroups.includes('all')) {
      members = await Member.find({});
    } else {
      // Find members belonging to ANY of the selected groups
      members = await Member.find({ categories: { $in: targetGroups } });
    }

    if (members.length === 0) {
      return res.status(400).json({ message: 'No members found in the selected group(s).' });
    }

    // Deduplicate — one person in both Workers & FFCC only gets SMS once
    const seen   = new Set();
    const unique = members.filter((m) => {
      if (seen.has(m._id.toString())) return false;
      seen.add(m._id.toString());
      return true;
    });

    const phones = unique.map((m) => m.phone);
    const results = await sendSMS(phones, content);

    const deliveryStatus = phones.map((phone, i) => ({
      phone,
      status: results[i]?.status === 'success' ? 'delivered' : 'pending',
    }));

    const message = await Message.create({
      sentBy,
      recipients: phones,
      group:      targetGroups.join(', '),
      content,
      type:       targetGroups.includes('all') ? 'all' : 'group',
      deliveryStatus,
    });

    res.status(201).json({
      message: 'SMS sent!',
      count:   phones.length,
      groups:  targetGroups,
      id:      message._id,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/messages/selective
const sendSelectiveMessage = async (req, res) => {
  const { recipients, content, sentBy } = req.body;
  try {
    if (!recipients || recipients.length === 0) {
      return res.status(400).json({ message: 'No recipients provided.' });
    }
    const results = await sendSMS(recipients, content);
    const deliveryStatus = recipients.map((phone, i) => ({
      phone,
      status: results[i]?.status === 'success' ? 'delivered' : 'pending',
    }));
    await Message.create({ sentBy, recipients, content, type: 'selective', deliveryStatus });
    res.status(201).json({ message: 'SMS sent!', count: recipients.length });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/messages/history
const getHistory = async (req, res) => {
  try {
    const messages = await Message.find({}).sort({ createdAt: -1 }).limit(100);
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { sendGroupMessage, sendSelectiveMessage, getHistory };