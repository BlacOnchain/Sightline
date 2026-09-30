import React from 'react';

export function Table({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`w-full overflow-x-auto border border-border rounded-md bg-surface ${className}`}>
      <table className="w-full text-left border-collapse text-xs sm:text-sm">{children}</table>
    </div>
  );
}

export function TableHead({ children }: { children: React.ReactNode }) {
  return (
    <thead className="border-b border-border text-xs text-muted font-normal select-none bg-surface/50">
      {children}
    </thead>
  );
}

export function TableBody({ children }: { children: React.ReactNode }) {
  return <tbody className="divide-y divide-border/60">{children}</tbody>;
}

export function TableRow({
  children,
  className = '',
  onClick,
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <tr
      onClick={onClick}
      className={`transition-colors ${
        onClick ? 'cursor-pointer hover:bg-raised/50' : 'hover:bg-raised/20'
      } ${className}`}
    >
      {children}
    </tr>
  );
}

export function TableHeaderCell({
  children,
  className = '',
  align = 'left',
}: {
  children: React.ReactNode;
  className?: string;
  align?: 'left' | 'right' | 'center';
}) {
  return (
    <th
      className={`px-3 sm:px-4 py-2.5 font-normal text-muted ${
        align === 'right' ? 'text-right' : align === 'center' ? 'text-center' : 'text-left'
      } ${className}`}
    >
      {children}
    </th>
  );
}

export function TableCell({
  children,
  className = '',
  align = 'left',
}: {
  children: React.ReactNode;
  className?: string;
  align?: 'left' | 'right' | 'center';
}) {
  return (
    <td
      className={`px-3 sm:px-4 py-3 text-text ${
        align === 'right' ? 'text-right tabular-nums' : align === 'center' ? 'text-center' : 'text-left'
      } ${className}`}
    >
      {children}
    </td>
  );
}
