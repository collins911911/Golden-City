const express = require('express');
const router  = express.Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');
const Notice  = require('../models/Notice');
const { sendPushToMembers } = require('../utils/push');

const crud = require('../controllers/crudFactory')(Notice, {
  fields: ['title', 'body', 'postedBy', 'important'],
  sort:   { createdAt: -1 },
  // Push notification to MEMBERS when a notice is posted
  afterCreate: (notice) => {
    const title = notice.important ? `Important: ${notice.title}` : notice.title;
    const body  = notice.body.length > 120 ? notice.body.slice(0, 120) + '…' : notice.body;
    sendPushToMembers(title, body, '/member-notice');
  },
});

// Fill "postedBy" from the logged-in admin if the page didn't send it
const setPoster = (req, res, next) => {
  req.body.postedBy = req.body.postedBy || req.user.name;
  next();
};

router.get('/',       crud.list);                       // public
router.post('/',      protect, adminOnly, setPoster, crud.create);
router.put('/:id',    protect, adminOnly, crud.update);
router.delete('/:id', protect, adminOnly, crud.remove);

module.exports = router;
