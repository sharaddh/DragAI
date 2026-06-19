import type { ComponentConfig, ComponentResult } from "../types/index.js";

export function generateCard(config: ComponentConfig): ComponentResult {
  const name = config.name || "Card";
  const color = config.color || "white";

  const hasHeader = !!config.header;
  const hasBody = !!config.body || (config.children && config.children.length > 0);
  const hasFooter = !!config.footer;
  const hasImage = !!config.image;

  const borderClass = color === "white" ? "border border-gray-200 dark:border-gray-700" : "";
  const bgClass = color === "white"
    ? "bg-white dark:bg-gray-800"
    : color === "slate"
    ? "bg-slate-50 dark:bg-slate-900"
    : "bg-white dark:bg-gray-800";

  const props = `export interface ${name}Props {
  ${hasHeader ? `header?: React.ReactNode;` : ""}
  children?: React.ReactNode;
  ${hasFooter ? `footer?: React.ReactNode;` : ""}
  ${hasImage ? `imageSrc?: string;` : ""}
  className?: string;
  hoverable?: boolean;
  onClick?: () => void;
  badge?: string;
  badgeColor?: 'red' | 'green' | 'blue' | 'yellow' | 'purple';
  actions?: { label: string; onClick: () => void; variant?: 'primary' | 'ghost' }[];
}`;

  const imageSection = hasImage
    ? `      {imageSrc && (
        <div className="overflow-hidden rounded-t-xl relative group/image">
          <img
            src={imageSrc}
            alt=""
            className="h-48 w-full object-cover transition-all duration-500 group-hover:scale-110 group-hover:brightness-90"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover/image:opacity-100 transition-opacity duration-300" />
        </div>
      )}`
    : "";

  const badgeSection = `      {badge && (
        <span
          className={[
            'absolute top-3 right-3 px-2.5 py-0.5 text-xs font-semibold rounded-full shadow-sm z-10',
            badgeColor === 'red' ? 'bg-red-500 text-white' : '',
            badgeColor === 'green' ? 'bg-green-500 text-white' : '',
            badgeColor === 'blue' ? 'bg-blue-500 text-white' : '',
            badgeColor === 'yellow' ? 'bg-yellow-400 text-yellow-900' : '',
            badgeColor === 'purple' ? 'bg-purple-500 text-white' : '',
            !badgeColor || badgeColor === 'blue' ? 'bg-blue-500 text-white' : '',
          ].join(' ')}
        >
          {badge}
        </span>
      )}`;

  const headerSection = hasHeader
    ? `        {header && (
          <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-700 flex items-center justify-between">
            {typeof header === 'string' ? (
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{header}</h3>
            ) : header}
          </div>
        )}`
    : "";

  const bodySection = hasBody
    ? `        <div className="px-6 py-4 space-y-3">
          {children}
        </div>`
    : "";
  const footerSection = hasFooter
    ? `        {footer && (
          <div className="border-t border-gray-200 px-6 py-4 dark:border-gray-700">
            {typeof footer === 'string' ? (
              <p className="text-sm text-gray-600 dark:text-gray-400">{footer}</p>
            ) : footer}
          </div>
        )}`
    : "";

  const actionsSection = `      {actions && actions.length > 0 && (
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center gap-2">
          {actions.map((action, idx) => (
            <button
              key={idx}
              type="button"
              onClick={(e) => { e.stopPropagation(); action.onClick(); }}
              className={[
                'px-3 py-1.5 text-sm font-medium rounded-lg transition-all duration-200',
                action.variant === 'primary' || !action.variant
                  ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm hover:shadow'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700',
              ].join(' ')}
            >
              {action.label}
            </button>
          ))}
        </div>
      )}`;

  const code = `import React from 'react';

${props}

export default function ${name}({
  ${hasHeader ? "header," : ""}
  children,
  ${hasFooter ? "footer," : ""}
  ${hasImage ? "imageSrc," : ""}
  className = '',
  hoverable = false,
  onClick,
  badge,
  badgeColor = 'blue',
  actions,
}) {
  const Component = onClick ? 'button' : 'div';

  return (
    <Component
      onClick={onClick}
      className={[
        'overflow-hidden rounded-xl shadow-sm transition-all duration-300 relative',
        '${bgClass} ${borderClass}',
        hoverable && !onClick ? 'hover:shadow-lg hover:-translate-y-1' : '',
        onClick ? 'hover:shadow-md hover:-translate-y-0.5 cursor-pointer text-left w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2' : '',
        'group',
        className,
      ].join(' ')}
      {onClick ? 'type="button"' : ''}
    >
${badgeSection}
${imageSection}
      <div className="flex flex-col">
${headerSection}
${bodySection || (!hasHeader && !hasFooter && !hasImage ? `        <div className="px-6 py-4 space-y-3">
          {children}
        </div>` : "")}
${actionsSection}
${footerSection}
      </div>
    </Component>
  );
}`;

  return { componentName: name, code, props, dependencies: [] };
}
