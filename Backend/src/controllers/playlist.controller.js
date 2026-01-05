const { db } = require('../config/firebase');

// Helper to check if DB is available
const isDbAvailable = () => !!db;

exports.createPlaylist = async (req, res) => {
    try {
        const { name, description } = req.body;
        const userId = req.user.uid; // From auth middleware

        if (!name) {
            return res.status(400).json({ message: 'Playlist name is required' });
        }

        const newPlaylist = {
            name,
            description: description || '',
            ownerId: userId,
            imageUrl: '', // Will be a placeholder or user uploaded in future
            tracks: [],
            createdAt: new Date().toISOString()
        };

        if (isDbAvailable()) {
            const docRef = await db.collection('playlists').add(newPlaylist);
            // Return the created object with ID
            return res.status(201).json({ id: docRef.id, ...newPlaylist });
        } else {
            // Fallback for no DB connection (should rarely happen in prod)
            console.warn("DB not available, returning mock response");
            return res.status(201).json({ id: 'temp-' + Date.now(), ...newPlaylist });
        }
    } catch (error) {
        console.error("Create Playlist Error:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.getUserPlaylists = async (req, res) => {
    try {
        const userId = req.user.uid;

        if (isDbAvailable()) {
            const snapshot = await db.collection('playlists')
                .where('ownerId', '==', userId)
                .get();

            const playlists = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            return res.json(playlists);
        }

        return res.json([]);
    } catch (error) {
        console.error("Get Playlists Error:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.getPlaylistById = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.uid;

        // Special case for "Liked Songs" virtual playlist
        if (id === 'liked') {
            let likedTracks = [];
            if (isDbAvailable()) {
                const snapshot = await db.collection('users').doc(userId).collection('loved').get();
                likedTracks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            }
            return res.json({
                id: 'liked',
                name: 'Liked Songs',
                ownerId: userId,
                imageUrl: 'https://placehold.co/400/indigo/white?text=Liked',
                description: 'Your favorite tracks',
                isSystem: true,
                tracks: likedTracks // Return actual tracks instead of nothing
            });
        }

        if (isDbAvailable()) {
            const doc = await db.collection('playlists').doc(id).get();
            if (!doc.exists) {
                return res.status(404).json({ message: 'Playlist not found' });
            }

            const playlist = doc.data();

            // Security Check: Only owner can view (or public later)
            if (playlist.ownerId !== userId) {
                return res.status(403).json({ message: 'Unauthorized access to this playlist' });
            }

            return res.json({ id: doc.id, ...playlist });
        }

        return res.status(404).json({ message: 'Playlist not found (DB Offline)' });

    } catch (error) {
        console.error("Get Playlist Error:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.updatePlaylistDetails = async (req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body;
        const userId = req.user.uid;

        if (id === 'liked') return res.status(403).json({ message: 'Cannot edit default Liked Songs playlist' });

        if (isDbAvailable()) {
            const ref = db.collection('playlists').doc(id);
            const doc = await ref.get();

            if (!doc.exists) return res.status(404).json({ message: 'Playlist not found' });

            if (doc.data().ownerId !== userId) {
                return res.status(403).json({ message: 'Unauthorized' });
            }

            // Simple update
            await ref.update({ name });
            return res.json({ message: 'Playlist updated', name });
        }

        res.status(500).json({ message: 'DB Error' });
    } catch (error) {
        console.error("Update Playlist Error:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.deletePlaylist = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.uid;

        if (id === 'liked') return res.status(403).json({ message: 'Cannot delete default Liked Songs playlist' });

        if (isDbAvailable()) {
            const ref = db.collection('playlists').doc(id);
            const doc = await ref.get();

            if (!doc.exists) return res.status(404).json({ message: 'Playlist not found' });

            if (doc.data().ownerId !== userId) {
                return res.status(403).json({ message: 'Unauthorized' });
            }

            await ref.delete();
            return res.json({ message: 'Playlist deleted' });
        }

        res.status(500).json({ message: 'DB Error' });
    } catch (error) {
        console.error("Delete Playlist Error:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.addTrackToPlaylist = async (req, res) => {
    try {
        const { id } = req.params;
        const { track } = req.body;
        const userId = req.user.uid;

        if (!track) return res.status(400).json({ message: 'Track data required' });

        if (id === 'liked') {
            if (isDbAvailable()) {
                const trackIdStr = String(track.id);
                const trackRef = db.collection('users').doc(userId).collection('loved').doc(trackIdStr);
                const doc = await trackRef.get();
                if (doc.exists) {
                    return res.status(400).json({ message: 'Track already exists in Liked Songs' });
                }
                await trackRef.set(track);
                return res.json({ message: 'Track added to Liked Songs', track });
            } else {
                return res.status(503).json({ message: 'Database unavailable for Liked Songs' });
            }
        }

        if (isDbAvailable()) {
            const ref = db.collection('playlists').doc(id);
            const doc = await ref.get();

            if (!doc.exists) return res.status(404).json({ message: 'Playlist not found' });
            if (doc.data().ownerId !== userId) return res.status(403).json({ message: 'Unauthorized' });

            const data = doc.data();
            const currentTracks = data.tracks || [];

            // Normalize ID for check
            const incomingId = String(track.id);
            if (currentTracks.some(t => String(t.id) === incomingId)) {
                return res.status(400).json({ message: 'Track already exists in this playlist' });
            }

            const updatedTracks = [...currentTracks, track];
            await ref.update({ tracks: updatedTracks });
            return res.json({ message: 'Track added', tracks: updatedTracks });
        }
        res.status(500).json({ message: 'DB Error' });
    } catch (error) {
        console.error("Add Track Error:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.removeTrackFromPlaylist = async (req, res) => {
    try {
        const { id, trackId } = req.params;
        const userId = req.user.uid;

        if (id === 'liked') {
            if (isDbAvailable()) {
                await db.collection('users').doc(userId).collection('loved').doc(String(trackId)).delete();
                return res.json({ message: 'Track removed from Liked Songs', trackId });
            } else {
                return res.status(503).json({ message: 'Database unavailable for Liked Songs' });
            }
        }

        if (isDbAvailable()) {
            const ref = db.collection('playlists').doc(id);
            const doc = await ref.get();

            if (!doc.exists) return res.status(404).json({ message: 'Playlist not found' });
            if (doc.data().ownerId !== userId) return res.status(403).json({ message: 'Unauthorized' });

            const data = doc.data();
            const targetId = String(trackId);
            const updatedTracks = (data.tracks || []).filter(t => String(t.id) !== targetId);

            await ref.update({ tracks: updatedTracks });
            return res.json({ message: 'Track removed', tracks: updatedTracks });
        }
        res.status(500).json({ message: 'DB Error' });
    } catch (error) {
        console.error("Remove Track Error:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};

