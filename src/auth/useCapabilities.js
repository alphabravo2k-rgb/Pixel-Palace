import { useCallback } from 'react';
import { useSession } from './useSession';
import { can as checkPermission } from '../lib/permissions';

export const useCapabilities = () => {
  const { session } = useSession();

  const can = useCallback((capability, context = null) => {
    // 🛡️ Guard: Fail closed (deny) if session is loading or invalid
    if (!session || session.isLoading || !session.isAuthenticated) {
        return false;
    }
    
    // Delegate to the Master Permission Engine
    return checkPermission(capability, session, context);
  }, [session]);

  return { can };
};
