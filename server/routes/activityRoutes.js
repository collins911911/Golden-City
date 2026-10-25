const express  = require('express');
const router   = express.Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');
const Activity = require('../models/WeeklyActivity');
const crud     = require('../controllers/crudFactory')(Activity, {
  fields: ['title', 'day', 'time', 'location', 'description'],
  sort:   { day: 1, time: 1 },
});

router.get('/',       crud.list);                       // public
router.post('/',      protect, adminOnly, crud.create);
router.put('/:id',    protect, adminOnly, crud.update);
router.delete('/:id', protect, adminOnly, crud.remove);

module.exports = router;
