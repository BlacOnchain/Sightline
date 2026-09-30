import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  eyebrow?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, eyebrow, className = '', id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full space-y-1">
        {eyebrow && (
          <span className="block text-xs text-muted">
            {eyebrow.replace(/^\/\/\s*\d*\.?\s*/i, '')}
          </span>
        )}
        {label && (
          <label htmlFor={inputId} className="block text-xs font-normal text-muted">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`w-full px-3 py-2 text-xs sm:text-sm bg-surface border rounded-md text-text placeholder:text-muted/60 focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent transition-colors disabled:opacity-50 disabled:bg-raised min-h-[38px] ${
            error ? 'border-danger focus:ring-danger focus:border-danger' : 'border-border'
          } ${className}`}
          {...props}
        />
        {error && <p className="text-xs text-danger">{error}</p>}
        {!error && helperText && <p className="text-xs text-muted">{helperText}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
