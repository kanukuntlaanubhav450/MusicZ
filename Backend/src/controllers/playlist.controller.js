const { db } = require('../config/firebase');

// In-memory storage for mock mode
let MOCK_PLAYLISTS = [
    {
        id: 'liked',
        name: 'Liked Songs',
        ownerId: 'user1',
        imageUrl: 'https://placehold.co/400/indigo/white?text=Liked',
        description: 'Your favorite tracks',
        tracks: []
    },
    {
        id: 'p1',
        name: 'My Awesome Mix',
        ownerId: 'user1',
        imageUrl: 'https://placehold.co/400/blue/white?text=Mix',
        description: 'Created by User',
        tracks: [
            { id: '1', title: 'Midnight City', artist: 'M83', category: 'Electronic', imageUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', duration: 320 }
        ]
    }
];

exports.updatePlaylistDetails = async (req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body;

        if (!name) {
            return res.status(400).json({ message: 'Playlist name is required' });
        }

        if (id === 'liked') {
            return res.status(403).json({ message: 'Cannot edit default Liked Songs playlist' });
        }

        if (db) {
            const ref = db.collection('playlists').doc(id);
            const doc = await ref.get();
            if (doc.exists) {
                // If it's a placeholder image, update it to match the new name
                // If we assume all images are placeholders for now:
                const newImageUrl = 'https://placehold.co/400/gray/white?text=' + encodeURIComponent(name);

                await ref.update({
                    name,
                    imageUrl: newImageUrl
                });
                return res.json({ message: 'Playlist updated', name, imageUrl: newImageUrl });
            }
        }

        // Mock
        const playlist = MOCK_PLAYLISTS.find(p => p.id === id);
        if (playlist) {
            playlist.name = name;
            // Update imageUrl text to match new name for consistency in mock
            playlist.imageUrl = 'https://placehold.co/400/gray/white?text=' + encodeURIComponent(name);
            return res.json({ message: 'Playlist updated', name, imageUrl: playlist.imageUrl }); // Return new mock image too
        }

        return res.status(404).json({ message: 'Playlist not found' });

    } catch (error) {
        console.error("Update Playlist Error:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.createPlaylist = async (req, res) => {
    try {
        const { name, description, userId } = req.body;
        const newPlaylist = {
            id: 'p' + Date.now(),
            name: name || 'New Playlist',
            description: description || '',
            ownerId: userId || 'user1',
            imageUrl: 'https://placehold.co/400/gray/white?text=' + encodeURIComponent(name || 'Playlist'),
            tracks: []
        };

        if (db) {
            await db.collection('playlists').doc(newPlaylist.id).set(newPlaylist);
        } else {
            MOCK_PLAYLISTS.push(newPlaylist);
        }

        res.status(201).json(newPlaylist);
    } catch (error) {
        console.error("Create Playlist Error:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.getUserPlaylists = async (req, res) => {
    try {
        const { userId } = req.query; // Mock: assume 'user1' if not provided

        if (db) {
            const snapshot = await db.collection('playlists').where('ownerId', '==', userId || 'user1').get();
            const playlists = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            return res.json(playlists);
        } else {
            res.json(MOCK_PLAYLISTS);
        }
    } catch (error) {
        console.error("Get Playlists Error:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.getPlaylistById = async (req, res) => {
    try {
        const { id } = req.params;

        if (db) {
            const doc = await db.collection('playlists').doc(id).get();
            if (doc.exists) {
                return res.json({ id: doc.id, ...doc.data() });
            }
        }

        // Fallback or Mock
        const playlist = MOCK_PLAYLISTS.find(p => p.id === id);
        if (playlist) return res.json(playlist);

        // If not found in mock array but it was "Liked Songs" request which is special
        if (id === 'liked') {
            // ensure it exists
            const liked = { id: 'liked', name: 'Liked Songs', tracks: [] };
            MOCK_PLAYLISTS.push(liked);
            return res.json(liked);
        }

        return res.status(404).json({ message: 'Playlist not found' });

    } catch (error) {
        console.error("Get Playlist Error:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.addTrackToPlaylist = async (req, res) => {
    try {
        const { id } = req.params;
        const { track } = req.body;

        if (!track) return res.status(400).json({ message: 'Track data required' });

        if (db) {
            // Firestore array union logic would go here
            // For now, simple read-modify-write
            const ref = db.collection('playlists').doc(id);
            const doc = await ref.get();
            if (doc.exists) {
                const data = doc.data();
                const currentTracks = data.tracks || [];

                // Check for duplicate
                const isDuplicate = currentTracks.some(t => t.id === track.id);
                if (isDuplicate) {
                    return res.status(400).json({ message: 'Track already exists in this playlist' });
                }

                const updatedTracks = [...currentTracks, track];
                await ref.update({ tracks: updatedTracks });
                return res.json({ message: 'Track added', tracks: updatedTracks });
            }
        }

        // Mock
        const playlist = MOCK_PLAYLISTS.find(p => p.id === id);
        if (playlist) {
            // Avoid duplicates
            if (playlist.tracks.find(t => t.id === track.id)) {
                return res.status(400).json({ message: 'Track already exists in this playlist' });
            }
            playlist.tracks.push(track);
            return res.json({ message: 'Track added', tracks: playlist.tracks });
        }

        return res.status(404).json({ message: 'Playlist not found' });

    } catch (error) {
        console.error("Add Track Error:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.removeTrackFromPlaylist = async (req, res) => {
    try {
        const { id, trackId } = req.params;

        if (db) {
            // Firestore logic
            const ref = db.collection('playlists').doc(id);
            const doc = await ref.get();
            if (doc.exists) {
                const data = doc.data();
                const updatedTracks = (data.tracks || []).filter(t => t.id !== trackId);
                await ref.update({ tracks: updatedTracks });
                return res.json({ message: 'Track removed', tracks: updatedTracks });
            }
        }

        // Mock
        const playlist = MOCK_PLAYLISTS.find(p => p.id === id);
        if (playlist) {
            playlist.tracks = playlist.tracks.filter(t => t.id !== trackId);
            return res.json({ message: 'Track removed', tracks: playlist.tracks });
        }

        return res.status(404).json({ message: 'Playlist not found' });

    } catch (error) {
        console.error("Remove Track Error:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.deletePlaylist = async (req, res) => {
    try {
        const { id } = req.params;
        console.log("Backend: Received delete request for:", id);

        // Protect "Liked Songs"
        if (id === 'liked') {
            console.log("Backend: Attempted to delete 'liked' playlist. blocked.");
            return res.status(403).json({ message: 'Cannot delete default Liked Songs playlist' });
        }

        if (db) {
            await db.collection('playlists').doc(id).delete();
            return res.json({ message: 'Playlist deleted' });
        }

        const index = MOCK_PLAYLISTS.findIndex(p => p.id === id);
        console.log("Backend: Found playlist at index:", index, "Current Playlists:", MOCK_PLAYLISTS.map(p => p.id));

        if (index !== -1) {
            MOCK_PLAYLISTS.splice(index, 1);
            console.log("Backend: Playlist removed. New count:", MOCK_PLAYLISTS.length);
            return res.json({ message: 'Playlist deleted' });
        }

        console.log("Backend: Playlist not found");
        return res.status(404).json({ message: 'Playlist not found' });
    } catch (error) {
        console.error("Delete Playlist Error:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};
