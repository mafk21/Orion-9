import { forwardRef } from 'react';
import type { ButtonHTMLAttributes } from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
};

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'border border-cyan-400/30 bg-gradient-to-r from-cyan-400 via-sky-400 to-violet-500 text-slate-950 shadow-[0_0_24px_rgba(56,189,248,0.25)] hover:shadow-[0_0_30px_rgba(56,189,248,0.35)]',
  secondary: 'border border-cyan-400/20 bg-white/8 text-cyan-100 hover:bg-white/12',
  ghost: 'border border-white/10 bg-transparent text-cyan-100 hover:bg-white/6',
  danger: 'border border-rose-400/30 bg-gradient-to-r from-rose-500/90 to-amber-400/90 text-slate-950 shadow-[0_0_24px_rgba(248,113,113,0.18)] hover:shadow-[0_0_30px_rgba(248,113,113,0.28)]'
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-4 py-2 text-xs',
  md: 'px-5 py-3 text-sm',
  lg: 'px-6 py-3.5 text-base'
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className = '', variant = 'primary', size = 'md', fullWidth = false, type = 'button', ...props },
  ref
) {
  return (
    <button
      ref={ref}
      type={type}
      className={[
        'inline-flex items-center justify-center rounded-full font-semibold tracking-[0.18em] uppercase transition duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 disabled:cursor-not-allowed disabled:opacity-60',
        variantStyles[variant],
        sizeStyles[size],
        fullWidth ? 'w-full' : '',
        className
      ].join(' ')}
      {...props}
    />
  );
});

export default Button;
