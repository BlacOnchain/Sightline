import React from 'react';
import { Loader2 } from 'lucide-react';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'secondary',
      size = 'md',
      loading = false,
      disabled = false,
      icon,
      className = '',
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium rounded-md transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none select-none cursor-pointer touch-manipulation';

    const sizeStyles = {
      sm: 'text-xs px-3 py-1.5 gap-1.5 min-h-[36px] sm:min-h-[30px]',
      md: 'text-xs sm:text-sm px-3.5 py-2 gap-2 min-h-[40px] sm:min-h-[34px]',
      lg: 'text-sm px-4.5 py-2.5 gap-2.5 min-h-[44px] sm:min-h-[38px]',
    };

    const variantStyles = {
      primary:
        'bg-text text-surface hover:opacity-90 active:opacity-100 border border-text font-medium shadow-none',
      secondary:
        'bg-surface text-text hover:bg-raised active:bg-raised/80 border border-border shadow-none',
      outline:
        'bg-transparent text-text hover:bg-raised active:bg-surface border border-border shadow-none',
      ghost:
        'bg-transparent text-muted hover:text-text hover:bg-raised/60 active:bg-raised border border-transparent',
      danger:
        'bg-danger/12 text-danger hover:bg-danger/20 active:bg-danger/25 border border-danger/30',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
        {...props}
      >
        {loading ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin text-current" />
        ) : (
          icon && <span className="inline-flex shrink-0">{icon}</span>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
