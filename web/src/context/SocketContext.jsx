"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuthStore } from '@/store/authStore';

const SocketContext = createContext(null);

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const { user } = useAuthStore();

    useEffect(() => {
        // Use provided backend URL, or existing API URL, or fallback to relative/localhost
        const socketUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 
                         process.env.NEXT_PUBLIC_API_URL || 
                         (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:6000');
        
        const newSocket = io(socketUrl, {
            withCredentials: true,
            transports: ['websocket', 'polling']
        });

        newSocket.on('connect', () => {
            console.log('[SOCKET] Connected to server:', newSocket.id);
            if (user?._id || user?.userId) {
                newSocket.emit('join', user._id || user.userId);
            }
            if (user?.role) {
                newSocket.emit('join_role', user.role);
            }
        });

        setSocket(newSocket);

        return () => newSocket.close();
    }, [user]);

    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    );
};
