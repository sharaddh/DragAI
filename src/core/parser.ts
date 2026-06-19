import type { ComponentConfig, ComponentType, ColorScheme, Size, ButtonVariant, FieldConfig } from "../types/index.js";

const componentKeywords: Record<string, ComponentType> = {
  button: "button",
  btn: "button",
  input: "input",
  textfield: "input",
  textbox: "input",
  card: "card",
  panel: "card",
  tile: "card",
  navbar: "navbar",
  nav: "navbar",
  header: "navbar",
  toolbar: "navbar",
  form: "form",
  modal: "modal",
  dialog: "modal",
  popup: "modal",
  overlay: "modal",
  table: "table",
  datatable: "table",
  grid: "table",
  badge: "badge",
  tag: "badge",
  pill: "badge",
  avatar: "avatar",
  profilepic: "avatar",
  "profile picture": "avatar",
  layout: "layout",
  container: "layout",
  dropdown: "dropdown",
  menu: "dropdown",
  selectmenu: "dropdown",
  tabs: "tabs",
  tab: "tabs",
  page: "page",
  landing: "page",
  homepage: "page",
  website: "page",
  dashboard: "page",
  site: "page",
};

const colorKeywords: Record<string, ColorScheme> = {
  blue: "blue",
  red: "red",
  green: "green",
  yellow: "yellow",
  purple: "purple",
  indigo: "indigo",
  gray: "gray",
  slate: "slate",
  orange: "orange",
  teal: "teal",
  cyan: "cyan",
  pink: "pink",
  rose: "rose",
  black: "black",
  white: "white",
  dark: "slate",
  primary: "blue",
  danger: "red",
  success: "green",
  warning: "yellow",
  info: "blue",
};

const sizeKeywords: Record<string, Size> = {
  xs: "sm",
  small: "sm",
  tiny: "sm",
  compact: "sm",
  md: "md",
  medium: "md",
  normal: "md",
  regular: "md",
  lg: "lg",
  large: "lg",
  big: "lg",
  xl: "xl",
  xlarge: "xl",
  huge: "xl",
};

const variantKeywords: Record<string, ButtonVariant> = {
  primary: "primary",
  outline: "outline",
  bordered: "outline",
  secondary: "secondary",
  subtle: "ghost",
  ghost: "ghost",
  transparent: "ghost",
  danger: "danger",
  delete: "danger",
};

const fieldTypeKeywords: Record<string, FieldConfig["type"]> = {
  text: "text",
  name: "text",
  username: "text",
  email: "email",
  mail: "email",
  password: "password",
  pass: "password",
  number: "number",
  count: "number",
  age: "number",
  phone: "tel",
  telephone: "tel",
  search: "search",
  textarea: "textarea",
  message: "textarea",
  description: "textarea",
  comment: "textarea",
  select: "select",
  dropdown: "select",
  checkbox: "checkbox",
  "check box": "checkbox",
  agree: "checkbox",
  accept: "checkbox",
  terms: "checkbox",
  url: "url",
  website: "url",
};

