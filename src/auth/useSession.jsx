import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { supabase } from '../supabase/client';
import { normalizeRole, ROLES } from '../lib/roles';

const SessionContext = createContext(null);

export const SessionProvider = ({ children }) => {
  const hydratingRef = useRef(false);
  
  // Default State
  const [session, setSession] = useState({
    isAuthenticated: false,
    user: null,
    role: ROLES.GUEST,
    team_id: null,
    identity: null,
    loading: true
  });

  // 1. Initial Load & Realtime Listener
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: authSession } }) => {
      if (authSession?.user) hydrateUser(authSession.user);
      else setAsGuest();
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, authSession) => {
      if (authSession?.user) hydrateUser(authSession.user);
      else setAsGuest();
    });

    return () => subscription.unsubscribe();
  }, []);

  // Helper to reset state
  const setAsGuest = () => {
    setSession({
      isAuthenticated: false, user: null, role: ROLES.GUEST,
      team_id: null, identity: null, loading: false
    });
  };

  // 2. Hydration Logic (The "Brain")
  const hydrateUser = async (user) => {
    if (hydratingRef.current) return;
    hydratingRef.current = true;

    try {
      // Fetch consolidated profile (Works for Admins OR Players)
      const { data: profile, error } = await supabase
        .from('session_profiles')
        .select('*')
        .eq('auth_user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      if (!profile) {
        console.warn("[Session] Auth valid, but no Profile found.");
        // We keep them logged in but powerless (Guest)
        setSession({
          isAuthenticated: true, user: user, role: ROLES.GUEST,
          team_id: null, identity: null, loading: false
        });
        return;
      }

      setSession({
        isAuthenticated: true,
        user: user,
        role: normalizeRole(profile.role),
        team_id: profile.team_id || null,
        identity: {
          auth_user_id: profile.auth_user_id,
          display_name: profile.display_name,
          team_id: profile.team_id,
          context: profile.context // 'admin_panel' or 'competitor'
        },
        loading: false
      });

    } catch (err) {
      console.error("[Session] Hydration Error:", err);
      setAsGuest();
    } finally {
      hydratingRef.current = false;
    }
  };

  // 3. Login Function (The "Key" - Updated)
  const login = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;

      // Check Role immediately to return success/fail to the form
      // This prevents the "flash" on the login screen
      const { data: roleData } = await supabase
        .from('session_profiles')
        .select('role')
        .eq('auth_user_id', data.user.id)
        .single();

      if (roleData) {
        return { success: true, role: roleData.role };
      }
      
      return { success: false, message: "Profile not found." };

    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setAsGuest();
  };

  return (
    <SessionContext.Provider value={{ session, login, logout, loading: session.loading }}>
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = () => {
  const context = useContext(SessionContext);
  if (!context) throw new Error('useSession must be used within a SessionProvider');
  return context;
};
