/**
 * 🔐 PIXEL PALACE: IDENTITY BRIDGE (GENESIS OMNI)
 * VERSION: 2050.5.0 (MASTER OMNI)
 * STATUS: OPERATIONAL // DATA-DECOUPLED
 */

import React from 'react';
import { useNexusStore } from '../store/useNexusStore';

/**
 * THE PROVIDER (Legacy Architecture Wrapper)
 * Retained for root-level component hierarchy compatibility.
 * In the Omni architecture, state lives in the Store, not Context.
 */
export const SessionProvider = ({ children }) => {
  return <>{children}</>;
};

/**
 * THE HOOK (The Bridge)
 * High-fidelity interface between Zustand and React components.
 */
export const useSession = () => {
  const store = useNexusStore();

  /**
   * 🔄 IDENTITY MATRIX
   * Maps high-performance Zustand state into the tactical session object.
   */
  const sessionData = {
    // 🚦 STATE SIGNALS
    isAuthenticated: !!store.uid,
    isReady: store.isHydrated,
    isLoading: !store.isHydrated,

    // 👤 USER INTELLIGENCE
    uid: store.uid,
    user: store.uid ? { id: store.uid, ...store.profile } : null,
    profile: store.profile,
    
    // 🛡️ CLEARANCE & HIERARCHY
    role: store.profile?.role || 'guest',
    teamId: store.profile?.team_id || null, // Normalized to camelCase for modern components
    team_id: store.profile?.team_id || null, // Legacy support for older components
    authType: store.authType || 'GUEST',

    // 🧩 METADATA
    lastSync: store.lastSync
  };

  /**
   * ⚡ EXECUTION LAYER
   * Proxies for global store actions and exposes state directly.
   */
  return {
    // Legacy Session Object (for router.jsx compatibility)
    session: sessionData,
    
    // Direct Access API (Preferred for new components)
    isAuthenticated: sessionData.isAuthenticated,
    isReady: sessionData.isReady,
    isLoading: sessionData.isLoading,
    user: sessionData.user,
    role: sessionData.role,
    
    // Auth Commands
    loginAdmin: store.loginAdmin,
    loginCaptain: store.loginCaptain,
    logout: store.clearNexus,
    
    // Management
    sync: store.syncNexus
  };
};
