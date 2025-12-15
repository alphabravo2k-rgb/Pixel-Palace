// In a real app, 'isAdmin' should check Custom Claims in the ID Token or a 'roles' collection.
// For this demo, we are checking if the user exists.
export const isAdmin = (user) => {
  return !!user; 
};

/**
 * Checks if the current user is the captain of the specific team.
 * This is crucial for Veto and Roster management.
 */
export const isTeamCaptain = (user, team) => {
  if (!user || !team) return false;
  return team.captainId === user.uid;
};

/**
 * Checks if the current user is part of the team roster.
 */
export const isTeamMember = (user, team) => {
    if (!user || !team || !team.players) return false;
    return team.players.some(p => p.uid === user.uid);
};
