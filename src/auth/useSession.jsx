import React, { createContext, useContext, useEffect, useState } from 'react';
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
    loading: true
  });

  // 1. BOOTSTRAP
  useEffect(() => {
    // Initial Load
    supabase.auth.getSession().then(({ data: { session: authSession } }) => {
      if (authSession?.user) hydrateUser(authSession.user);
      else setSession(prev => ({...prev, loading: false}));
    });

    // Realtime Listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, authSession) => {
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

  // 2. IDENTITY RESOLVER
  const hydrateUser = async (user) => {
    try {
      // 🛡️ SECURITY: Fetch from the 'session_profiles' SQL View (Code 9)
      const { data: profile, error } = await supabase
        .from('session_profiles') 
        .select('*')
        .eq('auth_user_id', user.id)
        .maybeSingle(); // Prevents 406 error if 0 rows found

      if (error) throw error;

      // 🛑 CRITICAL FIX: If no profile found (deleted user), Force GUEST.
      if (!profile) {
          console.warn("Session: Auth valid but Identity missing. Defaulting to Guest.");
          setSession({
            isAuthenticated: true,
            user: user,
            role: ROLES.GUEST,
            team_id: null,
            identity: null,
            loading: false
          });
          return;
      }

      // Safe Role Normalization
      const cleanRole = normalizeRole(profile.role);

      setSession({
        isAuthenticated: true,
        user: user,
        role: cleanRole,
        team_id: profile.team_id || null, // ✅ Used for Captain checks
        identity: profile, 
        loading: false
      });

    } catch (err) {
      console.error("Session Hydration Failed:", err);
      // Fallback to Guest on error to prevent lockouts
      setSession(prev => ({ 
          ...prev, 
          isAuthenticated: !!user, 
          role: ROLES.GUEST, 
          loading: false 
      }));
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

  const logout = async () => await supabase.auth.signOut();

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
