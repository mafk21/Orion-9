export default function AccessDenied() {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-rose-400/30 bg-space-950 p-12 text-center danger-glow">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_50%,rgba(251,113,133,0.18),transparent_60%)]" />
      <p className="code-text text-[0.7rem] uppercase tracking-[0.45em] text-rose-300/80">ORION-9 // gateway</p>
      <h2 className="access-flicker mt-6 text-5xl font-semibold tracking-[0.3em] text-rose-100 sm:text-6xl">ACCESS DENIED</h2>
      <p className="mt-6 max-w-2xl mx-auto text-sm text-slate-300">
        The sealed chamber refuses your imprint. Reconstruct the master access vector by combining role fragments. The captain must commit the order.
      </p>
    </div>
  );
}
