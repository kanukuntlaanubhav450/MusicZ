import React, { createContext, useContext, useState, useRef, useEffect } from 'react';

const AudioContext = createContext();

export const useAudio = () => useContext(AudioContext);

export const AudioProvider = ({ children }) => {
    const [currentTrack, setCurrentTrack] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [volume, setVolume] = useState(1);
    const [isLoading, setIsLoading] = useState(false);

    const audioRef = useRef(null);

    const playTrack = (track) => {
        if (currentTrack?.id === track.id) {
            togglePlay();
        } else {
            setIsLoading(true); // Start loading
            setCurrentTrack(track);
            setCurrentTime(0); // Reset time for new track
            setIsPlaying(true);
            // Audio element will auto-play due to useEffect dependency or explicit play
        }
    };

    const togglePlay = () => {
        setIsPlaying(!isPlaying);
    };

    const seek = (time) => {
        if (audioRef.current) {
            audioRef.current.currentTime = time;
            setCurrentTime(time);
        }
    };

    const handleTimeUpdate = () => {
        if (audioRef.current) {
            setCurrentTime(audioRef.current.currentTime);
        }
    };

    const handleLoadedMetadata = () => {
        if (audioRef.current) {
            setDuration(audioRef.current.duration);
        }
    };

    const handleEnded = () => {
        setIsPlaying(false);
        // Optional: Auto-play next track logic here
    };

    useEffect(() => {
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.play().catch(err => console.error("Play error:", err));
            } else {
                audioRef.current.pause();
            }
        }
    }, [isPlaying, currentTrack]);

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = volume;
        }
    }, [volume]);

    // --- Persistence Logic ---

    // 1. Load State on Mount
    useEffect(() => {
        try {
            const savedState = localStorage.getItem('musicstreamz_state');
            if (savedState) {
                const parsed = JSON.parse(savedState);
                if (parsed.currentTrack) {
                    setCurrentTrack(parsed.currentTrack);
                    setCurrentTime(parsed.currentTime || 0);
                    // Don't auto-play on restore
                }
            }
        } catch (e) {
            console.error("Failed to load state", e);
        }
    }, []);

    // 2. Save State (Debounced/Periodic) & History
    useEffect(() => {
        if (!currentTrack) return;

        // Save Current State
        const saveState = () => {
            localStorage.setItem('musicstreamz_state', JSON.stringify({
                currentTrack,
                currentTime
            }));
        };

        // Save immediately on pause/change, but for time updates we rely on the periodic check or effect
        saveState();

        // Update Recently Played History
        try {
            const history = JSON.parse(localStorage.getItem('musicstreamz_history') || '[]');
            // Remove existing instance of this track
            const filtered = history.filter(t => t.id !== currentTrack.id);
            // Add to front
            filtered.unshift(currentTrack);
            // Limit to 20
            const trimmed = filtered.slice(0, 20);
            localStorage.setItem('musicstreamz_history', JSON.stringify(trimmed));
        } catch (e) {
            console.error("Failed to save history", e);
        }

    }, [currentTrack, isPlaying]); // Save when track changes or play status changes

    // Save time periodically
    useEffect(() => {
        if (!isPlaying || !currentTrack) return;
        const interval = setInterval(() => {
            localStorage.setItem('musicstreamz_state', JSON.stringify({
                currentTrack,
                currentTime
            }));
        }, 5000);
        return () => clearInterval(interval);
    }, [isPlaying, currentTrack, currentTime]);

    // Restore seek position when track loads if resuming
    useEffect(() => {
        // If we have a current time set but audio is at 0, seek
        if (audioRef.current && currentTime > 0 && Math.abs(audioRef.current.currentTime - currentTime) > 1) {
            audioRef.current.currentTime = currentTime;
        }
    }, [currentTrack]); // Only on track load logic roughly

    const closePlayer = () => {
        setIsPlaying(false);
        setCurrentTrack(null);
    };

    const resetPlayer = () => {
        setIsPlaying(false);
        setCurrentTrack(null);
        setCurrentTime(0);
        setDuration(0);

        // Clear LocalStorage
        localStorage.removeItem('musicstreamz_state');
        localStorage.removeItem('musicstreamz_history'); // Optional: remove this if you want to keep history
    };

    return (
        <AudioContext.Provider value={{
            currentTrack,
            isPlaying,
            duration,
            currentTime,
            volume,
            playTrack,
            togglePlay,
            seek,
            setVolume,
            closePlayer,
            resetPlayer,
            isLoading
        }}>
            {children}
            <audio
                key={currentTrack?.id}
                ref={audioRef}
                src={currentTrack?.audioUrl}
                preload="auto"
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onEnded={handleEnded}
                onWaiting={() => setIsLoading(true)}
                onCanPlay={() => setIsLoading(false)}
                onPlaying={() => setIsLoading(false)}
            />
        </AudioContext.Provider>
    );
};
