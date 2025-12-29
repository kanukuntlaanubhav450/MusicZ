import React, { useState } from 'react';
import { auth } from '../../services/firebase';
import { useAudio } from '../../context/AudioContext';
import { useNavigate } from 'react-router-dom';

const Header = ({ onMenuClick }) => {
    const navigate = useNavigate();
    const [query, setQuery] = useState('');

    const { resetPlayer } = useAudio();

    const handleLogout = () => {
        resetPlayer(); // Clear player state locally
        auth.signOut();
        navigate('/login');
    };

    const handleSearch = (e) => {
        if (e.key === 'Enter') {
            navigate(`/search?q=${encodeURIComponent(query)}`);
        }
    };

    return (
        <header className="sticky top-0 z-40 bg-gray-900/90 backdrop-blur-sm p-4 flex items-center justify-between border-b border-white/10">
            {/* Search Bar & Menu Toggle */}
            <div className="flex items-center gap-4 flex-1">
                <button
                    className="p-2 text-gray-400 hover:text-white transition-colors rounded-full hover:bg-white/10"
                    onClick={onMenuClick}
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
                </button>

                <div className="flex items-center bg-gray-800 rounded-full px-4 py-2 w-full max-w-md group focus-within:ring-2 focus-within:ring-white transition">
                    <svg className="w-5 h-5 text-gray-400 group-focus-within:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    <input
                        type="text"
                        placeholder="What do you want to play?"
                        className="bg-transparent border-none text-white focus:outline-none ml-2 w-full placeholder-gray-400"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={handleSearch}
                    />
                </div>
            </div>

            {/* User Profile / Actions */}
            {/* User Profile / Actions */}
            <div className="flex items-center gap-4">
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-white bg-red-600/10 hover:bg-red-600/20 border border-red-600/20 hover:border-red-600/50 rounded-full transition-all duration-200 group"
                >
                    <span>Logout</span>
                    <svg className="w-4 h-4 text-red-500 group-hover:text-red-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                </button>
            </div>
        </header>
    );
};

export default Header;
