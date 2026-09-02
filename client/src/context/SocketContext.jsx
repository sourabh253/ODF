import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (!user?.token) {
      setSocket(null);
      return undefined;
    }

    const connection = io(import.meta.env.VITE_API_URL, {
      auth: { token: user.token },
      autoConnect: true,
    });
    setSocket(connection);

    return () => {
      connection.removeAllListeners();
      connection.disconnect();
      setSocket(null);
    };
  }, [user?.token]);

  return <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>;
};

export const useSocket = () => useContext(SocketContext);
