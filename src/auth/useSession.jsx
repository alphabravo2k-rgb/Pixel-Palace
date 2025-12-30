import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { supabase } from '../supabase/client';
import { normalizeRole, ROLES } from '../lib/roles';

const SessionContext = createContext(null);

export const SessionProvider = ({ children }) => {
  const hydratingRef = useRef(false); // 🔒 Lock to prevent race conditions

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

  // 2. IDENTITY RESOLVER (Race-Condition Proof)
  const hydrateUser = async (user) => {
    if (hydratingRef.current) return; // 🔒 Skip if already hydrating
    hydratingRef.current = true;

    try {
      // 🛡️ SECURITY: Fetch from the 'session_profiles' SQL View
      const { data: profile, error } = await supabase
        .from('session_profiles') 
        .select('*')
        .eq('auth_user_id', user.id)
        .maybeSingle(); 

      if (error) throw error;

      // 🛑 CRITICAL: If no profile found (deleted user), Force GUEST.
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

      // 🛡️ DATA SANITIZATION: Whitelist identity fields
      // Do NOT pass the raw DB object to the UI
      const cleanIdentity = {
          id: profile.id, // Or whatever ID field your view returns
          auth_user_id: profile.auth_user_id,
          display_name: profile.display_name || profile.name,
          team_id: profile.team_id,
          context: profile.context
      };

      setSession({
        isAuthenticated: true,
        user: user,
        role: cleanRole,
        team_id: profile.team_id || null, // ✅ Critical for Captain checks
        identity: cleanIdentity, 
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
    } finally {
        hydratingRef.current = false; // 🔓 Release lock
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
