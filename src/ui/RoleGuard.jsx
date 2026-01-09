import React from 'react';
import { ShieldAlert } from 'lucide-react';
import { useAuth } from '../lib/auth'; // We will build this hook later

/**
 * 🛡️ ROLE GUARD
 * Conditionally renders content based on user clearance level.
 * Usage: <RoleGuard allowedRoles={['owner', 'admin']}> <AdminPanel /> </RoleGuard>
 */
const ROLE_HIERARCHY = {
  'guest': 0,
  'player': 10,
  'organizer': 50,
  'admin': 90,
  'owner': 100
};

export const RoleGuard = ({ children, allowedRoles = [], fallback = null }) => {
  const { user, profile, loading } = useAuth(); // Assumes AuthContext exists

  if (loading) return null; // Or a skeleton loader
  if (!user || !profile) return fallback;

  // 1. Check exact role match
  if (allowedRoles.includes(profile.role)) return children;

  // 2. Check hierarchy (e.g. Owner can access Admin areas)
  const userLevel = ROLE_HIERARCHY[profile.role] || 0;
  const requiredLevel = Math.min(...allowedRoles.map(r => ROLE_HIERARCHY[r] || 999));

  if (userLevel >= requiredLevel) return children;

  return fallback || (
    <div className="flex items-center gap-2 text-red-500 text-xs font-mono border border-red-900/50 bg-red-950/20 p-2 rounded-sm">
      <ShieldAlert size={14} />
      <span>RESTRICTED: LEVEL {requiredLevel} CLEARANCE REQUIRED</span>
    </div>
  );
};
