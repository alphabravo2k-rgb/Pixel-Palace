import { useCallback } from 'react';
import { useSession } from './useSession';
import { can as checkPermission } from '../lib/security/engine'; // ✅ LINKED TO NEW ENGINE

/**
 * 🛡️ USE CAPABILITIES: PERMISSION HOOK
 * ------------------------------------
 * STATUS: MASTERED (BURJ KHALIFA STANDARD)
 * * PURPOSE:
 * Provides a React Hook interface for the Security Engine.
 * Allows components to ask: "Can the current user do X?"
 */

export const useCapabilities = () => {
  const { session } = useSession();

  const can = useCallback((capability, context = null) => {
    // 1. Guard: Fail closed if system is loading or user is offline
    if (!session || session.isLoading || !session.isAuthenticated) {
        return false;
    }
    
    // 2. Delegate: Ask the Master Security Engine
    // We pass the session object because it contains the 'role'
    return checkPermission(capability, session, context);
  }, [session]);

  return { can };
};
