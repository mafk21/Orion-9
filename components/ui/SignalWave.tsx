export default function SignalWave({ label, className = '' }: { label?: string; className?: string }) {
  return (
    <div className={['flex flex-col gap-2', className].join(' ')}>
      {label ? <p className="code-text text-[0.62rem] uppercase tracking-[0.32em] text-cyan-200/80">{label}</p> : null}
      <div className="signal-wave" aria-hidden="true" />
    </div>
  );
}
