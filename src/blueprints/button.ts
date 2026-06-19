import type { ComponentConfig, ComponentResult } from "../types/index.js";
import { buttonVariantClasses, sizeClasses } from "../templates/tailwind.js";

export function generateButton(config: ComponentConfig): ComponentResult {
  const name = config.name || "Button";
  const variant = config.variant || "primary";
  const color = config.color || "blue";
  const size = config.size || "md";
  const sz = sizeClasses(size);
  const classes = buttonVariantClasses(variant, color);

  const iconAttr = config.icon ? `icon?: React.ReactNode;` : null;
  const iconPosition = config.iconPosition || "left";
  const fullWidth = config.responsive || false;

  const props = `export interface ${name}Props {
  children?: React.ReactNode;
  ${iconAttr ? iconAttr + "\n  iconPosition?: 'left' | 'right';" : ""}
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  ariaLabel?: string;
  ${fullWidth ? "fullWidth?: boolean;" : ""}
  tooltip?: string;
}`;

  const loadingSpinner = `        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>`;

  const iconRender = config.icon
    ? `        {icon && iconPosition === 'left' && <span className="mr-2 -ml-1">{icon}</span>}
        {children}
        {icon && iconPosition === 'right' && <span className="ml-2 -mr-1">{icon}</span>}`
    : `        {children}`;

  const code = `import React, { useState, useRef } from 'react';

${props}

export default function ${name}({
  children,
  ${config.icon ? "icon," : ""}
  ${config.icon ? "iconPosition = 'left'," : ""}
  onClick,
  type = 'button',
  disabled = false,
  loading = false,
  className = '',
  ariaLabel,
  ${fullWidth ? "fullWidth = false," : ""}
  tooltip,
}) {
  const [ripples, setRipples] = useState([]);
  const btnRef = useRef(null);
  let rippleId = useRef(0);

  const handleClick = (e) => {
    if (disabled || loading) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = ++rippleId.current;
    setRipples((prev) => [...prev, { x, y, id }]);
    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== id));
    }, 600);
    onClick?.();
  };

  return (
    <button
      ref={btnRef}
      type={type}
      onClick={handleClick}
      disabled={disabled || loading}
      aria-label={ariaLabel}
      aria-busy={loading}
      title={tooltip}
      className={[
        'inline-flex items-center justify-center font-medium transition-all duration-200 relative overflow-hidden',
        '${sz.padding} ${sz.text} ${sz.rounded}',
        '${classes}',
        ${fullWidth ? "fullWidth ? 'w-full' : ''" : ""}
        ${config.responsive ? `'w-full sm:w-auto',` : ""}
        'select-none',
        className,
      ].filter(Boolean).join(' ')}
    >
      {loading ? (
        <>
          ${loadingSpinner}
          {children}
        </>
      ) : (
        <>
${iconRender}
        </>
      )}
      {ripples.map((ripple) => (
        <span
          key={ripple.id}
          className="pointer-events-none absolute rounded-full bg-white/30 animate-ripple"
          style={{
            left: ripple.x - 10,
            top: ripple.y - 10,
            width: 20,
            height: 20,
          }}
        />
      ))}
    </button>
  );
}`;

  return { componentName: name, code, props, dependencies: [] };
}
