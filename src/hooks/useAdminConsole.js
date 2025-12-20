// ... existing imports

  // UPDATED: Now handles undefined values safely
  const changeMyPin = async (oldPin, newPin, identityData, securityToken = '') => {
    setLoading(true);
    setError(null);
    try {
      const { error: rpcError } = await supabase.rpc('cmd_admin_change_pin', {
        p_old_pin: oldPin,
        p_new_pin: newPin,
        // Send NULL if undefined to satisfy the DB signature
        p_discord_handle: identityData.discordHandle || null,
        p_faceit_username: identityData.faceitUser || null,
        p_faceit_url: identityData.faceitUrl || null,
        p_security_token: securityToken
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

// ... existing exports
