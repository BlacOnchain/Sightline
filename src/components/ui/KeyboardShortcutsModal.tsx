import React from 'react';
import { Modal } from './Modal';

export interface ShortcutItem {
  keys: string[];
  description: string;
}

export function KeyboardShortcutsModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const shortcuts: { category: string; items: ShortcutItem[] }[] = [
    {
      category: 'Navigation',
      items: [
        { keys: ['g', 'o'], description: 'Go to Overview dashboard' },
        { keys: ['g', 'q'], description: 'Go to Tracked Queries' },
      ],
    },
    {
      category: 'Actions',
      items: [
        { keys: ['/'], description: 'Focus search input' },
        { keys: ['?'], description: 'Show keyboard shortcuts' },
        { keys: ['Esc'], description: 'Close modal / dropdown' },
      ],
    },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Keyboard Shortcuts"
      eyebrow="Productivity"
      maxWidth="sm"
    >
      <div className="space-y-4">
        {shortcuts.map((group) => (
          <div key={group.category} className="space-y-2">
            <span className="text-xs text-muted block font-normal">
              {group.category}
            </span>
            <div className="space-y-1.5">
              {group.items.map((item) => (
                <div
                  key={item.description}
                  className="flex items-center justify-between p-2 rounded-md bg-raised/40 border border-border text-xs"
                >
                  <span className="text-text">{item.description}</span>
                  <div className="flex items-center gap-1">
                    {item.keys.map((k, i) => (
                      <React.Fragment key={i}>
                        <kbd className="px-2 py-0.5 rounded-xs bg-surface border border-border text-[11px] text-accent font-semibold min-w-5 text-center">
                          {k}
                        </kbd>
                        {i < item.keys.length - 1 && (
                          <span className="text-muted text-[10px]">then</span>
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Modal>
  );
}
