import type { ComponentConfig, ComponentResult } from "../types/index.js";

export function generateModal(config: ComponentConfig): ComponentResult {
  const name = config.name || "Modal";
  const title = config.modalTitle || "Modal Title";
  const modalSize = config.modalSize || "md";
  const color = config.color || "blue";

  const maxWidth: Record<string, string> = {
    sm: "max-w-sm",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
    full: "max-w-[calc(100vw-2rem)]",
  };

  const props = `export interface ${name}Props {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  className?: string;
  closeOnOverlay?: boolean;
  showCloseButton?: boolean;
}`;

  const code = `import React, { useEffect, useRef, useState } from 'react';

${props}

export default function ${name}({
  isOpen,
  onClose,
  title = '${title}',
  children,
  footer,
  size = '${modalSize}',
  className = '',
  closeOnOverlay = true,
  showCloseButton = true,
}) {
  const overlayRef = useRef(null);
  const dialogRef = useRef(null);
  const [visible, setVisible] = useState(false);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setVisible(true);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setAnimating(true);
        });
      });
      document.body.style.overflow = 'hidden';
      setTimeout(() => dialogRef.current?.focus(), 100);
    } else {
      setAnimating(false);
      const timer = setTimeout(() => {
        setVisible(false);
        document.body.style.overflow = '';
      }, 200);
      return () => clearTimeout(timer);
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'Tab' && dialogRef.current) {
        const focusable = dialogRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey) {
          if (document.activeElement === first) { e.preventDefault(); last.focus(); }
        } else {
          if (document.activeElement === last) { e.preventDefault(); first.focus(); }
        }
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose]);

  if (!visible) return null;

  return (
    <div
      ref={overlayRef}
      className={[
        'fixed inset-0 z-50 flex items-center justify-center p-4',
        'transition-all duration-200 ease-out',
        animating ? 'bg-black/60 backdrop-blur-sm' : 'bg-black/0 backdrop-blur-none',
      ].join(' ')}
      onClick={(e) => { if (closeOnOverlay && e.target === overlayRef.current) onClose(); }}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        ref={dialogRef}
        tabIndex={-1}
        className={[
          'relative w-full ${maxWidth[modalSize] || maxWidth.md}',
          'bg-white rounded-2xl shadow-2xl dark:bg-gray-800 dark:text-gray-100',
          'transition-all duration-200 ease-out',
          animating ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-4',
          'max-h-[90vh] flex flex-col',
          className,
        ].join(' ')}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 shrink-0">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</h2>
          {showCloseButton && (
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-${color}-500 dark:hover:text-gray-300 dark:hover:bg-gray-700 transition-all duration-200"
              aria-label="Close dialog"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        <div className="px-6 py-4 overflow-y-auto flex-1">
          {children}
        </div>

        {footer && (
          <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-end gap-2 shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}`;

  return { componentName: name, code, props, dependencies: [] };
}
