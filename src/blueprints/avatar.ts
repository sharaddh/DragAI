import type { ComponentConfig, ComponentResult } from "../types/index.js";

export function generateAvatar(config: ComponentConfig): ComponentResult {
  const name = config.name || "Avatar";
  const size = config.size || "md";
  const color = config.color || "blue";

  const sizeMap: Record<string, { size: string; text: string }> = {
    sm: { size: "h-8 w-8", text: "text-xs" },
    md: { size: "h-10 w-10", text: "text-sm" },
    lg: { size: "h-12 w-12", text: "text-base" },
    xl: { size: "h-16 w-16", text: "text-lg" },
  };
  const s = sizeMap[size] || sizeMap.md;

  const props = `export interface ${name}Props {
  src?: string;
  alt?: string;
  fallback?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  status?: 'online' | 'offline' | 'away';
  className?: string;
  onClick?: () => void;
}`;

  const statusDot = config.dot
    ? `
      {status && (
        <span
          className={[
            'absolute -bottom-0.5 -right-0.5 block h-2.5 w-2.5 rounded-full ring-2 ring-white dark:ring-gray-800',
            status === 'online' ? 'bg-green-500' : '',
            status === 'away' ? 'bg-yellow-500' : '',
            status === 'offline' ? 'bg-gray-400' : '',
          ].join(' ')}
          aria-label={status}
        />
      )}`
    : "";

  const buttonAttr = "type=\"button\"";
  const code = `import React, { useState } from 'react';

${props}

export default function ${name}({
  src,
  alt = '',
  fallback,
  size = '${size}',
  status,
  className = '',
  onClick,
}: ${name}Props) {
  const [imgError, setImgError] = useState(false);

  const sizeClasses: Record<string, string> = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-12 w-12 text-base',
    xl: 'h-16 w-16 text-lg',
  };

  const initials = (fallback || alt || '?')
    .split(' ')
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const Component = onClick ? 'button' : 'div';

  return (
    <Component
      \${onClick ? '${buttonAttr}' : ''}
      onClick={onClick}
      className={['relative inline-flex items-center justify-center rounded-full overflow-hidden',
        'bg-${color}-100 text-${color}-600 dark:bg-${color}-900 dark:text-${color}-300',
        'font-medium',
        sizeClasses[size] || sizeClasses.md,
        onClick ? 'cursor-pointer hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-${color}-500 focus:ring-offset-2 transition-opacity' : '',
        className,
      ].filter(Boolean).join(' ')}
      aria-label={alt || fallback || 'Avatar'}
    >
      {src && !imgError ? (
        <img
          src={src}
          alt={alt}
          onError={() => setImgError(true)}
          className="h-full w-full object-cover"
          loading="lazy"
        />
      ) : (
        <span aria-hidden="true">{initials}</span>
      )}
${statusDot}
    </Component>
  );
}`;

  return { componentName: name, code, props, dependencies: [] };
}
