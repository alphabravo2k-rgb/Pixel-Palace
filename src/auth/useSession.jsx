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
    supabase.auth.getSession().then(({ data: { session: authSession } }) => {
      if (authSession?.user) hydrateUser(authSession.user);
      else setSession(prev => ({...prev, loading: false}));
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, authSession) => {
      if (authSession?.user) {
        hydrateUser(authSession.user);
      } else {
        setSession({ isAuthenticated: false, user: null, role: ROLES.GUEST, team_id: null, identity: null, loading: false });
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const hydrateUser = async (user) => {
    if (hydratingRef.current) return;
    hydratingRef.current = true;

    try {
      const { data: profile, error } = await supabase.from('session_profiles')
        .select('*')
        .eq('auth_user_id', user.id)
        .maybeSingle();

      if (error || !profile) {
        setSession({ isAuthenticated: true, user, role: ROLES.GUEST, team_id: null, identity: null, loading: false });
        return;
      }

      const cleanRole = normalizeRole(profile.role);
      const cleanIdentity = { id: profile.id, auth_user_id: profile.auth_user_id, display_name: profile.display_name, team_id: profile.team_id, context: profile.context };

      setSession({
        isAuthenticated: true,
        user: user,
        role: cleanRole,
        team_id: profile.team_id || null,
        identity: cleanIdentity,
        loading: false
      });
    } catch (err) {
      setSession(prev => ({ ...prev, isAuthenticated: !!user, role: ROLES.GUEST, loading: false }));
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
