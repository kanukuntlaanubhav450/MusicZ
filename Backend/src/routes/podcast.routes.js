const express = require('express');
const router = express.Router();
const podcastController = require('../controllers/podcast.controller');
const authMiddleware = require('../middlewares/auth.middleware');

router.use(authMiddleware);

router.get('/', podcastController.getAllPodcasts);
router.get('/:id', podcastController.getPodcastById);

module.exports = router;
