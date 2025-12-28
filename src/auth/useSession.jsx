import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../supabase/client';
import { normalizeRole, ROLES } from '../lib/roles';

const SessionContext = createContext(null);

export const SessionProvider = ({ children }) => {
  const [session, setSession] = useState({
    isAuthenticated: false,
    user: null,
    role: ROLES.GUEST,
    team_id: null, // 🛡️ CRITICAL: The Anchor for Permissions
    loading: true
  });

  // 1. BOOTSTRAP
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: authSession } }) => {
      if (authSession?.user) hydrateUser(authSession.user);
      else setSession(prev => ({...prev, loading: false}));
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, authSession) => {
      if (authSession?.user) {
        hydrateUser(authSession.user);
      } else {
        setSession({
          isAuthenticated: false,
          user: null,
          role: ROLES.GUEST,
          team_id: null,
          loading: false
        });
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  // 2. IDENTITY RESOLVER
  const hydrateUser = async (user) => {
    try {
      // 🛡️ SECURITY: Fetch from Safe View, not raw tables
      const { data: profile, error } = await supabase
        .from('global_identities') 
        .select('role, team_id, username, avatar_url')
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') console.error("Auth Hydration Error:", error);

      const cleanRole = normalizeRole(profile?.role || ROLES.PLAYER);

      setSession({
        isAuthenticated: true,
        user: user,
        role: cleanRole,
        team_id: profile?.team_id || null, 
        identity: profile, 
        loading: false
      });
    } catch (err) {
      console.error("Critical Session Failure:", err);
      setSession(prev => ({ ...prev, loading: false }));
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
