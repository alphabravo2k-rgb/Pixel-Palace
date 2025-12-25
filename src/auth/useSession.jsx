import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabase/client';
// 🛑 FIX #1: Strict Single Source of Truth for ROLES
import { ROLES } from '../lib/roles';
// 🛑 FIX #2: Consuming standard Action Vocabulary (No local re-definitions)
import { PERM_ACTIONS } from '../lib/permissions.actions';

const SessionContext = createContext();

export const SessionProvider = ({ children }) => {
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

  // 🛡️ PERMISSION CHECKER
  const can = (action, context = {}) => {
    // 1. Root Override: Owners/Admins (Wildcard Power)
    // 🛑 NOTE (Critique #3): This '*' is a frontend shortcut. 
    // The Backend RLS/RPC must still validate the actual request.
    if ([ROLES.OWNER, ROLES.ADMIN].includes(session.role)) return true;

    // 2. Role-Based Capabilities (Guest check)
    if (session.role === ROLES.GUEST) return false;

    // 3. Scope Enforcement (The "Context" Check)

    // Check Tournament Scope
    if (context.tournamentId) {
      const hasClaim = session.claims.tournamentIds.includes('*') || 
                       session.claims.tournamentIds.includes(context.tournamentId);
      if (!hasClaim) return false;
    }

    // Check Team Scope
    if (context.teamId) {
      const hasClaim = session.claims.teamIds.includes('*') || 
                       session.claims.teamIds.includes(context.teamId);
      if (!hasClaim) return false;
    }

    // 🛑 FIX #4: Match Scope Enforcement
    // This prevents a Captain from acting on a match they are not part of.
    if (context.matchId) {
      const hasClaim = session.claims.matchIds.includes('*') || 
                       session.claims.matchIds.includes(context.matchId);
      if (!hasClaim) return false;
    }

    return true;
  };

  const login = async (pin) => {
    setLoading(true);
    try {
      // A. Try Admin Login
      const { data: adminData } = await supabase.rpc('api_admin_login', { p_pin: pin });
      
      if (adminData && adminData.success) {
        const userRole = adminData.profile.role; 
        setSession({
          role: userRole,
          isAuthenticated: true,
          identity: {
            id: adminData.profile.id,
            name: adminData.profile.display_name,
            type: 'ADMIN'
          },
          // Admins get wildcard claims
          claims: {
            tournamentIds: ['*'],
            teamIds: ['*'],
            matchIds: ['*']
          }
        });
        return { success: true, role: userRole };
      }

      // B. Try Captain Login
      const { data: capData } = await supabase.rpc('api_get_captain_state', { p_pin: pin });
      
      if (capData && capData.team_name) {
        // 🛑 FIX: Populate claims correctly.
        // We initialize matchIds as empty. The MatchView component acts as the "Gateway"
        // and will validate if the user belongs to that match when loading data.
        // Ideally, we would fetch 'active_matches' here, but for now, we secure via scope logic.
        
        setSession({
          role: ROLES.CAPTAIN,
          isAuthenticated: true,
          identity: {
            id: capData.team_id, 
            name: capData.team_name,
            type: 'CAPTAIN'
          },
          claims: {
            tournamentIds: [capData.tournament_id],
            teamIds: [capData.team_id],
            matchIds: [] // Populated dynamically or strictly checked via TeamID relation in backend
          }
        });
        return { success: true, role: ROLES.CAPTAIN };
      }

      return false;
    } catch (err) {
      console.error("Login Error:", err);
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

  return (
    <SessionContext.Provider value={{ session, login, logout, can, loading }}>
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = () => {
  const context = useContext(SessionContext);
  if (!context) throw new Error('useSession must be used within a SessionProvider');
  return context;
};
