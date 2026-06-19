import type { ComponentConfig, ComponentResult } from "../types/index.js";
import { gapClasses } from "../templates/tailwind.js";

export function generateLayout(config: ComponentConfig): ComponentResult {
  const name = config.name || "Layout";
  const layout = config.layout || "container";
  const direction = config.direction || "column";
  const gap = gapClasses(config.gap || "md");
  const align = config.align || "start";
  const justify = config.justify || "start";

  const alignClasses: Record<string, string> = {
    start: "items-start", center: "items-center", end: "items-end", stretch: "items-stretch",
  };
  const justifyClasses: Record<string, string> = {
    start: "justify-start", center: "justify-center", end: "justify-end",
    between: "justify-between", around: "justify-around",
  };

  const props = `export interface ${name}Props {
  children?: React.ReactNode;
  className?: string;
  as?: 'div' | 'section' | 'article' | 'aside' | 'main';
  ${layout === "grid" ? "cols?: number;" : ""}
}`;

  let innerCode = "";
  const childrenRender = `      {children}`;

  if (layout === "container") {
    innerCode = `    <Component
      className={['mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8', className].filter(Boolean).join(' ')}
    >
${childrenRender}
    </Component>`;
  } else if (layout === "stack") {
    innerCode = `    <Component
      className={[
        'flex ${direction === "row" ? "flex-row" : "flex-col"}',
        '${alignClasses[align]} ${justifyClasses[justify]}',
        '${gap}',
        className,
      ].filter(Boolean).join(' ')}
    >
${childrenRender}
    </Component>`;
  } else if (layout === "grid") {
    innerCode = `    <Component
      className={[
        'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-${config.cols || 3}',
        '${gap}',
        className,
      ].filter(Boolean).join(' ')}
    >
${childrenRender}
    </Component>`;
  } else if (layout === "sidebar") {
    const side = config.sidebar || "left";
    innerCode = `    <Component
      className={[
        'flex flex-col lg:flex-row',
        '${gap}',
        className,
      ].filter(Boolean).join(' ')}
    >
      ${side === "left" ? `      <aside className="w-full lg:w-64 flex-shrink-0">
        {sidebar}
      </aside>
      <main className="flex-1 min-w-0">
        {children}
      </main>` : `      <main className="flex-1 min-w-0">
        {children}
      </main>
      <aside className="w-full lg:w-64 flex-shrink-0">
        {sidebar}
      </aside>`}
    </Component>`;
  }

  const code = `import React from 'react';

${props}

export default function ${name}({
  children,
  className = '',
  as = 'div',
  ${layout === "sidebar" ? "sidebar," : ""}
  ${layout === "grid" ? "cols = 3," : ""}
}: ${name}Props) {
  const Component = as;

  return (
${innerCode}
  );
}`;

  return { componentName: name, code, props, dependencies: [] };
}
