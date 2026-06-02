export default function RadarScan({ size = 280 }: { size?: number }) {
  return (
    <div className="radar-shell radar-grid" style={{ width: size, height: size }} aria-hidden="true">
      <div className="radar-sweep" />
      <div className="absolute inset-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-300 shadow-[0_0_18px_rgba(103,232,249,0.8)]" />
    </div>
  );
}
