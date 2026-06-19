import type { ComponentConfig, ComponentResult, FieldConfig } from "../types/index.js";
import { colorClasses, inputSizeClasses } from "../templates/tailwind.js";

function generateInputField(field: FieldConfig, color: string, size: string): string {
  const c = colorClasses(color as any);
  const sz = inputSizeClasses(size as any);
  const id = `field-${field.name}`;
  const required = field.required ? `\n        required` : "";

  if (field.type === "textarea") {
    return `      <div className="space-y-1">
        <label htmlFor="${id}" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          ${field.label}${field.required ? ' <span className="text-red-500">*</span>' : ""}
        </label>
        <textarea
          id="${id}"
          name="${field.name}"
          placeholder="${field.placeholder || ""}"
          rows={4}
          ${required}
          aria-required={${field.required || false}}
          className={[
            'block w-full rounded-lg border border-gray-300 bg-white shadow-sm',
            '${sz}',
            'placeholder:text-gray-400',
            'focus:border-${color}-500 focus:outline-none focus:ring-2 ${c.focus}',
            'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-50',
            'dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500',
          ].join(' ')}
        />
      </div>`;
  }

  if (field.type === "select") {
    const options = (field.options || []).map(
      (opt) => `          <option value="${opt.toLowerCase()}">${opt}</option>`
    ).join("\n");
    return `      <div className="space-y-1">
        <label htmlFor="${id}" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          ${field.label}${field.required ? ' <span className="text-red-500">*</span>' : ""}
        </label>
        <select
          id="${id}"
          name="${field.name}"
          ${required}
          aria-required={${field.required || false}}
          className={[
            'block w-full rounded-lg border border-gray-300 bg-white shadow-sm',
            '${sz}',
            'focus:border-${color}-500 focus:outline-none focus:ring-2 ${c.focus}',
            'disabled:cursor-not-allowed disabled:opacity-50',
            'dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100',
          ].join(' ')}
        >
          <option value="">Select...</option>
${options}
        </select>
      </div>`;
  }

  if (field.type === "checkbox") {
    return `      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          name="${field.name}"
          ${required}
          aria-required={${field.required || false}}
          className="h-4 w-4 rounded border-gray-300 ${c.text} focus:ring-2 ${c.focus}"
        />
        <span className="text-sm text-gray-700 dark:text-gray-300">${field.label}</span>
      </label>`;
  }

  return `      <div className="space-y-1">
        <label htmlFor="${id}" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          ${field.label}${field.required ? ' <span className="text-red-500">*</span>' : ""}
        </label>
        <input
          type="${field.type}"
          id="${id}"
          name="${field.name}"
          placeholder="${field.placeholder || ""}"
          ${required}
          aria-required={${field.required || false}}
          className={[
            'block w-full rounded-lg border border-gray-300 bg-white shadow-sm',
            '${sz}',
            'placeholder:text-gray-400',
            'focus:border-${color}-500 focus:outline-none focus:ring-2 ${c.focus}',
            'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-50',
            'dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500',
          ].join(' ')}
        />
      </div>`;
}

export function generateInput(config: ComponentConfig): ComponentResult {
  const name = config.name || "InputField";
  const color = config.color || "blue";
  const size = config.size || "md";

  const fields = config.fields || [
    { type: "text", name: "value", label: config.label || "Input", placeholder: config.placeholder, required: config.required } as FieldConfig,
  ];

  const fieldCode = fields.map((f) => generateInputField(f, color, size)).join("\n\n");

  const fieldNames = fields.map((f) => `  ${f.name}?: string;`).join("\n");
  const errorsType = fields.map((f) => `  ${f.name}?: string;`).join("\n");

  const props = `export interface ${name}Props {
${fieldNames}
  onChange?: (value: string) => void;
  className?: string;
  disabled?: boolean;
  loading?: boolean;
  errors?: {
${errorsType}
  };
}`;

  const code = `import React, { useState } from 'react';

${props}

export default function ${name}({
  ${fields.map((f) => `${f.name} = '',`).join("\n  ")}
  onChange,
  className = '',
  disabled = false,
  loading = false,
  errors = {},
}: ${name}Props) {
  const [focused, setFocused] = useState<string | null>(null);

  return (
    <div className={['space-y-4', className].filter(Boolean).join(' ')}>
${fieldCode.split("\n").map(l => l || "").join("\n")}
    </div>
  );
}`;

  return { componentName: name, code, props, dependencies: [] };
}
