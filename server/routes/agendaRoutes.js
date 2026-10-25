const express = require('express');
const router  = express.Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');
const Agenda  = require('../models/Agenda');
const crud    = require('../controllers/crudFactory')(Agenda, {
  fields: ['title', 'description', 'date', 'time', 'year'],
  sort:   { date: 1 },
});

router.get('/',       crud.list);                       // public
router.post('/',      protect, adminOnly, crud.create);
router.put('/:id',    protect, adminOnly, crud.update);
router.delete('/:id', protect, adminOnly, crud.remove);

module.exports = router;
