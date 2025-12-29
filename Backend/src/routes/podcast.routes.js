const express = require('express');
const router = express.Router();
const podcastController = require('../controllers/podcast.controller');


router.get('/', podcastController.getAllPodcasts);
router.get('/:id', podcastController.getPodcastById);

module.exports = router;
