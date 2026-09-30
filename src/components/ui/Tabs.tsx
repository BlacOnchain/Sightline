import React from 'react';

export interface TabItem {
  id: string;
  label: string;
  count?: number;
}

export interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (id: string) => void;
  className?: string;
}

export function Tabs({ tabs, activeTab, onChange, className = '' }: TabsProps) {
  return (
    <div className={`flex border-b border-border gap-1 ${className}`} role="tablist">
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.id)}
            className={`px-3.5 py-2 text-xs font-medium border-b-2 -mb-px transition-colors cursor-pointer select-none inline-flex items-center gap-1.5 focus:outline-none ${
              isActive
                ? 'border-accent text-text font-semibold'
                : 'border-transparent text-muted hover:text-text hover:border-border'
            }`}
          >
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span
                className={`text-[11px] tabular-nums px-1.5 py-0.5 rounded-xs ${
                  isActive ? 'bg-accent-subtle text-accent font-medium' : 'bg-raised text-muted'
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
