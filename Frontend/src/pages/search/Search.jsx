import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import { useAudio } from '../../context/AudioContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import AddToPlaylistModal from '../../components/common/AddToPlaylistModal';
import { API_URL } from '../../config/api';
import { authenticatedFetch } from '../../utils/auth';

const Search = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const query = searchParams.get('q') || '';
    const [searchTerm, setSearchTerm] = useState(query);
    const [results, setResults] = useState({ tracks: [], podcasts: [] });
    const [loading, setLoading] = useState(false);
    const [trackToAdd, setTrackToAdd] = useState(null);
    const { playPlaylist } = useAudio();

    // Debounce search term
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchTerm) {
                setSearchParams({ q: searchTerm });
            } else {
                setSearchParams({});
                setResults({ tracks: [], podcasts: [] });
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [searchTerm, setSearchParams]);

    // Fetch results when URL query changes
    useEffect(() => {
        const fetchResults = async () => {
            if (!query) {
                setResults({ tracks: [], podcasts: [] });
                return;
            }

            setLoading(true);
            try {
                const res = await authenticatedFetch(`${API_URL}/api/search?q=${encodeURIComponent(query)}`);
                if (!res.ok) throw new Error('Search failed');
                const data = await res.json();
                setResults(data);
            } catch (error) {
                console.error("Search error:", error);
                // Fallback to empty results on error
                setResults({ tracks: [], podcasts: [] });
            } finally {
                setLoading(false);
            }
        };

        fetchResults();
    }, [query]);

    return (
        <Layout>
            <div className="mb-8">
                <input
                    type="text"
                    placeholder="Search for songs, artists, or podcasts..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full md:w-1/2 lg:w-1/3 px-6 py-4 bg-white/10 border border-white/10 rounded-full text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white/20 transition-all text-lg"
                    autoFocus
                />
            </div>

            {query && <h2 className="text-3xl font-bold mb-8">Search Results for "{query}"</h2>}

            {loading ? (
                <LoadingSpinner />
            ) : (
                <>
                    {results.tracks.length === 0 && results.podcasts.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                            <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                            <p className="text-xl font-medium">No results found for "{query}"</p>
                            <p className="text-sm mt-2">Try searching for "Rock", "Pop", or specific track names.</p>
                        </div>
                    )}

                    {results.tracks.length > 0 && (
                        <section className="mb-12">
                            <h3 className="text-2xl font-bold mb-6 border-l-4 border-green-500 pl-4">Tracks</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {results.tracks.map((track, index) => (
                                    <div key={track.id} onClick={() => playPlaylist(results.tracks, index)} className="bg-white/5 p-4 rounded-xl hover:bg-white/10 transition-colors shadow-lg group cursor-pointer relative">
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
                                        <button
                                            onClick={(e) => { e.stopPropagation(); setTrackToAdd(track); }}
                                            className="absolute top-2 right-2 p-2 bg-black/50 hover:bg-black/80 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                            title="Add to Playlist"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* ... Podcasts ... */}
                    {results.podcasts.length > 0 && (
                        <section>
                            <h3 className="text-2xl font-bold mb-6 border-l-4 border-blue-500 pl-4">Podcasts</h3>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                                {results.podcasts.map((podcast, index) => (
                                    <div key={podcast.id} onClick={() => playPlaylist(results.podcasts, index)} className="bg-white/5 p-4 rounded-xl hover:bg-white/10 transition-colors shadow-lg group cursor-pointer relative">
                                        <div className="relative mb-4 overflow-hidden rounded-lg aspect-square">
                                            <img
                                                src={podcast.imageUrl}
                                                alt={podcast.title}
                                                className="w-full h-full object-cover shadow-md group-hover:scale-105 transition-transform duration-300"
                                                onError={(e) => { e.target.style.display = 'none'; console.error("Img Error:", podcast.imageUrl); }}
                                            />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <button className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center shadow-lg transform scale-0 group-hover:scale-100 transition-transform delay-100">
                                                    <svg className="w-5 h-5 text-black ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                                                </button>
                                            </div>
                                        </div>
                                        <h4 className="font-bold truncate text-lg">{podcast.title}</h4>
                                        <p className="text-sm text-gray-400 truncate">{podcast.host}</p>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                // Normalize data for the modal (podcasts use 'host', tracks use 'artist')
                                                setTrackToAdd({ ...podcast, artist: podcast.host });
                                            }}
                                            className="absolute top-2 right-2 p-2 bg-black/50 hover:bg-black/80 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                            title="Add to Playlist"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {trackToAdd && (
                        <AddToPlaylistModal
                            track={trackToAdd}
                            onClose={() => setTrackToAdd(null)}
                        />
                    )}
                </>
            )}
        </Layout>
    );
};


export default Search;
