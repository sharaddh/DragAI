import type { ComponentConfig, ComponentResult } from "../types/index.js";
import { generateComponent } from "../blueprints/registry.js";
import { parsePrompt } from "./parser.js";
import { toJSX } from "./compile.js";

export interface CompositionResult {
  componentName: string;
  code: string;
  props: string;
  dependencies: string[];
}

export function compose(config: ComponentConfig): CompositionResult {
  const result = generateComponent(config);

  // If component has children, compose and integrate them
  if (config.children && config.children.length > 0) {
    const childCodes: string[] = [];
    const childPropsList: string[] = [];

    for (const child of config.children) {
      if (typeof child === "string") {
        childCodes.push(child);
      } else {
        const childResult = generateComponent(child);
        childCodes.push(childResult.code);
        childPropsList.push(childResult.props);
        result.dependencies.push(...childResult.dependencies);
      }
    }

    const childSections = childCodes.map((code) => {
      return code.replace(/^export default /m, "// ");
    }).join("\n\n");

    result.code = result.code.replace(
      /(export default function)/,
      `${childSections}\n\n$1`
    );
  }

  // Deduplicate dependencies
  result.dependencies = [...new Set(result.dependencies)].sort();

  // Compile TSX to portable JSX with PropTypes
  const compiled = toJSX(result.code, result.props, result.componentName);
  result.code = compiled.code;
  result.props = compiled.props;

  return result;
}

export function composeFromPrompt(
  type: string,
  prompt: string,
  imageAnalysis?: ComponentConfig
): CompositionResult {
  const config = parsePrompt(prompt);

  // Merge image analysis overrides
  if (imageAnalysis) {
    Object.assign(config, imageAnalysis);
  }

  return compose(config);
}
