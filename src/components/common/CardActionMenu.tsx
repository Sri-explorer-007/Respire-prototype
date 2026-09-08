import React, { useState, useRef, useEffect } from 'react';
import { MoreVertical } from 'lucide-react';

export interface ActionMenuItem {
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  onClick: () => void;
  danger?: boolean;
}

interface CardActionMenuProps {
  items: ActionMenuItem[];
  title?: string;
  className?: string;
  iconClassName?: string;
}

export const CardActionMenu: React.FC<CardActionMenuProps> = ({
  items,
  title = 'Card options',
  className = '',
  iconClassName = 'w-3.5 h-3.5',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className={`relative ${className}`} ref={menuRef}>
      <button
        type="button"
        title={title}
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
      >
        <MoreVertical className={iconClassName} />
      </button>

      {isOpen && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="absolute right-0 top-full mt-1 w-44 rounded-xl bg-slate-900/95 border border-white/15 backdrop-blur-xl shadow-2xl py-1 z-40 animate-in fade-in zoom-in-95"
        >
          {items.map((item, idx) => {
            const Icon = item.icon;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  item.onClick();
                }}
                className={`w-full flex items-center space-x-2 px-3 py-1.5 text-xs text-left transition-colors cursor-pointer ${
                  item.danger
                    ? 'text-rose-400 hover:bg-rose-500/15'
                    : 'text-slate-300 hover:text-white hover:bg-white/[0.08]'
                }`}
              >
                {Icon && <Icon className="w-3.5 h-3.5 shrink-0 opacity-80" />}
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
