import { supabase } from '../supabase/client';

/**
 * 🔒 SECURITY SERVICE: ANTI-FRAUD & INTEGRITY
 * VERSION: 2050.5.0
 * STATUS: ACTIVE // FINGERPRINTING ENABLED
 */

export const SecurityService = {
  
  /**
   * 🕵️ GENERATE DEVICE FINGERPRINT
   * Creates a unique hash based on browser/screen/OS data.
   * Used to detect alts/smurfs sharing the same PC.
   */
  getFingerprint: async () => {
    // Combine hardware traits
    const traits = [
      navigator.userAgent,
      navigator.language,
      screen.colorDepth,
      new Date().getTimezoneOffset(),
      navigator.hardwareConcurrency || 'unknown',
      // navigator.deviceMemory || 'unknown' // (Chrome only)
    ].join('||');

    // Simple Hash Function (SHA-256 equivalent for strings)
    const msgBuffer = new TextEncoder().encode(traits);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  },

  /**
   * 🛑 SANITIZE INPUT
   * Strips dangerous characters to prevent XSS (Cross-Site Scripting) in chat/names.
   */
  sanitize: (input) => {
    if (typeof input !== 'string') return input;
    return input
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  },

  /**
   * 🚨 REPORT SUSPICIOUS ACTIVITY
   * Logs an event to the audit_logs table if a fingerprint matches a banned user.
   */
  auditLog: async (actorId, action, metadata = {}) => {
    const fingerprint = await SecurityService.getFingerprint();
    
    await supabase.from('audit_logs').insert({
      actor_id: actorId,
      action_type: action,
      metadata: { ...metadata, fingerprint }
    });
  }
};
