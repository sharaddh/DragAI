import type { ComponentConfig, ComponentResult, FieldConfig } from "../types/index.js";

function formField(field: FieldConfig, color: string): string {
  const c = color;
  const id = `form-${field.name}`;
  const required = field.required ? `\n        required` : "";

  const baseClasses = `'block w-full rounded-xl border shadow-sm transition-all duration-200',
              '\${sz}',
              'placeholder:text-gray-400 dark:placeholder:text-gray-500',
              errors.${field.name} ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20' : 'border-gray-300 focus:border-${c}-500 focus:ring-${c}-500/20 dark:border-gray-600',
              'focus:outline-none focus:ring-4',
              'dark:bg-gray-800/50 dark:text-gray-100 dark:focus:bg-gray-800',`;

  if (field.type === "textarea") {
    return `        <div className="space-y-1.5">
          <label htmlFor="${id}" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            ${field.label}${field.required ? ' <span className="text-red-500">*</span>' : ""}
            {errors.${field.name} && <span className="text-red-500 text-xs ml-2">{errors.${field.name}}</span>}
          </label>
          <textarea
            id="${id}"
            name="${field.name}"
            placeholder="${field.placeholder || ""}"
            rows={4}
            ${required}
            aria-required={${field.required || false}}
            aria-invalid={!!errors.${field.name}}
            value={formData.${field.name}}
            onChange={handleChange}
            onBlur={handleBlur}
            className={[
              ${baseClasses}
              'resize-y min-h-[80px]',
            ].join(' ')}
          />
          {errors.${field.name} && (
            <p className="text-xs text-red-500 flex items-center gap-1 mt-1" role="alert">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
              {errors.${field.name}}
            </p>
          )}
        </div>`;
  }

  if (field.type === "select") {
    const options = (field.options || []).map(
      (opt) => `              <option value="${opt.toLowerCase()}">${opt}</option>`
    ).join("\n");
    return `        <div className="space-y-1.5">
          <label htmlFor="${id}" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            ${field.label}${field.required ? ' <span className="text-red-500">*</span>' : ""}
          </label>
          <div className="relative">
            <select
              id="${id}"
              name="${field.name}"
              ${required}
              aria-required={${field.required || false}}
              aria-invalid={!!errors.${field.name}}
              value={formData.${field.name}}
              onChange={handleChange}
              onBlur={handleBlur}
              className={[
                ${baseClasses}
                'appearance-none pr-10',
              ].join(' ')}
            >
              <option value="">Select...</option>
${options}
            </select>
            <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
          </div>
          {errors.${field.name} && (
            <p className="text-xs text-red-500 flex items-center gap-1" role="alert">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
              {errors.${field.name}}
            </p>
          )}
        </div>`;
  }

  if (field.type === "checkbox") {
    return `        <label className="flex items-center gap-3 cursor-pointer group">
          <div className="relative flex items-center justify-center">
            <input
              type="checkbox"
              name="${field.name}"
              ${required}
              checked={!!formData.${field.name}}
              onChange={handleChange}
              className="peer sr-only"
            />
            <div className="w-5 h-5 rounded-md border-2 border-gray-300 dark:border-gray-600 peer-checked:border-${c}-500 peer-checked:bg-${c}-500 transition-all duration-200 group-hover:border-gray-400 dark:group-hover:border-gray-500" />
            <svg className="absolute w-3 h-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity duration-200 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
          </div>
          <span className="text-sm text-gray-700 dark:text-gray-300 select-none">${field.label}</span>
        </label>`;
  }

  const inputType = field.type === "password" ? "password" : field.type || "text";

  return `        <div className="space-y-1.5">
          <label htmlFor="${id}" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            ${field.label}${field.required ? ' <span className="text-red-500">*</span>' : ""}
            {errors.${field.name} && <span className="text-red-500 text-xs ml-2">{errors.${field.name}}</span>}
          </label>
          <div className="relative">
            <input
              type={showPassword && '${inputType}' === 'password' ? 'text' : '${inputType}'}
              id="${id}"
              name="${field.name}"
              placeholder="${field.placeholder || ""}"
              ${required}
              aria-required={${field.required || false}}
              aria-invalid={!!errors.${field.name}}
              value={formData.${field.name}}
              onChange={handleChange}
              onBlur={handleBlur}
              className={[
                ${baseClasses}
                '${inputType === "password" ? "pr-10" : ""}',
              ].join(' ')}
            />
            ${inputType === "password" ? `
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
              )}
            </button>` : ""}
          </div>
          {errors.${field.name} && (
            <p className="text-xs text-red-500 flex items-center gap-1 mt-1" role="alert">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
              {errors.${field.name}}
            </p>
          )}
        </div>`;
}

