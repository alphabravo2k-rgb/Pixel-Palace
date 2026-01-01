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
    loading: true,
    authType: 'GUEST' // 'SUPABASE' or 'CAPTAIN_PIN'
  });

  // 1. Initial Load & Realtime Listener
  useEffect(() => {
    // A. Check for Captain Session (Local Storage)
    const localCaptain = localStorage.getItem('pixel_captain_session');
    if (localCaptain) {
        try {
            const capData = JSON.parse(localCaptain);
            // Verify session is valid (optional: could ping DB here)
            setSession(capData);
            return; 
        } catch (e) {
            localStorage.removeItem('pixel_captain_session');
        }
    }

    // B. Check Supabase Auth (Admins)
    supabase.auth.getSession().then(({ data: { session: authSession } }) => {
      if (authSession?.user) hydrateUser(authSession.user);
      else setAsGuest();
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, authSession) => {
      if (authSession?.user) hydrateUser(authSession.user);
      // Don't reset if we are logged in as a Captain via PIN
      else if (!localStorage.getItem('pixel_captain_session')) setAsGuest();
    });

    return () => subscription.unsubscribe();
  }, []);

  // Helper to reset state
  const setAsGuest = () => {
    setSession({
      isAuthenticated: false, user: null, role: ROLES.GUEST,
      team_id: null, identity: null, loading: false, authType: 'GUEST'
    });
  };

  // 2. Hydration Logic (For Admins/Staff via Email)
  const hydrateUser = async (user) => {
    if (hydratingRef.current) return;
    hydratingRef.current = true;

    try {
      const { data: profile, error } = await supabase
        .from('session_profiles')
        .select('*')
        .eq('auth_user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      if (!profile) {
        console.warn("[Session] Auth valid, but no Profile found.");
        setSession({
          isAuthenticated: true, user: user, role: ROLES.GUEST,
          team_id: null, identity: null, loading: false, authType: 'SUPABASE'
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
          context: profile.context
        },
        loading: false,
        authType: 'SUPABASE'
      });

    } catch (err) {
      console.error("[Session] Hydration Error:", err);
      setAsGuest();
    } finally {
      hydratingRef.current = false;
    }
  };

  // 3. Login Functions

  // A. Admin Login (Email/Pass)
  const loginAdmin = async (email, password) => {
    try {
      localStorage.removeItem('pixel_captain_session'); // Clear any captain session
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;

      // Optimistic check to return role immediately
      const { data: roleData } = await supabase
        .from('session_profiles')
        .select('role')
        .eq('auth_user_id', data.user.id)
        .single();

      return { success: true, role: roleData?.role || 'GUEST' };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  // B. Captain Login (Access Code)
  const loginCaptain = async (accessCode) => {
      try {
          // Call the SQL Function
          const { data, error } = await supabase.rpc('verify_team_access', { p_code: accessCode });
          
          if (error) throw error;
          if (!data || !data.success) return { success: false, message: data?.message || 'Invalid Code' };

          // Construct Captain Session
          const capSession = {
              isAuthenticated: true,
              user: { id: 'captain_session' }, // Dummy user object
              role: ROLES.CAPTAIN,
              team_id: data.team_id,
              identity: {
                  id: data.team_id, // For captains, Identity ID = Team ID
                  display_name: `Captain (${data.team_name})`,
                  team_id: data.team_id
              },
              loading: false,
              authType: 'CAPTAIN_PIN'
          };

          // Save & Set
          localStorage.setItem('pixel_captain_session', JSON.stringify(capSession));
          setSession(capSession);
          
          return { success: true, role: ROLES.CAPTAIN };

      } catch (err) {
          console.error(err);
          return { success: false, message: "Verification failed." };
      }
  };

  const logout = async () => {
    localStorage.removeItem('pixel_captain_session');
    await supabase.auth.signOut();
    setAsGuest();
  };

  return (
    <SessionContext.Provider value={{ session, login: loginAdmin, loginCaptain, logout, loading: session.loading }}>
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = () => {
  const context = useContext(SessionContext);
  if (!context) throw new Error('useSession must be used within a SessionProvider');
  return context;
};
