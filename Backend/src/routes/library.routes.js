const express = require('express');
const router = express.Router();
const libraryController = require('../controllers/library.controller');

router.get('/loved', libraryController.getLovedTracks);
router.post('/loved', libraryController.toggleLove);

module.exports = router;
