import type { ColorScheme, Size, ButtonVariant } from "../types/index.js";

export function colorClasses(scheme: ColorScheme): {
  bg: string; text: string; border: string; ring: string;
  hover: string; focus: string; dark: string;
} {
  const map: Record<ColorScheme, { bg: string; text: string; border: string; ring: string; hover: string; focus: string; dark: string }> = {
    blue:    { bg: "bg-blue-500",       text: "text-blue-600",       border: "border-blue-500",    ring: "ring-blue-500",
               hover: "hover:bg-blue-600", focus: "focus:ring-blue-400", dark: "dark:bg-blue-600 dark:text-blue-300" },
    red:     { bg: "bg-red-500",        text: "text-red-600",        border: "border-red-500",     ring: "ring-red-500",
               hover: "hover:bg-red-600",  focus: "focus:ring-red-400",  dark: "dark:bg-red-600 dark:text-red-300" },
    green:   { bg: "bg-green-500",      text: "text-green-600",      border: "border-green-500",   ring: "ring-green-500",
               hover: "hover:bg-green-600", focus: "focus:ring-green-400", dark: "dark:bg-green-600 dark:text-green-300" },
    yellow:  { bg: "bg-yellow-500",     text: "text-yellow-600",     border: "border-yellow-500",  ring: "ring-yellow-500",
               hover: "hover:bg-yellow-600", focus: "focus:ring-yellow-400", dark: "dark:bg-yellow-600 dark:text-yellow-300" },
    purple:  { bg: "bg-purple-500",     text: "text-purple-600",     border: "border-purple-500",  ring: "ring-purple-500",
               hover: "hover:bg-purple-600", focus: "focus:ring-purple-400", dark: "dark:bg-purple-600 dark:text-purple-300" },
    indigo:  { bg: "bg-indigo-500",     text: "text-indigo-600",     border: "border-indigo-500",  ring: "ring-indigo-500",
               hover: "hover:bg-indigo-600", focus: "focus:ring-indigo-400", dark: "dark:bg-indigo-600 dark:text-indigo-300" },
    gray:    { bg: "bg-gray-500",       text: "text-gray-600",       border: "border-gray-500",    ring: "ring-gray-500",
               hover: "hover:bg-gray-600",  focus: "focus:ring-gray-400",  dark: "dark:bg-gray-600 dark:text-gray-300" },
    slate:   { bg: "bg-slate-500",      text: "text-slate-600",      border: "border-slate-500",   ring: "ring-slate-500",
               hover: "hover:bg-slate-600", focus: "focus:ring-slate-400", dark: "dark:bg-slate-600 dark:text-slate-300" },
    zinc:    { bg: "bg-zinc-500",       text: "text-zinc-600",       border: "border-zinc-500",    ring: "ring-zinc-500",
               hover: "hover:bg-zinc-600",  focus: "focus:ring-zinc-400",  dark: "dark:bg-zinc-600 dark:text-zinc-300" },
    neutral: { bg: "bg-neutral-500",    text: "text-neutral-600",    border: "border-neutral-500", ring: "ring-neutral-500",
               hover: "hover:bg-neutral-600", focus: "focus:ring-neutral-400", dark: "dark:bg-neutral-600 dark:text-neutral-300" },
    stone:   { bg: "bg-stone-500",      text: "text-stone-600",      border: "border-stone-500",   ring: "ring-stone-500",
               hover: "hover:bg-stone-600", focus: "focus:ring-stone-400", dark: "dark:bg-stone-600 dark:text-stone-300" },
    orange:  { bg: "bg-orange-500",     text: "text-orange-600",     border: "border-orange-500",  ring: "ring-orange-500",
               hover: "hover:bg-orange-600", focus: "focus:ring-orange-400", dark: "dark:bg-orange-600 dark:text-orange-300" },
    teal:    { bg: "bg-teal-500",       text: "text-teal-600",       border: "border-teal-500",    ring: "ring-teal-500",
               hover: "hover:bg-teal-600",  focus: "focus:ring-teal-400",  dark: "dark:bg-teal-600 dark:text-teal-300" },
    cyan:    { bg: "bg-cyan-500",       text: "text-cyan-600",       border: "border-cyan-500",    ring: "ring-cyan-500",
               hover: "hover:bg-cyan-600",  focus: "focus:ring-cyan-400",  dark: "dark:bg-cyan-600 dark:text-cyan-300" },
    pink:    { bg: "bg-pink-500",       text: "text-pink-600",       border: "border-pink-500",    ring: "ring-pink-500",
               hover: "hover:bg-pink-600",  focus: "focus:ring-pink-400",  dark: "dark:bg-pink-600 dark:text-pink-300" },
    rose:    { bg: "bg-rose-500",       text: "text-rose-600",       border: "border-rose-500",    ring: "ring-rose-500",
               hover: "hover:bg-rose-600",  focus: "focus:ring-rose-400",  dark: "dark:bg-rose-600 dark:text-rose-300" },
    white:   { bg: "bg-white",          text: "text-gray-900",       border: "border-gray-200",    ring: "ring-gray-300",
               hover: "hover:bg-gray-50",   focus: "focus:ring-gray-400",  dark: "dark:bg-gray-800 dark:text-gray-100" },
    black:   { bg: "bg-black",          text: "text-white",          border: "border-black",       ring: "ring-gray-500",
               hover: "hover:bg-gray-900",  focus: "focus:ring-gray-400",  dark: "dark:bg-white dark:text-black" },
  };
  return map[scheme] ?? map.blue;
}

