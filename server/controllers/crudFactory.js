const { httpError, pick } = require('../utils/validate');

// Builds list / create / update / delete handlers for simple collections
// (Agenda, Notices, Weekly Activities) so the logic lives in one place.
//   fields: which body fields may be saved
//   sort:   default sort for the list
//   afterCreate: optional hook (e.g. send a push notification)
const crudFactory = (Model, { fields, sort = { createdAt: -1 }, afterCreate } = {}) => ({
  list: async (req, res) => {
    res.json(await Model.find({}).sort(sort).lean());
  },

  create: async (req, res) => {
    const doc = await Model.create(pick(req.body, fields));
    if (afterCreate) afterCreate(doc, req); // not awaited → response is instant
    res.status(201).json(doc);
  },

  update: async (req, res) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, pick(req.body, fields), {
      returnDocument: 'after', runValidators: true,
    }).lean();
    if (!doc) throw httpError(404, 'Not found');
    res.json(doc);
  },

  remove: async (req, res) => {
    const doc = await Model.findByIdAndDelete(req.params.id);
    if (!doc) throw httpError(404, 'Not found');
    res.json({ message: 'Deleted' });
  },
});

module.exports = crudFactory;
