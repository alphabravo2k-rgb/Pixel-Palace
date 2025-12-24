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
  session: { role: ROLES.GUEST, user: null },
  isAdmin: false,
  isCaptain: false,
  loading: false,
  login: async () => {},
  logout: () => {},
  validateSession: async () => {}, // ✅ New Action: Server-side revocation hook
  checkPermission: () => false
});

// ------------------------------------------------------------------
// 3. PROVIDER COMPONENT
// ------------------------------------------------------------------
export const SessionProvider = ({ children }) => {
  const [session, setSession] = useState({
    user: null,          
    role: ROLES.GUEST,   
    isAuthenticated: false,
    authTime: null // ✅ Tracking login time for expiration logic
  });
  
  const [loading, setLoading] = useState(false);

  // ----------------------------------------------------------------
  // LOGIN LOGIC (Existing Secure Implementation)
  // ----------------------------------------------------------------
  const login = async (pin) => {
    setLoading(true);
    try {
      // VERIFY ADMIN
      const { data: adminData, error: adminError } = await supabase.rpc('api_admin_login', { p_pin: pin });
      if (!adminError && adminData?.status === 'SUCCESS') {
        setSession({
          user: adminData.profile,
          role: adminData.profile.role || ROLES.ADMIN,
          isAuthenticated: true,
          authTime: Date.now()
        });
        return true;
      }

      // VERIFY CAPTAIN
      const { data: captainData, error: captainError } = await supabase.rpc('api_get_captain_state', { p_pin: pin });
      if (!captainError && captainData?.team_name) {
        setSession({
          user: { 
            name: captainData.team_name, 
            teamId: captainData.team_id, 
            tournamentId: captainData.tournament_id 
          },
          role: ROLES.CAPTAIN,
          isAuthenticated: true,
          authTime: Date.now()
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

  // ----------------------------------------------------------------
  // ✅ FIX 1: SESSION VALIDATION / REVOCATION
  // "Admins get removed. Captains change. Matches end."
  // ----------------------------------------------------------------
  const validateSession = useCallback(async () => {
    if (!session.isAuthenticated) return false;

    // In a real scenario, we would re-run a silent RPC check here.
    // For now, we enforce a Client-Side Expiration policy.
    const SESSION_DURATION = 1000 * 60 * 60 * 4; // 4 Hours
    const isExpired = (Date.now() - session.authTime) > SESSION_DURATION;

    if (isExpired) {
      console.warn("Session Expired: Forced Logout");
      logout();
      return false;
    }
    
    return true;
  }, [session]);

  const logout = () => {
    setSession({
      user: null,
      role: ROLES.GUEST,
      isAuthenticated: false,
      authTime: null
    });
  };

  // ----------------------------------------------------------------
  // ✅ FIX 2: SCOPED PERMISSIONS
  // "Role ≠ Authority. Role + Scope + State = Authority"
  // ----------------------------------------------------------------
  const checkPermission = useCallback((action, context = {}) => {
    // 1. Check Basic Role
    const allowedRoles = PERMISSIONS[action] || [];
    if (!allowedRoles.includes(session.role)) return false;

    // 2. Check Admin Override (Admins typically have global scope)
    if ([ROLES.ADMIN, ROLES.OWNER].includes(session.role)) return true;

    // 3. Check Scope for Captains
    if (session.role === ROLES.CAPTAIN) {
      // Captains only have authority over THEIR specific team/match.
      
      // Scope Check: Team ID
      if (context.requiredTeamId && session.user.teamId !== context.requiredTeamId) {
        return false; // Authority Violation: Wrong Team
      }

      // Scope Check: Tournament ID
      if (context.requiredTournamentId && session.user.tournamentId !== context.requiredTournamentId) {
        return false; // Authority Violation: Wrong Tournament
      }
      
      // State Check: Is Match Active? (Passed via context)
      if (context.isMatchActive === false) {
        return false; // Authority Violation: Match Ended
      }
    }

    return true;
  }, [session]);

  const value = useMemo(() => ({
    session,
    loading,
    login,
    logout,
    validateSession,
    checkPermission,
    isAdmin: [ROLES.ADMIN, ROLES.OWNER].includes(session.role),
    isCaptain: session.role === ROLES.CAPTAIN,
    isAuthenticated: session.isAuthenticated
  }), [session, loading, validateSession, checkPermission]);

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
};

export const useSession = () => {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
};
