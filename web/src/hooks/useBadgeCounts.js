import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useSocket } from '@/context/SocketContext';

/**
 * Hook that fetches badge counts from the given role's API endpoint.
 * Returns { badges: { [key]: number }, refresh }
 */
export function useBadgeCounts(role, intervalMs = 60000) {
    const [badges, setBadges] = useState({});
    const socket = useSocket();

    const refresh = useCallback(async () => {
        try {
            const url = `/api/${role}/badge-counts`;
            const { data } = await axios.get(url);
            if (data?.data) setBadges(data.data);
        } catch {
            // silently fail — badges are non-critical
        }
    }, [role]);

    useEffect(() => {
        refresh();
        const id = setInterval(refresh, intervalMs);
        return () => clearInterval(id);
    }, [refresh, intervalMs]);

    // Socket listeners for real-time badge updates
    useEffect(() => {
        if (!socket) return;

        const handleUpdate = () => {
            console.log(`[SOCKET] Badge refresh triggered for ${role}`);
            refresh();
        };

        // Standard event for any data change that affects badges
        socket.on('badge_refresh', handleUpdate);
        
        // Role-specific events
        if (role === 'instructor') {
            socket.on('content_submitted', handleUpdate);
        } else if (role === 'student') {
            socket.on('content_published', handleUpdate);
            socket.on('new_notification', handleUpdate);
        }

        return () => {
            socket.off('badge_refresh', handleUpdate);
            socket.off('content_submitted', handleUpdate);
            socket.off('content_published', handleUpdate);
            socket.off('new_notification', handleUpdate);
        };
    }, [socket, role, refresh]);

    return { badges, refresh };
}
