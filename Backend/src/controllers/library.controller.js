const { db } = require('../config/firebase');

const isDbAvailable = () => !!db;

exports.getLovedTracks = async (req, res) => {
    try {
        const userId = req.user.uid;

        if (isDbAvailable()) {
            // Get from subcollection: users/{userId}/loved
            const snapshot = await db.collection('users').doc(userId).collection('loved').get();
            const tracks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            return res.json(tracks);
        }

        // Fallback or empty if no DB
        res.json([]);
    } catch (error) {
        console.error("Library Error:", error);
        res.status(500).json({ message: 'Server Error', tracks: [] });
    }
};

exports.toggleLove = async (req, res) => {
    try {
        const userId = req.user.uid;
        const { track } = req.body;

        if (!track || !track.id) {
            // If it's a DELETE request (unlike), we might just get ID in URL? 
            // The frontend sends POST for toggle or separate DELETE. 
            // Implementation plan said "toggleLove". Let's check frontend useLikes hook.
            // It sends POST with body { track } for like, and DELETE /tracks/:id for unlike.
            // Wait, library.routes.js only has POST /loved currently mapped to toggleLove.
            // Let's verify routes file again.
            return res.status(400).json({ message: 'Track data required' });
        }

        if (isDbAvailable()) {
            const userRef = db.collection('users').doc(userId);
            const trackRef = userRef.collection('loved').doc(track.id.toString());

            const doc = await trackRef.get();

            if (doc.exists) {
                // Unlike
                await trackRef.delete();
                return res.json({ message: 'Removed from Liked Songs', status: 'removed' });
            } else {
                // Like
                await trackRef.set(track);
                return res.json({ message: 'Added to Liked Songs', status: 'added' });
            }
        }

        res.status(500).json({ message: 'DB Error' });
    } catch (error) {
        console.error("Toggle Love Error:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};

