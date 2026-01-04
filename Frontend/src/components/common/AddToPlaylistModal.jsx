import React, { useEffect, useState } from 'react';
import { API_URL } from '../../config/api';
import { authenticatedFetch } from '../../utils/auth';

const AddToPlaylistModal = ({ track, onClose }) => {
    const [playlists, setPlaylists] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPlaylists = async () => {
            try {
                const res = await authenticatedFetch(`${API_URL}/api/playlists/my`);
                if (res.ok) {
                    const data = await res.json();
                    setPlaylists(data);
                }
            } catch (err) {
                console.error("Error fetching playlists", err);
            } finally {
                setLoading(false);
            }
        };
        fetchPlaylists();
    }, []);

    const handleAddToPlaylist = async (playlistId) => {
        try {
            const res = await authenticatedFetch(`${API_URL}/api/playlists/${playlistId}/tracks`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ track })
            });
            if (res.ok) {
                alert(`Added to playlist!`);
                onClose();
            } else {
                const data = await res.json();
                alert(data.message || "Failed to add to playlist.");
            }
        } catch (err) {
            console.error("Error adding to playlist", err);
            alert("An error occurred.");
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-gray-800 rounded-xl p-6 w-full max-w-sm border border-white/10 shadow-2xl" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-white">Add to Playlist</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                <div className="mb-4 flex items-center gap-3 bg-white/5 p-3 rounded-lg">
                    <img src={track.imageUrl} alt={track.title} className="w-12 h-12 rounded object-cover" />
                    <div className="overflow-hidden">
                        <p className="text-white font-medium truncate">{track.title}</p>
                        <p className="text-gray-400 text-sm truncate">{track.artist}</p>
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-4 text-gray-400">Loading playlists...</div>
                ) : (
                    <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                        {playlists.map(p => (
                            <button
                                key={p.id}
                                onClick={() => handleAddToPlaylist(p.id)}
                                className="w-full text-left px-4 py-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors flex items-center gap-3 text-white"
                            >
                                <div className="w-8 h-8 bg-indigo-500 rounded flex items-center justify-center text-xs font-bold">{p.name[0]}</div>
                                <span className="truncate flex-1">{p.name}</span>
                                <span className="text-gray-400 text-xs">{p.tracks?.length || 0} songs</span>
                            </button>
                        ))}
                        {playlists.length === 0 && (
                            <p className="text-center text-gray-500 py-4">No playlists found. Create one in the sidebar!</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AddToPlaylistModal;
