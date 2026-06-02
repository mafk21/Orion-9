import type { ReactNode } from 'react';

export default function Modal({ open, children, className = '' }: { open: boolean; children: ReactNode; className?: string; }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-space-950/75 p-4 backdrop-blur-md">
      <div className={['w-full max-w-xl rounded-3xl border border-white/8 bg-space-900/95 p-6 shadow-[0_24px_80px_rgba(8,14,27,0.65)]', className].join(' ')}>
        {children}
      </div>
    </div>
  );
}