export function generateForm(config: ComponentConfig): ComponentResult {
  const name = config.name || "FormComponent";
  const color = config.color || "blue";
  const fields = config.fields || [
    { type: "text", name: "name", label: "Name", required: true } as FieldConfig,
    { type: "email", name: "email", label: "Email", required: true } as FieldConfig,
  ];
  const submitLabel = config.submitLabel || "Submit";
  const cancelLabel = config.cancelLabel;

  const hasPassword = fields.some(f => f.type === "password");

  const fieldsCode = fields.map((f) => formField(f, color)).join("\n\n");

  const initialFields = fields.map((f) => `  ${f.name}: '',`).join("\n");
  const fieldTypes = fields.map((f) => `  ${f.name}: string;`).join("\n");

  const props = `export interface ${name}Props {
  onSubmit?: (data: ${name}Data) => void;
  onCancel?: () => void;
  loading?: boolean;
  className?: string;
  submitLabel?: string;
  cancelLabel?: string;
}

export interface ${name}Data {
${fieldTypes}
}`;

  const cancelBtn = cancelLabel
    ? `            <button
              type="button"
              onClick={onCancel}
              className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-4 focus:ring-gray-100 transition-all duration-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
            >
              {cancelLabel || 'Cancel'}
            </button>`
    : "";

  const code = `import React, { useState } from 'react';

${props}

export default function ${name}({
  onSubmit,
  onCancel,
  loading = false,
  className = '',
  submitLabel = '${submitLabel}',
  cancelLabel,
}) {
  const [formData, setFormData] = useState({
${initialFields}
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  ${hasPassword ? "const [showPassword, setShowPassword] = useState(false);" : ""}

  const validate = () => {
    const newErrors = {};
${fields.filter(f => f.required).map(f => `    if (!formData.${f.name}) newErrors.${f.name} = '${f.label} is required';`).join("\n")}
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    const checked = e.target.type === 'checkbox' ? e.target.checked : undefined;
    const val = type === 'checkbox' ? checked : value;
    setFormData((prev) => ({ ...prev, [name]: val }));
    if (touched[name]) {
      if (!val && ${JSON.stringify(fields.filter(f => f.required).map(f => f.name))}.includes(name)) {
        setErrors((prev) => ({ ...prev, [name]: 'This field is required' }));
      } else {
        setErrors((prev) => ({ ...prev, [name]: undefined }));
      }
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    if (!value && ${JSON.stringify(fields.filter(f => f.required).map(f => f.name))}.includes(name)) {
      setErrors((prev) => ({ ...prev, [name]: 'This field is required' }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setTouched(${JSON.stringify(fields.map(f => f.name))}.reduce((acc, key) => ({ ...acc, [key]: true }), {}));
    if (validate()) {
      onSubmit?.(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className={['space-y-5', className].filter(Boolean).join(' ')} aria-label="${name} form">
${fieldsCode}

      <div className="flex items-center gap-3 pt-4">
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center justify-center px-6 py-2.5 text-sm font-semibold text-white bg-${color}-600 rounded-xl hover:bg-${color}-700 focus:outline-none focus:ring-4 focus:ring-${color}-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md"
        >
          {loading && (
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          )}
          {submitLabel}
        </button>
${cancelBtn}
      </div>
    </form>
  );
}`;

  return { componentName: name, code, props, dependencies: [] };
}