export function parsePrompt(prompt: string): ComponentConfig {
  const lower = prompt.toLowerCase().trim();
  const config: ComponentConfig = {
    type: "button",
    name: inferComponentName(prompt),
  };

  // Detect component type: use priority ranking, then earliest position in prompt
  const words = new Set(lower.split(/\s+/));
  const typePriority: Record<ComponentType, number> = {
    page: 11, navbar: 10, dropdown: 9, modal: 8, tabs: 8, form: 7, table: 6,
    card: 5, layout: 4, avatar: 3, badge: 3, input: 2, button: 1,
  };
  let bestMatch = { priority: -1, type: "button" as ComponentType, pos: Infinity };
  for (const [keyword, type] of Object.entries(componentKeywords)) {
    const pos = lower.indexOf(keyword);
    if (pos === -1) continue;
    if (keyword.includes(" ") || words.has(keyword)) {
      const priority = typePriority[type as ComponentType] ?? 0;
      const higherPri = priority > bestMatch.priority;
      const samePriEarlier = priority === bestMatch.priority && pos < bestMatch.pos;
      if (higherPri || samePriEarlier) {
        bestMatch = { priority, type: type as ComponentType, pos };
      }
    }
  }
  config.type = bestMatch.type;

  // Detect color
  for (const [keyword, color] of Object.entries(colorKeywords)) {
    if (lower.includes(keyword)) {
      config.color = color;
      break;
    }
  }

  // Detect size
  for (const [keyword, size] of Object.entries(sizeKeywords)) {
    if (lower.includes(keyword)) {
      config.size = size;
      break;
    }
  }

  // Detect variant
  for (const [keyword, variant] of Object.entries(variantKeywords)) {
    if (lower.includes(keyword)) {
      config.variant = variant;
      break;
    }
  }

  // Detect loading state
  if (lower.includes("loading") || lower.includes("spinner") || lower.includes("async")) {
    config.loading = true;
  }

  // Detect disabled state
  if (lower.includes("disabled") || lower.includes("readonly") || lower.includes("read only")) {
    config.disabled = true;
  }

  // Detect required state
  if (lower.includes("required") || lower.includes("mandatory")) {
    config.required = true;
  }

  // Detect icon
  if (lower.includes("icon") || lower.includes("with icon")) {
    config.icon = "Icon";
  }

  // Detect icon position
  if (lower.includes("icon right") || lower.includes("right icon")) {
    config.iconPosition = "right";
  }

  // Detect form fields
  if (config.type === "form") {
    config.fields = parseFormFields(lower);
  } else if (config.type === "input") {
    config.fields = [parseSingleField(lower)];
  }

  // Detect navbar config
  if (config.type === "navbar") {
    config.links = parseNavLinks(lower);
    if (lower.includes("sticky") || lower.includes("fixed")) {
      config.sticky = true;
    }
    if (lower.includes("cta") || lower.includes("sign up") || lower.includes("get started") || lower.includes("login") || lower.includes("contact")) {
      config.cta = { label: extractCTALabel(lower) };
    }
    if (lower.includes("logo")) {
      config.logo = "Logo";
    }
  }

  // Detect card config
  if (config.type === "card") {
    if (lower.includes("header") || lower.includes("title")) {
      config.header = "Card Title";
    }
    if (lower.includes("footer")) {
      config.footer = "Card footer content";
    }
    if (lower.includes("image") || lower.includes("photo") || lower.includes("picture")) {
      config.image = "/image.jpg";
    }
  }

  // Detect layout config
  if (config.type === "layout") {
    if (lower.includes("sidebar") || lower.includes("side panel")) {
      config.layout = "sidebar";
      config.sidebar = lower.includes("right") ? "right" : "left";
    } else if (lower.includes("grid") || lower.includes("columns")) {
      config.layout = "grid";
      config.cols = extractNumber(lower, 3);
    } else if (lower.includes("stack") || lower.includes("vertical") || lower.includes("column")) {
      config.layout = "stack";
      config.direction = "column";
    } else if (lower.includes("horizontal") || lower.includes("row")) {
      config.layout = "stack";
      config.direction = "row";
    } else {
      config.layout = "container";
    }
  }

  // Detect table columns
  if (config.type === "table") {
    config.columns = parseTableColumns(lower);
  }

  // Detect tabs
  if (config.type === "tabs") {
    config.tabs = parseTabs(lower);
  }

  // Detect modal title
  if (config.type === "modal") {
    config.modalTitle = extractModalTitle(lower);
  }

  // Detect badge config
  if (config.type === "badge") {
    config.dot = lower.includes("dot") || lower.includes("indicator");
  }

  // Detect avatar config
  if (config.type === "avatar") {
    config.dot = lower.includes("status") || lower.includes("online") || lower.includes("offline");
  }

  // Detect dropdown items
  if (config.type === "dropdown") {
    config.items = parseDropdownItems(lower);
  }

  // Detect responsive
  if (lower.includes("responsive") || lower.includes("mobile")) {
    config.responsive = true;
  }

  // Detect theme toggle
  if (lower.includes("theme") || lower.includes("dark mode") || lower.includes("light mode")
    || lower.includes("dark/light") || lower.includes("light/dark")
    || (lower.includes("dark") && lower.includes("light"))) {
    config.themeToggle = true;
  }

  // Detect className override
  const classMatch = prompt.match(/class(?:Name)?:\s*["']([^"']+)["']/);
  if (classMatch) {
    config.className = classMatch[1];
  }

  // Label extraction
  if (!config.label) {
    config.label = inferLabel(prompt);
  }

  return config;
}

