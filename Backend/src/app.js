const express = require('express');
const cors = require('cors');
const errorHandler = require('./middlewares/error.middleware');

// Import Routes
const authRoutes = require('./routes/auth.routes');
const trackRoutes = require('./routes/track.routes');
const podcastRoutes = require('./routes/podcast.routes');
const categoryRoutes = require('./routes/category.routes');
const searchRoutes = require('./routes/search.routes');
const libraryRoutes = require('./routes/library.routes');
const playlistRoutes = require('./routes/playlist.routes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/', (req, res) => res.send('MusicStreamz Backend Running'));
app.use('/api/auth', authRoutes);
app.use('/api/tracks', trackRoutes);
app.use('/api/podcasts', podcastRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/library', libraryRoutes);
app.use('/api/playlists', playlistRoutes);
// app.use('/api/admin', adminRoutes);

// Error Handler
app.use(errorHandler);

module.exports = app;
