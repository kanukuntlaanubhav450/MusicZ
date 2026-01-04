import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
import { API_URL } from '../config/api';

const AudioContext = createContext();

export const useAudio = () => useContext(AudioContext);

export const AudioProvider = ({ children }) => {
    const [currentTrack, setCurrentTrack] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [volume, setVolume] = useState(1);
    const [isLoading, setIsLoading] = useState(false);

    // Visualizer State
    const [analyser, setAnalyser] = useState(null);
    const [frequencyData, setFrequencyData] = useState(null);
    // Computed frequency bands for shader
    const [audioData, setAudioData] = useState({ bass: 0, mid: 0, high: 0, energy: 0 });

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

    // Initialize Web Audio API IMMEDIATELY on mount - BEFORE any audio loads
    useEffect(() => {
        if (!audioRef.current) return;

        // Create AudioContext and connect to audio element BEFORE any src is loaded
        const setupAudioContext = () => {
            if (audioRef.current._audioContextSetup) return; // Already set up

            try {
                const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
                const newAnalyser = audioCtx.createAnalyser();

                // Enhanced FFT settings
                newAnalyser.fftSize = 1024; // More frequency bins for better resolution
                newAnalyser.smoothingTimeConstant = 0.3; // More reactive
                newAnalyser.minDecibels = -90;
                newAnalyser.maxDecibels = -10;

                // Create MediaElementSource BEFORE audio loads
                const source = audioCtx.createMediaElementSource(audioRef.current);
                source.connect(newAnalyser);
                newAnalyser.connect(audioCtx.destination);

                const bufferLength = newAnalyser.frequencyBinCount;
                const dataArray = new Uint8Array(bufferLength);

                setAnalyser(newAnalyser);
                setFrequencyData(dataArray);

                // Mark as set up to prevent re-initialization
                audioRef.current._audioContextSetup = true;
                audioRef.current._audioContext = audioCtx;

                console.log('AudioContext initialized successfully, frequencyBinCount:', bufferLength);
            } catch (e) {
                console.error("Web Audio API Init Error:", e);
            }
        };

        // Set up immediately
        setupAudioContext();

        // Resume AudioContext on play (for browser autoplay policy)
        const handlePlay = () => {
            if (audioRef.current._audioContext?.state === 'suspended') {
                audioRef.current._audioContext.resume();
            }
        };

        audioRef.current.addEventListener('play', handlePlay);

        return () => {
            if (audioRef.current) {
                audioRef.current.removeEventListener('play', handlePlay);
            }
        };
    }, []);

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

    // Memoize the audio source to prevent re-reloading on every render (due to Date.now())
    const distinctAudioSrc = React.useMemo(() => {
        if (!currentTrack?.audioUrl) return undefined;
        return `${API_URL}/api/proxy/audio?url=${encodeURIComponent(currentTrack.audioUrl)}&t=${Date.now()}`;
    }, [currentTrack?.id, currentTrack?.audioUrl]);

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
            isLoading,
            analyser,
            frequencyData,
            audioData,
            setAudioData
        }}>
            {children}
            <audio
                ref={audioRef}
                src={distinctAudioSrc}
                preload="auto"
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onEnded={handleEnded}
                onWaiting={() => setIsLoading(true)}
                onPlaying={() => setIsLoading(false)}
                onError={(e) => {
                    console.error("Audio playback error", e);
                    const audio = e.target;
                    console.error("Error details:", {
                        code: audio.error ? audio.error.code : 'unknown',
                        message: audio.error ? audio.error.message : 'unknown',
                        src: audio.src,
                        networkState: audio.networkState,
                        readyState: audio.readyState
                    });
                    setIsLoading(false);
                }}
                onLoadStart={() => console.log("Audio load start:", currentTrack?.audioUrl)}
                onCanPlay={() => {
                    console.log("Audio can play");
                    setIsLoading(false);
                }}
                onPlay={() => console.log("Audio play started")}
                onPause={() => console.log("Audio paused")}
                crossOrigin="anonymous" // Enable CORS for Web Audio API
            />
        </AudioContext.Provider>
    );
};
