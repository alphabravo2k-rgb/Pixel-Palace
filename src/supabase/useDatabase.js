/**
 * 🧬 USE DATABASE: HIGH-LEVEL CRUD ENGINE
 * VERSION: 2050.5.0
 * STATUS: SECURED // REAL-TIME ENABLED
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from './client';
// Note: Ensure audio engine exists or remove this line
import { SoundNexus, CUES } from '../lib/soundNexus'; 

/**
 * 📡 FETCH SINGLE RECORD (Live)
 * Usage: const { data } = useRecord('profiles', userId);
 */
export const useRecord = (table, id) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    
    // 1. Initial Fetch
    const fetch = async () => {
      const { data: record, error } = await supabase
        .from(table)
        .select('*')
        .eq('id', id)
        .single();
        
      if (!error) setData(record);
      setLoading(false);
    };
    fetch();

    // 2. Real-time Subscription
    const channel = supabase
      .channel(`${table}:${id}`)
      .on('postgres_changes', { 
        event: 'UPDATE', 
        schema: 'public', 
        table: table, 
        filter: `id=eq.${id}` 
      }, (payload) => {
        setData(payload.new);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [table, id]);

  return { data, loading };
};

/**
 * 📚 FETCH COLLECTION (Paginated)
 * Usage: const { data } = useCollection('teams', { limit: 10 });
 */
export const useCollection = (table, options = {}) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    let query = supabase.from(table).select('*');
    
    if (options.orderBy) query = query.order(options.orderBy, { ascending: options.asc });
    if (options.limit) query = query.limit(options.limit);
    if (options.eq) query = query.eq(options.eq.field, options.eq.value);

    const { data: records } = await query;
    setData(records || []);
    setLoading(false);
  }, [table, JSON.stringify(options)]);

  useEffect(() => { fetch(); }, [fetch]);

  return { data, loading, refresh: fetch };
};

/**
 * 🛠️ MUTATIONS (Create/Update/Delete)
 * Usage: const { create } = useMutations('matches');
 */
export const useMutations = (table) => {
  const create = async (payload) => {
    const { data, error } = await supabase.from(table).insert(payload).select().single();
    if (error) throw error;
    try { SoundNexus.play(CUES.UI_SUCCESS); } catch(e){}
    return data;
  };

  const update = async (id, payload) => {
    const { data, error } = await supabase.from(table).update(payload).eq('id', id).select().single();
    if (error) throw error;
    try { SoundNexus.play(CUES.UI_TICK); } catch(e){}
    return data;
  };

  const remove = async (id) => {
    const { error } = await supabase.from(table).delete().eq('id', id);
    if (error) throw error;
    try { SoundNexus.play(CUES.UI_ERROR); } catch(e){} // Deletion sound
  };

  return { create, update, remove };
};
