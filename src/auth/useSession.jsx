import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { supabase } from '../supabase/client';
import { normalizeRole, ROLES } from '../lib/roles';

const SessionContext = createContext(null);

export const SessionProvider = ({ children }) => {
  const [state, setState] = useState({
    isAuthenticated: false,
    user: null,
    role: ROLES.GUEST,
    team_id: null,
    identity: null,
    authType: 'GUEST',
    isReady: false // 🛑 THE BLOCKER: False until we are 100% sure
  });

  const mounted = useRef(true);

  useEffect(() => {
    let subscription = null;

    const initialize = async () => {
      // 1. Check Supabase (Staff)
      const { data: { session: sbSession } } = await supabase.auth.getSession();
      
      if (sbSession?.user) {
        await hydrateAdmin(sbSession.user);
      } else {
        // 2. Check Local Storage (Captain)
        const localCap = localStorage.getItem('pixel_captain_session');
        if (localCap) {
          try {
            const parsed = JSON.parse(localCap);
            // Verify token/code validity if needed
            if (parsed.accessCode) {
               // Silent verify
               const result = await verifyCaptain(parsed.accessCode);
               if (result.success) {
                 finalize({ ...result.session, isReady: true });
                 return;
               }
            }
          } catch (e) {
            localStorage.removeItem('pixel_captain_session');
          }
        }
        // 3. Fallback to Guest
        finalize({ 
            isAuthenticated: false, 
            user: null, 
            role: ROLES.GUEST, 
            authType: 'GUEST', 
            isReady: true 
        });
      }
    };

    initialize();

    // Listen for Auth Changes (Sign In / Sign Out)
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) hydrateAdmin(session.user);
        else if (!localStorage.getItem('pixel_captain_session')) {
            // Only drop to guest if not a captain
            finalize({ 
                isAuthenticated: false, 
                user: null, 
                role: ROLES.GUEST, 
                authType: 'GUEST', 
                isReady: true 
            });
        }
    });
    subscription = data.subscription;

    return () => { 
        mounted.current = false;
        subscription?.unsubscribe(); 
    };
  }, []);

  // --- HELPER: Update State Safely ---
  const finalize = (newState) => {
      if (mounted.current) setState(prev => ({ ...prev, ...newState }));
  };

  // --- HELPER: Hydrate Admin ---
  const hydrateAdmin = async (user) => {
    try {
      const { data: profile } = await supabase
        .from('session_profiles')
        .select('*')
        .eq('auth_user_id', user.id)
        .maybeSingle();
      
      finalize({
        isAuthenticated: true,
        user: user,
        role: normalizeRole(profile?.role || 'GUEST'),
        team_id: profile?.team_id,
        identity: { 
          auth_user_id: user.id, 
          display_name: profile?.display_name || user.email,
          is_staff: profile?.context?.is_staff || false
        },
        authType: 'SUPABASE',
        isReady: true
      });
    } catch (e) { 
      finalize({ isReady: true }); // Fail safe
    }
  };

  // --- HELPER: Verify Captain (Internal) ---
  const verifyCaptain = async (code) => {
      const { data, error } = await supabase.rpc('verify_team_access', { p_code: code });
      if (error || !data.success) return { success: false };
      
      return {
          success: true,
          session: {
            isAuthenticated: true,
            role: 'CAPTAIN',
            team_id: data.team_id,
            identity: { id: data.team_id, display_name: `Captain (${data.team_name})`, team_id: data.team_id },
            authType: 'CAPTAIN_PIN'
          }
      };
  };

  // --- PUBLIC ACTIONS ---
  const loginAdmin = async (email, password) => {
    localStorage.removeItem('pixel_captain_session');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { success: false, message: error.message };
    return { success: true };
  };

  const loginCaptain = async (accessCode) => {
    const result = await verifyCaptain(accessCode);
    if (result.success) {
        localStorage.setItem('pixel_captain_session', JSON.stringify({ accessCode }));
        finalize({ ...result.session, isReady: true });
        return { success: true };
    }
    return { success: false, message: 'Invalid Access Code' };
  };

  const logout = async () => {
    localStorage.removeItem('pixel_captain_session');
    await supabase.auth.signOut();
    finalize({ 
        isAuthenticated: false, 
        user: null, 
        role: ROLES.GUEST, 
        authType: 'GUEST',
        isReady: true 
    });
  };

  return (
    <SessionContext.Provider value={{ session: state, loginAdmin, loginCaptain, logout }}>
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = () => {
    const context = useContext(SessionContext);
    if (!context) throw new Error("useSession must be used within SessionProvider");
    return context;
};s
