const express = require('express');
const router  = express.Router();
const { adminLogin, memberRegister, memberLogin } = require('../controllers/authController');

router.post('/admin/login',    adminLogin);
router.post('/member/register', memberRegister);
router.post('/member/login',    memberLogin);   // ← NEW

module.exports = router;