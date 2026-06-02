import Card from '@/components/ui/Card';
import ProgressBar from '@/components/ui/ProgressBar';

export default function SoloMissionCard({
  title,
  status,
  summary,
  progress,
  tag
}: {
  title: string;
  status: string;
  summary: string;
  progress: number;
  tag: string;
}) {
  return (
    <Card className="p-6" tone="default">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[0.68rem] uppercase tracking-[0.35em] text-cyan-200/80">{tag}</p>
          <h3 className="mt-3 text-xl font-semibold text-white">{title}</h3>
          <p className="mt-2 text-sm text-slate-300">{summary}</p>
        </div>
        <span className="rounded-full border border-cyan-400/20 bg-cyan-400/8 px-3 py-1 text-xs uppercase tracking-[0.25em] text-cyan-100">{status}</span>
      </div>
      <div className="mt-5">
        <ProgressBar value={progress} label="Mission progress" />
      </div>
    </Card>
  );
}
