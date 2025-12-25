import { useState, useEffect, useContext, createContext } from 'react';
import { supabase } from '../supabase/client';
import { can as checkPermission } from '../lib/permissions'; // Ensure this path is correct
import { normalizeRole } from '../lib/roles';

// 1. Create Context
const SessionContext = createContext(null);

// 2. Provider Component
export const SessionProvider = ({ children }) => {
  const [session, setSession] = useState({
    isAuthenticated: false,
    role: 'GUEST',
    identity: null,
    claims: { tournamentIds: [] } // Default safe claims
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Restore session from localStorage on load (Simple persistence)
    const stored = localStorage.getItem('pp_session');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // Verify expiry (optional, strictly speaking)
        setSession(parsed);
      } catch (e) {
        localStorage.removeItem('pp_session');
      }
    }
    setLoading(false);
  }, []);

  const login = async (pin) => {
    try {
      // 🔒 RPC Call to Backend
      const { data, error } = await supabase.rpc('api_auth_pin', { p_pin: pin });
      
      if (error) throw error;
      if (!data.success) return { success: false, message: 'Invalid PIN' };

      // ✅ Construct Session Object
      const newSession = {
        isAuthenticated: true,
        role: normalizeRole(data.role),
        identity: {
            id: data.identity_id,
            tournament_id: data.tournament_id
        },
        // We store the PIN in memory for sensitive confirmations if needed, 
        // but rely on identity_id for logic.
        _debug_pin: pin 
      };

      setSession(newSession);
      localStorage.setItem('pp_session', JSON.stringify(newSession));
      return { success: true, role: newSession.role };

    } catch (err) {
      console.error("Auth Error:", err);
      return { success: false, message: "System Error" };
    }
  };

  const logout = () => {
    setSession({ isAuthenticated: false, role: 'GUEST', identity: null });
    localStorage.removeItem('pp_session');
  };

  // 🛡️ The "can" Helper
  // This is what was missing/breaking in your app!
  const can = (action, context = {}) => {
    return checkPermission(action, session, context);
  };

  // 🔑 Helper to get the ID for database logs
  const getAuthIdentifier = () => {
      return session?.identity?.id || null;
  };

  return (
    <SessionContext.Provider value={{ session, login, logout, can, getAuthIdentifier, loading }}>
      {!loading && children}
    </SessionContext.Provider>
  );
};

// 3. The Hook
export const useSession = () => {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error("useSession must be used within a SessionProvider");
  }
  return context;
};