function inferComponentName(prompt: string): string {
  const words = prompt.replace(/[^a-zA-Z0-9 ]/g, "").split(/\s+/).filter(Boolean);
  const blacklist = new Set(["a", "an", "the", "with", "and", "for", "in", "on", "of", "to", "is", "that", "this", "or", "but", "be", "at", "by", "from", "as", "are", "was", "were", "been", "being", "have", "has", "had", "do", "does", "did", "will", "would", "shall", "should", "may", "might", "must", "can", "could", "blue", "red", "green", "purple", "yellow", "white", "black", "small", "medium", "large", "tiny", "big", "huge", "loading", "disabled", "primary", "secondary", "ghost", "outline", "danger", "sticky", "responsive", "icon", "with", "without"]);

  const filtered = words.filter(w => !blacklist.has(w) && !colorKeywords[w] && !sizeKeywords[w]);

  if (filtered.length >= 1) {
    // Take first meaningful word and combine with component type
    const first = filtered[0];
    if (first === "button" || first === "form" || first === "card" || first === "modal" || first === "table" || first === "badge" || first === "avatar" || first === "navbar" || first === "dropdown" || first === "tabs" || first === "input" || first === "layout") {
      const componentType = first;
      if (filtered.length >= 2) {
        return capitalize(filtered[1]) + capitalize(componentType);
      }
      return capitalize(componentType);
    }
    if (filtered.length >= 2) {
      return capitalize(filtered[0]) + capitalize(filtered[1].replace(/s$/, ""));
    }
    return capitalize(filtered[0]);
  }

  return "GeneratedComponent";
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}

function parseFormFields(lower: string): FieldConfig[] {
  const fields: FieldConfig[] = [];
  const words = lower.split(/\s+/);

  const fieldIndicators = [
    "with", "fields:", "has", "including",
  ];

  let startIndex = -1;
  for (const indicator of fieldIndicators) {
    const idx = lower.indexOf(indicator);
    if (idx !== -1) {
      startIndex = idx;
      break;
    }
  }

  const relevantLower = startIndex >= 0 ? lower.slice(startIndex) : lower;

  // Common field patterns
  const fieldPatterns: { match: string; type: FieldConfig["type"]; label: string; name: string; required?: boolean }[] = [
    { match: "email", type: "email", label: "Email", name: "email", required: true },
    { match: "password", type: "password", label: "Password", name: "password", required: true },
    { match: "username", type: "text", label: "Username", name: "username", required: true },
    { match: "full name", type: "text", label: "Full Name", name: "fullName", required: true },
    { match: "first name", type: "text", label: "First Name", name: "firstName", required: true },
    { match: "last name", type: "text", label: "Last Name", name: "lastName", required: true },
    { match: "name", type: "text", label: "Name", name: "name", required: true },
    { match: "phone", type: "tel", label: "Phone", name: "phone" },
    { match: "telephone", type: "tel", label: "Phone", name: "phone" },
    { match: "message", type: "textarea", label: "Message", name: "message", required: true },
    { match: "comment", type: "textarea", label: "Comment", name: "comment" },
    { match: "description", type: "textarea", label: "Description", name: "description" },
    { match: "bio", type: "textarea", label: "Bio", name: "bio" },
    { match: "search", type: "search", label: "Search", name: "search" },
    { match: "age", type: "number", label: "Age", name: "age" },
    { match: "url", type: "url", label: "Website", name: "url" },
    { match: "website", type: "url", label: "Website", name: "website" },
    { match: "confirm password", type: "password", label: "Confirm Password", name: "confirmPassword", required: true },
    { match: "address", type: "text", label: "Address", name: "address" },
    { match: "city", type: "text", label: "City", name: "city" },
    { match: "country", type: "select", label: "Country", name: "country" },
    { match: "gender", type: "select", label: "Gender", name: "gender" },
    { match: "agree", type: "checkbox", label: "I agree to the terms", name: "agree", required: true },
    { match: "terms", type: "checkbox", label: "I accept the terms", name: "terms", required: true },
    { match: "subscribe", type: "checkbox", label: "Subscribe to newsletter", name: "subscribe" },
  ];

  for (const pattern of fieldPatterns) {
    if (relevantLower.includes(pattern.match)) {
      if (!fields.some((f) => f.name === pattern.name)) {
        fields.push({
          type: pattern.type,
          name: pattern.name,
          label: pattern.label,
          placeholder: `Enter your ${pattern.label.toLowerCase()}`,
          required: pattern.required,
          options: pattern.type === "select" ? ["Option 1", "Option 2", "Option 3"] : undefined,
        });
      }
    }
  }

  // If no fields detected but "form" was requested, add defaults
  if (fields.length === 0) {
    fields.push(
      { type: "text", name: "name", label: "Name", placeholder: "Enter your name", required: true },
      { type: "email", name: "email", label: "Email", placeholder: "Enter your email", required: true }
    );
  }

  // Detect submit label
  const submitWords = ["submit", "send", "register", "sign up", "signup", "login", "log in", "create", "save", "update", "contact"];
  for (const word of submitWords) {
    if (lower.includes(word)) {
      break;
    }
  }

  return fields;
}

