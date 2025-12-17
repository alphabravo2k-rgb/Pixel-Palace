import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabase/client';
import { ROLES } from '../lib/roles';

// --- CONFIGURATION ---
const SESSION_TIMEOUT_MS = 12 * 60 * 60 * 1000; // 12 Hours
const PIN_ATTEMPT_COOLDOWN = 2000; // 2 seconds between attempts
const DEV_MODE_ENABLED = false; // ⚠️ SET TO FALSE FOR PRODUCTION
const SESSION_VERSION = '1.0'; // Bump this to invalidate all active sessions on clients

const SessionContext = createContext();

export const SessionProvider = ({ children }) => {
  // 1. Strict Session State Initialization
  const [session, setSession] = useState({
    isAuthenticated: false,
    role: ROLES.GUEST,
    teamId: null,
    tournamentId: null,
    identity: 'Anonymous',
    pin: null,
    lastActive: null,
    version: SESSION_VERSION,
    loading: true
  });

  const [isPinModalOpen, setIsPinModalOpen] = useState(true);
  const [lastAttemptTime, setLastAttemptTime] = useState(0);

  // Centralized session updater
  const updateSession = useCallback((newSession) => {
    const sessionWithVersion = { ...newSession, version: SESSION_VERSION };
    setSession(sessionWithVersion);
    sessionStorage.setItem('pp_user_session', JSON.stringify(sessionWithVersion));
    setIsPinModalOpen(false);
  }, []);

  // 2. Session Restoration & Validation with Expiry Check
  useEffect(() => {
    const restoreSession = async () => {
      const stored = sessionStorage.getItem('pp_user_session');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          const now = Date.now();
          const lastActive = new Date(parsed.lastActive).getTime();

          // Version Check - Invalidate if structure changed
          if (parsed.version !== SESSION_VERSION) {
            console.warn("Session version mismatch. Forcing logout.");
            throw new Error("Version mismatch");
          }

          // Check for session expiry
          if (now - lastActive > SESSION_TIMEOUT_MS) {
            console.warn("Session expired. Logging out.");
            throw new Error("Session expired");
          }

          // Sliding Expiry: Update lastActive on restore
          const refreshedSession = { 
            ...parsed, 
            lastActive: new Date().toISOString(), 
            loading: false 
          };
          
          updateSession(refreshedSession);
        } catch (e) {
          console.error("Session Parse Error", e);
          sessionStorage.removeItem('pp_user_session');
          setSession(s => ({ ...s, loading: false }));
        }
      } else {
        setSession(s => ({ ...s, loading: false }));
      }
    };
    restoreSession();
  }, [updateSession]);

  // 3. Verification Logic - The Gatekeeper
  const verifyPin = useCallback(async (inputPin) => {
    const now = Date.now();
    
    // Rate Limiting (Frontend)
    if (now - lastAttemptTime < PIN_ATTEMPT_COOLDOWN) {
      console.warn("Rate limit: Please wait before retrying.");
      return false;
    }
    setLastAttemptTime(now);

    // Secure Dev Backdoor
    if (DEV_MODE_ENABLED && inputPin === '0000') {
      const devSession = {
        isAuthenticated: true,
        role: ROLES.SYSTEM_OWNER,
        teamId: null,
        tournamentId: 'global',
        identity: 'Dev Owner',
        pin: '0000',
        lastActive: new Date().toISOString(),
        loading: false
      };
      updateSession(devSession);
      return true;
    }

    try {
      // Backend RPC call to validate PIN
      const { data, error } = await supabase.rpc('verify_pin', { input_pin: inputPin.trim() });

      if (error) {
        console.error("Auth RPC Error:", error);
        return false;
      }

      if (data && data.valid) {
        // 4. Identity Construction
        let identityLabel = data.display_name;
        if (!identityLabel) {
           const suffix = data.team_id ? ` (${data.team_id.slice(0,4)})` : '';
           identityLabel = `${data.role}${suffix}`;
        }

        const newSession = {
          isAuthenticated: true,
          role: data.role,
          teamId: data.team_id || null,
          tournamentId: data.tournament_id || null, // Scoping ready
          identity: identityLabel,
          pin: inputPin.trim(),
          lastActive: new Date().toISOString(),
          loading: false
        };
        
        updateSession(newSession);
        return true;
      } else {
        return false;
      }
    } catch (err) {
      console.error("Verification Execution Failed", err);
      return false;
    }
  }, [lastAttemptTime, updateSession]);

  const logout = useCallback(() => {
    const emptySession = {
      isAuthenticated: false,
      role: ROLES.GUEST,
      teamId: null,
      tournamentId: null,
      identity: 'Anonymous',
      pin: null,
      lastActive: null,
      version: SESSION_VERSION,
      loading: false
    };
    setSession(emptySession);
    sessionStorage.removeItem('pp_user_session');
    setIsPinModalOpen(true);
  }, []);

  // 5. Activity Heartbeat (Call this on major actions to extend session)
  const refreshActivity = useCallback(() => {
      if (session.isAuthenticated) {
          const updated = { ...session, lastActive: new Date().toISOString() };
          updateSession(updated);
      }
  }, [session, updateSession]);

  return (
    <SessionContext.Provider value={{ session, verifyPin, logout, isPinModalOpen, setIsPinModalOpen, refreshActivity }}>
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = () => {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
};
