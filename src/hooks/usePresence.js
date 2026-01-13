/**
 * 📡 USE PRESENCE: REAL-TIME LOBBY TRACKING
 * VERSION: 2050.5.0 (MASTER OMNI)
 * STATUS: SECURED // LOW-LATENCY
 */

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../supabase/client';
import { useNexus } from './useNexus';
import { Telemetry, EVENTS } from '../lib/telemetry';

export const usePresence = (roomId) => {
  // 1. Get User from Nexus (Aligned with your hook)
  const { user, isAuthenticated } = useNexus();
  const [onlineUsers, setOnlineUsers] = useState([]);

  // 2. Sync Handler (Converts raw presence to clean list)
  const handleSync = useCallback((channel) => {
    const state = channel.presenceState();
    
    // Convert object-map state to a clean, sorted list of operatives
    const formatted = Object.keys(state).map((key) => {
      const presence = state[key][0]; // Most recent presence instance
      return {
        id: presence.user_id,
        name: presence.username,
        role: presence.role,
        avatar: presence.avatar,
        status: presence.status || 'online',
        last_seen: new Date().toISOString()
      };
    }).sort((a, b) => a.name.localeCompare(b.name));

    setOnlineUsers(formatted);
  }, []);

  useEffect(() => {
    if (!roomId || !isAuthenticated || !user) return;

    // 3. Initialize Tactical Channel
    const channel = supabase.channel(`presence:match:${roomId}`, {
      config: {
        presence: { key: user.id },
      },
    });

    // 4. Event Listeners with Telemetry
    channel
      .on('presence', { event: 'sync' }, () => handleSync(channel))
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        Telemetry.log(EVENTS.COMBAT, { action: 'presence_join', roomId, user: key });
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        Telemetry.log(EVENTS.COMBAT, { action: 'presence_leave', roomId, user: key });
      });

    

    // 5. Connect & Broadcast Identity
    channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await channel.track({
          user_id: user.id,
          username: user.username || user.email?.split('@')[0],
          role: user.role,
          avatar: user.avatar_url,
          status: 'ready'
        });
      }
    });

    return () => {
      channel.unsubscribe();
    };
  }, [roomId, isAuthenticated, user, handleSync]);

  return { 
    onlineUsers,
    count: onlineUsers.length,
    // Helper to check if a specific team member is ready
    isUserOnline: (userId) => onlineUsers.some(u => u.id === userId)
  };
};
