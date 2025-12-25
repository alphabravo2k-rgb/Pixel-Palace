import React, { createContext, useContext, useState } from 'react';
import { supabase } from '../supabase/client';
import { ROLES } from '../lib/roles';

const SessionContext = createContext();

export const SessionProvider = ({ children }) => {
  const [session, setSession] = useState({
    role: ROLES.GUEST,
    isAuthenticated: false,
    identity: null, // { id: 'uuid', name: 'DispName', type: 'ADMIN' | 'CAPTAIN' }
  });
  const [loading, setLoading] = useState(false);

  // 🛡️ NEW: The Golden Key Helper
  // Use this when calling ANY backend RPC that requires p_admin_id or p_team_id
  const getAuthIdentifier = () => {
    if (!session.isAuthenticated || !session.identity) return null;
    return session.identity.id;
  };

  const login = async (pin) => {
    setLoading(true);
    try {
      // A. Try Admin Login (Code 29)
      const { data: adminData, error: adminError } = await supabase.rpc('api_admin_login', { p_pin: pin });
      
      if (!adminError && adminData && adminData.success) {
        setSession({
          role: adminData.profile.role, // 'OWNER', 'ADMIN', 'REFEREE'
          isAuthenticated: true,
          identity: {
            id: adminData.profile.id, // 🛑 THIS UUID IS YOUR ADMIN KEY
            name: adminData.profile.display_name,
            type: 'ADMIN'
          }
        });
        return { success: true, role: adminData.profile.role };
      }

      // B. Try Captain Login (Code 29)
      const { data: capData, error: capError } = await supabase.rpc('api_get_captain_state', { p_pin: pin });
      
      if (!capError && capData && capData.success) {
        setSession({
          role: ROLES.CAPTAIN,
          isAuthenticated: true,
          identity: {
            id: capData.team_id, // 🛑 THIS UUID IS YOUR TEAM KEY
            name: capData.team_name,
            tournament_id: capData.tournament_id,
            type: 'CAPTAIN'
          }
        });
        return { success: true, role: ROLES.CAPTAIN };
      }

      return { success: false, message: 'Invalid PIN' };
    } catch (err) {
      console.error("Login System Error:", err);
      return { success: false, message: 'System Error' };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setSession({
      role: ROLES.GUEST,
      isAuthenticated: false,
      identity: null
    });
  };

  return (
    <SessionContext.Provider value={{ session, login, logout, loading, getAuthIdentifier }}>
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = () => {
  const context = useContext(SessionContext);
  if (!context) throw new Error('useSession must be used within a SessionProvider');
  return context;
};
