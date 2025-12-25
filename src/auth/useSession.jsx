import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabase/client';
// 🛑 FIX #1: No more local ROLES. Import the Single Source of Truth.
import { ROLES } from '../lib/roles';
// 🛑 FIX #2: No more local PERMISSIONS. Use the standard Actions vocabulary.
import { PERM_ACTIONS } from '../lib/permissions.actions';

const SessionContext = createContext();

export const SessionProvider = ({ children }) => {
  const [session, setSession] = useState({
    role: ROLES.GUEST,
    identity: null, // { id, name, type }
    claims: { 
      tournamentIds: [], 
      teamIds: [], 
      matchIds: [] 
    },
    isAuthenticated: false
  });
  const [loading, setLoading] = useState(false); // Initial load is done, strictly for login actions now

  // 🛡️ PERMISSION CHECKER (The Brain)
  const can = (action, context = {}) => {
    // 1. Root Override: Owners/Admins (Wildcard Power)
    // 🛑 NOTE (Critique #3): This '*' is a frontend shortcut. 
    // The Backend RLS/RPC must still validate the actual request.
    if ([ROLES.OWNER, ROLES.ADMIN].includes(session.role)) return true;

    // 2. Role-Based Capabilities (Guest check)
    if (session.role === ROLES.GUEST) return false;

    // 3. Scope Enforcement (The "Context" Check)
    // Does the user have a claim to the specific resource they are trying to touch?

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
    // Prevents Captains from acting on matches they aren't playing in.
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
        const userRole = adminData.profile.role; // e.g., 'ADMIN' or 'OWNER'
        const newSession = {
          role: userRole,
          isAuthenticated: true,
          identity: {
            id: adminData.profile.id,
            name: adminData.profile.display_name,
            type: 'ADMIN'
          },
          // Admins get wildcard claims (Frontend convenience)
          claims: {
            tournamentIds: ['*'],
            teamIds: ['*'],
            matchIds: ['*']
          }
        };
        setSession(newSession);
        return newSession;
      }

      // B. Try Captain Login
      const { data: capData } = await supabase.rpc('api_get_captain_state', { p_pin: pin });
      
      if (capData && capData.team_name) {
        // Fetch matches for this team to populate claims
        // (Assuming a helper or query exists, otherwise we default to empty until fetched)
        // For now, we will allow them to claim their known Team ID.
        // TODO: In a real flow, we'd fetch their active match IDs here.
        
        const newSession = {
          role: ROLES.CAPTAIN,
          isAuthenticated: true,
          identity: {
            id: capData.team_id, // Captain's ID is effectively the Team ID for logic
            name: capData.team_name,
            type: 'CAPTAIN'
          },
          claims: {
            tournamentIds: [capData.tournament_id],
            teamIds: [capData.team_id],
            matchIds: [] // Needs to be populated by the Match View when loaded
          }
        };
        setSession(newSession);
        return newSession;
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
  if (!context) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
};
