import Card from '@/components/ui/Card';

export default function SignalArchivePanel({
  items = [
    { id: 'S-01', label: 'Fragment 01', detail: 'Pulse burst from the moon relay chamber.' },
    { id: 'S-02', label: 'Fragment 02', detail: 'Encrypted route map for the abandoned launch bay.' },
    { id: 'S-03', label: 'Fragment 03', detail: 'Ambient telemetry from the deep-scan station.' }
  ]
}: {
  items?: Array<{ id: string; label: string; detail: string }>;
}) {
  return (
    <Card className="p-6" tone="default">
      <div className="space-y-4">
        {items.map((item) => (
          <article key={item.id} className="rounded-2xl border border-white/8 bg-space-950/70 p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-[0.68rem] uppercase tracking-[0.35em] text-cyan-200/70">{item.id}</p>
              <span className="rounded-full border border-emerald-400/20 bg-emerald-400/8 px-3 py-1 text-[0.65rem] uppercase tracking-[0.25em] text-emerald-100">Archived</span>
            </div>
            <h3 className="mt-3 text-lg font-semibold text-white">{item.label}</h3>
            <p className="mt-2 text-sm text-slate-300">{item.detail}</p>
          </article>
        ))}
      </div>
    </Card>
  );
}
