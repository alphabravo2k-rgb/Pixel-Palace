import React, { createContext, useContext, useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { supabase } from '../supabase/client';
import { ROLES } from '../lib/roles';

// --- CONFIGURATION ---
const SESSION_TIMEOUT_MS = 12 * 60 * 60 * 1000;
const PIN_ATTEMPT_COOLDOWN = 2000; 
const ACTIVITY_WRITE_THROTTLE = 60000; 
const SESSION_VERSION = '1.3'; 
const DEV_MODE_ENABLED = import.meta.env.VITE_DEV_MODE === 'true';

const SessionContext = createContext();

export const SessionProvider = ({ children }) => {
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
  const lastStorageWrite = useRef(0);

  const updateSession = useCallback((newSession, skipStorage = false) => {
    const sessionWithVersion = { ...newSession, version: SESSION_VERSION };
    setSession(sessionWithVersion);
    if (!skipStorage) {
        sessionStorage.setItem('pp_user_session', JSON.stringify(sessionWithVersion));
        lastStorageWrite.current = Date.now();
    }
    if (newSession.isAuthenticated) setIsPinModalOpen(false);
  }, []);

  useEffect(() => {
    const restoreSession = async () => {
      const stored = sessionStorage.getItem('pp_user_session');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          const now = Date.now();
          const lastActive = new Date(parsed.lastActive).getTime();

          if (parsed.version !== SESSION_VERSION) throw new Error("VERSION_MISMATCH");
          if (now - lastActive > SESSION_TIMEOUT_MS) throw new Error("SESSION_EXPIRED");

          const refreshedSession = { 
            ...parsed, 
            lastActive: new Date().toISOString(), 
            loading: false 
          };
          updateSession(refreshedSession, true); 
        } catch (e) {
          console.warn(`Session Restore Failed: ${e.message}`);
          sessionStorage.removeItem('pp_user_session');
          setSession(s => ({ ...s, loading: false }));
          setIsPinModalOpen(true);
        }
      } else {
        setSession(s => ({ ...s, loading: false }));
      }
    };
    restoreSession();
  }, [updateSession]);

  const verifyPin = useCallback(async (inputPin) => {
    const now = Date.now();
    if (now - lastAttemptTime < PIN_ATTEMPT_COOLDOWN) {
      return { success: false, reason: "RATE LIMIT: PLEASE WAIT" };
    }
    setLastAttemptTime(now);

    if (DEV_MODE_ENABLED && inputPin === '0000') {
      const devSession = {
        isAuthenticated: true,
        role: ROLES.SYSTEM_OWNER,
        teamId: null,
        tournamentId: 'global',
        identity: 'DEV_OVERRIDE',
        pin: '0000',
        lastActive: new Date().toISOString(),
        loading: false
      };
      updateSession(devSession);
      return { success: true };
    }

    try {
      const { data, error } = await supabase.rpc('verify_pin', { input_pin: inputPin.trim() });
      if (error) {
        console.error("Auth RPC Error:", error);
        return { success: false, reason: "SERVER CONNECTION FAILED" };
      }
      if (data?.valid === true) {
        let identityLabel = data.display_name;
        if (!identityLabel) {
           const suffix = data.team_id ? ` (${data.team_id.slice(0,4)})` : '';
           identityLabel = `${data.role}${suffix}`;
        }
        const newSession = {
          isAuthenticated: true,
          role: data.role,
          teamId: data.team_id || null,
          tournamentId: data.tournament_id || null,
          identity: identityLabel,
          pin: inputPin.trim(),
          lastActive: new Date().toISOString(),
          loading: false
        };
        updateSession(newSession);
        return { success: true };
      } else {
        return { success: false, reason: "ACCESS DENIED: INVALID PIN" };
      }
    } catch (err) {
      console.error("Verification Error", err);
      return { success: false, reason: "SYSTEM ERROR" };
    }
  }, [lastAttemptTime, updateSession]);

  // FIX: Renamed 'reason' to '_reason'
  const logout = useCallback((_reason = "USER_ACTION") => {
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

  const loginAsSpectator = useCallback(() => {
    const spectatorSession = {
      isAuthenticated: true,
      role: ROLES.SPECTATOR,
      teamId: null,
      tournamentId: null,
      identity: 'Spectator',
      pin: null,
      lastActive: new Date().toISOString(),
      loading: false
    };
    updateSession(spectatorSession);
  }, [updateSession]);

  const refreshActivity = useCallback(() => {
      setSession(prev => {
        if (!prev.isAuthenticated) return prev;
        const now = Date.now();
        const updated = { ...prev, lastActive: new Date().toISOString() };
        if (now - lastStorageWrite.current > ACTIVITY_WRITE_THROTTLE) {
            sessionStorage.setItem('pp_user_session', JSON.stringify(updated));
            lastStorageWrite.current = now;
        }
        return updated;
      });
  }, []);

  const permissions = useMemo(() => {
    const r = session.role;
    return {
        isAdmin: [ROLES.SYSTEM_OWNER, ROLES.OWNER, ROLES.ADMIN].includes(r),
        isReferee: r === ROLES.REFEREE,
        isCaptain: r === ROLES.CAPTAIN,
        isSpectator: r === ROLES.SPECTATOR,
        isGuest: r === ROLES.GUEST || !session.isAuthenticated
    };
  }, [session.role, session.isAuthenticated]);

  return (
    <SessionContext.Provider value={{ session, permissions, verifyPin, loginAsSpectator, logout, isPinModalOpen, setIsPinModalOpen, refreshActivity }}>
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = () => {
  const context = useContext(SessionContext);
  if (!context) throw new Error('useSession must be used within a SessionProvider');
  return context;
};
