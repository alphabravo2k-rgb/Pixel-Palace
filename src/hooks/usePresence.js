/**
 * 📡 USE PRESENCE: REAL-TIME LOBBY TRACKING
 * VERSION: 2050.5.0
 * STATUS: CONNECTED
 */

import { useEffect, useState } from 'react';
import { supabase } from '../supabase/client';
import { useSession } from '../auth/useSession';

export const usePresence = (roomId) => {
  const { session } = useSession();
  const [onlineUsers, setOnlineUsers] = useState([]);

  useEffect(() => {
    if (!roomId || !session) return;

    // 1. Create Unique Channel for this Lobby
    const channel = supabase.channel(`room:${roomId}`, {
      config: {
        presence: {
          key: session.user.id,
        },
      },
    });

    // 2. Listen for Sync Events (Join/Leave)
    channel
      .on('presence', { event: 'sync' }, () => {
        const newState = channel.presenceState();
        
        // Flatten the presence object into a simple array of users
        const users = Object.values(newState).map(presences => {
          const user = presences[0]; // Take most recent session
          return {
            id: user.user_id, // Map from your tracking payload below
            name: user.username,
            role: user.role,
            avatar: user.avatar,
            online_at: new Date().toISOString()
          };
        });
        
        setOnlineUsers(users);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          // 3. Broadcast My Presence
          await channel.track({
            user_id: session.user.id,
            username: session.identity?.username || 'Unknown Agent',
            role: session.role,
            avatar: session.identity?.avatar_url
          });
        }
      });

    // Cleanup: Leave channel on unmount
    return () => {
      channel.unsubscribe();
    };
  }, [roomId, session]);

  return { onlineUsers };
};
