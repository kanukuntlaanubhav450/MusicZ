const { db } = require('../config/firebase');

const MOCK_PODCASTS = [
    {
        id: '1',
        title: 'Tech Talk Daily',
        host: 'Jane Doe',
        imageUrl: 'https://placehold.co/400/purple/white?text=Tech+Talk',
        description: 'Daily tech news, analysis, and deep dives into the latest trends.',
        category: 'Technology',
        episodes: [
            { id: 'e1', title: 'The Future of AI', duration: 1200, audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', date: '2023-10-01' },
            { id: 'e2', title: 'Web Development Trends', duration: 900, audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', date: '2023-10-02' },
        ]
    },
    {
        id: '2',
        title: 'History Uncovered',
        host: 'John Smith',
        imageUrl: 'https://placehold.co/400/orange/white?text=History',
        description: 'Uncovering the secrets of the past, one civilization at a time.',
        category: 'History',
        episodes: [
            { id: 'e3', title: 'Ancient Rome', duration: 1500, audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3', date: '2023-09-15' },
            { id: 'e4', title: 'The Industrial Revolution', duration: 1800, audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3', date: '2023-09-22' },
        ]
    }
];

exports.getAllPodcasts = async (req, res) => {
    try {
        if (db) {
            const snapshot = await db.collection('podcasts').get();
            const podcasts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            if (podcasts.length === 0) return res.json(MOCK_PODCASTS);
            return res.json(podcasts);
        } else {
            res.json(MOCK_PODCASTS);
        }
    } catch (error) {
        console.error("Error fetching podcasts:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.getPodcastById = async (req, res) => {
    try {
        const { id } = req.params;
        if (db) {
            const doc = await db.collection('podcasts').doc(id).get();
            if (doc.exists) {
                return res.json({ id: doc.id, ...doc.data() });
            }
            // Fallback to mock if not found in DB (for hybrid testing)
            const mock = MOCK_PODCASTS.find(p => p.id === id);
            if (mock) return res.json(mock);
            return res.status(404).json({ message: 'Podcast not found' });
        } else {
            const podcast = MOCK_PODCASTS.find(p => p.id === id);
            if (!podcast) return res.status(404).json({ message: 'Podcast not found' });
            res.json(podcast);
        }
    } catch (error) {
        console.error("Error fetching podcast details:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};
