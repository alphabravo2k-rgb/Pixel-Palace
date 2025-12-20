import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabase/client';
import { ROLES, PERMISSIONS } from '../lib/roles';

const SessionContext = createContext();

export const SessionProvider = ({ children }) => {
  const [session, setSession] = useState({
    isAuthenticated: false,
    role: ROLES.GUEST,
    identity: 'Anonymous',
    pin: null,
    teamId: null
  });
  
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);

  // LOGIC: Validate PIN against Database
  const verifyPin = async (pin) => {
    try {
      // 1. Check Admin
      const { data: admin, error: adminErr } = await supabase.rpc('api_admin_login', { p_pin: pin });
      if (!adminErr && admin.status === 'SUCCESS') {
        setSession({
          isAuthenticated: true,
          role: admin.profile.role, // e.g., 'OWNER', 'ADMIN'
          identity: admin.profile.display_name,
          pin: pin,
          teamId: null
        });
        return true;
      }

      // 2. Check Captain
      const { data: captain, error: capErr } = await supabase.rpc('api_get_captain_state', { p_pin: pin });
      if (!capErr && captain) {
        setSession({
          isAuthenticated: true,
          role: ROLES.CAPTAIN,
          identity: captain.team_name,
          pin: pin,
          teamId: captain.match_id
        });
        return true;
      }
      return false;
    } catch (e) {
      console.error("Auth Error:", e);
      return false;
    }
  };

  const logout = () => {
    setSession({ isAuthenticated: false, role: ROLES.GUEST, identity: 'Anonymous', pin: null });
    window.location.reload(); 
  };

  // HELPER: Check if current session has a specific permission
  const checkPermission = (action) => {
    const allowedRoles = PERMISSIONS[action] || [];
    return allowedRoles.includes(session.role);
  };

  // HELPER: Quick check for Admin/Owner status
  const isAdmin = [ROLES.SYSTEM_OWNER, ROLES.OWNER, ROLES.ADMIN].includes(session.role);

  return (
    <SessionContext.Provider value={{ 
      session, 
      verifyPin, 
      logout, 
      isPinModalOpen, 
      setIsPinModalOpen,
      permissions: {
        can: checkPermission,
        isAdmin: isAdmin,
        isSpectator: !session.isAuthenticated
      }
    }}>
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = () => useContext(SessionContext);
