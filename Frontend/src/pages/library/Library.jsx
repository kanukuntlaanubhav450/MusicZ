import React, { useEffect, useState } from 'react';
import toast, { Toaster } from 'react-hot-toast'; // Added toast for consistency
import Layout from '../../components/layout/Layout';
import { useAudio } from '../../context/AudioContext';
import { useLikes } from '../../hooks/useLikes';
import { API_URL } from '../../config/api';
import { authenticatedFetch } from '../../utils/auth';

const Library = () => {
    const [likedSongs, setLikedSongs] = useState([]); // Local state for the list
    const [loading, setLoading] = useState(true);
    const { playTrack, currentTrack, isPlaying } = useAudio();
    const { likedTrackIds, toggleLike } = useLikes(); // Use the hook for toggling

    useEffect(() => {
        const fetchLikedSongs = async () => {
            try {
                const res = await authenticatedFetch(`${API_URL}/api/library/loved`);
                if (!res.ok) throw new Error('Failed to fetch library');
                const data = await res.json();
                setLikedSongs(data);
            } catch (error) {
                console.error("Library Error:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchLikedSongs();
    }, []);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    return (
        <Layout>
            {/* Header Section */}
            <div className="flex items-end gap-6 mb-8">
                <div className="w-52 h-52 bg-gradient-to-br from-indigo-700 to-purple-800 shadow-2xl rounded-lg flex items-center justify-center">
                    <svg className="w-24 h-24 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" /></svg>
                </div>
                <div>
                    <p className="text-sm font-bold uppercase text-white">Playlist</p>
                    <h1 className="text-5xl font-black text-white mb-4">Liked Songs</h1>
                    <p className="text-gray-300 text-sm">
                        <span className="text-white font-bold">You</span> • {likedSongs.length} songs
                    </p>
                </div>
            </div>

            {/* Play Button */}
            <div className="mb-8">
                <button
                    onClick={() => likedSongs.length > 0 && playTrack(likedSongs[0])}
                    className="w-14 h-14 bg-green-500 rounded-full flex items-center justify-center hover:scale-105 transition shadow-lg"
                >
                    <svg className="w-8 h-8 text-black ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                </button>
            </div>

            {/* Songs List */}
            <div className="bg-black/20 rounded-lg p-6">
                {/* Table Header */}
                <div className="grid grid-cols-[16px_4fr_3fr_50px_1fr] gap-4 text-gray-400 border-b border-white/10 pb-2 mb-4 text-sm uppercase font-medium">
                    <span>#</span>
                    <span>Title</span>
                    <span>Album</span>
                    <span></span> {/* Heart Column */}
                    <span className="text-right">Time</span>
                </div>

                {loading ? (
                    <div className="text-white">Loading Library...</div>
                ) : (
                    likedSongs.map((track, index) => (
                        <div
                            key={track.id}
                            onClick={() => playTrack(track)}
                            className={`grid grid-cols-[16px_4fr_3fr_50px_1fr] gap-4 items-center p-3 rounded-md hover:bg-white/10 transition cursor-pointer group ${currentTrack?.id === track.id ? 'text-green-500' : 'text-gray-300'}`}
                        >
                            <span className="text-sm">
                                {currentTrack?.id === track.id && isPlaying ? (
                                    <img src="https://open.spotifycdn.com/cdn/images/equaliser-animated-green.f93a2ef4.gif" alt="playing" className="w-4 h-4" />
                                ) : (
                                    <span className="group-hover:hidden">{index + 1}</span>
                                )}
                                <svg className="w-4 h-4 hidden group-hover:block text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                            </span>

                            <div className="flex items-center gap-4">
                                <img src={track.imageUrl} alt={track.title} className="w-10 h-10 rounded object-cover" />
                                <div>
                                    <p className={`font-medium ${currentTrack?.id === track.id ? 'text-green-500' : 'text-white'}`}>{track.title}</p>
                                    <p className="text-sm text-gray-400">{track.artist}</p>
                                </div>
                            </div>

                            <span className="text-sm text-gray-400 hover:text-white transition">{track.album || "Single"}</span>

                            {/* Heart Button */}
                            <button
                                onClick={(e) => {
                                    toggleLike(e, track);
                                    // Optional: Manually remove from local list for instant feedback, 
                                    // but hook optimistic update handles the icon state at least.
                                }}
                                className="text-gray-400 hover:text-green-500 focus:outline-none"
                                title={likedTrackIds.has(track.id) ? "Unlike" : "Like"}
                            >
                                <svg className={`w-5 h-5 ${likedTrackIds.has(track.id) ? 'text-green-500 fill-current' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                            </button>

                            <span className="text-sm text-right font-mono">{formatTime(track.duration)}</span>
                        </div>
                    ))
                )}
            </div>
            <Toaster position="bottom-right" />
        </Layout>
    );
};

export default Library;
