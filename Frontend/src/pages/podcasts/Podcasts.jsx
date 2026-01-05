import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import AddToPlaylistModal from '../../components/common/AddToPlaylistModal';
import { useLikes } from '../../hooks/useLikes';
import { Toaster } from 'react-hot-toast';
import { API_URL } from '../../config/api';
import { authenticatedFetch } from '../../utils/auth';

const Podcasts = () => {
    const [podcasts, setPodcasts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [trackToAdd, setTrackToAdd] = useState(null);
    const { likedTrackIds, toggleLike } = useLikes();
    const navigate = useNavigate();
    const [likedSongs, setLikedSongs] = useState([]); // Added likedSongs state

    useEffect(() => {
        const fetchPodcasts = async () => {
            try {
                const res = await authenticatedFetch(`${API_URL}/api/podcasts`);
                if (!res.ok) throw new Error('Failed to fetch podcasts');
                const data = await res.json();
                setPodcasts(data);
            } catch (error) {
                console.error("Error fetching podcasts:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchPodcasts();
    }, []);
    return (
        <Layout>
            <div className="mb-8">
                <h1 className="text-4xl font-black text-white mb-2">Podcasts</h1>
                <p className="text-gray-400">Explore trending shows and episodes</p>
            </div>

            {loading ? (
                <div className="text-white">Loading Podcasts...</div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                    {podcasts.map((podcast) => (
                        <div
                            key={podcast.id}
                            onClick={() => navigate(`/podcast/${podcast.id}`)}
                            className="bg-white/5 p-4 rounded-xl hover:bg-white/10 transition-colors shadow-lg group cursor-pointer relative"
                        >
                            <div className="relative mb-4 overflow-hidden rounded-lg aspect-square">
                                <img
                                    src={podcast.imageUrl}
                                    alt={podcast.title}
                                    className="w-full h-full object-cover shadow-md group-hover:scale-105 transition-transform duration-300"
                                    onError={(e) => { e.target.src = 'https://placehold.co/400?text=Podcast'; }}
                                />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <div className="bg-green-500 text-black rounded-full p-3 shadow-lg transform scale-90 group-hover:scale-100 transition-transform">
                                        <svg className="w-8 h-8 pl-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                                    </div>
                                </div>
                            </div>
                            <h4 className="font-bold truncate text-lg text-white">{podcast.title}</h4>
                            <p className="text-sm text-gray-400 truncate">{podcast.host}</p>
                            <span className="text-xs text-green-500 font-medium bg-green-500/10 px-2 py-0.5 rounded mt-2 inline-block">
                                {podcast.category}
                            </span>
                            <button
                                onClick={(e) => toggleLike(e, { ...podcast, artist: podcast.host })} // Adapt podcast to track shape
                                className="absolute top-2 left-2 p-2 bg-black/50 hover:bg-black/80 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                title={likedTrackIds.has(podcast.id) ? "Unlike" : "Like"}
                            >
                                <svg className={`w-5 h-5 ${likedTrackIds.has(podcast.id) ? 'text-green-500 fill-current' : 'text-white'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    // Inject a default duration so it doesn't show NaN
                                    setTrackToAdd({ ...podcast, artist: podcast.host, duration: 0 });
                                }}
                                className="absolute top-2 right-2 p-2 bg-black/50 hover:bg-black/80 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                title="Add to Playlist"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {trackToAdd && (
                <AddToPlaylistModal
                    track={trackToAdd}
                    onClose={() => setTrackToAdd(null)}
                />
            )}
            <Toaster position="bottom-right" />
        </Layout>
    );
};

export default Podcasts;
