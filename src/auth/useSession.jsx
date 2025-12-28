import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../supabase/client';
import { normalizeRole, ROLES } from '../lib/roles';
import { can } from '../lib/permissions'; // ✅ INTEGRATED PERMISSIONS

const SessionContext = createContext(null);

export const SessionProvider = ({ children }) => {
  const [session, setSession] = useState({
    isAuthenticated: false,
    user: null,
    role: ROLES.GUEST,
    team_id: null,
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
          loading: false
        });
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  // 2. IDENTITY RESOLVER
  const hydrateUser = async (user) => {
    try {
      // 🛡️ SECURITY: Fetch from the 'session_profiles' SQL View
      // This view automatically determines if they are Admin, Captain, or Player
      const { data: profile, error } = await supabase
        .from('session_profiles') 
        .select('*')
        .eq('auth_user_id', user.id)
        .single();

      // Normalize Role (Safety Net)
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
      console.error("Session Hydration Error:", err);
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
    <SessionContext.Provider value={{ session, login, logout, loading: session.loading, can }}>
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = () => {
  const context = useContext(SessionContext);
  if (!context) throw new Error('useSession must be used within a SessionProvider');
  return context;
};
