import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import { useAudio } from '../../context/AudioContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ConfirmationModal from '../../components/common/ConfirmationModal';
import EditPlaylistModal from '../../components/common/EditPlaylistModal';

const PlaylistDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [playlist, setPlaylist] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const { playTrack, currentTrack, isPlaying } = useAudio();

    const fetchPlaylist = async () => {
        try {
            const res = await fetch(`http://localhost:5000/api/playlists/${id}`);
            if (!res.ok) throw new Error('Failed to fetch playlist');
            const data = await res.json();
            setPlaylist(data);
        } catch (error) {
            console.error("Error:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPlaylist();
    }, [id]);

    const handleDeletePlaylist = async () => {
        console.log("Attempting to delete playlist:", id);
        try {
            const res = await fetch(`http://localhost:5000/api/playlists/${id}`, { method: 'DELETE' });
            console.log("Delete response status:", res.status);
            if (res.ok) {
                console.log("Delete successful, redirecting...");
                window.location.href = '/';
            } else {
                const errData = await res.json();
                console.error("Delete failed:", errData);
                alert(`Failed to delete: ${errData.message || 'Unknown error'}`);
            }
        } catch (err) {
            console.error("Failed to delete", err);
            alert("Error deleting playlist. Check console.");
        }
    };

    const handleUpdatePlaylist = async (newName) => {
        // Optimistic Update: Update UI immediately
        const previousPlaylist = { ...playlist };
        // Replicate backend logic for placeholder image to show it instantly
        const optimisticImageUrl = `https://placehold.co/400/gray/white?text=${encodeURIComponent(newName)}`;

        setPlaylist(prev => ({
            ...prev,
            name: newName,
            imageUrl: optimisticImageUrl
        }));

        try {
            const res = await fetch(`http://localhost:5000/api/playlists/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newName })
            });

            if (res.ok) {
                const updatedData = await res.json();
                // Confirm with server data
                setPlaylist(prev => ({ ...prev, name: updatedData.name, imageUrl: updatedData.imageUrl || prev.imageUrl }));
            } else {
                // Revert on failure
                const errData = await res.json();
                alert(`Failed to update: ${errData.message}`);
                setPlaylist(previousPlaylist);
            }
        } catch (err) {
            console.error("Update failed", err);
            alert("Error updating playlist");
            setPlaylist(previousPlaylist);
        }
    };

    const handleRemoveTrack = async (e, trackId) => {
        e.stopPropagation();
        try {
            const res = await fetch(`http://localhost:5000/api/playlists/${id}/tracks/${trackId}`, {
                method: 'DELETE'
            });
            if (res.ok) {
                setPlaylist(prev => ({
                    ...prev,
                    tracks: prev.tracks.filter(t => t.id !== trackId)
                }));
            }
        } catch (err) {
            console.error("Failed to remove track", err);
        }
    };

    const handlePlayPlaylist = () => {
        if (playlist.tracks && playlist.tracks.length > 0) {
            playTrack(playlist.tracks[0]);
        }
    };

    if (loading) return <Layout><LoadingSpinner /></Layout>;
    if (!playlist) return <Layout><div className="text-white p-8">Playlist Not Found</div></Layout>;

    return (
        <Layout>
            <div className="flex flex-col md:flex-row items-end gap-8 mb-8 pb-8 border-b border-white/10 bg-gradient-to-b from-gray-800 to-transparent -mx-8 px-8 pt-8">
                <div className="w-52 h-52 shadow-2xl rounded-lg overflow-hidden flex-shrink-0 relative group">
                    {playlist.imageUrl && <img src={playlist.imageUrl} alt={playlist.name} className="w-full h-full object-cover" />}
                    {!playlist.imageUrl && <div className="w-full h-full bg-gray-700 flex items-center justify-center text-4xl">🎵</div>}
                </div>
                <div className="flex-1">
                    <span className="text-xs font-bold uppercase text-white tracking-wider">Playlist</span>
                    <h1 className="text-5xl md:text-7xl font-black text-white mb-4 mt-2">{playlist.name}</h1>
                    <p className="text-gray-300 font-medium mb-4">{playlist.description}</p>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                        <span className="font-bold text-white">Sannu</span> • {playlist.tracks.length} songs
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-6 mb-8">
                <button
                    onClick={handlePlayPlaylist}
                    className="w-14 h-14 bg-green-500 rounded-full flex items-center justify-center hover:scale-105 transition shadow-lg text-black"
                >
                    <svg className="w-7 h-7 pl-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                </button>

                {id !== 'liked' && (
                    <>
                        <button
                            onClick={() => setShowEditModal(true)}
                            className="text-gray-400 hover:text-white font-bold text-sm tracking-wider uppercase border border-gray-600 hover:border-white px-6 py-2 rounded-full transition-colors"
                        >
                            Edit
                        </button>
                        <button
                            onClick={() => setShowDeleteModal(true)}
                            className="text-gray-400 hover:text-red-500 font-bold text-sm tracking-wider uppercase border border-gray-600 hover:border-red-500 px-6 py-2 rounded-full transition-colors"
                        >
                            Delete Playlist
                        </button>
                    </>
                )}
            </div>

            <ConfirmationModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={handleDeletePlaylist}
                title="Delete Playlist?"
                message="Are you sure you want to delete this playlist? This action cannot be undone."
            />

            <EditPlaylistModal
                isOpen={showEditModal}
                onClose={() => setShowEditModal(false)}
                onSave={handleUpdatePlaylist}
                currentName={playlist ? playlist.name : ''}
            />

            {/* Tracks List */}
            <div className="space-y-2">
                <div className="grid grid-cols-[auto,1fr,auto] gap-4 px-4 py-2 text-gray-400 text-sm border-b border-white/10 uppercase tracking-wider">
                    <span className="w-8">#</span>
                    <span>Title</span>
                    <span className="flex items-center gap-2"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></span>
                </div>

                {playlist.tracks && playlist.tracks.length > 0 ? (
                    playlist.tracks.map((track, index) => (
                        <div
                            key={track.id}
                            onClick={() => playTrack(track)}
                            className="group grid grid-cols-[auto,1fr,auto] gap-4 px-4 py-3 rounded-md hover:bg-white/10 transition-colors cursor-pointer items-center"
                        >
                            <span className="w-8 text-gray-400 group-hover:text-white flex items-center justify-center">
                                {currentTrack?.id === track.id && isPlaying ? (
                                    <svg className="w-4 h-4 text-green-500 animate-pulse" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" /></svg>
                                ) : (
                                    <span className="group-hover:hidden">{index + 1}</span>
                                )}
                                <svg className="w-4 h-4 hidden group-hover:block text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                            </span>

                            <div className="flex items-center gap-4">
                                <img src={track.imageUrl} alt="" className="w-10 h-10 object-cover rounded shadow" />
                                <div>
                                    <h4 className={`font-medium ${currentTrack?.id === track.id ? 'text-green-500' : 'text-white'}`}>{track.title}</h4>
                                    <p className="text-sm text-gray-400 group-hover:text-white transition">{track.artist}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <button
                                    onClick={(e) => handleRemoveTrack(e, track.id)}
                                    className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                    title="Remove from playlist"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                </button>
                                <span className="text-gray-400 text-sm md:w-12 text-right">
                                    {Math.floor(track.duration / 60)}:{(track.duration % 60).toString().padStart(2, '0')}
                                </span>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                        <div className="bg-white/5 p-6 rounded-full mb-4">
                            <svg className="w-12 h-12 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" /></svg>
                        </div>
                        <p className="text-xl font-medium mb-2">This playlist is empty.</p>
                        <p className="text-sm text-gray-500 mb-6">Find some music to build your perfect collection.</p>
                        <button
                            onClick={() => navigate('/')}
                            className="bg-white text-black font-bold py-3 px-8 rounded-full hover:scale-105 transition-transform"
                        >
                            Browse Music
                        </button>
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default PlaylistDetail;
