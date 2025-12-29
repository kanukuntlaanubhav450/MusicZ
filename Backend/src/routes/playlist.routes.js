const express = require('express');
const router = express.Router();
const playlistController = require('../controllers/playlist.controller');

router.post('/', playlistController.createPlaylist);
router.get('/my', playlistController.getUserPlaylists);
router.get('/:id', playlistController.getPlaylistById);
router.put('/:id', playlistController.updatePlaylistDetails);
router.post('/:id/tracks', playlistController.addTrackToPlaylist);
router.delete('/:id/tracks/:trackId', playlistController.removeTrackFromPlaylist);
router.delete('/:id', playlistController.deletePlaylist);

module.exports = router;
