import React, { createContext, useContext, useState, useEffect } from 'react';

const SessionContext = createContext();

export const SessionProvider = ({ children }) => {
  // Simple session state for public view. 
  // Real authentication is handled by VetoPanel/AdminDashboard internally.
  const [session, setSession] = useState({ isAuthenticated: false, role: 'GUEST', identity: 'Anonymous' });

  return (
    <SessionContext.Provider value={{ session, permissions: { isSpectator: true } }}>
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = () => useContext(SessionContext);
