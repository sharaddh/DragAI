export type ComponentType =
  | "button"
  | "input"
  | "card"
  | "navbar"
  | "form"
  | "modal"
  | "table"
  | "badge"
  | "avatar"
  | "layout"
  | "dropdown"
  | "tabs"
  | "page";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "outline" | "danger";
export type Size = "sm" | "md" | "lg" | "xl";
export type ColorScheme =
  | "blue" | "red" | "green" | "yellow" | "purple" | "indigo"
  | "gray" | "slate" | "zinc" | "neutral" | "stone" | "orange" | "teal"
  | "cyan" | "pink" | "rose" | "white" | "black";

export interface FieldConfig {
  type: "text" | "email" | "password" | "number" | "search" | "textarea" | "select" | "checkbox" | "radio" | "tel" | "url";
  name: string;
  label: string;
  placeholder?: string;
  required?: boolean;
  options?: string[];
}

export interface ColumnConfig {
  key: string;
  label: string;
  sortable?: boolean;
  width?: string;
}

export interface TabConfig {
  id: string;
  label: string;
  content?: string;
}

export interface DropdownItem {
  label: string;
  value: string;
  divider?: boolean;
  disabled?: boolean;
}

export interface ComponentConfig {
  type: ComponentType;
  name: string;
  size?: Size;
  color?: ColorScheme;
  variant?: ButtonVariant;

  label?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  loading?: boolean;
  icon?: string;
  iconPosition?: "left" | "right";

  fields?: FieldConfig[];
  submitLabel?: string;
  cancelLabel?: string;

  header?: string;
  body?: string;
  footer?: string;
  image?: string;

  logo?: string;
  links?: { label: string; href: string; active?: boolean }[];
  cta?: { label: string; href?: string };
  sticky?: boolean;

  columns?: ColumnConfig[];
  rows?: Record<string, string>[];
  emptyText?: string;

  tabs?: TabConfig[];
  items?: DropdownItem[];

  children?: (ComponentConfig | string)[];
  direction?: "row" | "column";
  gap?: "none" | "sm" | "md" | "lg";
  align?: "start" | "center" | "end" | "stretch";
  justify?: "start" | "center" | "end" | "between" | "around";

  modalTitle?: string;
  modalSize?: Size;

  avatarSrc?: string;
  avatarFallback?: string;
  badge?: string;
  dot?: boolean;

  responsive?: boolean;
  themeToggle?: boolean;
  animation?: "fade" | "slide" | "scale" | "none";
  className?: string;

  layout?: "stack" | "grid" | "sidebar" | "container";
  cols?: number;
  sidebar?: "left" | "right";
  darkMode?: boolean;
}

export interface ComponentResult {
  componentName: string;
  code: string;
  props: string;
  dependencies: string[];
}

export interface GenerateRequest {
  prompt: string;
  image?: string;
}

export interface GenerateSuccessResponse {
  success: true;
  data: ComponentResult;
}

export interface GenerateErrorResponse {
  success: false;
  error: { message: string; code: string };
}

export type GenerateResponse = GenerateSuccessResponse | GenerateErrorResponse;
