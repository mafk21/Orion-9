'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { fetchProfile, updateProfile } from '@/services/profile';
import { getTeamByUser, getTeamMembers } from '@/services/teams';
import { getAttemptsByTeam } from '@/services/attempts';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import HudFrame from '@/components/ui/HudFrame';
import type { Profile as ProfileType } from '@/services/profile';
import type { Team, TeamMember } from '@/types/database';

interface Attempt {
  id: string;
  team_id: string;
  phase: number;
  success: boolean;
  created_at: string;
}

export default function ProfilePage() {
  const { user, profile, refresh } = useAuth();
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [callsign, setCallsign] = useState('');
  const [team, setTeam] = useState<Team | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [soloProgress, setSoloProgress] = useState<any[]>([]);

  async function loadData() {
    if (!user) return;
    setLoading(true);
    try {
      // Load team info
      const userTeam = await getTeamByUser(user.id);
      if (userTeam) {
        setTeam(userTeam);
        const members = await getTeamMembers(userTeam.id);
        setTeamMembers(members);
        
        // Load attempts
        const userAttempts = await getAttemptsByTeam(userTeam.id);
        setAttempts(userAttempts);
      }
      
      // Set callsign for editing
      if (profile?.callsign) {
        setCallsign(profile.callsign);
      }
    } catch (err) {
      console.error('Failed to load profile data:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [user, profile]);

  async function saveProfile() {
    if (!user || !callsign.trim()) return;
    try {
      await updateProfile(user.id, { callsign: callsign.trim() });
      await refresh();
      setEditing(false);
    } catch (err) {
      console.error('Failed to update profile:', err);
    }
  }

  const successfulAttempts = attempts.filter(a => a.success).length;
  const failedAttempts = attempts.filter(a => !a.success).length;
  const successRate = attempts.length > 0 
    ? Math.round((successfulAttempts / attempts.length) * 100) 
    : 0;

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="text-slate-400">Loading profile…</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <HudFrame tone="cyan">
        <p className="code-text text-[0.72rem] uppercase tracking-[0.35em] text-cyan-300/70">Operative Profile</p>
        <h1 className="mt-2 text-3xl font-semibold text-white">{profile?.callsign || 'Operative'}</h1>
        <p className="mt-1 text-sm text-slate-300">{profile?.email}</p>
      </HudFrame>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Profile Info */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-white">Profile Information</h2>
          
          <div className="mt-4 space-y-4">
            <div>
              <label className="block text-xs uppercase tracking-[0.25em] text-slate-400">Callsign</label>
              {editing ? (
                <div className="mt-1 flex gap-2">
                  <input
                    type="text"
                    value={callsign}
                    onChange={(e) => setCallsign(e.target.value)}
                    className="flex-1 rounded-xl border border-white/8 bg-space-950/80 px-3 py-2 text-white text-sm"
                  />
                  <Button size="sm" variant="primary" onClick={saveProfile}>Save</Button>
                  <Button size="sm" variant="ghost" onClick={() => { setEditing(false); setCallsign(profile?.callsign || ''); }}>Cancel</Button>
                </div>
              ) : (
                <div className="mt-1 flex items-center justify-between">
                  <span className="text-white">{profile?.callsign || 'Not set'}</span>
                  <Button size="sm" variant="ghost" onClick={() => setEditing(true)}>Edit</Button>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs uppercase tracking-[0.25em] text-slate-400">Clearance Level</label>
              <div className="mt-1">
                <span className={[
                  'inline-flex items-center rounded-full px-3 py-1 text-xs font-medium',
                  profile?.clearance_level === 'OMEGA' ? 'bg-amber-400/20 text-amber-100' :
                  profile?.clearance_level === 'COMMAND' ? 'bg-violet-400/20 text-violet-100' :
                  'bg-cyan-400/20 text-cyan-100'
                ].join(' ')}>
                  {profile?.clearance_level || 'OPERATIVE'}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-[0.25em] text-slate-400">Experience Points</label>
              <div className="mt-1 text-2xl font-bold text-white">{profile?.xp || 0} XP</div>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-[0.25em] text-slate-400">Member Since</label>
              <div className="mt-1 text-slate-200">
                {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'Unknown'}
              </div>
            </div>
          </div>
        </Card>

        {/* Team Info */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-white">Team Assignment</h2>
          
          {team ? (
            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-[0.25em] text-slate-400">Team Name</label>
                <div className="mt-1 text-white">{team.name}</div>
              </div>
              
              <div>
                <label className="block text-xs uppercase tracking-[0.25em] text-slate-400">Current Phase</label>
                <div className="mt-1">
                  <span className="inline-flex items-center rounded-lg bg-violet-400/20 px-3 py-1 text-sm font-medium text-violet-100">
                    Phase {team.phase}
                  </span>
                </div>
              </div>
              
              <div>
                <label className="block text-xs uppercase tracking-[0.25em] text-slate-400">Team Status</label>
                <div className="mt-1">
                  <span className={[
                    'inline-flex items-center rounded-lg px-3 py-1 text-sm font-medium',
                    team.status === 'completed' ? 'bg-emerald-400/20 text-emerald-100' :
                    team.status === 'failed' ? 'bg-rose-400/20 text-rose-100' :
                    'bg-cyan-400/20 text-cyan-100'
                  ].join(' ')}>
                    {team.status.toUpperCase()}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-[0.25em] text-slate-400">Remaining Attempts</label>
                <div className="mt-1 text-white">{3 - team.attempt_count} / 3</div>
              </div>
            </div>
          ) : (
            <div className="mt-4 text-slate-400">
              You are not assigned to any team yet.
            </div>
          )}
        </Card>
      </div>

      {/* Attempt History */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-white">Mission Attempt History</h2>
        
        <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
          <div className="rounded-xl bg-space-950/50 p-4">
            <div className="text-xs uppercase tracking-[0.25em] text-slate-400">Total Attempts</div>
            <div className="mt-1 text-2xl font-bold text-white">{attempts.length}</div>
          </div>
          <div className="rounded-xl bg-space-950/50 p-4">
            <div className="text-xs uppercase tracking-[0.25em] text-slate-400">Successful</div>
            <div className="mt-1 text-2xl font-bold text-emerald-400">{successfulAttempts}</div>
          </div>
          <div className="rounded-xl bg-space-950/50 p-4">
            <div className="text-xs uppercase tracking-[0.25em] text-slate-400">Failed</div>
            <div className="mt-1 text-2xl font-bold text-rose-400">{failedAttempts}</div>
          </div>
          <div className="rounded-xl bg-space-950/50 p-4">
            <div className="text-xs uppercase tracking-[0.25em] text-slate-400">Success Rate</div>
            <div className="mt-1 text-2xl font-bold text-cyan-400">{successRate}%</div>
          </div>
        </div>

        {attempts.length > 0 ? (
          <div className="mt-6 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-white/10">
                <tr>
                  <th className="px-3 py-2 text-slate-300">Date</th>
                  <th className="px-3 py-2 text-slate-300">Phase</th>
                  <th className="px-3 py-2 text-slate-300">Result</th>
                </tr>
              </thead>
              <tbody>
                {attempts.slice(0, 10).map((attempt) => (
                  <tr key={attempt.id} className="border-b border-white/5">
                    <td className="px-3 py-2 text-slate-200">
                      {new Date(attempt.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-3 py-2 text-slate-200">Phase {attempt.phase}</td>
                    <td className="px-3 py-2">
                      <span className={[
                        'inline-flex items-center rounded px-2 py-0.5 text-xs',
                        attempt.success ? 'bg-emerald-400/20 text-emerald-100' : 'bg-rose-400/20 text-rose-100'
                      ].join(' ')}>
                        {attempt.success ? 'SUCCESS' : 'FAILED'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="mt-4 text-slate-400">No attempts recorded yet.</div>
        )}
      </Card>
    </div>
  );
}
