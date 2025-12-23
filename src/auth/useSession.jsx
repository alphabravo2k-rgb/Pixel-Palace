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
    console.log("🔐 Verifying PIN:", pin); // Debug Log

    try {
      // 1. Check Admin Access
      const { data: admin, error: adminErr } = await supabase.rpc('api_admin_login', { p_pin: pin });
      
      // 🛡️ HARDENED CHECK: Uses '?.' to prevent crash if admin is null
      if (!adminErr && admin?.status === 'SUCCESS') {
        console.log("✅ Admin Login Success:", admin.profile.role);
        setSession({
          isAuthenticated: true,
          role: admin.profile.role, // e.g., 'OWNER', 'ADMIN'
          identity: admin.profile.display_name || 'Admin',
          pin: pin,
          teamId: null
        });
        return true;
      }

      // 2. Check Captain Access
      const { data: captain, error: capErr } = await supabase.rpc('api_get_captain_state', { p_pin: pin });
      
      // 🛡️ HARDENED CHECK: Ensure captain object exists before reading
      if (!capErr && captain && captain.team_name) {
        console.log("✅ Captain Login Success:", captain.team_name);
        setSession({
          isAuthenticated: true,
          role: ROLES.CAPTAIN,
          identity: captain.team_name,
          pin: pin,
          teamId: captain.match_id
        });
        return true;
      }

      console.warn("❌ Login Failed: Invalid PIN or API Error", { adminErr, capErr });
      return false;

    } catch (e) {
      console.error("🚨 CRITICAL AUTH ERROR:", e);
      return false;
    }
  };

  const logout = () => {
    console.log("👋 Logging out...");
    setSession({ isAuthenticated: false, role: ROLES.GUEST, identity: 'Anonymous', pin: null });
    // Optional: Only reload if strictly necessary to clear deeply held state
    window.location.reload(); 
  };

  // HELPER: Check if current session has a specific permission
  const checkPermission = (action) => {
    // Safety: Default to empty array if action doesn't exist in PERMISSIONS
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
