const express = require('express');
const router = express.Router();
const trackController = require('../controllers/track.controller');
const authMiddleware = require('../middlewares/auth.middleware');

router.use(authMiddleware);

router.get('/', trackController.getAllTracks);
router.post('/', trackController.createTrack);

module.exports = router;
