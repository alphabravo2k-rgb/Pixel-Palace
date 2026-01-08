/**
 * 🕹️ ADMIN MODULE BARREL FILE
 * --------------------------
 * STATUS: MASTERED (CLEAN EXPORTS)
 * EXPORTS: Only active, approved components.
 */

// 1. DASHBOARD & HUB
export { AdminDashboard } from './AdminDashboard';
export { AdminToolbar } from './AdminToolbar';
export { SystemDiagnostic } from './SystemDiagnostic';
export { AdminProfile } from './AdminProfile';

// 2. MATCH CONTROL
export { MatchWarRoom } from './MatchWarRoom';
export { AdminMatchControls } from './AdminMatchControls';

// 3. TEAM & STAFF MANAGEMENT
export { StaffManagement } from './StaffManagement';
export { TeamRosterView } from './TeamRosterView';
export { TeamStatusControl } from './TeamStatusControl';
export { RosterIntegrityControl } from './RosterIntegrityControl';

// 4. LOGS & AUDITS
export { AdminAuditLog } from './AdminAuditLog';

// ❌ DEPRECATED / REMOVED:
// export { AdminLogin } -> Use src/components/auth/UnifiedLogin.jsx
// export { AdminMatchModal } -> Use src/components/MatchModal.jsx
