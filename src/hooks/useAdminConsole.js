import { useState } from 'react';
import { supabase } from '../supabase/client';

export const useAdminConsole = () => {
  // --- AUTH STATE ---
  const [adminProfile, setAdminProfile] = useState(null);
  const [tempPin, setTempPin] = useState(null);
  
  // --- OPERATION STATE ---
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null); // For success messages (Sync complete, etc)

  // =========================================================================
  // 🔐 AUTHENTICATION & USER MANAGEMENT (Existing Logic)
  // =========================================================================

  const login = async (pin) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.rpc('api_admin_login', { p_pin: pin });
      if (error) throw error;
      if (!data) throw new Error("No response from authentication server");
      if (data.status === 'ERROR') throw new Error(data.message || "Login failed");
      
      setAdminProfile(data.profile);
      return true;
    } catch (err) {
      console.error("Admin Login Error:", err);
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const createAdmin = async (ownerPin, formData) => {
    setLoading(true);
    setTempPin(null);
    try {
      const { data, error } = await supabase.rpc('cmd_owner_create_admin', {
        p_owner_pin: ownerPin,
        p_display_name: formData.name,
        p_discord_handle: formData.discord,
        p_discord_username: formData.discordUser,
        p_faceit_username: formData.faceitUser || null,
        p_faceit_url: formData.faceitUrl || null
      });

      if (error) throw error;
      setTempPin(data.generated_pin);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const changeMyPin = async (oldPin, newPin, identityData, securityToken = '') => {
    setLoading(true);
    setError(null);
    try {
      const { error: rpcError } = await supabase.rpc('cmd_admin_change_pin', {
        p_old_pin: oldPin,
        p_new_pin: newPin,
        p_discord_handle: identityData.discordHandle || null,
        p_faceit_username: identityData.faceitUser || null,
        p_faceit_url: identityData.faceitUrl || null,
        p_security_token: securityToken
      });

      if (rpcError) throw rpcError;
      return true;
    } catch (err) {
      let msg = err.message.replace('P0001: ', ''); 
      if (msg === 'VERIFICATION_FAILED') msg = "Identity Verification Failed"; 
      setError(msg);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // =========================================================================
  // 🎮 TOURNAMENT OPERATIONS (New "Style 1" Logic)
  // =========================================================================

  /**
   * Helper to execute strict admin commands
   */
  const executeCommand = async (commandName, rpcName, params = {}) => {
    setLoading(true);
    setError(null);
    setResult(null);
    console.log(`[AdminConsole] 🚀 Executing ${commandName}...`, params);

    try {
      const { data, error: rpcError } = await supabase.rpc(rpcName, params);
      if (rpcError) throw rpcError;
      
      // Handle legacy SQL error strings
      if (typeof data === 'string' && data.startsWith('Error:')) {
        throw new Error(data);
      }

      console.log(`[AdminConsole] ✅ ${commandName} Success:`, data);
      setResult(typeof data === 'string' ? data : 'Operation Successful');
      return { success: true, data };
    } catch (err) {
      console.error(`[AdminConsole] ❌ ${commandName} Failed:`, err);
      setError(err.message || 'Unknown Error');
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // 1. Sync Registrations (Explicit)
  const syncRegistrations = async (tournamentId) => {
    return executeCommand('Sync Registrations', 'sync_registrations_to_tables', {
      target_tourney_id: tournamentId
    });
  };

  // 2. Generate Bracket (Explicit)
  const generateBracket = async (tournamentId) => {
    return executeCommand('Generate Bracket', 'force_generate_bracket', {
      target_tourney_id: tournamentId
    });
  };

  // 3. Swap Teams (Explicit + Guarded)
  const swapTeams = async (matchId, adminPin) => {
    if (!adminPin) return setError("PIN required for sensitive ops.");
    return executeCommand('Swap Teams', 'admin_swap_teams', {
      match_id: matchId,
      admin_pin: adminPin
    });
  };

  // 4. Update Match Config (Explicit + Guarded)
  const updateMatchConfig = async (matchId, bestOf, adminPin) => {
    if (![1, 3, 5].includes(bestOf)) return setError("Best Of must be 1, 3, or 5.");
    if (!adminPin) return setError("PIN required.");
    
    return executeCommand('Update Config', 'admin_update_match_config', {
      match_id: matchId,
      new_best_of: bestOf,
      admin_pin: adminPin
    });
  };

  return {
    adminProfile, tempPin, error, loading, result,
    login, createAdmin, changeMyPin,
    syncRegistrations, generateBracket, swapTeams, updateMatchConfig
  };
};
