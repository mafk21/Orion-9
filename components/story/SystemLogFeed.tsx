import { logSeverity } from '@/lib/astra';
import type { SystemLogRow } from '@/types/database';

export default function SystemLogFeed({ logs }: { logs: SystemLogRow[] }) {
  if (logs.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-cyan-400/20 bg-space-950/70 p-6 text-center text-sm text-slate-400">
        No logs received. System is silent.
      </div>
    );
  }
  return (
    <ol className="space-y-2 code-text text-sm">
      {logs.map((log) => {
        const sev = logSeverity(log);
        const tone = sev === 'critical' ? 'text-rose-200' : sev === 'warn' ? 'text-amber-200' : 'text-cyan-100';
        const dot = sev === 'critical' ? 'bg-rose-400' : sev === 'warn' ? 'bg-amber-400' : 'bg-cyan-400';
        return (
          <li key={log.id} className="flex items-start gap-3 rounded-xl border border-white/6 bg-space-950/70 px-3 py-2">
            <span className={`mt-1.5 inline-block h-2 w-2 shrink-0 rounded-full ${dot}`} />
            <span className="text-[0.7rem] uppercase tracking-[0.25em] text-slate-500 w-32">
              {new Date(log.created_at).toLocaleString()}
            </span>
            <span className={`${tone} flex-1`}>{log.content}</span>
            {log.phase ? <span className="text-[0.62rem] uppercase tracking-[0.3em] text-slate-500">P{log.phase}</span> : null}
          </li>
        );
      })}
    </ol>
  );
}
