'use client';

import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import useAuthStore from '../store/authStore';
import useAxios from '../axios-service';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
});

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { accessToken, setAccessToken } = useAuthStore();
  const { AxiosPublic } = useAxios();

  const isRefreshingRef = useRef(false);

  const handleRefreshToken = async (): Promise<string | null> => {
    if (isRefreshingRef.current) return null;
    isRefreshingRef.current = true;

    try {
      console.log('🔄 Mencoba refresh accessToken untuk WebSocket...');
      const response = await AxiosPublic.post(
        '/refreshToken',
        {},
        { withCredentials: true }
      );

      const newAccessToken = response.data?.accessToken;
      if (newAccessToken) {
        setAccessToken(newAccessToken);
        console.log('✅ AccessToken baru berhasil didapatkan!');
        return newAccessToken;
      }
      return null;
    } catch (error) {
      console.error('❌ Gagal refresh token:', error);
      return null;
    } finally {
      isRefreshingRef.current = false;
    }
  };

  useEffect(() => {
    if (!accessToken) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setIsConnected(false);
      }
      return;
    }
    const socketInstance = io(
      process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000',
      {
        transports: ['websocket'],
        autoConnect: true,
        withCredentials: true,
        auth: {
          token: `Bearer ${accessToken}`,
        },
      }
    );

    socketInstance.on('connect', () => {
      console.log('⚡ Socket connected globally:', socketInstance.id);
      setIsConnected(true);
    });

    socketInstance.on('connect_error', async (err) => {
      console.warn('⚠️ Socket connection error:', err.message);

      // Jika koneksi ditolak (kemungkinan token expired/invalid)
      const newAccessToken = await handleRefreshToken();

      if (newAccessToken) {
        // Update token di instance socket yang ada & coba connect ulang
        socketInstance.auth = { token: `Bearer ${newAccessToken}` };
        socketInstance.connect();
      } else {
        // Jika refresh token juga gagal, putuskan koneksi
        socketInstance.disconnect();
      }
    });

    socketInstance.on("welcome", (data) => {
      console.log("Data: ", data);
    })

    socketInstance.on('disconnect', (reason) => {
      console.log('❌ Socket disconnected. Reason:', reason);
      setIsConnected(false);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [accessToken]); // <-- RE-RUN / RE-CONNECT JIKA ACCESSTOKEN BERUBAH

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  return useContext(SocketContext);
};