function parseSingleField(lower: string): FieldConfig {
  for (const [keyword, type] of Object.entries(fieldTypeKeywords)) {
    if (lower.includes(keyword)) {
      return {
        type,
        name: keyword,
        label: keyword.charAt(0).toUpperCase() + keyword.slice(1),
        placeholder: `Enter ${keyword}`,
        required: lower.includes("required"),
      };
    }
  }
  return { type: "text", name: "value", label: "Input", placeholder: "Enter value" };
}

function parseNavLinks(lower: string): { label: string; href: string; active?: boolean }[] {
  const linkPatterns = [
    { label: "Home", href: "/", keyword: "home" },
    { label: "About", href: "/about", keyword: "about" },
    { label: "Services", href: "/services", keyword: "services" },
    { label: "Products", href: "/products", keyword: "products" },
    { label: "Features", href: "/features", keyword: "features" },
    { label: "Pricing", href: "/pricing", keyword: "pricing" },
    { label: "Blog", href: "/blog", keyword: "blog" },
    { label: "Contact", href: "/contact", keyword: "contact" },
    { label: "FAQ", href: "/faq", keyword: "faq" },
    { label: "Docs", href: "/docs", keyword: "docs" },
    { label: "Dashboard", href: "/dashboard", keyword: "dashboard" },
    { label: "Settings", href: "/settings", keyword: "settings" },
    { label: "Profile", href: "/profile", keyword: "profile" },
    { label: "Portfolio", href: "/portfolio", keyword: "portfolio" },
    { label: "Gallery", href: "/gallery", keyword: "gallery" },
    { label: "Team", href: "/team", keyword: "team" },
    { label: "Careers", href: "/careers", keyword: "careers" },
  ];

  const links: { label: string; href: string; active?: boolean }[] = [];
  let first = true;

  for (const pattern of linkPatterns) {
    if (lower.includes(pattern.keyword)) {
      links.push({ ...pattern, active: first ? true : undefined });
      first = false;
    }
  }

  if (links.length === 0) {
    links.push(
      { label: "Home", href: "/", active: true },
      { label: "About", href: "/about" },
      { label: "Contact", href: "/contact" },
    );
  }

  return links;
}

function extractCTALabel(lower: string): string {
  const ctaPatterns = [
    { keyword: "sign up", label: "Sign Up" },
    { keyword: "signup", label: "Sign Up" },
    { keyword: "get started", label: "Get Started" },
    { keyword: "login", label: "Log In" },
    { keyword: "log in", label: "Log In" },
    { keyword: "contact", label: "Contact Us" },
    { keyword: "subscribe", label: "Subscribe" },
  ];
  for (const pattern of ctaPatterns) {
    if (lower.includes(pattern.keyword)) return pattern.label;
  }
  return "Get Started";
}

function parseTableColumns(lower: string): { key: string; label: string; sortable?: boolean }[] {
  const colPatterns = [
    { keyword: "name", key: "name", label: "Name" },
    { keyword: "email", key: "email", label: "Email" },
    { keyword: "status", key: "status", label: "Status" },
    { keyword: "role", key: "role", label: "Role" },
    { keyword: "date", key: "date", label: "Date" },
    { keyword: "amount", key: "amount", label: "Amount" },
    { keyword: "price", key: "price", label: "Price" },
    { keyword: "category", key: "category", label: "Category" },
  ];

  const columns: { key: string; label: string; sortable?: boolean }[] = [];
  for (const pattern of colPatterns) {
    if (lower.includes(pattern.keyword)) {
      columns.push({ ...pattern, sortable: true });
    }
  }

  if (columns.length === 0) {
    columns.push(
      { key: "name", label: "Name", sortable: true },
      { key: "value", label: "Value", sortable: true },
    );
  }

  return columns;
}

