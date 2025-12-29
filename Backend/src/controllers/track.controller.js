const { db } = require('../config/firebase');

const MOCK_TRACKS = [
    {
        id: '1',
        title: 'Midnight City',
        artist: 'M83',
        album: 'Hurry Up, We\'re Dreaming',
        imageUrl: 'https://i.scdn.co/image/ab67616d0000b273295c64f72d4c3c3a4f6e3c3f',
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
        category: 'Electronic'
    },
    {
        id: '2',
        title: 'Blinding Lights',
        artist: 'The Weeknd',
        album: 'After Hours',
        imageUrl: 'https://i.scdn.co/image/ab67616d0000b2738863bc11d2aa12b54f5aeb36',
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
        category: 'Pop'
    },
    {
        id: '3',
        title: 'Levitating',
        artist: 'Dua Lipa',
        album: 'Future Nostalgia',
        imageUrl: 'https://i.scdn.co/image/ab67616d0000b273bd26ede1ae69327010d49946',
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
        category: 'Pop'
    }
];

exports.getAllTracks = async (req, res) => {
    try {
        if (db) {
            const snapshot = await db.collection('tracks').get();
            const tracks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            // If DB is empty, return mock data? Or maybe user wants to see empty state?
            // Let's mix: if empty, return mock data for demo purposes?
            if (tracks.length === 0) {
                return res.json(MOCK_TRACKS); // Fallback for demo
            }
            return res.json(tracks);
        } else {
            // Mock mode
            res.json(MOCK_TRACKS);
        }
    } catch (error) {
        console.error("Error fetching tracks:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};
exports.createTrack = async (req, res) => {
    try {
        const { title, artist, category, imageUrl, audioUrl } = req.body;

        if (!title || !artist || !category || !imageUrl || !audioUrl) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const newTrack = {
            title,
            artist,
            category,
            imageUrl,
            audioUrl,
            createdAt: new Date().toISOString()
        };

        if (db) {
            const docRef = await db.collection('tracks').add(newTrack);
            res.status(201).json({ id: docRef.id, ...newTrack });
        } else {
            // Mock mode
            newTrack.id = String(MOCK_TRACKS.length + 1);
            MOCK_TRACKS.push(newTrack);
            console.log("Mock Track Created:", newTrack);
            res.status(201).json(newTrack);
        }
    } catch (error) {
        console.error("Error creating track:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};
