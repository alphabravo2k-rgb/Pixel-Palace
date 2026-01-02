import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { supabase } from '../supabase/client';
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

  useEffect(() => {
    const hydrate = async () => {
      // 1. Staff Login
      const { data: { session: sbSession } } = await supabase.auth.getSession();
      
      if (sbSession?.user) {
        await hydrateAdmin(sbSession.user);
        return;
      }

      // 2. Captain Login (Check Storage)
      const localCap = localStorage.getItem('pixel_captain_session');
      if (localCap) {
        try {
          const parsed = JSON.parse(localCap);
          // 🛡️ RE-VERIFY PIN ON RELOAD (Code 61)
          if (parsed.accessCode) {
             const verify = await loginCaptain(parsed.accessCode, true); 
             if (verify.success) return; 
          }
        } catch (e) {
          console.error("Session Corrupted", e);
        }
        localStorage.removeItem('pixel_captain_session');
      }

      if (mounted.current) setAsGuest();
    };

    hydrate();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) hydrateAdmin(session.user);
      else if (!localStorage.getItem('pixel_captain_session')) {
         if (mounted.current) setAsGuest();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const setAsGuest = () => {
    setSession({
      isAuthenticated: false, user: null, role: ROLES.GUEST,
      team_id: null, identity: null, loading: false, authType: 'GUEST'
    });
  };

  const hydrateAdmin = async (user) => {
    try {
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

  const loginAdmin = async (email, password) => {
    localStorage.removeItem('pixel_captain_session');
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { success: false, message: error.message };
    return { success: true };
  };

  const loginCaptain = async (accessCode, silent = false) => {
    try {
        // CALL THE BACKEND RPC (Code 61/65)
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
        
        if (!silent) {
            localStorage.setItem('pixel_captain_session', JSON.stringify({ ...capSession, accessCode }));
        }
        
        return { success: true };
    } catch (err) {
        if (!silent) console.error("Captain Login Failed:", err);
        return { success: false, message: err.message || "Connection Error" };
    }
  };

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

export const useSession = () => useContext(SessionContext);
