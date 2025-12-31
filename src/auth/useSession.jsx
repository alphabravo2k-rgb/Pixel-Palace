import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { supabase } from '../supabase/client';
import { normalizeRole, ROLES } from '../lib/roles';

const SessionContext = createContext(null);

export const SessionProvider = ({ children }) => {
  const hydratingRef = useRef(false);
  const [session, setSession] = useState({
    isAuthenticated: false,
    user: null,
    role: ROLES.GUEST,
    team_id: null,
    identity: null,
    loading: true
  });

  useEffect(() => {
    // 1. Initial Load
    supabase.auth.getSession().then(({ data: { session: authSession } }) => {
      if (authSession?.user) {
        hydrateUser(authSession.user);
      } else {
        // Explicitly set Guest if no session found
        setSession(prev => ({ 
            ...prev, 
            isAuthenticated: false, 
            user: null, 
            role: ROLES.GUEST, 
            loading: false 
        }));
      }
    });

    // 2. Realtime Listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, authSession) => {
      // console.log("Auth Event:", event); // Debugging hook
      if (authSession?.user) {
        hydrateUser(authSession.user);
      } else {
        setSession({
          isAuthenticated: false,
          user: null,
          role: ROLES.GUEST,
          team_id: null,
          identity: null,
          loading: false
        });
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const hydrateUser = async (user) => {
    if (hydratingRef.current) return;
    hydratingRef.current = true;

    try {
      // 🛡️ SECURITY: Fetch from the 'session_profiles' VIEW (Code 11/12)
      // This view consolidates Admins and Players into one identity source.
      const { data: profile, error } = await supabase
        .from('session_profiles')
        .select('*')
        .eq('auth_user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      // 🛑 CRITICAL: Valid Auth but No Profile? -> Force Guest Mode
      if (!profile) {
        console.warn("[Session] Auth valid, but no Profile found. Access limited.");
        setSession({
          isAuthenticated: true, // They are logged in...
          user: user,
          role: ROLES.GUEST,     // ...but have no power.
          team_id: null,
          identity: null,
          loading: false
        });
        return;
      }

      // ✅ SUCCESS: Profile Found
      const cleanRole = normalizeRole(profile.role);
      
      const cleanIdentity = {
        // Map fields strictly to the View columns
        auth_user_id: profile.auth_user_id, 
        display_name: profile.display_name,
        team_id: profile.team_id,
        context: profile.context // 'admin_panel' or 'competitor'
      };

      setSession({
        isAuthenticated: true,
        user: user,
        role: cleanRole,
        team_id: profile.team_id || null, // Critical for Captain logic
        identity: cleanIdentity,
        loading: false
      });

    } catch (err) {
      console.error("[Session] Hydration Failed:", err);
      // Fallback: Keep them logged in as Guest so they can see the error or logout
      setSession({
        isAuthenticated: !!user,
        user: user,
        role: ROLES.GUEST,
        team_id: null,
        identity: null,
        loading: false
      });
    } finally {
      hydratingRef.current = false;
    }
  };

  const login = async (email, password) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      return { success: true };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setSession({ 
        isAuthenticated: false, 
        user: null, 
        role: ROLES.GUEST, 
        loading: false 
    });
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
