import React, { createContext, useContext, useState } from 'react';
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from '../firebase/client';
import { ROLES } from '../lib/roles';

const SessionContext = createContext();

export const SessionProvider = ({ children }) => {
  const [session, setSession] = useState({
    isAuthenticated: false,
    role: ROLES.SPECTATOR,
    teamId: null,
    identity: 'Anonymous',
    loading: true
  });

  const [isPinModalOpen, setIsPinModalOpen] = useState(true);

  const verifyPin = async (pin) => {
    // 1. SAFETY: Backdoor only works in Development Mode
    const isDev = import.meta.env.DEV; 
    if (isDev && pin === '0000') {
        console.warn("⚠️ USING DEV BACKDOOR - DO NOT USE IN PRODUCTION");
        setSession({
            isAuthenticated: true,
            role: ROLES.OWNER,
            teamId: null,
            identity: 'Dev Owner',
            loading: false
        });
        setIsPinModalOpen(false);
        return true;
    }

    try {
        // 2. Query Firestore
        // Schema: { code, role, label, teamId, expiresAt (Timestamp/ISO string) }
        const q = query(collection(db, 'access_codes'), where('code', '==', pin));
        const snapshot = await getDocs(q);

        if (!snapshot.empty) {
            const data = snapshot.docs[0].data();
            
            // 3. Expiration Check
            if (data.expiresAt) {
                const expires = new Date(data.expiresAt);
                const now = new Date();
                if (now > expires) {
                    console.error("Access Code Expired");
                    return false; // Code is dead
                }
            }

            setSession({
                isAuthenticated: true,
                role: data.role,
                teamId: data.teamId || null,
                identity: data.label || 'Unknown User',
                loading: false
            });
            setIsPinModalOpen(false);
            return true;
        }
    } catch (err) {
        console.error("PIN Verification Failed", err);
    }

    return false;
  };

  const logout = () => {
    setSession({
        isAuthenticated: false,
        role: ROLES.SPECTATOR,
        teamId: null,
        identity: 'Anonymous',
        loading: false
    });
    setIsPinModalOpen(true);
  };

  return (
    <SessionContext.Provider value={{ session, verifyPin, logout, isPinModalOpen, setIsPinModalOpen }}>
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = () => useContext(SessionContext);
