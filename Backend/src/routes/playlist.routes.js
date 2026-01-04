const express = require('express');
const router = express.Router();
const playlistController = require('../controllers/playlist.controller');
const authMiddleware = require('../middlewares/auth.middleware');

router.use(authMiddleware); // Apply to all routes in this file

router.post('/', playlistController.createPlaylist);
router.get('/my', playlistController.getUserPlaylists);
router.get('/:id', playlistController.getPlaylistById);
router.put('/:id', playlistController.updatePlaylistDetails);
router.post('/:id/tracks', playlistController.addTrackToPlaylist);
router.delete('/:id/tracks/:trackId', playlistController.removeTrackFromPlaylist);
router.delete('/:id', playlistController.deletePlaylist);

module.exports = router;

