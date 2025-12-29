const express = require('express');
const router = express.Router();
// const authController = require('../controllers/auth.controller');

// router.post('/signup', authController.signup);
// router.post('/login', authController.login);

router.get('/test', (req, res) => res.send('Auth Route Working'));

module.exports = router;
