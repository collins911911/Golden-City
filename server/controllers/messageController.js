const Member      = require('../models/Member');
const Message     = require('../models/Message');
const { sendSMS } = require('../utils/termii');
const { httpError } = require('../utils/validate');

const toStatus = (results) => (phone, i) => ({
  phone,
  status: results[i]?.status === 'success' ? 'delivered' : 'pending',
});

// POST /api/messages/group   body: { groups: [...] } or { group: 'all' | 'men' ... , content }
const sendGroupMessage = async (req, res) => {
  const { group, groups } = req.body;
  const content = String(req.body.content || '').trim();
  if (!content) throw httpError(400, 'Message cannot be empty.');

  const targetGroups = Array.isArray(groups) && groups.length > 0
    ? groups
    : [group || 'all'];

  const filter  = targetGroups.includes('all') ? {} : { categories: { $in: targetGroups } };
  // distinct() → each phone only once, even if someone is in 2 groups
  const phones  = await Member.distinct('phone', filter);
  if (phones.length === 0) throw httpError(400, 'No members found in the selected group(s).');

  const results = await sendSMS(phones, content);
  const message = await Message.create({
    sentBy:         req.user.name || req.body.sentBy,
    recipients:     phones,
    group:          targetGroups.join(', '),
    content,
    type:           targetGroups.includes('all') ? 'all' : 'group',
    deliveryStatus: phones.map(toStatus(results)),
  });

  res.status(201).json({ message: 'SMS sent!', count: phones.length, groups: targetGroups, id: message._id });
};

// POST /api/messages/selective   body: { recipients: [phones], content }
const sendSelectiveMessage = async (req, res) => {
  const content    = String(req.body.content || '').trim();
  const recipients = [...new Set((req.body.recipients || []).map(String))];
  if (recipients.length === 0) throw httpError(400, 'No recipients provided.');
  if (!content) throw httpError(400, 'Message cannot be empty.');

  const results = await sendSMS(recipients, content);
  await Message.create({
    sentBy: req.user.name || req.body.sentBy,
    recipients,
    content,
    type: 'selective',
    deliveryStatus: recipients.map(toStatus(results)),
  });
  res.status(201).json({ message: 'SMS sent!', count: recipients.length });
};

// GET /api/messages/history
const getHistory = async (req, res) => {
  res.json(await Message.find({}).sort({ createdAt: -1 }).limit(100).lean());
};

module.exports = { sendGroupMessage, sendSelectiveMessage, getHistory };
