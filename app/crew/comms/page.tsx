'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { fetchLogsForTeam } from '@/services/logs';
import Card from '@/components/ui/Card';
import SystemLogFeed from '@/components/story/SystemLogFeed';
import type { SystemLogRow } from '@/types/database';

export default function CrewCommsPage() {
  const { team } = useAuth();
  const [logs, setLogs] = useState<SystemLogRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      if (!team) {
        setLoading(false);
        return;
      }
      try {
        const data = await fetchLogsForTeam(team.id);
        if (active) setLogs(data);
      } catch (err) {
        console.error('Failed to load logs:', err);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [team?.id]);

  if (!team) {
    return (
      <div className="mx-auto max-w-5xl px-6 py-8 sm:px-8">
        <Card className="p-6">
          <p className="text-slate-300">Join a team to access system logs.</p>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl px-6 py-8 sm:px-8">
        <Card className="p-6">
          <p className="code-text text-xs uppercase tracking-[0.35em] text-cyan-200/80 hud-pulse">Loading logs…</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-8 sm:px-8">
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Team log · {team.name}</h2>
        <SystemLogFeed logs={logs} />
      </Card>
    </div>
  );
}
