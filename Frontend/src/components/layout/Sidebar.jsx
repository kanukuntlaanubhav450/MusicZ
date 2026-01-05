import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { API_URL } from '../../config/api';
import { authenticatedFetch } from '../../utils/auth';
import { auth } from '../../services/firebase';
import { onAuthStateChanged } from 'firebase/auth';

const NavItem = ({ to, icon, label, active }) => (
    <Link
        to={to}
        className={`flex items-center gap-4 px-6 py-3 transition-colors duration-200 ${active
            ? 'text-white bg-white/10 border-r-4 border-green-500'
            : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
    >
        {icon}
        <span className="font-medium">{label}</span>
    </Link>
);

const Sidebar = ({ isOpen, onClose }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const [playlists, setPlaylists] = useState([]);
    const [userEmail, setUserEmail] = useState('');

    // Listen for auth state changes to get user email
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setUserEmail(user.email || '');
            } else {
                setUserEmail('');
            }
        });
        return () => unsubscribe();
    }, []);

    React.useEffect(() => {
        const fetchPlaylists = async () => {
            try {
                const res = await authenticatedFetch(`${API_URL}/api/playlists/my`);
                if (res.ok) {
                    const data = await res.json();
                    setPlaylists(data);
                }
            } catch (err) {
                console.error("Error fetching playlists", err);
            }
        };
        fetchPlaylists();
    }, []);

    const handleCreatePlaylist = async () => {
        const name = prompt("Enter playlist name:");
        if (!name) return;

        try {
            const res = await authenticatedFetch(`${API_URL}/api/playlists`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name })
            });
            if (res.ok) {
                const newPlaylist = await res.json();
                setPlaylists(prev => [...prev, newPlaylist]);
                navigate(`/playlist/${newPlaylist.id}`);
            }
        } catch (err) {
            console.error("Error creating playlist", err);
        }
    };

    return (
        <aside className={`
            w-64 bg-black h-screen fixed left-0 top-0 flex flex-col border-r border-white/10 z-30 transition-transform duration-300
            ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
        `}>
            <div className="p-6">
                <div className="flex items-center justify-between">
                    {/* Logo */}
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-green-400 to-green-600 bg-clip-text text-transparent cursor-pointer" onClick={() => navigate('/')}>
                        MusicStreamz
                    </h1>
                    <button className="md:hidden text-gray-400" onClick={onClose}>
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
                {/* User Email */}
                {userEmail && (
                    <p className="text-xs text-gray-400 mt-2 truncate" title={userEmail}>
                        {userEmail}
                    </p>
                )}
            </div>

            <nav className="flex-1 mt-6 overflow-y-auto">
                <div className="space-y-1">
                    <p className="px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Menu</p>
                    <ul>
                        <li>
                            <NavItem
                                to="/"
                                icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>}
                                label="Home"
                                active={location.pathname === '/'}
                            />
                        </li>
                        <li>
                            <NavItem
                                to="/search"
                                icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>}
                                label="Search"
                                active={location.pathname === '/search'}
                            />
                        </li>
                        <li className={`flex items-center gap-4 text-gray-400 hover:text-white cursor-pointer transition-colors px-6 py-3 ${location.pathname === '/library' ? 'bg-white/10 text-white border-r-4 border-green-500' : ''}`} onClick={() => navigate('/library')}>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" /></svg>
                            <span className="font-medium">Library</span>
                        </li>
                        <li className={`flex items-center gap-4 text-gray-400 hover:text-white cursor-pointer transition-colors px-6 py-3 ${location.pathname === '/podcasts' || location.pathname.startsWith('/podcast') ? 'bg-white/10 text-white border-r-4 border-green-500' : ''}`} onClick={() => navigate('/podcasts')}>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
                            <span className="font-medium">Podcasts</span>
                        </li>

                    </ul>
                </div>

                {/* Admin Link (Hidden-ish) */}
                <div className="mt-4 px-6">
                    <button
                        onClick={() => navigate('/admin/upload')}
                        className="text-xs text-gray-600 hover:text-gray-400 uppercase tracking-widest font-semibold"
                    >
                        Admin Panel
                    </button>
                </div>

                <div className="mt-8 space-y-1">
                    <div className="flex items-center justify-between px-6 mb-2">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Playlists</p>
                        <button onClick={handleCreatePlaylist} className="text-gray-400 hover:text-white" title="Create Playlist">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                        </button>
                    </div>
                    <ul>
                        <li>
                            <NavItem
                                to="/playlist/liked"
                                icon={
                                    <div className="bg-gradient-to-br from-indigo-700 to-white/30 p-1 rounded-sm">
                                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" /></svg>
                                    </div>
                                }
                                label="Liked Songs"
                                active={location.pathname === '/playlist/liked'}
                            />
                        </li>
                        {playlists.map(playlist => (
                            <li key={playlist.id}>
                                <NavItem
                                    to={`/playlist/${playlist.id}`}
                                    icon={<div className="w-6 h-6 bg-gray-800 rounded flex items-center justify-center text-xs text-gray-400 font-bold">{playlist.name[0]}</div>}
                                    label={playlist.name}
                                    active={location.pathname === `/playlist/${playlist.id}`}
                                />
                            </li>
                        ))}
                    </ul>
                </div>
            </nav>
        </aside >
    );
};

export default Sidebar;
