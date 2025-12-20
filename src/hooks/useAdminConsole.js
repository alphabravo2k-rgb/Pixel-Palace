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
      if (data.status === 'ERROR') throw new Error(data.message);
      
      setAdminProfile(data.profile);
      return true;
    } catch (err) {
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

  // UPDATED: Now accepts securityToken
  const changeMyPin = async (oldPin, newPin, identityData, securityToken = '') => {
    setLoading(true);
    setError(null);
    try {
      const { error: rpcError } = await supabase.rpc('cmd_admin_change_pin', {
        p_old_pin: oldPin,
        p_new_pin: newPin,
        p_discord_handle: identityData.discordHandle,
        p_faceit_username: identityData.faceitUser,
        p_faceit_url: identityData.faceitUrl,
        p_security_token: securityToken // <--- PASSED HERE
      });

      if (rpcError) throw rpcError;
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { adminProfile, tempPin, error, loading, login, createAdmin, changeMyPin };
};
