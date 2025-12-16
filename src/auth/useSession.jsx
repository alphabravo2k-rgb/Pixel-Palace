import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabase/client';
import { ROLES } from '../lib/roles';

const SessionContext = createContext();

export const SessionProvider = ({ children }) => {
  const [session, setSession] = useState({
    isAuthenticated: false,
    role: ROLES.SPECTATOR,
    teamId: null,
    identity: 'Anonymous',
    pin: null, // Required to sign RPC requests
    loading: false
  });

  const [isPinModalOpen, setIsPinModalOpen] = useState(true);

  // Restore session from session storage on load
  useEffect(() => {
    const stored = sessionStorage.getItem('pp_user_session');
    if (stored) {
        try {
            const parsed = JSON.parse(stored);
            setSession(parsed);
            setIsPinModalOpen(false);
        } catch (e) {
            sessionStorage.removeItem('pp_user_session');
        }
    }
  }, []);

  const verifyPin = async (inputPin) => {
    // 1. Dev Backdoor (Only works in localhost for testing)
    if (import.meta.env.DEV && inputPin === '0000') {
        const devSession = {
            isAuthenticated: true,
            role: ROLES.OWNER,
            teamId: null,
            identity: 'Dev Owner',
            pin: '0000',
            loading: false
        };
        updateSession(devSession);
        return true;
    }

    try {
        const cleanPin = inputPin.trim();
        
        // 2. Call the updated 'verify_pin' RPC
        // Now expects the backend to return { valid, role, team_id, display_name }
        const { data, error } = await supabase.rpc('verify_pin', { input_pin: cleanPin });

        if (error) {
            console.error("Auth RPC Error:", error);
            return false;
        }

        if (data && data.valid) {
            // 3. Identity Resolution
            // Uses the specific 'display_name' from the DB (e.g., "AdmKancha")
            // Falls back to Role + Team ID if name is missing
            let identityLabel = data.display_name;
            
            if (!identityLabel) {
                 identityLabel = `${data.role} ${data.team_id ? `(${data.team_id.slice(0,4)})` : ''}`;
            }

            const newSession = {
                isAuthenticated: true,
                role: data.role,
                teamId: data.team_id || null,
                identity: identityLabel,
                pin: cleanPin, // Store PIN for future RPC calls
                loading: false
            };
            updateSession(newSession);
            return true;
        } else {
            console.warn("Invalid PIN response:", data?.error);
            return false;
        }
    } catch (err) {
        console.error("Verification Execution Failed", err);
        return false;
    }
  };

  const updateSession = (newSession) => {
      setSession(newSession);
      sessionStorage.setItem('pp_user_session', JSON.stringify(newSession));
      setIsPinModalOpen(false);
  };

  const logout = () => {
    const emptySession = {
        isAuthenticated: false,
        role: ROLES.SPECTATOR,
        teamId: null,
        identity: 'Anonymous',
        pin: null,
        loading: false
    };
    setSession(emptySession);
    sessionStorage.removeItem('pp_user_session');
    setIsPinModalOpen(true);
  };

  return (
    <SessionContext.Provider value={{ session, verifyPin, logout, isPinModalOpen, setIsPinModalOpen }}>
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = () => useContext(SessionContext);
