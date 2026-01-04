import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { API_URL } from '../config/api';

export const useLikes = () => {
    const [likedTrackIds, setLikedTrackIds] = useState(new Set());
    const [loadingLikes, setLoadingLikes] = useState(true);

    const fetchLikedSongs = useCallback(async () => {
        try {
            const res = await fetch(`${API_URL}/api/playlists/liked`);
            if (res.ok) {
                const data = await res.json();
                const ids = new Set((data.tracks || []).map(t => t.id));
                setLikedTrackIds(ids);
            }
        } catch (error) {
            console.error("useLikes: Failed to fetch liked songs", error);
        } finally {
            setLoadingLikes(false);
        }
    }, []);

    useEffect(() => {
        fetchLikedSongs();
    }, [fetchLikedSongs]);

    const toggleLike = async (e, track) => {
        if (e) e.stopPropagation();

        const isLiked = likedTrackIds.has(track.id);

        // Optimistic update
        setLikedTrackIds(prev => {
            const next = new Set(prev);
            if (isLiked) next.delete(track.id);
            else next.add(track.id);
            return next;
        });

        try {
            const method = isLiked ? 'DELETE' : 'POST';
            const url = isLiked
                ? `${API_URL}/api/playlists/liked/tracks/${track.id}`
                : `${API_URL}/api/playlists/liked/tracks`;

            const options = { method };
            if (!isLiked) {
                options.headers = { 'Content-Type': 'application/json' };
                options.body = JSON.stringify({ track });
            }

            const res = await fetch(url, options);
            if (!res.ok) throw new Error('Failed to update like');

            toast.success(isLiked ? 'Removed from Liked Songs' : 'Added to Liked Songs');
        } catch (error) {
            console.error("Like toggle failed", error);
            toast.error("Failed to update favorites");
            // Revert on error
            setLikedTrackIds(prev => {
                const next = new Set(prev);
                if (isLiked) next.add(track.id);
                else next.delete(track.id);
                return next;
            });
        }
    };

    return { likedTrackIds, toggleLike, loadingLikes, refreshLikes: fetchLikedSongs };
};
