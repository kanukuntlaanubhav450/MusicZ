import React from 'react';
import { useAudio } from '../../context/AudioContext';

const Player = () => {
    const { currentTrack, isPlaying, togglePlay, duration, currentTime, seek, volume, setVolume, closePlayer, isLoading } = useAudio();

    if (!currentTrack) return null;

    const formatTime = (time) => {
        if (isNaN(time)) return "0:00";
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };

    const handleSeek = (e) => {
        seek(parseFloat(e.target.value));
    };

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-black/95 backdrop-blur-lg border-t border-white/10 h-24 px-4 flex items-center justify-between z-50 text-white">
            {/* Track Info */}
            <div className="w-1/4 flex items-center gap-4">
                <img src={currentTrack.imageUrl} alt={currentTrack.title} className="w-14 h-14 rounded shadow-lg object-cover" />
                <div className="overflow-hidden">
                    <h4 className="font-bold truncate">{currentTrack.title}</h4>
                    <p className="text-sm text-gray-400 truncate">{currentTrack.artist}</p>
                </div>
            </div>

            {/* Controls */}
            <div className="flex-1 max-w-2xl flex flex-col items-center justify-center gap-2">
                <div className="flex items-center gap-6">
                    <button className="text-gray-400 hover:text-white transition cursor-pointer">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M11 18V6l-8.5 6 8.5 6zm.5-6l8.5 6V6l-8.5 6z" /></svg>
                    </button>
                    <button
                        onClick={togglePlay}
                        className="w-10 h-10 bg-white text-black rounded-full flex items-center justify-center hover:scale-105 transition transform shadow-lg cursor-pointer"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <svg className="animate-spin h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        ) : isPlaying ? (
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /></svg>
                        ) : (
                            <svg className="w-5 h-5 ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                        )}
                    </button>
                    <button className="text-gray-400 hover:text-white transition cursor-pointer">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M4 18l8.5-6L4 6v12zm9-12v12l8.5-6L13 6z" /></svg>
                    </button>
                </div>

                <div className="flex items-center gap-2 w-full text-xs text-gray-400 font-mono">
                    <span>{formatTime(currentTime)}</span>
                    <input
                        type="range"
                        min="0"
                        max={duration || 0}
                        value={currentTime}
                        onChange={handleSeek}
                        className="flex-1 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-green-500 hover:accent-green-400"
                    />
                    <span>{formatTime(duration)}</span>
                </div>
            </div>

            {/* Volume */}
            <div className="w-1/4 flex justify-end items-center gap-2">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>
                <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={volume}
                    onChange={(e) => setVolume(parseFloat(e.target.value))}
                    className="w-24 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-white hover:accent-green-500"
                />
            </div>

            {/* Close Button */}
            <button
                onClick={closePlayer}
                className="absolute top-2 right-2 text-gray-400 hover:text-red-500 transition cursor-pointer p-1 rounded-full hover:bg-white/10"
                title="Close Player"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
        </div >
    );
};

export default Player;
