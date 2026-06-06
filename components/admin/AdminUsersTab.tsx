'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getAllUsers, updateProfile, deleteUser, type Profile } from '@/services/profile';
import { logAdminAction } from '@/services/admin';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

export default function AdminUsersTab() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterClearance, setFilterClearance] = useState<string>('all');
  const [isBusy, setIsBusy] = useState(false);
  const [editingUser, setEditingUser] = useState<Profile | null>(null);
  const [editCallsign, setEditCallsign] = useState('');

  async function load() {
    setLoading(true);
    try {
      const allUsers = await getAllUsers();
      setUsers(allUsers);
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function promoteToOmega(userId: string) {
    if (!currentUser) return;
    setIsBusy(true);
    try {
      await updateProfile(userId, { clearance_level: 'OMEGA' });
      await logAdminAction({
        admin_id: currentUser.id,
        action: 'user.promote_omega',
        target_type: 'profile',
        target_id: userId
      });
      await load();
    } catch (err) {
      console.error('Failed to promote user:', err);
    } finally {
      setIsBusy(false);
    }
  }

  async function demoteFromOmega(userId: string) {
    if (!currentUser) return;
    // Prevent demoting self
    if (userId === currentUser.id) {
      alert('Cannot demote yourself.');
      return;
    }
    setIsBusy(true);
    try {
      await updateProfile(userId, { clearance_level: 'OPERATIVE' });
      await logAdminAction({
        admin_id: currentUser.id,
        action: 'user.demote_omega',
        target_type: 'profile',
        target_id: userId
      });
      await load();
    } catch (err) {
      console.error('Failed to demote user:', err);
    } finally {
      setIsBusy(false);
    }
  }

  async function suspendUser(userId: string) {
    if (!currentUser) return;
    if (userId === currentUser.id) {
      alert('Cannot suspend yourself.');
      return;
    }
    if (!confirm('Are you sure you want to suspend this user?')) return;
    setIsBusy(true);
    try {
      await updateProfile(userId, { clearance_level: 'COMMAND' }); // Use COMMAND as suspended state
      await logAdminAction({
        admin_id: currentUser.id,
        action: 'user.suspend',
        target_type: 'profile',
        target_id: userId
      });
      await load();
    } catch (err) {
      console.error('Failed to suspend user:', err);
    } finally {
      setIsBusy(false);
    }
  }

  async function handleDeleteUser(userId: string) {
    if (!currentUser) return;
    if (userId === currentUser.id) {
      alert('Cannot delete yourself.');
      return;
    }
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;
    setIsBusy(true);
    try {
      await deleteUser(userId);
      await logAdminAction({
        admin_id: currentUser.id,
        action: 'user.delete',
        target_type: 'profile',
        target_id: userId
      });
      await load();
    } catch (err) {
      console.error('Failed to delete user:', err);
    } finally {
      setIsBusy(false);
    }
  }

  function startEdit(user: Profile) {
    setEditingUser(user);
    setEditCallsign(user.callsign || '');
  }

  async function saveEdit() {
    if (!editingUser || !currentUser) return;
    setIsBusy(true);
    try {
      await updateProfile(editingUser.id, { callsign: editCallsign });
      await logAdminAction({
        admin_id: currentUser.id,
        action: 'user.update_callsign',
        target_type: 'profile',
        target_id: editingUser.id,
        metadata: { new_callsign: editCallsign }
      });
      setEditingUser(null);
      await load();
    } catch (err) {
      console.error('Failed to update user:', err);
    } finally {
      setIsBusy(false);
    }
  }

  const filteredUsers = users.filter((u) => {
    const matchesSearch = search === '' || 
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.callsign || '').toLowerCase().includes(search.toLowerCase());
    const matchesClearance = filterClearance === 'all' || u.clearance_level === filterClearance;
    return matchesSearch && matchesClearance;
  });

  if (loading) {
    return <Card className="p-6"><p className="text-slate-400">Loading users…</p></Card>;
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-white">User Management</h3>
        <p className="mt-1 text-sm text-slate-400">View, search, and manage all registered users.</p>
        
        <div className="mt-4 flex gap-2">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by email or callsign…"
            className="flex-1 rounded-xl border border-white/8 bg-space-950/80 px-4 py-2 text-white text-sm"
          />
          <select
            value={filterClearance}
            onChange={(e) => setFilterClearance(e.target.value)}
            className="rounded-xl border border-white/8 bg-space-950/80 px-3 py-2 text-white text-sm"
          >
            <option value="all">All Clearances</option>
            <option value="OPERATIVE">Operative</option>
            <option value="COMMAND">Command</option>
            <option value="OMEGA">Omega</option>
          </select>
        </div>
      </Card>

      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-space-950/80 border-b border-white/10">
              <tr>
                <th className="px-4 py-3 text-slate-300">Email</th>
                <th className="px-4 py-3 text-slate-300">Callsign</th>
                <th className="px-4 py-3 text-slate-300">Clearance</th>
                <th className="px-4 py-3 text-slate-300">XP</th>
                <th className="px-4 py-3 text-slate-300">Joined</th>
                <th className="px-4 py-3 text-slate-300 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                    No users found.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b border-white/5 hover:bg-white/5">
                    <td className="px-4 py-3 text-white">{user.email}</td>
                    <td className="px-4 py-3">
                      {editingUser?.id === user.id ? (
                        <input
                          type="text"
                          value={editCallsign}
                          onChange={(e) => setEditCallsign(e.target.value)}
                          className="rounded-lg border border-white/8 bg-space-950/80 px-2 py-1 text-white text-sm"
                        />
                      ) : (
                        <span className="text-slate-200">{user.callsign || '-'}</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={[
                        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
                        user.clearance_level === 'OMEGA' ? 'bg-amber-400/20 text-amber-100' :
                        user.clearance_level === 'COMMAND' ? 'bg-violet-400/20 text-violet-100' :
                        'bg-cyan-400/20 text-cyan-100'
                      ].join(' ')}>
                        {user.clearance_level}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-200">{user.xp}</td>
                    <td className="px-4 py-3 text-slate-400 text-xs">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-1">
                        {editingUser?.id === user.id ? (
                          <>
                            <Button size="sm" variant="primary" disabled={isBusy} onClick={saveEdit}>Save</Button>
                            <Button size="sm" variant="ghost" disabled={isBusy} onClick={() => setEditingUser(null)}>Cancel</Button>
                          </>
                        ) : (
                          <>
                            <Button size="sm" variant="ghost" disabled={isBusy} onClick={() => startEdit(user)}>Edit</Button>
                            {user.clearance_level !== 'OMEGA' ? (
                              <Button size="sm" variant="secondary" disabled={isBusy} onClick={() => promoteToOmega(user.id)}>Promote</Button>
                            ) : (
                              <Button size="sm" variant="secondary" disabled={isBusy} onClick={() => demoteFromOmega(user.id)}>Demote</Button>
                            )}
                            <Button size="sm" variant="danger" disabled={isBusy} onClick={() => suspendUser(user.id)}>Suspend</Button>
                            <Button size="sm" variant="danger" disabled={isBusy} onClick={() => handleDeleteUser(user.id)}>Delete</Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="text-xs text-slate-400">
        Showing {filteredUsers.length} of {users.length} users
      </div>
    </div>
  );
}
