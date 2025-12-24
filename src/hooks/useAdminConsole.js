import { useState } from 'react';
import { supabase } from '../supabase/client'; // FIX IMPORT PATH

export const useAdminConsole = () => {
  const [adminProfile, setAdminProfile] = useState(null);
  const [tempPin, setTempPin] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const executeCommand = async (commandName, rpcName, params = {}) => {
    setLoading(true);
    setError(null);
    setResult(null);
    console.log(`[AdminConsole] 🚀 Executing ${commandName}...`, params);

    try {
      const { data, error: rpcError } = await supabase.rpc(rpcName, params);
      if (rpcError) throw rpcError;
      if (typeof data === 'string' && data.startsWith('Error:')) throw new Error(data);

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

  const searchUsers = async (query, adminPin) => {
    if (!query || query.length < 2) return [];
    try {
        const { data, error } = await supabase.rpc('admin_search_users', { search_term: query, admin_pin: adminPin });
        if (error) throw error;
        return data || [];
    } catch (e) {
        console.error("Search failed", e);
        return [];
    }
  };

  const fetchTournaments = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('tournaments').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    } catch (err) {
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const syncRegistrations = async (tournamentId) => {
    return executeCommand('Sync Registrations', 'sync_registrations_to_tables', { target_tourney_id: tournamentId });
  };

  const generateBracket = async (tournamentId) => {
    return executeCommand('Generate Bracket', 'force_generate_bracket', { target_tourney_id: tournamentId });
  };

  const swapTeams = async (matchId, adminPin) => {
    if (!adminPin) { setError("Session expired or PIN missing."); return; }
    return executeCommand('Swap Teams', 'admin_swap_teams', { match_id: matchId, admin_pin: adminPin });
  };

  const updateMatchConfig = async (matchId, bestOf, adminPin) => {
    if (![1, 3, 5].includes(bestOf)) { setError("Best Of must be 1, 3, or 5."); return; }
    if (!adminPin) { setError("Session expired or PIN missing."); return; }
    return executeCommand('Update Config', 'admin_update_match_config', { match_id: matchId, new_best_of: bestOf, admin_pin: adminPin });
  };

  return {
    adminProfile, tempPin, loading, error, result,
    login, createAdmin, changeMyPin, searchUsers, fetchTournaments,
    syncRegistrations, generateBracket, swapTeams, updateMatchConfig
  };
};
