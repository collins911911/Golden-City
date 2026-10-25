const express = require('express');
const router  = express.Router();
const { adminLogin, memberRegister, memberLogin } = require('../controllers/authController');

router.post('/admin/login',     adminLogin);
router.post('/member/register', memberRegister);   // creates a PENDING request
router.post('/member/login',    memberLogin);

module.exports = router;
