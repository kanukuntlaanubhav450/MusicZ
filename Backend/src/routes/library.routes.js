const express = require('express');
const router = express.Router();
const libraryController = require('../controllers/library.controller');
const authMiddleware = require('../middlewares/auth.middleware');

router.use(authMiddleware);

router.get('/loved', libraryController.getLovedTracks);
router.post('/loved', libraryController.toggleLove);

module.exports = router;

