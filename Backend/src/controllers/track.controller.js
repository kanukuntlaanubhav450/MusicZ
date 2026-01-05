const { db } = require('../config/firebase');

const isDbAvailable = () => !!db;

const MOCK_TRACKS = [
    {
        id: 'mock-1',
        title: 'Chill Vibes',
        artist: 'SoundHelix',
        category: 'Electronic',
        imageUrl: 'https://placehold.co/400/1a1a2e/e94560?text=Chill',
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'
    },
    {
        id: 'mock-2',
        title: 'Summer Beats',
        artist: 'SoundHelix',
        category: 'Pop',
        imageUrl: 'https://placehold.co/400/16213e/0f3460?text=Summer',
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3'
    },
    {
        id: 'mock-3',
        title: 'Night Drive',
        artist: 'SoundHelix',
        category: 'Electronic',
        imageUrl: 'https://placehold.co/400/1b262c/0f4c75?text=Night',
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3'
    },
    {
        id: 'mock-4',
        title: 'Morning Coffee',
        artist: 'SoundHelix',
        category: 'Jazz',
        imageUrl: 'https://placehold.co/400/3c1642/886a92?text=Jazz',
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3'
    }
];

exports.getAllTracks = async (req, res) => {
    try {
        const userId = req.user.uid;

        if (isDbAvailable()) {
            const snapshot = await db.collection('tracks').get();
            const dbTracks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            // Always include mock tracks + any database tracks
            const allTracks = [...MOCK_TRACKS, ...dbTracks];
            return res.json(allTracks);
        }

        // Fallback for no DB - just mock tracks
        return res.json(MOCK_TRACKS);
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
