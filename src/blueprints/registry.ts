import type { ComponentType, ComponentConfig, ComponentResult } from "../types/index.js";
import { generateButton } from "./button.js";
import { generateInput } from "./input.js";
import { generateCard } from "./card.js";
import { generateNavbar } from "./navbar.js";
import { generateForm } from "./form.js";
import { generateModal } from "./modal.js";
import { generateTable } from "./table.js";
import { generateBadge } from "./badge.js";
import { generateAvatar } from "./avatar.js";
import { generateLayout } from "./layout.js";
import { generateDropdown } from "./dropdown.js";
import { generateTabs } from "./tabs.js";
import { generatePage } from "./page.js";

type Generator = (config: ComponentConfig) => ComponentResult;

const registry: Record<ComponentType, Generator> = {
  button: generateButton,
  input: generateInput,
  card: generateCard,
  navbar: generateNavbar,
  form: generateForm,
  modal: generateModal,
  table: generateTable,
  badge: generateBadge,
  avatar: generateAvatar,
  layout: generateLayout,
  dropdown: generateDropdown,
  tabs: generateTabs,
  page: generatePage,
};

export function generateComponent(config: ComponentConfig): ComponentResult {
  const generator = registry[config.type];
  if (!generator) {
    throw new Error(`Unknown component type: ${config.type}`);
  }
  return generator(config);
}

export function getSupportedTypes(): ComponentType[] {
  return Object.keys(registry) as ComponentType[];
}
