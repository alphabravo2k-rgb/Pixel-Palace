import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { supabase } from '../supabase/client'; // Ensure path is correct
import { normalizeRole, ROLES } from '../lib/roles';

const SessionContext = createContext(null);

export const SessionProvider = ({ children }) => {
  const [session, setSession] = useState({
    isAuthenticated: false,
    user: null,
    role: ROLES.GUEST,
    team_id: null,
    identity: null,
    loading: true,
    authType: 'GUEST'
  });

  const mounted = useRef(true);

  useEffect(() => {
    return () => { mounted.current = false; };
  }, []);

  // 🔄 HYDRATION LOGIC (Runs on App Start)
  useEffect(() => {
    const hydrate = async () => {
      // A. Check for Admin/Staff (Supabase Auth)
      const { data: { session: sbSession } } = await supabase.auth.getSession();
      
      if (sbSession?.user) {
        await hydrateAdmin(sbSession.user);
        return;
      }

      // B. Check for Captain (Local Storage + RPC Verification)
      const localCap = localStorage.getItem('pixel_captain_session');
      if (localCap) {
        try {
          const parsed = JSON.parse(localCap);
          // 🛡️ SECURITY CHECK: Don't trust storage. Verify with DB.
          if (parsed.accessCode) {
             const verify = await loginCaptain(parsed.accessCode, true); // true = silent re-auth
             if (verify.success) return; 
          }
        } catch (e) {
          console.error("Session Corrupted", e);
        }
        // If verification failed, wipe storage
        localStorage.removeItem('pixel_captain_session');
      }

      // C. Fallback to Guest
      if (mounted.current) setAsGuest();
    };

    hydrate();

    // Listener for Admin Logout/Login
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) hydrateAdmin(session.user);
      else if (!localStorage.getItem('pixel_captain_session')) {
         if (mounted.current) setAsGuest();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // --- HELPER: Set Guest ---
  const setAsGuest = () => {
    setSession({
      isAuthenticated: false, user: null, role: ROLES.GUEST,
      team_id: null, identity: null, loading: false, authType: 'GUEST'
    });
  };

  // --- HELPER: Load Admin Profile (Uses the Fixed View) ---
  const hydrateAdmin = async (user) => {
    try {
      // Query the FIXED View (Code 01_MASTER_DEPLOY)
      const { data: profile, error } = await supabase
        .from('session_profiles')
        .select('*')
        .eq('auth_user_id', user.id)
        .maybeSingle();
      
      if (error) throw error;
      
      if (mounted.current) {
        setSession({
          isAuthenticated: true,
          user: user,
          role: normalizeRole(profile?.role || 'GUEST'),
          team_id: profile?.team_id,
          identity: { 
            auth_user_id: user.id, 
            display_name: profile?.display_name || user.email,
            is_staff: profile?.context?.is_staff || false
          },
          loading: false,
          authType: 'SUPABASE'
        });
      }
    } catch (e) { 
      console.error("Hydration Error:", e);
      if(mounted.current) setAsGuest();
    }
  };

  // --- ACTION: Admin Login ---
  const loginAdmin = async (email, password) => {
    // Clear any captain session first
    localStorage.removeItem('pixel_captain_session');
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { success: false, message: error.message };
    return { success: true };
  };

  // --- ACTION: Captain Login (Uses RPC) ---
  const loginCaptain = async (accessCode, silent = false) => {
    try {
        // 1. Call the Secure Backend Function
        const { data, error } = await supabase.rpc('verify_team_access', { p_code: accessCode });
        
        if (error) throw error;
        if (!data || !data.success) {
            throw new Error(data?.message || 'Invalid Code');
        }

        const capSession = {
            isAuthenticated: true,
            role: 'CAPTAIN',
            team_id: data.team_id,
            identity: { 
                id: data.team_id, 
                display_name: `Captain (${data.team_name})`, 
                team_id: data.team_id 
            },
            loading: false,
            authType: 'CAPTAIN_PIN'
        };

        if (mounted.current) setSession(capSession);
        
        // Store code for re-verification on reload
        if (!silent) {
            localStorage.setItem('pixel_captain_session', JSON.stringify({ ...capSession, accessCode }));
        }
        
        return { success: true };
    } catch (err) {
        if (!silent) console.error("Captain Login Failed:", err);
        return { success: false, message: err.message || "Connection Error" };
    }
  };

  // --- ACTION: Logout ---
  const logout = async () => {
    localStorage.removeItem('pixel_captain_session');
    await supabase.auth.signOut();
    if(mounted.current) setAsGuest();
  };

  return (
    <SessionContext.Provider value={{ session, loginAdmin, loginCaptain, logout }}>
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = () => {
    const context = useContext(SessionContext);
    if (!context) throw new Error("useSession must be used within SessionProvider");
    return context;
};
