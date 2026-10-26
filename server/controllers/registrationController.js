const Registration = require('../models/Registration');
const Member       = require('../models/Member');
const Message      = require('../models/Message');
const { sendSMS }  = require('../utils/termii');
const { httpError } = require('../utils/validate');

// Send an SMS and log it in Message History — runs in the background
// so the admin's screen updates instantly.
const smsInBackground = (phone, text, sentBy) => {
  (async () => {
    try {
      const results = await sendSMS([phone], text);
      await Message.create({
        sentBy,
        recipients:     [phone],
        content:        text,
        type:           'selective',
        deliveryStatus: [{ phone, status: results[0]?.status === 'success' ? 'delivered' : 'pending' }],
      });
    } catch (err) {
      console.error('Registration SMS error:', err.message);
    }
  })();
};

// GET /api/registrations?status=pending|approved|rejected|all
const listRegistrations = async (req, res) => {
  const status = req.query.status || 'pending';
  const filter = status === 'all' ? {} : { status };
  const items  = await Registration.find(filter).sort({ createdAt: -1 }).limit(200).lean();
  res.json(items);
};

// GET /api/registrations/count → { pending: 3 }
const pendingCount = async (req, res) => {
  const pending = await Registration.countDocuments({ status: 'pending' });
  res.json({ pending });
};

// POST /api/registrations/:id/approve
const approveRegistration = async (req, res) => {
  const reg = await Registration.findById(req.params.id).select('+password');
  if (!reg) throw httpError(404, 'Registration not found');
  if (reg.status !== 'pending') throw httpError(400, `This request was already ${reg.status}.`);

  if (await Member.exists({ phone: reg.phone })) {
    reg.status = 'approved';
    reg.reviewedBy = req.user.name;
    reg.reviewedAt = new Date();
    await reg.save();
    throw httpError(409, 'A member with this phone number already exists. The request was closed.');
  }

  const member = await Member.create({
    name:        reg.name,
    phone:       reg.phone,
    dateOfBirth: reg.dateOfBirth,
    password:    reg.password, // already hashed
    categories:  reg.categories,
  });

  reg.status     = 'approved';
  reg.reviewedBy = req.user.name;
  reg.reviewedAt = new Date();
  await reg.save();

  smsInBackground(
    reg.phone,
    `Welcome to CPM Golden City Church, ${reg.name}! Your registration has been APPROVED. ` +
    `You can now log in to the member portal with your phone number and password. God bless you!`,
    `${req.user.name} (Approval)`
  );

  res.json({ message: `${reg.name} approved and added as a member.`, memberId: member._id });
};

// POST /api/registrations/:id/reject   body: { reason }
const rejectRegistration = async (req, res) => {
  const reason = String(req.body.reason || '').trim().slice(0, 300);
  const reg    = await Registration.findById(req.params.id);
  if (!reg) throw httpError(404, 'Registration not found');
  if (reg.status !== 'pending') throw httpError(400, `This request was already ${reg.status}.`);

  reg.status     = 'rejected';
  reg.reason     = reason;
  reg.reviewedBy = req.user.name;
  reg.reviewedAt = new Date();
  await reg.save();

  smsInBackground(
    reg.phone,
    `Hello ${reg.name}, your registration to CPM Golden City Church member portal was not approved` +
    `${reason ? `. Reason: ${reason}` : ''}. Please contact the church office for help.`,
    `${req.user.name} (Rejection)`
  );

  res.json({ message: `${reg.name}'s request was rejected.` });
};

// DELETE /api/registrations/:id
const deleteRegistration = async (req, res) => {
  const result = await Registration.deleteOne({ _id: req.params.id });
  if (result.deletedCount === 0) throw httpError(404, 'Registration not found');
  res.json({ message: 'Request deleted' });
};

module.exports = {
  listRegistrations, pendingCount, approveRegistration, rejectRegistration, deleteRegistration,
};
