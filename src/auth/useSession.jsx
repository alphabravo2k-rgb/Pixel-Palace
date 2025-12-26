import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../supabase/client';

const SessionContext = createContext(null);

export const SessionProvider = ({ children }) => {
  const [session, setSession] = useState({
    isAuthenticated: false,
    user: null,    // The Auth User (Email/Password)
    identity: null, // The Global Identity (Profile, Avatar)
    role: 'GUEST'   // The Calculated Role
  });
  const [loading, setLoading] = useState(true);

  // 1. BOOTSTRAP: Listen for Auth Changes (The "Real" Source of Truth)
  useEffect(() => {
    // Check active session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      handleSessionUpdate(session);
    });

    // Subscribe to changes (Login, Logout, Auto-Refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      handleSessionUpdate(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // 2. IDENTITY RESOLVER: Turn a "Auth User" into a "Pixel Palace Admin"
  const handleSessionUpdate = async (authSession) => {
    if (!authSession?.user) {
      setSession({ isAuthenticated: false, user: null, identity: null, role: 'GUEST' });
      setLoading(false);
      return;
    }

    try {
      // A. Fetch the Global Identity
      const { data: identity, error } = await supabase
        .from('global_identities')
        .select('*')
        .eq('auth_user_id', authSession.user.id)
        .single();

      if (error || !identity) {
        console.warn("User authenticated but has no Global Identity.");
        // Fallback for fresh users (Standard behavior)
      }

      // B. Determine Highest Role (Simple check for now, RBAC handles specific permissions)
      // We check if they exist in the 'app_admins' table for legacy compatibility
      // OR if they have the 'OWNER' permission in the new system.
      let role = 'PLAYER';
      
      const { data: adminRecord } = await supabase
        .from('app_admins') // Legacy table bridge
        .select('role')
        .eq('id', authSession.user.id) // Assuming we migrated IDs, otherwise use email mapping
        .maybeSingle();

      if (adminRecord) role = adminRecord.role;

      // C. Update State
      setSession({
        isAuthenticated: true,
        user: authSession.user,
        identity: identity || { username: 'Unknown Agent' },
        role: role
      });

    } catch (err) {
      console.error("Identity Verification Failed:", err);
    } finally {
      setLoading(false);
    }
  };

  // 3. EXPOSED ACTIONS
  const login = async (email, password) => {
    setLoading(true);
    // CRITICAL CHANGE: We now use Email/Password, not PINs
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setLoading(false);
      return { success: false, message: error.message };
    }
    
    // The useEffect hook will handle the state update automatically
    return { success: true };
  };

  const logout = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    // State clears automatically via subscription
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
