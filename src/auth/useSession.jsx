import React from 'react';
import { useNexusStore } from '../store/useNexusStore';

/**
 * 🔐 PIXEL PALACE: IDENTITY BRIDGE
 * --------------------------------
 * STATUS: MASTERED (BURJ KHALIFA STANDARD)
 * * ARCHITECTURE:
 * 1. ZUSTAND INTEGRATION: Connects legacy UI components to the global 'NexusStore'.
 * 2. PERFORMANCE: Eliminates React Context re-render hell.
 * 3. COMPATIBILITY: Maintains the exact API expected by Router and Login.
 */

// 1. THE PROVIDER (Legacy Wrapper)
// We keep this component so App.jsx doesn't crash, but it no longer holds state.
// The state now lives in the high-performance 'useNexusStore'.
export const SessionProvider = ({ children }) => {
  return <>{children}</>;
};

// 2. THE HOOK (The Bridge)
export const useSession = () => {
  // 🧠 Access the Global Brain directly
  const store = useNexusStore();

  // 🔄 MAP STATE: Zustand -> Session Interface
  // This ensures 'router.jsx' and 'UnifiedLogin.jsx' get exactly what they expect.
  const session = {
    isAuthenticated: !!store.uid, // If we have a UID, we are logged in
    user: store.uid ? { id: store.uid, ...store.profile } : null,
    role: store.profile?.role || 'guest',
    team_id: store.profile?.team_id,
    profile: store.profile,
    authType: store.authType || 'GUEST', 
    
    // 🚦 ROUTER SIGNALS
    isReady: store.isHydrated, // True when LocalStorage has been read
    isLoading: !store.isHydrated
  };

  // ⚡ ACTION PROXIES
  return {
    session,
    loginAdmin: store.loginAdmin,
    loginCaptain: store.loginCaptain,
    logout: store.clearNexus
  };
};
