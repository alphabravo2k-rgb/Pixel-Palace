import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../supabase/client';

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
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) handleSessionUpdate(session);
      else setLoading(false); // No session found, stop loading
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) handleSessionUpdate(session);
      else {
         // Only clear if we aren't using a mocked PIN session
         // We check inside the state setter to be safe
         setSession(prev => prev.user?.isMock ? prev : { isAuthenticated: false, user: null, identity: null, role: 'GUEST' });
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // 2. IDENTITY RESOLVER
  const handleSessionUpdate = async (authSession) => {
    if (!authSession?.user) return;

    try {
      // A. Try to fetch Global Identity
      const { data: identity } = await supabase
        .from('global_identities')
        .select('*')
        .eq('auth_user_id', authSession.user.id)
        .maybeSingle();

      // B. Determine Role
      let role = 'PLAYER';
      const { data: adminRecord } = await supabase
        .from('app_admins')
        .select('role')
        .eq('id', authSession.user.id)
        .maybeSingle();

      if (adminRecord) role = adminRecord.role;

      setSession({
        isAuthenticated: true,
        user: authSession.user,
        identity: identity || { username: authSession.user.email || 'Agent' },
        role: role
      });

    } catch (err) {
      console.error("Identity Verification Failed:", err);
    } finally {
      setLoading(false);
    }
  };

  // 3. EXPOSED ACTIONS (THE HYBRID LOGIN LOGIC)
  const login = async (credential, passwordOrPin) => {
    setLoading(true);

    try {
      // STRATEGY A: Try Email/Password (Supabase Auth - The Future)
      if (credential.includes('@')) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: credential,
          password: passwordOrPin,
        });
        
        if (!error && data.user) {
           // Identity resolution happens in useEffect
           return { success: true, role: 'PLAYER' }; // Role updates async
        }
      }

      // STRATEGY B: PIN / Access Code (Legacy Bridge - The Present)
      // 1. Check Admin PINs
      const { data: adminData } = await supabase
        .from('app_admins')
        .select('*')
        .eq('pin_code', passwordOrPin)
        .maybeSingle();

      if (adminData) {
        // MOCK SESSION for Admin
        const mockUser = { id: adminData.id, email: 'admin@legacy.com', isMock: true };
        setSession({
          isAuthenticated: true,
          user: mockUser,
          identity: { id: adminData.id, username: adminData.name, role: adminData.role },
          role: adminData.role
        });
        setLoading(false);
        return { success: true, role: adminData.role };
      }

      // 2. Check Team/Captain Access Codes
      const { data: teamData } = await supabase
        .from('teams')
        .select('*')
        .eq('access_code', passwordOrPin)
        .maybeSingle();

      if (teamData) {
        // MOCK SESSION for Captain
        const mockUser = { id: teamData.id, email: 'captain@legacy.com', isMock: true };
        setSession({
          isAuthenticated: true,
          user: mockUser,
          identity: { id: teamData.id, username: credential || teamData.name, team_id: teamData.id },
          role: 'CAPTAIN'
        });
        setLoading(false);
        return { success: true, role: 'CAPTAIN' };
      }

      return { success: false, message: 'Invalid Access Code or Email' };

    } catch (err) {
      console.error("Login Error:", err);
      return { success: false, message: 'System Error during Auth' };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    // Clear state explicitly for mock sessions
    setSession({ isAuthenticated: false, user: null, identity: null, role: 'GUEST' });
    setLoading(false);
  };

  return (
    <SessionContext.Provider value={{ session, login, logout, loading }}>
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = () => {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
};
