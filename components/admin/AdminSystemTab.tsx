'use client';

import { useEffect, useState } from 'react';
import { fetchAllLogs, writeSystemLog } from '@/services/logs';
import { fetchAdminActions, logAdminAction } from '@/services/admin';
import { useAuth } from '@/contexts/AuthContext';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import SystemLogFeed from '@/components/story/SystemLogFeed';
import type { SystemLogRow, AdminActionRow, Phase } from '@/types/database';

export default function AdminSystemTab() {
  const { user } = useAuth();
  const [logs, setLogs] = useState<SystemLogRow[]>([]);
  const [actions, setActions] = useState<AdminActionRow[]>([]);
  const [content, setContent] = useState('');
  const [phase, setPhase] = useState<Phase | ''>('');
  const [hidden, setHidden] = useState(false);
  const [busy, setBusy] = useState(false);

  async function load() {
    const [l, a] = await Promise.all([fetchAllLogs(), fetchAdminActions(50)]);
    setLogs(l);
    setActions(a);
  }

  useEffect(() => { load(); }, []);

  async function inject() {
    if (!user || !content.trim()) return;
    setBusy(true);
    try {
      const log = await writeSystemLog({
        team_id: null,
        content: content.trim(),
        phase: phase === '' ? null : phase,
        hidden
      });
      await logAdminAction({
        admin_id: user.id,
        action: 'log.inject',
        target_type: 'system_log',
        target_id: log.id,
        metadata: { phase, hidden }
      });
      setContent('');
      await load();
    } finally {
      setBusy(false);
    }
  }

  async function simulateFailure() {
    if (!user) return;
    setBusy(true);
    try {
      const log = await writeSystemLog({
        team_id: null,
        content: 'System alert: Primary systems compromised. Containment integrity critical. Manual intervention required.',
        phase: null,
        hidden: false
      });
      await logAdminAction({
        admin_id: user.id,
        action: 'system.simulate_failure',
        target_type: 'system_log',
        target_id: log.id
      });
      await load();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-white">Inject system log</h3>
        <p className="mt-2 text-sm text-slate-300">Logs marked hidden are visible to OMEGA only.</p>
        <div className="mt-4 space-y-3">
          <textarea
            className="w-full rounded-2xl border border-white/8 bg-space-950/80 px-4 py-3 text-slate-100 outline-none"
            rows={3}
            placeholder="Log content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <select
              className="rounded-2xl border border-white/8 bg-space-950/80 px-4 py-3 text-slate-100"
              value={phase}
              onChange={(e) => setPhase(e.target.value === '' ? '' : (Number(e.target.value) as Phase))}
            >
              <option value="">No phase</option>
              {[1, 2, 3, 4].map((p) => <option key={p} value={p}>Phase {p}</option>)}
            </select>
            <label className="flex items-center gap-3 rounded-2xl border border-white/8 bg-space-950/80 px-4 py-3 text-sm text-slate-200">
              <input type="checkbox" checked={hidden} onChange={(e) => setHidden(e.target.checked)} />
              <span>Hidden (OMEGA only)</span>
            </label>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={inject} disabled={busy || !content.trim()}>Inject log</Button>
            <Button variant="danger" onClick={simulateFailure} disabled={busy}>Simulate failure</Button>
          </div>
        </div>

        <div className="mt-8">
          <h3 className="text-lg font-semibold text-white">Recent admin actions</h3>
          <ul className="mt-3 space-y-2 max-h-72 overflow-y-auto pr-1">
            {actions.map((a) => (
              <li key={a.id} className="flex items-start gap-3 rounded-xl border border-white/6 bg-space-950/70 px-3 py-2 code-text text-xs">
                <span className="text-slate-500 w-32">{new Date(a.created_at).toLocaleString()}</span>
                <Badge tone="warning">{a.action}</Badge>
                <span className="text-slate-300">{a.target_type}{a.target_id ? ` · ${a.target_id.slice(0, 8)}…` : ''}</span>
              </li>
            ))}
            {actions.length === 0 ? <li className="text-sm text-slate-400">No admin actions logged.</li> : null}
          </ul>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold text-white">All system logs</h3>
        <p className="mt-2 text-sm text-slate-300">Includes hidden logs (OMEGA view).</p>
        <div className="mt-4">
          <SystemLogFeed logs={logs} />
        </div>
      </Card>
    </div>
  );
}
