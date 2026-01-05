const { db } = require('../config/firebase');

const isDbAvailable = () => !!db;

exports.getAllTracks = async (req, res) => {
    try {
        const userId = req.user.uid;

        if (isDbAvailable()) {
            // Filter tracks by the logged-in user
            const snapshot = await db.collection('tracks').get();

            const tracks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            return res.json(tracks);
        }

        // Fallback for no DB
        return res.json([]);
    } catch (error) {
        console.error("Error fetching tracks:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.createTrack = async (req, res) => {
    try {
        const { title, artist, category, imageUrl, audioUrl } = req.body;
        const userId = req.user.uid;

        if (!title || !artist || !category || !imageUrl || !audioUrl) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const newTrack = {
            title,
            artist,
            category,
            imageUrl,
            audioUrl,
            ownerId: userId, // Link track to uploader
            createdAt: new Date().toISOString()
        };

        if (isDbAvailable()) {
            const docRef = await db.collection('tracks').add(newTrack);
            res.status(201).json({ id: docRef.id, ...newTrack });
        } else {
            res.status(500).json({ message: 'DB Unavailable' });
        }
    } catch (error) {
        console.error("Error creating track:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};
