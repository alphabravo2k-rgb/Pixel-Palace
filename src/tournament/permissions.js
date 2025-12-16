import { ROLES } from '../lib/roles';

export const hasRole = (session, requiredRole) => {
    if (!session || !session.isAuthenticated) return false;
    // Owner is superuser
    if (session.role === ROLES.OWNER) return true; 
    return session.role === requiredRole;
};

export const isAdmin = (session) => {
    if (!session || !session.isAuthenticated) return false;
    return session.role === ROLES.ADMIN || session.role === ROLES.OWNER;
};

export const isTeamCaptain = (session, teamId) => {
    if (!session || !session.isAuthenticated) return false;
    
    // Admins/Owners effectively act as super-captains
    if (session.role === ROLES.OWNER || session.role === ROLES.ADMIN) return true;
    
    // Strict captain check
    if (session.role === ROLES.CAPTAIN && session.teamId === teamId) return true;
    
    return false;
};
