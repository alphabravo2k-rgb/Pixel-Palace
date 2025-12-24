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
  can: () => false, // ✅ Future-proof signature
});

// ------------------------------------------------------------------
// 3. PROVIDER COMPONENT
// ------------------------------------------------------------------
export const SessionProvider = ({ children }) => {
  /**
   * 🔧 Upgrade 1️⃣: Session shape must evolve
   * From: { role, identity, pin }
   * To: { role, identity, claims: { ... } }
   */
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

  const login = async (pin) => {
    setLoading(true);
    try {
      // --- ADMIN LOGIN FLOW ---
      const { data: adminData, error: adminError } = await supabase.rpc('api_admin_login', { p_pin: pin });
      
      if (!adminError && adminData?.status === 'SUCCESS') {
        setSession({
          role: adminData.profile.role || ROLES.ADMIN,
          identity: {
            id: adminData.profile.id,
            name: adminData.profile.display_name
          },
          // Admins typically have global claims (represented here as wildcards or specific assignments)
          claims: {
            tournamentIds: ['*'], 
            teamIds: ['*'],
            matchIds: ['*']
          },
          isAuthenticated: true
        });
        return true;
      }

      // --- CAPTAIN LOGIN FLOW ---
      const { data: captainData, error: captainError } = await supabase.rpc('api_get_captain_state', { p_pin: pin });
      
      if (!captainError && captainData?.team_name) {
        setSession({
          role: ROLES.CAPTAIN,
          identity: {
            id: captainData.team_id,
            name: captainData.team_name
          },
          // Claims are strictly scoped to their specific ID
          claims: {
            tournamentIds: [captainData.tournament_id],
            teamIds: [captainData.team_id],
            matchIds: [] // Can be populated if the logic supports fetching active match IDs
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

  /**
   * 🔧 Upgrade 2️⃣: checkPermission must accept context
   * Signature: can(action, context)
   */
  const can = useCallback((action, context = {}) => {
    // 1. Role Check
    const allowedRoles = PERMISSIONS[action] || [];
    if (!allowedRoles.includes(session.role)) return false;

    // 2. Claim Check (Scope)
    // If context provides IDs, we must verify the user has a claim to them.
    
    // Check: Tournament Scope
    if (context.tournamentId) {
      const hasClaim = session.claims.tournamentIds.includes('*') || 
                       session.claims.tournamentIds.includes(context.tournamentId);
      if (!hasClaim) return false;
    }

    // Check: Team Scope
    if (context.teamId) {
      const hasClaim = session.claims.teamIds.includes('*') || 
                       session.claims.teamIds.includes(context.teamId);
      if (!hasClaim) return false;
    }

    // Check: Match Scope
    if (context.matchId) {
      const hasClaim = session.claims.matchIds.includes('*') || 
                       session.claims.matchIds.includes(context.matchId);
      // Note: Captains often don't store matchIds in session but derive access from TeamID inside the match.
      // We can add logic here: if I own the Team that is IN this match, I can access it.
      // For now, strict claim checking:
      if (!hasClaim && session.role !== ROLES.CAPTAIN) return false; 
    }

    return true;
  }, [session]);

  const value = useMemo(() => ({
    session,
    loading,
    login,
    logout,
    can, // Exposing the new signature
    // Convenience Accessors
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
