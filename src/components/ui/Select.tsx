import React from 'react';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: SelectOption[];
  error?: string;
  helperText?: string;
  eyebrow?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, options, error, helperText, eyebrow, className = '', id, ...props }, ref) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full space-y-1">
        {eyebrow && (
          <span className="block text-xs text-muted">
            {eyebrow.replace(/^\/\/\s*\d*\.?\s*/i, '')}
          </span>
        )}
        {label && (
          <label htmlFor={selectId} className="block text-xs font-normal text-muted">
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            className={`w-full px-3 py-2 text-xs sm:text-sm bg-surface border rounded-md text-text focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent transition-colors disabled:opacity-50 disabled:bg-raised appearance-none pr-8 cursor-pointer min-h-[38px] ${
              error ? 'border-danger focus:ring-danger focus:border-danger' : 'border-border'
            } ${className}`}
            {...props}
          >
            {options.map((opt) => (
              <option key={opt.value} value={opt.value} className="bg-surface text-text">
                {opt.label}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-muted">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
        {error && <p className="text-xs text-danger">{error}</p>}
        {!error && helperText && <p className="text-xs text-muted">{helperText}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';