export function sizeClasses(size: Size): { padding: string; text: string; rounded: string; height?: string } {
  const map: Record<Size, { padding: string; text: string; rounded: string; height?: string }> = {
    sm: { padding: "px-3 py-1.5", text: "text-sm", rounded: "rounded-md" },
    md: { padding: "px-4 py-2",   text: "text-sm", rounded: "rounded-lg" },
    lg: { padding: "px-5 py-2.5", text: "text-base", rounded: "rounded-lg" },
    xl: { padding: "px-6 py-3",   text: "text-lg", rounded: "rounded-xl" },
  };
  return map[size] ?? map.md;
}

export function buttonVariantClasses(variant: ButtonVariant, color: ColorScheme): string {
  const c = colorClasses(color);
  switch (variant) {
    case "primary":
      return `${c.bg} text-white ${c.hover} focus-visible:outline-none focus-visible:ring-2 ${c.focus} focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed`;
    case "secondary":
      return `${c.text} ${c.bg.replace("bg-", "bg-").replace("-500", "-100")} ${c.hover.replace("hover:bg-", "hover:bg-").replace("-600", "-200")} focus-visible:outline-none focus-visible:ring-2 ${c.ring} focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-opacity-20`;
    case "ghost":
      return `${c.text} hover:${c.bg.replace("bg-", "bg-").replace("-500", "-100")} focus-visible:outline-none focus-visible:ring-2 ${c.ring} disabled:opacity-50 disabled:cursor-not-allowed`;
    case "outline":
      return `${c.text} ${c.border} border bg-transparent hover:${c.bg.replace("bg-", "bg-").replace("-500", "-50")} focus-visible:outline-none focus-visible:ring-2 ${c.ring} focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed`;
    case "danger":
      return `bg-red-600 text-white hover:bg-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed`;
  }
}

export function inputSizeClasses(size: Size): string {
  const map: Record<Size, string> = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-3 py-2 text-sm",
    lg: "px-4 py-2.5 text-base",
    xl: "px-4 py-3 text-lg",
  };
  return map[size] ?? map.md;
}

export function gapClasses(gap: string): string {
  const map: Record<string, string> = {
    none: "gap-0",
    sm: "gap-2",
    md: "gap-4",
    lg: "gap-6",
  };
  return map[gap] ?? "gap-4";
}
