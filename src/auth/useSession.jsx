import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import { supabase } from '../supabase/client';
import { normalizeRole, ROLES } from '../lib/roles';

/**
 * 🔐 PIXEL PALACE: IDENTITY CORE
 * ------------------------------
 * STATUS: MASTERED (DUBAI STANDARD)
 * * ARCHITECTURE:
 * 1. DUAL-AUTH: Handles Supabase Users (Admins) AND LocalStorage Codes (Captains).
 * 2. RACE-CONDITION PROOF: Uses `mounted` refs to prevent memory leaks during rapid navigation.
 * 3. SELF-HEALING: Automatically purges corrupt sessions on boot.
 */

const SessionContext = createContext(null);

export const SessionProvider = ({ children }) => {
  const [state, setState] = useState({
    isAuthenticated: false,
    user: null,
    role: ROLES.GUEST,
    team_id: null,
    identity: null,
    authType: 'GUEST', // 'GUEST' | 'SUPABASE' | 'CAPTAIN_PIN'
    isReady: false,    // 🛑 Critical: Blocks router until checks complete
    isLoading: true
  });

  const mounted = useRef(true);

  // --- 🛠️ HELPER: Safe State Injection ---
  const finalize = useCallback((newState) => {
    if (mounted.current) {
      setState(prev => ({ 
        ...prev, 
        ...newState, 
        isReady: true, 
        isLoading: false 
      }));
    }
  }, []);

  // --- 🔄 INITIALIZATION SEQUENCE ---
  useEffect(() => {
    const initialize = async () => {
      try {
        // 1. PRIORITY ONE: Check Supabase (Staff/Admins)
        const { data } = await supabase.auth.getSession();
        
        if (data?.session?.user) {
          await hydrateAdmin(data.session.user);
        } else {
          // 2. PRIORITY TWO: Check Local Storage (Captain/Players)
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
                   // Security: If code is invalid/expired on server, kill it locally.
                   console.warn("⚠️ Nexus Security: Stale Captain Session Purged.");
                   localStorage.removeItem('pixel_captain_session');
                 }
              }
            } catch (e) {
              console.error("⚠️ Nexus Corrupt Data:", e);
              localStorage.removeItem('pixel_captain_session');
            }
          }
          
          // 3. FALLBACK: Guest Mode
          finalize({ 
             isAuthenticated: false, 
             user: null, 
             role: ROLES.GUEST, 
             authType: 'GUEST' 
          });
        }
      } catch (err) {
        console.error("🔥 CRITICAL BOOT ERROR:", err);
        finalize({ role: ROLES.GUEST }); 
      }
    };

    initialize();

    // 🎧 Listen for Supabase Auth Events (Magic Links / Admin Logins)
    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
        if (session?.user) {
            await hydrateAdmin(session.user);
        } else if (!localStorage.getItem('pixel_captain_session')) {
            // Only drop to guest if not holding a valid captain session
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
  }, [finalize]);

  // --- 👤 HYDRATION: ADMIN ---
  const hydrateAdmin = async (user) => {
    try {
      // Fetch profile from 'app_admins' table
      const { data: profile } = await supabase
        .from('app_admins')
        .select('*')
        .eq('auth_user_id', user.id)
        .maybeSingle();
      
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
      
      console.log(`%c 🛡️ COMMAND LINK: [${role}]`, "color: #e879f9; font-weight: bold;");
    } catch (e) { 
        console.error("Admin Hydration Failed:", e);
        finalize({ role: ROLES.GUEST });
    }
  };

  // --- 🛡️ VERIFICATION: CAPTAIN ---
  const verifyCaptain = async (code) => {
      try {
        // Calls the secure Database Function (RPC)
        const { data, error } = await supabase.rpc('verify_team_access', { p_code: code });
        
        if (error || !data || !data.success) {
            return { success: false, message: error?.message || 'Invalid Access Code' };
        }
        
        return {
            success: true,
            session: {
                isAuthenticated: true,
                user: { id: `cap_${data.team_id}` }, 
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
          return { success: false, message: 'Verification Exception' };
      }
  };

  // --- 🚀 PUBLIC ACTIONS ---
  
  const loginAdmin = async (email, password) => {
    // Security: Clear any captain sessions first to prevent "Double Identity"
    localStorage.removeItem('pixel_captain_session');
    
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { success: false, message: error.message };
    
    return { success: true }; 
  };

  const loginCaptain = async (accessCode) => {
    // Security: Logout any admin session first
    if (state.authType === 'SUPABASE') await supabase.auth.signOut();

    const result = await verifyCaptain(accessCode);
    
    if (result.success) {
        localStorage.setItem('pixel_captain_session', JSON.stringify({ accessCode }));
        finalize({ ...result.session });
        return { success: true, role: ROLES.CAPTAIN };
    }
    return { success: false, message: result.message };
  };

  const logout = async () => {
    console.log("👋 Terminating Session...");
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
