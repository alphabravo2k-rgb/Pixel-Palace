import { useCallback } from 'react';
import { useSession } from './useSession';
import { can as checkPermission } from '../lib/permissions';

export const useCapabilities = () => {
  const { session } = useSession();

  const can = useCallback((capability, context = null) => {
    if (!session || session.loading) return false;
    return checkPermission(capability, session, context);
  }, [session]);

  return { can };
};
