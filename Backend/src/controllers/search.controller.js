const { db } = require('../config/firebase');

// Re-using mock data from other controllers for search if DB is offline.
// Ideally, this should be imported from a shared mock file or the individual controllers.
// For simplicity in this mock phase, I will replicate a small subset or attempt to require them.
// But requiring them might not work if they don't export the DATA.
// So I will define a search function that tries to use Firestore keys.

// MOCK DATA (Synced with other controllers for consistent search results)
const MOCK_TRACKS = [
    { id: '1', title: 'Midnight City', artist: 'M83', category: 'Electronic', imageUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', duration: 320 },
    { id: '2', title: 'Starlight', artist: 'Muse', category: 'Rock', imageUrl: 'https://images.unsplash.com/photo-1493225255756-d9584f8606e9', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', duration: 240 },
    { id: '3', title: 'Get Lucky', artist: 'Daft Punk', category: 'Pop', imageUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3', duration: 248 },
    { id: '4', title: 'Blinding Lights', artist: 'The Weeknd', category: 'Pop', imageUrl: 'https://images.unsplash.com/photo-1514525253440-b393452e8d26', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3', duration: 200 }
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

        let resultsFoundInDb = false;
        let tracks = [];
        let podcasts = [];

        // Try fetching from DB if initialized
        if (db) {
            try {
                const tracksSnapshot = await db.collection('tracks').get();

                tracksSnapshot.forEach(doc => tracks.push({ id: doc.id, ...doc.data() }));

                const podcastsSnapshot = await db.collection('podcasts').get();
                if (podcastsSnapshot.empty) {
                    podcasts = MOCK_PODCASTS;
                } else {
                    podcastsSnapshot.forEach(doc => podcasts.push({ id: doc.id, ...doc.data() }));
                }

                resultsFoundInDb = true;

                // Validate that we actually got some data (optional, but good if DB is empty)
                // If DB is empty, we might still want to show mock data for demo purposes? 
                // For now, let's assume if DB calls work, we use that data even if empty.
            } catch (dbError) {
                console.warn("Search: Database query failed, falling back to mock data.", dbError);
                // Fallback to mock data loop below
                resultsFoundInDb = false;
            }
        }

        if (resultsFoundInDb) {
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
        } else {
            // Fallback / Mock Data Logic
            console.log("Search: Using Mock Data");

            const filteredTracks = MOCK_TRACKS.filter(t =>
                t.title.toLowerCase().includes(query) ||
                t.artist.toLowerCase().includes(query) ||
                t.category.toLowerCase().includes(query)
            );

            const filteredPodcasts = MOCK_PODCASTS.filter(p =>
                p.title.toLowerCase().includes(query) ||
                p.host.toLowerCase().includes(query) ||
                p.category.toLowerCase().includes(query)
            );

            return res.json({ tracks: filteredTracks, podcasts: filteredPodcasts });
        }

    } catch (error) {
        console.error("Search Error:", error);
        res.status(500).json({ message: 'Server Error', tracks: [], podcasts: [] });
    }
};
