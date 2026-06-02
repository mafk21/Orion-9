import { forwardRef } from 'react';
import type { ButtonHTMLAttributes } from 'react';
import Button from './Button';

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  label: string;
  variant?: 'primary' | 'secondary' | 'ghost';
};

const GlowingButton = forwardRef<HTMLButtonElement, Props>(function GlowingButton(
  { label, variant = 'primary', className = '', ...props },
  ref
) {

  return (
    <Button
      ref={ref}
      variant={variant === 'primary' ? 'primary' : variant === 'secondary' ? 'secondary' : 'ghost'}
      size="md"
      className={className}
      {...props}
    >
      {label}
    </Button>
  );
});

export default GlowingButton;
