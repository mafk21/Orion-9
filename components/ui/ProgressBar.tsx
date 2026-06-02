export default function ProgressBar({
  value,
  max = 100,
  label,
  className = ''
}: {
  value: number;
  max?: number;
  label?: string;
  className?: string;
}) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div className={className}>
      {label ? <div className="mb-2 flex items-center justify-between text-xs uppercase tracking-[0.25em] text-cyan-100/80"><span>{label}</span><strong>{Math.round(percentage)}%</strong></div> : null}
      <div className="h-2 rounded-full bg-white/8">
        <div className="h-2 rounded-full bg-gradient-to-r from-cyan-400 via-sky-400 to-violet-500 shadow-[0_0_14px_rgba(56,189,248,0.35)]" style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
}
