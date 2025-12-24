import React, { createContext, useContext, useState, useMemo, useCallback } from 'react';
import { supabase } from '../supabase/client';

// ------------------------------------------------------------------
// 1. CONSTANTS & CONFIGURATION
// ------------------------------------------------------------------
const ROLES = {
  OWNER: 'OWNER',
  ADMIN: 'ADMIN',
  CAPTAIN: 'CAPTAIN',
  GUEST: 'GUEST'
};

const PERMISSIONS = {
  CAN_MANAGE_BRACKET: [ROLES.OWNER, ROLES.ADMIN],
  CAN_VETO_MAPS: [ROLES.OWNER, ROLES.ADMIN, ROLES.CAPTAIN],
  CAN_EDIT_ROSTER: [ROLES.OWNER, ROLES.ADMIN],
  CAN_VIEW_DASHBOARD: [ROLES.OWNER, ROLES.ADMIN]
};

// ------------------------------------------------------------------
// 2. CONTEXT DEFINITION
// ------------------------------------------------------------------
const SessionContext = createContext({
  session: { 
    role: ROLES.GUEST, 
    identity: null, 
    claims: { tournamentIds: [], teamIds: [], matchIds: [] } 
  },
  loading: false,
  login: async () => {},
  logout: () => {},
  can: () => false, 
});

// ------------------------------------------------------------------
// 3. PROVIDER COMPONENT
// ------------------------------------------------------------------
export const SessionProvider = ({ children }) => {
  // 1️⃣ Session shape updated to include explicit claims
  const [session, setSession] = useState({
    role: ROLES.GUEST,
    identity: null,
    claims: {
      tournamentIds: [],
      teamIds: [],
      matchIds: []
    },
    isAuthenticated: false
  });
  
  const [loading, setLoading] = useState(false);

  // --- LOGIN LOGIC ---
  const login = async (pin) => {
    setLoading(true);
    try {
      // ADMIN CHECK
      const { data: adminData, error: adminError } = await supabase.rpc('api_admin_login', { p_pin: pin });
      
      if (!adminError && adminData?.status === 'SUCCESS') {
        setSession({
          role: adminData.profile.role || ROLES.ADMIN,
          identity: {
            id: adminData.profile.id,
            name: adminData.profile.display_name
          },
          // Admins get wildcard '*' access
          claims: {
            tournamentIds: ['*'], 
            teamIds: ['*'],
            matchIds: ['*']
          },
          isAuthenticated: true
        });
        return true;
      }

      // CAPTAIN CHECK
      const { data: captainData, error: captainError } = await supabase.rpc('api_get_captain_state', { p_pin: pin });
      
      if (!captainError && captainData?.team_name) {
        setSession({
          role: ROLES.CAPTAIN,
          identity: {
            id: captainData.team_id,
            name: captainData.team_name
          },
          // Captains get specific ID access
          claims: {
            tournamentIds: [captainData.tournament_id],
            teamIds: [captainData.team_id],
            matchIds: [] 
          },
          isAuthenticated: true
        });
        return true;
      }

      throw new Error("Invalid Credentials");

    } catch (error) {
      console.error("Auth Failure:", error);
      logout(); 
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setSession({
      role: ROLES.GUEST,
      identity: null,
      claims: { tournamentIds: [], teamIds: [], matchIds: [] },
      isAuthenticated: false
    });
  };

  // 2️⃣ checkPermission (can) accepts context for scope validation
  const can = useCallback((action, context = {}) => {
    // A. Role Check
    const allowedRoles = PERMISSIONS[action] || [];
    if (!allowedRoles.includes(session.role)) return false;

    // B. Scope/Claim Check
    if (context.tournamentId) {
      const hasClaim = session.claims.tournamentIds.includes('*') || 
                       session.claims.tournamentIds.includes(context.tournamentId);
      if (!hasClaim) return false;
    }

    if (context.teamId) {
      const hasClaim = session.claims.teamIds.includes('*') || 
                       session.claims.teamIds.includes(context.teamId);
      if (!hasClaim) return false;
    }

    return true;
  }, [session]);

  const value = useMemo(() => ({
    session,
    loading,
    login,
    logout,
    can,
    isAdmin: [ROLES.ADMIN, ROLES.OWNER].includes(session.role),
    isCaptain: session.role === ROLES.CAPTAIN,
  }), [session, loading, can]);

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
};

export const useSession = () => {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
};
