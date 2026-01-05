import React, { useEffect, useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import Layout from '../../components/layout/Layout';
import { useAudio } from '../../context/AudioContext';
import { useLikes } from '../../hooks/useLikes';
import { API_URL } from '../../config/api';
import { authenticatedFetch } from '../../utils/auth';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import AddToPlaylistModal from '../../components/common/AddToPlaylistModal';

const Home = () => {
    const navigate = useNavigate();
    const [tracks, setTracks] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [trackToAdd, setTrackToAdd] = useState(null);
    const { playTrack, playPlaylist } = useAudio();
    const { likedTrackIds, toggleLike } = useLikes();

    useEffect(() => {
        const controller = new AbortController();
        let isMounted = true;

        const fetchData = async () => {
            try {
                // Fetch both endpoints in parallel with abort signal
                const [tracksRes, catRes] = await Promise.all([
                    authenticatedFetch(`${API_URL}/api/tracks`, { signal: controller.signal }),
                    authenticatedFetch(`${API_URL}/api/categories`, { signal: controller.signal })
                ]);

                // Guard: skip state updates if unmounted
                if (!isMounted) return;

                if (tracksRes.ok) {
                    const tracksData = await tracksRes.json();
                    if (Array.isArray(tracksData)) {
                        setTracks(tracksData);
                    } else {
                        toast.error("Invalid tracks data format");
                    }
                } else {
                    toast.error("Failed to load tracks");
                }

                if (catRes.ok) {
                    const catData = await catRes.json();
                    if (Array.isArray(catData)) {
                        setCategories(catData);
                    } else {
                        toast.error("Invalid categories data format");
                    }
                } else {
                    toast.error("Failed to load categories");
                }
            } catch (error) {
                // Don't show error if it was an intentional abort
                if (error.name === 'AbortError') return;
                if (!isMounted) return;

                console.error("Error fetching data:", error);
                toast.error("Failed to load data. Please check your connection.");
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        fetchData();

        // Cleanup: abort requests and mark as unmounted
        return () => {
            isMounted = false;
            controller.abort();
        };
    }, []);

    const handlePlayFavorites = async () => {
        try {
            const res = await authenticatedFetch(`${API_URL}/api/playlists/liked`);
            if (res.ok) {
                const data = await res.json();
                if (data.tracks && data.tracks.length > 0) {
                    playPlaylist(data.tracks);
                    toast.success("Playing Liked Songs");
                } else {
                    toast("You haven't liked any songs yet!", { icon: '🎵' });
                }
            }
        } catch (error) {
            console.error("Play favorites failed", error);
        }
    };

    return (
        <Layout>
            {/* Hero Section */}
            <div className="mb-12 rounded-2xl bg-gradient-to-r from-purple-800 to-indigo-900 p-10 shadow-2xl relative overflow-hidden">
                <div className="relative z-10">
                    <h2 className="text-4xl font-extrabold mb-4">Musicstreamz</h2>
                    <p className="text-indigo-200 text-lg mb-6 max-w-lg">Discover the best new tracks and podcasts tailored just for you. updated daily.</p>
                    <button
                        onClick={handlePlayFavorites}
                        className="bg-green-500 hover:bg-green-400 text-black font-bold py-3 px-8 rounded-full transition-transform transform hover:scale-105 shadow-lg"
                    >
                        Play Favorites
                    </button>
                </div>
                {/* Decorative Circle */}
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
            </div>

            {/* ERROR / STATUS LOGGING ON SCREEN */}
            {(tracks.length === 0 && !loading) && (
                <div className="bg-red-500/20 border border-red-500 text-white p-4 mb-8 rounded">
                    Warning: No tracks loaded. Is backend running on port 5000? Check Console.
                </div>
            )}

            {/* Categories */}
            <section className="mb-12">
                <h3 className="text-2xl font-bold mb-6 border-l-4 border-green-500 pl-4">Browse Categories</h3>
                {loading ? (
                    <LoadingSpinner />
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                        {categories.map((cat) => (
                            <div key={cat.id} onClick={() => navigate(`/search?q=${encodeURIComponent(cat.name)}`)} className="group relative rounded-xl overflow-hidden cursor-pointer aspect-square shadow-lg transition-transform hover:-translate-y-1">
                                <img src={cat.imageUrl} alt={cat.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-4">
                                    <span className="font-bold text-lg">{cat.name}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {/* Recently Played */}
            {(() => {
                const recentHistory = JSON.parse(localStorage.getItem('musicstreamz_history') || '[]');
                if (recentHistory.length === 0) return null;

                return (
                    <section className="mb-12">
                        <h3 className="text-2xl font-bold mb-6 border-l-4 border-yellow-500 pl-4">Jump Back In</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                            {recentHistory.slice(0, 6).map((track) => (
                                <div key={track.id} onClick={() => playTrack(track)} className="group relative rounded-xl overflow-hidden cursor-pointer aspect-square shadow-lg hover:bg-white/10 bg-white/5 transition-colors">
                                    <div className="relative w-full h-full">
                                        <img src={track.imageUrl} alt={track.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <button className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center shadow-lg transform scale-0 group-hover:scale-100 transition-transform delay-100">
                                                <svg className="w-5 h-5 text-black ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                                            </button>
                                        </div>
                                    </div>
                                    <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/90 to-transparent">
                                        <h4 className="font-bold truncate text-sm text-white">{track.title}</h4>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                );
            })()}

            {/* Featured Tracks */}
            <section>
                <h3 className="text-2xl font-bold mb-6 border-l-4 border-green-500 pl-4">Featured Tracks</h3>
                {loading ? (
                    <LoadingSpinner />
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {tracks.map((track) => (
                            <div key={track.id} onClick={() => playTrack(track)} className="bg-white/5 p-4 rounded-xl hover:bg-white/10 transition-colors shadow-lg group cursor-pointer relative">
                                <div className="relative mb-4 overflow-hidden rounded-lg aspect-square">
                                    <img src={track.imageUrl} alt={track.title} className="w-full h-full object-cover shadow-md group-hover:scale-105 transition-transform duration-300" />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <button className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center shadow-lg transform scale-0 group-hover:scale-100 transition-transform delay-100">
                                            <svg className="w-5 h-5 text-black ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                                        </button>
                                    </div>
                                </div>
                                <h4 className="font-bold truncate text-lg">{track.title}</h4>
                                <p className="text-sm text-gray-400 truncate">{track.artist}</p>
                                <p className="text-xs text-gray-500 mt-2 bg-white/5 inline-block px-2 py-1 rounded-full">{track.category}</p>
                                <button
                                    onClick={(e) => toggleLike(e, track)}
                                    className="absolute top-2 left-2 p-2 bg-black/50 hover:bg-black/80 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                    title={likedTrackIds.has(track.id) ? "Unlike" : "Like"}
                                >
                                    <svg className={`w-5 h-5 ${likedTrackIds.has(track.id) ? 'text-green-500 fill-current' : 'text-white'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                                </button>
                                <button
                                    onClick={(e) => { e.stopPropagation(); setTrackToAdd(track); }}
                                    className="absolute top-2 right-2 p-2 bg-black/50 hover:bg-black/80 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                    title="Add to Playlist"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </section>

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

export default Home;
