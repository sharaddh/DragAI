import type { ComponentConfig, ComponentResult } from "../types/index.js";

export function generateDropdown(config: ComponentConfig): ComponentResult {
  const name = config.name || "Dropdown";
  const color = config.color || "blue";
  const items = config.items || [
    { label: "Option 1", value: "option1" },
    { label: "Option 2", value: "option2", divider: true },
    { label: "Option 3", value: "option3", disabled: true },
  ];

  const itemsCode = items.map((item) => {
    if (item.divider) {
      return `          <div className="h-px bg-gray-200 dark:bg-gray-700 my-1" role="separator" />`;
    }
    return `          <button
            type="button"
            className={[
              'w-full text-left px-4 py-2 text-sm transition-colors',
              'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700',
              ${item.disabled ? "'opacity-50 cursor-not-allowed hover:bg-transparent dark:hover:bg-transparent'" : "''"},
            ].filter(Boolean).join(' ')}
            onClick={() => !${item.disabled} && onSelect?.('${item.value}')}
            disabled={${item.disabled || false}}
            role="menuitem"
          >
            ${item.label}
          </button>`;
  }).join("\n");

  const props = `export interface ${name}Props {
  trigger?: React.ReactNode;
  items?: { label: string; value: string; divider?: boolean; disabled?: boolean }[];
  onSelect?: (value: string) => void;
  align?: 'left' | 'right';
  className?: string;
  label?: string;
}`;

  const code = `import React, { useState, useRef, useEffect } from 'react';

${props}

export default function ${name}({
  trigger,
  items: menuItems = ${JSON.stringify(items)},
  onSelect,
  align = 'left',
  className = '',
  label = 'Options',
}: ${name}Props) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open]);

  return (
    <div ref={dropdownRef} className={['relative inline-block text-left', className].filter(Boolean).join(' ')}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-${color}-500 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700 transition-colors"
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={label}
      >
        {trigger || 'Menu'}
        <svg className={['h-4 w-4 transition-transform', open ? 'rotate-180' : ''].join(' ')} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div
          className={[
            'absolute z-10 mt-1 min-w-[12rem] rounded-lg bg-white shadow-lg ring-1 ring-black/5 dark:bg-gray-800 dark:ring-white/10',
            'py-1',
            align === 'right' ? 'right-0' : 'left-0',
          ].join(' ')}
          role="menu"
          aria-orientation="vertical"
        >
${itemsCode}
        </div>
      )}
    </div>
  );
}`;

  return { componentName: name, code, props, dependencies: [] };
}
