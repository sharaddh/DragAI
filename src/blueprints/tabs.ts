import type { ComponentConfig, ComponentResult, TabConfig } from "../types/index.js";

export function generateTabs(config: ComponentConfig): ComponentResult {
  const name = config.name || "Tabs";
  const color = config.color || "blue";
  const tabs = config.tabs || [
    { id: "tab1", label: "First Tab" } as TabConfig,
    { id: "tab2", label: "Second Tab" } as TabConfig,
    { id: "tab3", label: "Third Tab" } as TabConfig,
  ];

  const tabButtons = tabs.map((t) => `            <button
              key="${t.id}"
              type="button"
              onClick={() => setActiveTab('${t.id}')}
              className={[
                'px-4 py-2.5 text-sm font-medium transition-all duration-200',
                'focus:outline-none focus:ring-2 focus:ring-${color}-500 focus:ring-offset-2 rounded-lg',
                activeTab === '${t.id}'
                  ? 'text-${color}-600 border-b-2 border-${color}-500 dark:text-${color}-400 dark:border-${color}-400'
                  : 'text-gray-500 hover:text-gray-700 border-b-2 border-transparent hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200',
              ].join(' ')}
              role="tab"
              aria-selected={activeTab === '${t.id}'}
              aria-controls="tabpanel-${t.id}"
            >
              ${t.label}
            </button>`).join("\n");

  const tabPanels = tabs.map((t) => `          <div
            key="${t.id}"
            id="tabpanel-${t.id}"
            role="tabpanel"
            aria-labelledby="${t.id}"
            hidden={activeTab !== '${t.id}'}
            className="pt-4"
          >
            {tabContents['${t.id}'] || <p className="text-gray-500 dark:text-gray-400">Content for ${t.label}</p>}
          </div>`).join("\n");

  const props = `export interface ${name}Props {
  tabs?: { id: string; label: string }[];
  defaultTab?: string;
  className?: string;
  onChange?: (tabId: string) => void;
}

export type ${name}Content = Record<string, React.ReactNode>;`;

  const tabsJson = JSON.stringify(tabs.map(t => ({ id: t.id, label: t.label })));

  const code = `import React, { useState } from 'react';

${props}

export default function ${name}({
  tabs: tabList = ${tabsJson},
  defaultTab,
  className = '',
  onChange,
}: ${name}Props) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabList[0]?.id || '');
  const [tabContents, setTabContents] = useState<${name}Content>({});

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    onChange?.(tabId);
  };

  return (
    <div className={className}>
      <div className="border-b border-gray-200 dark:border-gray-700" role="tablist" aria-orientation="horizontal">
        <div className="flex -mb-px space-x-1 overflow-x-auto">
${tabButtons}
        </div>
      </div>
      <div className="mt-2">
${tabPanels}
      </div>
    </div>
  );
}`;

  return { componentName: name, code, props, dependencies: [] };
}