function parseTabs(lower: string): { id: string; label: string }[] {
  const tabPatterns = [
    { keyword: "overview", id: "overview", label: "Overview" },
    { keyword: "details", id: "details", label: "Details" },
    { keyword: "settings", id: "settings", label: "Settings" },
    { keyword: "profile", id: "profile", label: "Profile" },
    { keyword: "account", id: "account", label: "Account" },
    { keyword: "billing", id: "billing", label: "Billing" },
    { keyword: "notifications", id: "notifications", label: "Notifications" },
    { keyword: "security", id: "security", label: "Security" },
  ];

  const tabs: { id: string; label: string }[] = [];
  for (const pattern of tabPatterns) {
    if (lower.includes(pattern.keyword)) {
      tabs.push(pattern);
    }
  }

  if (tabs.length < 2) {
    return [
      { id: "tab1", label: "First Tab" },
      { id: "tab2", label: "Second Tab" },
      { id: "tab3", label: "Third Tab" },
    ];
  }

  return tabs;
}

function extractModalTitle(lower: string): string {
  const titleKeywords = [
    { keyword: "confirm", title: "Confirm Action" },
    { keyword: "delete", title: "Confirm Delete" },
    { keyword: "edit", title: "Edit Item" },
    { keyword: "create", title: "Create New" },
    { keyword: "add", title: "Add New" },
    { keyword: "settings", title: "Settings" },
    { keyword: "profile", title: "Edit Profile" },
    { keyword: "details", title: "Details" },
  ];
  for (const pattern of titleKeywords) {
    if (lower.includes(pattern.keyword)) return pattern.title;
  }
  return "Modal Title";
}

function parseDropdownItems(lower: string): { label: string; value: string; divider?: boolean; disabled?: boolean }[] {
  const itemPatterns = [
    { keyword: "edit", label: "Edit", value: "edit" },
    { keyword: "delete", label: "Delete", value: "delete" },
    { keyword: "duplicate", label: "Duplicate", value: "duplicate" },
    { keyword: "share", label: "Share", value: "share" },
    { keyword: "export", label: "Export", value: "export" },
    { keyword: "import", label: "Import", value: "import" },
    { keyword: "download", label: "Download", value: "download" },
    { keyword: "print", label: "Print", value: "print" },
    { keyword: "copy", label: "Copy", value: "copy" },
    { keyword: "paste", label: "Paste", value: "paste" },
    { keyword: "rename", label: "Rename", value: "rename" },
    { keyword: "archive", label: "Archive", value: "archive" },
    { keyword: "move", label: "Move To", value: "move" },
    { keyword: "favorite", label: "Add to Favorites", value: "favorite" },
    { keyword: "settings", label: "Settings", value: "settings" },
    { keyword: "help", label: "Help", value: "help" },
  ];

  const items: { label: string; value: string; divider?: boolean; disabled?: boolean }[] = [];
  let added = false;

  for (const pattern of itemPatterns) {
    if (lower.includes(pattern.keyword)) {
      if (added && (pattern.label === "Delete" || pattern.label === "Archive")) {
        items.push({ label: "", value: "", divider: true });
      }
      items.push(pattern);
      added = true;
    }
  }

  if (items.length === 0) {
    items.push(
      { label: "Edit", value: "edit" },
      { label: "Duplicate", value: "duplicate" },
      { label: "", value: "", divider: true },
      { label: "Delete", value: "delete" },
    );
  }

  return items;
}

function extractNumber(lower: string, defaultVal: number): number {
  const match = lower.match(/(\d+)\s*columns?/);
  if (match) return parseInt(match[1], 10);
  return defaultVal;
}

function inferLabel(prompt: string): string {
  const words = prompt.split(/\s+/).filter(w => w.length > 3);
  return words.slice(0, 3).join(" ") || prompt;
}
