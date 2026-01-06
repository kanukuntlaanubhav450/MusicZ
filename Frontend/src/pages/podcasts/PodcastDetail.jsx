import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import { useAudio } from '../../context/AudioContext';
import AddToPlaylistModal from '../../components/common/AddToPlaylistModal';
import { API_URL } from '../../config/api';
import { authenticatedFetch } from '../../utils/auth';

const PodcastDetail = () => {
    const { id } = useParams();
    const [podcast, setPodcast] = useState(null);
    const [loading, setLoading] = useState(true);
    const [trackToAdd, setTrackToAdd] = useState(null);
    const { playPlaylist, currentTrack, isPlaying, isLoading } = useAudio();

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                const res = await authenticatedFetch(`${API_URL}/api/podcasts/${id}`);
                if (!res.ok) throw new Error('Failed to fetch podcast details');
                const data = await res.json();
                setPodcast(data);
            } catch (error) {
                console.error("Error:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDetails();
    }, [id]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}m ${secs}s`;
    };

    if (loading) return <Layout><div className="text-white p-8">Loading Podcast...</div></Layout>;
    if (!podcast) return <Layout><div className="text-white p-8">Podcast Not Found</div></Layout>;

    return (
        <Layout>
            {/* Header */}
            <div className="flex flex-col md:flex-row items-end gap-8 mb-8 pb-8 border-b border-white/10">
                <div className="w-52 h-52 shadow-2xl rounded-lg overflow-hidden flex-shrink-0">
                    <img src={podcast.imageUrl} alt={podcast.title} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1">
                    <span className="text-xs font-bold uppercase text-green-500 tracking-wider">Podcast</span>
                    <h1 className="text-4xl md:text-6xl font-black text-white mb-4 mt-2">{podcast.title}</h1>
                    <p className="text-xl text-gray-300 font-medium mb-4">Host: {podcast.host}</p>
                    <p className="text-gray-400 max-w-2xl text-sm leading-relaxed">{podcast.description}</p>
                </div>
            </div>

            {/* Episodes List */}
            <div>
                <h3 className="text-2xl font-bold mb-6 text-white">Episodes</h3>
                <div className="space-y-4">
                    {podcast.episodes && podcast.episodes.length > 0 ? (
                        podcast.episodes.map((episode, index) => (
                            <div
                                key={episode.id}
                                className="group bg-white/5 hover:bg-white/10 p-4 rounded-lg flex items-center justify-between transition-colors border border-transparent hover:border-white/10"
                            >
                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={() => {
                                            // Prepare all episodes with podcast metadata for the queue
                                            const normalizedEpisodes = podcast.episodes.map(ep => ({
                                                ...ep,
                                                imageUrl: podcast.imageUrl,
                                                artist: podcast.host
                                            }));
                                            playPlaylist(normalizedEpisodes, index);
                                        }}
                                        className="w-10 h-10 bg-white text-black rounded-full flex items-center justify-center hover:scale-105 transition shadow-lg flex-shrink-0"
                                        disabled={isLoading && currentTrack?.id === episode.id}
                                    >
                                        {isLoading && currentTrack?.id === episode.id ? (
                                            <svg className="animate-spin h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                        ) : currentTrack?.id === episode.id && isPlaying ? (
                                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /></svg>
                                        ) : (
                                            <svg className="w-5 h-5 ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                                        )}
                                    </button>
                                    <div>
                                        <h4 className={`font-bold text-lg ${currentTrack?.id === episode.id ? 'text-green-500' : 'text-white'}`}>{episode.title}</h4>
                                        <p className="text-sm text-gray-400">{episode.date} • {formatTime(episode.duration)}</p>
                                    </div>
                                </div>
                                <div className="text-gray-500 text-sm flex items-center gap-4">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setTrackToAdd({ ...episode, imageUrl: podcast.imageUrl, artist: podcast.host });
                                        }}
                                        className="text-gray-400 hover:text-white"
                                        title="Add to Playlist"
                                    >
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                                    </button>
                                    <span className="px-3 py-1 border border-gray-600 rounded-full text-xs hover:border-white hover:text-white transition cursor-pointer hidden md:block">Details</span>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-gray-400">No episodes available yet.</p>
                    )}
                </div>
            </div>

            {trackToAdd && (
                <AddToPlaylistModal
                    track={trackToAdd}
                    onClose={() => setTrackToAdd(null)}
                />
            )}
        </Layout>
    );
};

export default PodcastDetail;
