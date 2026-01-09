/**
 * 🧬 USE DATABASE: HIGH-LEVEL CRUD ENGINE
 * VERSION: 2050.5.0 (MASTER OMNI)
 * STATUS: SECURED // REAL-TIME // SENSORY-LINKED
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from './client';
// Note: Ensure audio engine exists. Safe navigation used below.
import { SoundNexus, CUES } from '../lib/soundNexus'; 

/**
 * 📡 USE RECORD: SINGLE-ENTITY NEURAL LINK
 * Ideal for Player Profiles, specific Match Rooms, or Team Dossiers.
 * Automatically subscribes to real-time updates.
 */
export const useRecord = (table, id) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;
    
    const fetchRecord = async () => {
      setLoading(true);
      const { data: record, error: dbError } = await supabase
        .from(table)
        .select('*')
        .eq('id', id)
        .single();
        
      if (dbError) {
        // Don't log 406 errors (standard for "no single row found" when creating new profiles)
        if (dbError.code !== 'PGRST116') console.error("Nexus Record Error:", dbError);
        setError(dbError.message);
      } else {
        setData(record);
      }
      setLoading(false);
    };

    fetchRecord();

    // 🔄 REAL-TIME SYNC: Listens for external updates (e.g., Admin changing a score)
    const channel = supabase
      .channel(`live:${table}:${id}`)
      .on('postgres_changes', { 
        event: 'UPDATE', 
        schema: 'public', 
        table: table, 
        filter: `id=eq.${id}` 
      }, (payload) => {
        setData(payload.new);
        // 🔊 Subtle ping to notify the UI has updated silently
        try { SoundNexus.playSpatial(CUES.UI_TICK, { volume: 0.1 }); } catch(e){}
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [table, id]);

  return { data, loading, error };
};

/**
 * 📚 USE COLLECTION: MULTI-ENTITY MATRIX
 * Ideal for Tournament Lists, Leaderboards, or Team Rosters.
 */
export const useCollection = (table, options = {}) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Memoize options key to prevent infinite fetch loops
  const optKey = JSON.stringify(options);

  const fetchCollection = useCallback(async () => {
    setLoading(true);
    let query = supabase.from(table).select(options.select || '*');
    
    // Dynamic Filtering
    if (options.eq) query = query.eq(options.eq.field, options.eq.value);
    if (options.orderBy) query = query.order(options.orderBy, { ascending: options.asc ?? false });
    if (options.limit) query = query.limit(options.limit);

    const { data: records, error } = await query;
    
    if (!error) setData(records || []);
    setLoading(false);
  }, [table, optKey]);

  useEffect(() => { fetchCollection(); }, [fetchCollection]);

  return { data, loading, refresh: fetchCollection };
};

/**
 * 🛠️ USE MUTATIONS: THE DATA FORGE
 * Handles the creation and destruction of records with haptic feedback.
 */
export const useMutations = (table) => {
  
  const create = async (payload) => {
    const { data, error } = await supabase.from(table).insert(payload).select().single();
    if (error) {
      try { SoundNexus.play(CUES.UI_ERROR); } catch(e){}
      throw error;
    }
    try { SoundNexus.playSpatial(CUES.UI_SUCCESS); } catch(e){}
    return data;
  };

  const update = async (id, payload) => {
    const { data, error } = await supabase.from(table).update(payload).eq('id', id).select().single();
    if (error) {
      try { SoundNexus.play(CUES.UI_ERROR); } catch(e){}
      throw error;
    }
    // Subtle "Lock-in" sound for updates
    try { SoundNexus.playSpatial(CUES.UI_TICK, { pitch: 1.2 }); } catch(e){}
    return data;
  };

  const remove = async (id) => {
    const { error } = await supabase.from(table).delete().eq('id', id);
    if (error) {
      try { SoundNexus.play(CUES.UI_ERROR); } catch(e){}
      throw error;
    }
    // "Deletion/De-materialize" sound
    try { SoundNexus.playSpatial(CUES.UI_ERROR, { volume: 0.5, pitch: 0.8 }); } catch(e){}
  };

  return { create, update, remove };
};
