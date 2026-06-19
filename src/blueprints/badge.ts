import type { ComponentConfig, ComponentResult } from "../types/index.js";
import { colorClasses, sizeClasses } from "../templates/tailwind.js";

export function generateBadge(config: ComponentConfig): ComponentResult {
  const name = config.name || "Badge";
  const color = config.color || "blue";
  const size = config.size || "sm";
  const c = colorClasses(color);
  const sz = sizeClasses(size);

  const dotClass = config.dot ? "w-1.5 h-1.5" : "hidden";
  const removable = config.badge ? true : false;

  const props = `export interface ${name}Props {
  children?: React.ReactNode;
  color?: '${color}' | 'red' | 'green' | 'yellow' | 'purple';
  size?: 'sm' | 'md' | 'lg';
  dot?: boolean;
  removable?: boolean;
  onRemove?: () => void;
  className?: string;
}`;

  const code = `import React from 'react';

${props}

export default function ${name}({
  children,
  color = '${color}',
  size = '${size}',
  dot = ${config.dot || false},
  removable = ${removable},
  onRemove,
  className = '',
}: ${name}Props) {
  const colorMap: Record<string, string> = {
    blue: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
    red: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
    green: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
    yellow: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
    purple: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
  };

  const sizeMap: Record<string, string> = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1 text-sm',
  };

  return (
    <span
      className={[
        'inline-flex items-center gap-1.5 font-medium rounded-full',
        colorMap[color] || colorMap.blue,
        sizeMap[size] || sizeMap.sm,
        className,
      ].filter(Boolean).join(' ')}
    >
      {dot && (
        <span className={[\`w-1.5 h-1.5 rounded-full bg-current\`, 'opacity-60'].join(' ')} aria-hidden="true" />
      )}
      {children}
      {removable && (
        <button
          type="button"
          onClick={onRemove}
          className="ml-0.5 inline-flex items-center justify-center rounded-full hover:bg-black/10 dark:hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-offset-1"
          aria-label="Remove"
        >
          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </span>
  );
}`;

  return { componentName: name, code, props, dependencies: [] };
}
