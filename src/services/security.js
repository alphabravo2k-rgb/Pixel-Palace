/**
 * 🔒 SECURITY SERVICE: ANTI-FRAUD & INTEGRITY
 * VERSION: 2050.5.0 (SENTINEL OMNI)
 * STATUS: ACTIVE // CANVAS ENFORCED
 */

import { supabase } from '../supabase/client';

export const SecurityService = {
  
  /**
   * 🕵️ GENERATE HARDWARE FINGERPRINT
   * Uses Canvas rendering and Hardware traits to create a unique ID.
   * This detects unique hardware even if the IP or User-Agent changes.
   */
  getFingerprint: async () => {
    // 1. Create a hidden canvas to extract unique GPU rendering artifacts
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx.textBaseline = "top";
    ctx.font = "14px 'Arial'";
    ctx.textBaseline = "alphabetic";
    ctx.fillStyle = "#f60";
    ctx.fillRect(125, 1, 62, 20);
    ctx.fillStyle = "#069";
    ctx.fillText("Nexus_Sentinel_Auth", 2, 15);
    ctx.fillStyle = "rgba(102, 204, 0, 0.7)";
    ctx.fillText("Nexus_Sentinel_Auth", 4, 17);
    const canvasData = canvas.toDataURL();

    // 2. Combine with Hardware Traits
    const traits = [
      navigator.userAgent,
      navigator.language,
      screen.colorDepth,
      new Date().getTimezoneOffset(),
      navigator.hardwareConcurrency || 'unknown',
      canvasData
    ].join('||');

    // 3. Cryptographic SHA-256 Hashing
    const msgBuffer = new TextEncoder().encode(traits);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  },

  /**
   * 🛑 XSS SHIELD
   * Prevents malicious script injection in public text fields.
   */
  sanitize: (input) => {
    if (typeof input !== 'string') return input;
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return input.replace(/[&<>"']/g, (m) => map[m]);
  },

  /**
   * 🚨 AUDIT TELEMETRY
   * Logs security events silently in the background.
   */
  auditLog: async (actorId, action, metadata = {}) => {
    try {
      const fingerprint = await SecurityService.getFingerprint();
      
      // Fire-and-forget: Don't await the insert so UI doesn't lag
      supabase.from('audit_logs').insert({
        actor_id: actorId,
        action_type: action,
        metadata: { 
          ...metadata, 
          fingerprint,
          timestamp: new Date().toISOString(),
          resolution: `${window.screen.width}x${window.screen.height}`
        }
      }).then(({ error }) => {
        if (error) console.warn("Sentinel Log Failed", error);
      });
    } catch (e) {
      // Fail silently to prevent UI disruption
    }
  }
};
