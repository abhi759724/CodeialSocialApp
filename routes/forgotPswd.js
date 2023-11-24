const express = require('express');
const passport = require('passport');
const router = express.Router();

const forgotPaswdController = require('../controllers/forgotPaswd_controller');

router.get('/forgot-password', forgotPaswdController.forgot);
router.post('/forgot-password', forgotPaswdController.setEmail);

router.get('/reset-password/:token',forgotPaswdController.getResetPaswd);
router.post('/reset-password/:token',forgotPaswdController.resetPaswd);


module.exports = router;

