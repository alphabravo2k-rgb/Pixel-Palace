import React, { useEffect, useState } from 'react';
import { supabase } from '../../supabase/client';
import { useSession } from '../../auth/useSession';
import { SkewButton, Badge } from '../../ui/Components';
import { ShieldAlert, Trash2, RefreshCw, Loader2, Shield } from 'lucide-react';
import { can } from '../../lib/permissions';
import { PERM_CAPABILITIES } from '../../lib/permissions.actions';

export const StaffManagement = () => {
  const { session } = useSession();
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);

  if (!can(PERM_CAPABILITIES.MANAGE_TOURNAMENT, session)) {
    return (
      <div className="p-8 text-center border border-red-900/50 bg-red-900/10 rounded">
        <ShieldAlert className="w-12 h-12 text-red-500 mx-auto mb-2" />
        <h3 className="text-xl font-bold text-white">ACCESS DENIED</h3>
        <p className="text-red-400 text-sm">You do not have permission to manage staff.</p>
      </div>
    );
  }

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const { data, error } = await supabase
          .from('app_admins')
          .select('id, name, role, is_active')
          .order('role', { ascending: true });

        if (error) throw error;
        setAdmins(data || []);
      } catch (err) {
        console.error("Staff Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStaff();
  }, []);

  const handleRevoke = async (id) => {
    if (!confirm("Are you sure you want to revoke this admin's access?")) return;
    alert("Please use the CLI or Console to revoke access for ID: " + id);
  };

  if (loading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-fuchsia-500" /></div>;

  return (
    <div className="space-y-8">
      <section className="bg-black/20 p-6 rounded border border-white/5">
        <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-['Teko'] uppercase text-white tracking-wide flex items-center gap-2">
                <Shield className="w-5 h-5" /> Command Staff
            </h3>
            <SkewButton onClick={() => alert("Use the CLI to generate new invites.")}>
                + Invite New
            </SkewButton>
        </div>

        <div className="space-y-3">
            {admins.map((admin) => (
            <div key={admin.id} className="flex items-center justify-between p-4 bg-zinc-900/50 border border-zinc-800 rounded">
                <div className="flex items-center gap-4">
                <div className={`w-2 h-2 rounded-full ${admin.is_active ? 'bg-green-500' : 'bg-red-500'}`} />
                <div>
                    <div className="font-bold text-white text-sm flex items-center gap-2">
                        {admin.name || 'Unknown Agent'}
                        <Badge color={admin.role === 'OWNER' ? 'yellow' : 'blue'}>{admin.role}</Badge>
                    </div>
                </div>
                </div>

                <div className="flex gap-2">
                <button 
                    className="p-2 hover:bg-white/5 rounded text-zinc-400 hover:text-white"
                    title="Reset Credentials"
                    onClick={() => alert("Please use the Admin Console to rotate credentials.")}
                >
                    <RefreshCw size={14} />
                </button>
                {admin.role !== 'OWNER' && (
                    <button 
                        onClick={() => handleRevoke(admin.id)}
                        className="p-2 hover:bg-red-900/20 rounded text-zinc-400 hover:text-red-500"
                        title="Revoke Access"
                    >
                        <Trash2 size={14} />
                    </button>
                )}
                </div>
            </div>
            ))}
        </div>
      </section>
      
      <div className="p-4 border border-zinc-800 rounded bg-zinc-900/30 text-center">
          <p className="text-zinc-500 text-xs font-mono">
              <Shield size={12} className="inline mr-1" />
              Team Access Codes are vaulted. Use "Roster Management" to reset team credentials individually.
          </p>
      </div>
    </div>
  );
};
