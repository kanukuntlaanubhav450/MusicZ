const { db } = require('../config/firebase');

// Re-using mock data from other controllers for search if DB is offline.
// Ideally, this should be imported from a shared mock file or the individual controllers.
// For simplicity in this mock phase, I will replicate a small subset or attempt to require them.
// But requiring them might not work if they don't export the DATA.
// So I will define a search function that tries to use Firestore keys.

// MOCK DATA (Synced with track.controller.js)
const MOCK_TRACKS = [
    {
        id: 'mock-1',
        title: 'Chill Vibes',
        artist: 'SoundHelix',
        category: 'Electronic',
        imageUrl: 'https://placehold.co/400/1a1a2e/e94560?text=Chill',
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
        ownerId: 'system',
        createdAt: '2024-01-01T00:00:00.000Z'
    },
    {
        id: 'mock-2',
        title: 'Summer Beats',
        artist: 'SoundHelix',
        category: 'Pop',
        imageUrl: 'https://placehold.co/400/16213e/0f3460?text=Summer',
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
        ownerId: 'system',
        createdAt: '2024-01-01T00:00:00.000Z'
    },
    {
        id: 'mock-3',
        title: 'Night Drive',
        artist: 'SoundHelix',
        category: 'Electronic',
        imageUrl: 'https://placehold.co/400/1b262c/0f4c75?text=Night',
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
        ownerId: 'system',
        createdAt: '2024-01-01T00:00:00.000Z'
    },
    {
        id: 'mock-4',
        title: 'Morning Coffee',
        artist: 'SoundHelix',
        category: 'Jazz',
        imageUrl: 'https://placehold.co/400/3c1642/886a92?text=Jazz',
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
        ownerId: 'system',
        createdAt: '2024-01-01T00:00:00.000Z'
    }
];

const MOCK_PODCASTS = [
    {
        id: '1',
        title: 'Tech Talk Daily',
        host: 'Jane Doe',
        imageUrl: 'https://placehold.co/400/purple/white?text=Tech+Talk',
        description: 'Daily tech news.',
        category: 'Technology',
        episodes: []
    },
    {
        id: '2',
        title: 'History Uncovered',
        host: 'John Smith',
        imageUrl: 'https://placehold.co/400/orange/white?text=History',
        description: 'Uncovering the secrets of the past.',
        category: 'History',
        episodes: []
    }
];

exports.search = async (req, res) => {
    try {
        const query = req.query.q ? req.query.q.toLowerCase() : '';

        if (!query) {
            return res.json({ tracks: [], podcasts: [] });
        }

        let tracks = [];
        let podcasts = [];

        // Try fetching from DB if initialized
        if (db) {
            try {
                const tracksSnapshot = await db.collection('tracks').get();
                const dbTracks = tracksSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

                // Merge: Start with mock tracks, then add DB tracks (DB entries override mocks with same ID)
                const trackMap = new Map();
                MOCK_TRACKS.forEach(t => trackMap.set(String(t.id), t));
                dbTracks.forEach(t => trackMap.set(String(t.id), t)); // DB overrides mock
                tracks = Array.from(trackMap.values());

                const podcastsSnapshot = await db.collection('podcasts').get();
                if (podcastsSnapshot.empty) {
                    podcasts = MOCK_PODCASTS;
                } else {
                    podcastsSnapshot.forEach(doc => podcasts.push({ id: doc.id, ...doc.data() }));
                }
            } catch (dbError) {
                const errorMsg = dbError?.message || 'Unknown database error';
                console.warn("Search: Database query failed, using only mock data.", errorMsg);
                if (process.env.NODE_ENV === 'development' && dbError?.stack) {
                    console.debug("Stack trace:", dbError.stack);
                }
                tracks = MOCK_TRACKS;
                podcasts = MOCK_PODCASTS;
            }
        } else {
            // No DB available, use mock data
            tracks = MOCK_TRACKS;
            podcasts = MOCK_PODCASTS;
        }

        // Filter all tracks (mock + db combined)
        const filteredTracks = tracks.filter(t =>
            (t.title && t.title.toLowerCase().includes(query)) ||
            (t.artist && t.artist.toLowerCase().includes(query)) ||
            (t.category && t.category.toLowerCase().includes(query))
        );

        const filteredPodcasts = podcasts.filter(p =>
            (p.title && p.title.toLowerCase().includes(query)) ||
            (p.host && p.host.toLowerCase().includes(query)) ||
            (p.category && p.category.toLowerCase().includes(query))
        );

        return res.json({ tracks: filteredTracks, podcasts: filteredPodcasts });

    } catch (error) {
        console.error("Search Error:", error);
        res.status(500).json({ message: 'Server Error', tracks: [], podcasts: [] });
    }
};
