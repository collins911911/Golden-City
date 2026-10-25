const express = require('express');
const router  = express.Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');
const c = require('../controllers/registrationController');

// Admin only — new members submit through /api/auth/member/register
router.use(protect, adminOnly);

router.get('/',             c.listRegistrations);   // ?status=pending|approved|rejected|all
router.get('/count',        c.pendingCount);
router.post('/:id/approve', c.approveRegistration);
router.post('/:id/reject',  c.rejectRegistration);
router.delete('/:id',       c.deleteRegistration);

module.exports = router;
