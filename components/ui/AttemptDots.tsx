export default function AttemptDots({ used, total = 3 }: { used: number; total?: number }) {
  const dots = Array.from({ length: total });
  return (
    <div className="flex items-center gap-1.5" aria-label={`${used} of ${total} attempts used`}>
      {dots.map((_, i) => {
        const consumed = i < used;
        return (
          <span
            key={i}
            className={[
              'inline-block h-2.5 w-2.5 rounded-full',
              consumed
                ? 'bg-rose-400 shadow-[0_0_10px_rgba(251,113,133,0.6)]'
                : 'border border-cyan-400/50 bg-transparent'
            ].join(' ')}
          />
        );
      })}
    </div>
  );
}
