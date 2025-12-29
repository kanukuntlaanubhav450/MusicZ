const { db } = require('../config/firebase');

// MOCK DATA: Simulating a user's "Liked Songs" playlist
const MOCK_LOVED_TRACKS = [
    { id: '3', title: 'Get Lucky', artist: 'Daft Punk', album: 'Random Access Memories', duration: 248, imageUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3' },
    { id: '1', title: 'Midnight City', artist: 'M83', album: 'Hurry Up, We\'re Dreaming', duration: 320, imageUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' },
    { id: '4', title: 'Blinding Lights', artist: 'The Weeknd', album: 'After Hours', duration: 200, imageUrl: 'https://images.unsplash.com/photo-1514525253440-b393452e8d26', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3' }
];

exports.getLovedTracks = async (req, res) => {
    try {
        // In a real app, we would query Firestore for the current user's loved tracks.
        // e.g., await db.collection('users').doc(req.user.uid).collection('loved').get();

        if (db) {
            // Placeholder for Firestore logic if DB was active
            res.json(MOCK_LOVED_TRACKS);
        } else {
            res.json(MOCK_LOVED_TRACKS);
        }
    } catch (error) {
        console.error("Library Error:", error);
        res.status(500).json({ message: 'Server Error', tracks: [] });
    }
};

exports.toggleLove = async (req, res) => {
    // Mock toggle endpoint
    res.json({ message: 'Success', status: 'toggled' });
};
