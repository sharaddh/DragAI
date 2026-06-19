import type { ComponentConfig, ComponentResult } from "../types/index.js";

export function generateNavbar(config: ComponentConfig): ComponentResult {
  const name = config.name || "Navbar";
  const color = config.color || "white";
  const links = config.links || [];
  const cta = config.cta;
  const hasThemeToggle = config.themeToggle ?? false;

  const bgClass = color === "white"
    ? "bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 shadow-sm"
    : color === "black"
    ? "bg-black/90 backdrop-blur-md text-white border-b border-gray-800"
    : "bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 shadow-sm";

  const textClass = color === "black" ? "text-white" : "text-gray-600 dark:text-gray-300";
  const brandClass = color === "black" ? "text-white" : "text-gray-900 dark:text-gray-100";

  const props = `export interface ${name}Props {
  logo?: React.ReactNode;
  links?: { label: string; href: string; active?: boolean }[];
  cta?: { label: string; href?: string; onClick?: () => void };
  className?: string;
  sticky?: boolean;
  onLinkClick?: (href: string) => void;
  ${hasThemeToggle ? "defaultDark?: boolean;" : ""}
  ${hasThemeToggle ? "onThemeToggle?: (isDark: boolean) => void;" : ""}
  hideOnScroll?: boolean;
}`;

  const linksCode = links.length > 0
    ? `          <div className="hidden md:flex md:items-center md:gap-1">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => { e.preventDefault(); onLinkClick?.(link.href); setOpen(false); }}
                className={[
                  'relative px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                  'hover:scale-105',
                  link.active
                    ? 'bg-gray-100 text-gray-900 shadow-sm dark:bg-gray-800 dark:text-gray-100'
                    : '${textClass} hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-800 dark:hover:text-gray-100',
                ].join(' ')}
                aria-current={link.active ? 'page' : undefined}
              >
                {link.label}
                {link.active && (
                  <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-blue-500" />
                )}
              </a>
            ))}
          </div>`
    : "";

  const ctaCode = cta
    ? `          <div className="hidden md:block">
            <a
              href={cta.href || '#'}
              onClick={(e) => { e.preventDefault(); cta.onClick?.(); }}
              className="inline-flex items-center px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-semibold hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 shadow-md hover:shadow-lg active:scale-95"
            >
              {cta.label}
            </a>
          </div>`
    : "";

  const themeToggleCode = hasThemeToggle
    ? `            <button
              type="button"
              onClick={toggleTheme}
              className="inline-flex items-center justify-center rounded-lg p-2 ${textClass} hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDark ? (
                <svg className="h-5 w-5 text-yellow-400 transition-transform duration-500 rotate-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="h-5 w-5 text-gray-600 transition-transform duration-500 -rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>`
    : "";

  const mobileLinks = links.length > 0
    ? `            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => { e.preventDefault(); onLinkClick?.(link.href); setOpen(false); }}
                className={[
                  'block px-4 py-2.5 rounded-lg text-base font-medium transition-all duration-200',
                  link.active
                    ? 'bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100'
                    : '${textClass} hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-800 dark:hover:text-gray-100',
                ].join(' ')}
                aria-current={link.active ? 'page' : undefined}
              >
                {link.label}
              </a>
            ))}`
    : "";

  const themeHook = hasThemeToggle
    ? `  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('theme');
      if (stored) return stored === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return defaultDark ?? false;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    onThemeToggle?.(isDark);
  }, [isDark]);

  const toggleTheme = () => setIsDark((prev) => !prev);`
    : "";

  const code = `import React, { useState${hasThemeToggle ? ", useEffect, useRef" : ", useRef"} } from 'react';

${props}

export default function ${name}({
  logo,
  links: navLinks = [],
  cta,
  className = '',
  sticky = false,
  onLinkClick,
  ${hasThemeToggle ? "defaultDark," : ""}
  ${hasThemeToggle ? "onThemeToggle," : ""}
  hideOnScroll = false,
}) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      setScrolled(currentY > 20);
      if (hideOnScroll && currentY > 100) {
        setHidden(currentY > lastScrollY.current);
      }
      lastScrollY.current = currentY;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hideOnScroll]);

${themeHook}

  return (
    <nav
      className={[
        '${bgClass}',
        sticky ? 'fixed top-0 left-0 right-0 z-50' : '',
        'transition-all duration-300',
        scrolled && sticky ? 'shadow-md' : '',
        hideOnScroll ? (hidden ? '-translate-y-full' : 'translate-y-0') : '',
        className,
      ].filter(Boolean).join(' ')}
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            {logo && (
              <div className="flex-shrink-0 font-bold text-xl ${brandClass}">
                {logo}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
${linksCode}
${themeToggleCode}
${ctaCode}

            <button
              type="button"
              onClick={() => setOpen(!open)}
              className="md:hidden inline-flex items-center justify-center rounded-lg p-2 ${textClass} hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              aria-expanded={open}
              aria-label={open ? 'Close menu' : 'Open menu'}
            >
              <svg className="h-6 w-6 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                {open ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-lg rounded-b-2xl overflow-hidden transition-all duration-300">
          <div className="space-y-1 px-4 pb-4 pt-2">
${mobileLinks}
            ${hasThemeToggle ? `            <div className="pt-3 border-t border-gray-100 dark:border-gray-800">
              <button
                type="button"
                onClick={toggleTheme}
                className="flex w-full items-center gap-3 px-4 py-2.5 rounded-lg text-base font-medium ${textClass} hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                {isDark ? (
                  <svg className="h-5 w-5 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                ) : (
                  <svg className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
                )}
                {isDark ? 'Light Mode' : 'Dark Mode'}
              </button>
            </div>` : ""}
            ${cta ? `            <div className="pt-3">
              <a
                href={cta.href || '#'}
                onClick={(e) => { e.preventDefault(); cta.onClick?.(); setOpen(false); }}
                className="block w-full px-4 py-2.5 rounded-lg text-base font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 text-center shadow-md transition-all duration-200 active:scale-[0.98]"
              >
                {cta.label}
              </a>
            </div>` : ""}
          </div>
        </div>
      )}
    </nav>
  );
}`;

  return { componentName: name, code, props, dependencies: [] };
}
