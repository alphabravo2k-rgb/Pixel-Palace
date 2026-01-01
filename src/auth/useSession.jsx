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
    const initAuth = async () => {
        // 1. Check Local Storage for Captain PIN
        const localCap = localStorage.getItem('pixel_captain_session');
        if (localCap) {
            try {
                if(mounted.current) {
                    setSession(JSON.parse(localCap));
                    return; // Stop loading here
                }
            } catch(e) {
                localStorage.removeItem('pixel_captain_session');
            }
        }

        // 2. Check Supabase Auth (Admins)
        const { data: { session: sbSession } } = await supabase.auth.getSession();
        if (sbSession?.user) {
            await hydrateAdmin(sbSession.user);
        } else {
            // No auth found, set as Guest immediately
            if(mounted.current) setSession(prev => ({ ...prev, loading: false }));
        }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) hydrateAdmin(session.user);
        else if (!localStorage.getItem('pixel_captain_session')) {
             if(mounted.current) setAsGuest();
        }
    });

    return () => { 
        mounted.current = false;
        subscription.unsubscribe(); 
    };
  }, []);

  const setAsGuest = () => {
    setSession({
      isAuthenticated: false, user: null, role: ROLES.GUEST,
      team_id: null, identity: null, loading: false, authType: 'GUEST'
    });
  };

  const hydrateAdmin = async (user) => {
    try {
        const { data: profile } = await supabase.from('session_profiles').select('*').eq('auth_user_id', user.id).maybeSingle();
        
        if (mounted.current) {
            setSession({
                isAuthenticated: true,
                user: user,
                role: normalizeRole(profile?.role || 'GUEST'),
                team_id: profile?.team_id,
                identity: { auth_user_id: user.id, display_name: profile?.display_name || user.email },
                loading: false, // Stop loading
                authType: 'SUPABASE'
            });
        }
    } catch (e) { 
        console.error(e);
        if(mounted.current) setAsGuest();
    }
  };

  // --- ACTIONS ---

  const loginAdmin = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { success: false, message: error.message };
    return { success: true };
  };

  const loginCaptain = async (accessCode) => {
    try {
        const { data, error } = await supabase.rpc('verify_team_access', { p_code: accessCode });
        if (error || !data.success) return { success: false, message: data?.message || 'Invalid Code' };

        const capSession = {
            isAuthenticated: true,
            role: ROLES.CAPTAIN,
            team_id: data.team_id,
            identity: { id: data.team_id, display_name: `Captain (${data.team_name})` },
            loading: false,
            authType: 'CAPTAIN_PIN'
        };

        localStorage.setItem('pixel_captain_session', JSON.stringify(capSession));
        setSession(capSession);
        return { success: true };
    } catch (err) {
        return { success: false, message: "Connection Error" };
    }
  };

  const logout = async () => {
    localStorage.removeItem('pixel_captain_session');
    await supabase.auth.signOut();
    if(mounted.current) setAsGuest();
  };

  // ⚠️ EXPORTING 'login' AS ALIAS FOR ADMIN LOGIN FOR BACKWARD COMPATIBILITY
  return (
    <SessionContext.Provider value={{ session, login: loginAdmin, loginAdmin, loginCaptain, logout }}>
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = () => useContext(SessionContext);
