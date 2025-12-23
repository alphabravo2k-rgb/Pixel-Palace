import { useState } from 'react';
import { supabase } from '../supabase/client';

export const useAdminConsole = () => {
  const [adminProfile, setAdminProfile] = useState(null);
  const [tempPin, setTempPin] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const login = async (pin) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.rpc('api_admin_login', { p_pin: pin });
      
      if (error) throw error;
      
      // 🛡️ CRASH GUARD: Handle case where data is null or malformed
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
        // Send NULL if undefined to prevent database signature errors
        p_discord_handle: identityData.discordHandle || null,
        p_faceit_username: identityData.faceitUser || null,
        p_faceit_url: identityData.faceitUrl || null,
        p_security_token: securityToken
      });

      if (rpcError) throw rpcError;
      return true;
    } catch (err) {
      // Clean up the error message for the UI
      let msg = err.message.replace('P0001: ', ''); 
      if (msg === 'VERIFICATION_FAILED') msg = "Identity Verification Failed"; 
      setError(msg);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { adminProfile, tempPin, error, loading, login, createAdmin, changeMyPin };
};
