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
    isReady: false, // 🛑 Starts FALSE to block router
    isLoading: true
  });

  const mounted = useRef(true);

  // --- HELPER: Safe State Update ---
  const finalize = (newState) => {
    if (mounted.current) {
        setState(prev => ({ 
            ...prev, 
            ...newState, 
            isReady: true, 
            isLoading: false 
        }));
    }
  };

  useEffect(() => {
    const initialize = async () => {
      try {
        // 1. Check Supabase (Staff/Admins) - Priority 1
        const { data } = await supabase.auth.getSession();
        
        if (data?.session?.user) {
          await hydrateAdmin(data.session.user);
        } else {
          // 2. Check Local Storage (Captain/Players) - Priority 2
          const localCap = localStorage.getItem('pixel_captain_session');
          if (localCap) {
            try {
              const parsed = JSON.parse(localCap);
              if (parsed && parsed.accessCode) {
                 const result = await verifyCaptain(parsed.accessCode);
                 if (result.success) {
                   finalize({ ...result.session });
                   return;
                 } else {
                   // Invalid code found in storage? WIPE IT.
                   console.warn("Stale Captain Session Detected. Purging.");
                   localStorage.removeItem('pixel_captain_session');
                 }
              }
            } catch (e) {
              console.warn("Corrupt Session Storage", e);
              localStorage.removeItem('pixel_captain_session');
            }
          }
          // 3. Fallback to Guest
          finalize({ 
              isAuthenticated: false, 
              user: null, 
              role: ROLES.GUEST, 
              authType: 'GUEST' 
          });
        }
      } catch (err) {
        console.error("Boot Error:", err);
        finalize({ role: ROLES.GUEST }); 
      }
    };

    initialize();

    // Listen for Auth Changes (Supabase only)
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
            hydrateAdmin(session.user);
        } else if (!localStorage.getItem('pixel_captain_session')) {
            // Only drop to guest if not holding a captain session
            finalize({ 
                isAuthenticated: false, 
                user: null, 
                role: ROLES.GUEST, 
                authType: 'GUEST' 
            });
        }
    });

    return () => { 
        mounted.current = false;
        authListener?.subscription.unsubscribe(); 
    };
  }, []);

  // --- HELPER: Hydrate Admin ---
  const hydrateAdmin = async (user) => {
    try {
      // Query the specific app_admins table we created
      const { data: profile } = await supabase
        .from('app_admins')
        .select('*')
        .eq('auth_user_id', user.id)
        .maybeSingle();
      
      // Determine Role
      const role = profile ? normalizeRole(profile.role) : ROLES.GUEST;

      finalize({
        isAuthenticated: true,
        user: user,
        role: role,
        team_id: null,
        identity: { 
          auth_user_id: user.id, 
          display_name: profile?.full_name || user.email,
          is_staff: true,
          ...profile
        },
        authType: 'SUPABASE'
      });
    } catch (e) { 
        console.error("Admin Hydration Failed:", e);
        finalize({ role: ROLES.GUEST });
    }
  };

  // --- HELPER: Verify Captain ---
  const verifyCaptain = async (code) => {
      try {
        const { data, error } = await supabase.rpc('verify_team_access', { p_code: code });
        
        if (error || !data || !data.success) {
            return { success: false, message: error?.message || 'Invalid Access Code' };
        }
        
        return {
            success: true,
            session: {
                isAuthenticated: true,
                user: { id: 'captain-session' }, // Placeholder for generic structure
                role: ROLES.CAPTAIN,
                team_id: data.team_id,
                identity: { 
                    id: data.team_id, 
                    display_name: `Captain (${data.team_name})`, 
                    team_id: data.team_id, 
                    team_name: data.team_name
                },
                authType: 'CAPTAIN_PIN'
            }
        };
      } catch (e) {
          return { success: false, message: 'Verification Error' };
      }
  };

  // --- PUBLIC ACTIONS ---
  const loginAdmin = async (email, password) => {
    // 🛡️ SECURITY: Clear any captain sessions first to prevent "State Pollution"
    localStorage.removeItem('pixel_captain_session');
    
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { success: false, message: error.message };
    
    // State update happens via onAuthStateChange listener
    return { success: true }; 
  };

  const loginCaptain = async (accessCode) => {
    // 🛡️ SECURITY: Clear any admin sessions first
    if (state.authType === 'SUPABASE') await supabase.auth.signOut();

    const result = await verifyCaptain(accessCode);
    if (result.success) {
        localStorage.setItem('pixel_captain_session', JSON.stringify({ accessCode }));
        finalize({ ...result.session });
        return { success: true, role: 'captain' };
    }
    return { success: false, message: result.message };
  };

  const logout = async () => {
    // 🧹 CLEANUP: Nuke everything
    localStorage.removeItem('pixel_captain_session');
    if (state.authType === 'SUPABASE') {
        await supabase.auth.signOut();
    }
    finalize({ 
        isAuthenticated: false, 
        user: null, 
        role: ROLES.GUEST, 
        team_id: null, 
        identity: null, 
        authType: 'GUEST' 
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
};
