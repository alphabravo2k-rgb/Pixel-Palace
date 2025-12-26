import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../supabase/client';
import { normalizeRole } from '../lib/roles';

const SessionContext = createContext(null);

export const SessionProvider = ({ children }) => {
  const [session, setSession] = useState({
    isAuthenticated: false,
    user: null,    
    identity: null, 
    role: 'GUEST'   
  });
  const [loading, setLoading] = useState(true);

  // 1. BOOTSTRAP: Listen for Auth Changes
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: authSession } }) => {
      if (authSession) handleSessionUpdate(authSession);
      else setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, authSession) => {
      if (authSession) handleSessionUpdate(authSession);
      else {
        setSession(prev => prev.user?.isMock ? prev : { 
          isAuthenticated: false, 
          user: null, 
          identity: null, 
          role: 'GUEST' 
        });
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // 2. IDENTITY RESOLVER
  const handleSessionUpdate = async (authSession) => {
    if (!authSession?.user) return;

    try {
      // A. Fetch Global Identity
      const { data: identity } = await supabase
        .from('global_identities')
        .select('*')
        .eq('id', authSession.user.id)
        .maybeSingle();

      // B. Determine Role
      let rawRole = 'PLAYER';
      const { data: adminRecord } = await supabase
        .from('app_admins')
        .select('role')
        .eq('id', authSession.user.id)
        .maybeSingle();

      if (adminRecord) rawRole = adminRecord.role;

      // C. NORMALIZE ROLE
      const cleanRole = normalizeRole(rawRole);

      setSession({
        isAuthenticated: true,
        user: authSession.user,
        identity: identity || { username: authSession.user.email?.split('@')[0] || 'Agent' },
        role: cleanRole
      });

    } catch (err) {
      console.error("Identity Verification Failed:", err);
    } finally {
      setLoading(false);
    }
  };

  // 3. EXPOSED ACTIONS
  const login = async (credential, passwordOrPin) => {
    setLoading(true);

    try {
      // STRATEGY A: Email/Password
      if (credential.includes('@')) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: credential.trim(),
          password: passwordOrPin.trim(),
        });
        
        if (error) throw error;
        return { success: true }; 
      }

      // STRATEGY B: PIN / Access Code (Secure Bridge)
      
      // 1. Check Admin PINs (Via Secure RPC)
      const { data: adminAuthData, error: adminAuthError } = await supabase
        .rpc('api_verify_admin_pin', { p_pin: passwordOrPin.trim() });
      
      // The RPC returns a row if successful, or empty/null if failed
      if (adminAuthData && adminAuthData.length > 0 && adminAuthData[0].success) {
         const adminUser = adminAuthData[0];
         const cleanRole = normalizeRole(adminUser.role);

         // Fetch profile identity if available
         const { data: profile } = await supabase
            .from('global_identities')
            .select('*')
            .eq('id', adminUser.id)
            .maybeSingle();

         setSession({
            isAuthenticated: true,
            user: { id: adminUser.id, email: 'admin@pixelpalace.gg', isMock: true },
            identity: profile || { id: adminUser.id, username: adminUser.name, role: cleanRole },
            role: cleanRole
         });
         return { success: true, role: cleanRole };
      }

      // 2. Check Team Captains
      const { data: teamData } = await supabase
        .from('teams')
        .select('*')
        .eq('access_code', passwordOrPin.trim())
        .maybeSingle();

      if (teamData) {
        setSession({
          isAuthenticated: true,
          user: { id: teamData.id, isMock: true },
          identity: { id: teamData.id, username: credential || teamData.name, team_id: teamData.id },
          role: 'CAPTAIN'
        });
        return { success: true, role: 'CAPTAIN' };
      }

      return { success: false, message: 'Invalid Access Code or Email' };

    } catch (err) {
      console.error("Login Error:", err);
      return { success: false, message: err.message || 'Auth System Error' };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setSession({ isAuthenticated: false, user: null, identity: null, role: 'GUEST' });
  };

  return (
    <SessionContext.Provider value={{ session, login, logout, loading }}>
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = () => {
  const context = useContext(SessionContext);
  if (!context) throw new Error('useSession must be used within a SessionProvider');
  return context;
};
