export default function SectionHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="space-y-3">
      <p className="text-sm uppercase tracking-[0.3em] text-cyan-300/80">{title}</p>
      <h2 className="text-2xl font-semibold text-white sm:text-3xl">{subtitle}</h2>
    </div>
  );
}
