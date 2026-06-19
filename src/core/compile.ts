const REACT_TYPE = /React\.\w+(?:<[^>]*>)?/g;
const GENERIC_HOOK = /(\b(?:useState|useRef|useMemo|useEffect|useCallback|useReducer))<[^>]*>/g;
const PROP_ANNOTATION = /}(\s*:\s*\w+(?:Props|Data|Content)\s*\))(?=\s*\{)/g;
const INTERFACE_BLOCK = /export (?:interface|type)\s+\w+(?:Props|Data|Content)?\s*(?:extends\s+\w+(?:Props|Data|Content)?\s*)?\{[\s\S]*?^\}/gm;
const TYPE_ALIAS = /export type\s+\w+(?:Props|Data|Content)?\s*=\s*[\s\S]*?;/g;
const AS_CAST = /\s+as\s+(?:keyof\s+)?\w+(?:Props|Data|Content)?/g;
const KEYOF_REF = /keyof\s+\w+(?:Props|Data|Content)?/g;
const PARTIAL_RECORD = /Partial<Record<keyof\s+\w+(?:Props|Data|Content)?,\s*string>>/g;
const RECORD_REF = /:\s*Record<string,\s*(?:any|string)>/g;
const SET_STATE_TYPE = /set\w+<[^>]*>/g;

function stripTypeScript(code: string): string {
  let s = code;

  s = s.replace(INTERFACE_BLOCK, '');
  s = s.replace(TYPE_ALIAS, '');
  s = s.replace(PARTIAL_RECORD, 'object');
  s = s.replace(RECORD_REF, '');
  s = s.replace(PROP_ANNOTATION, '})');
  s = s.replace(GENERIC_HOOK, '$1');
  s = s.replace(AS_CAST, '');
  s = s.replace(KEYOF_REF, 'string');
  s = s.replace(SET_STATE_TYPE, (m) => m.replace(/<[^>]*>/, ''));
  s = s.replace(REACT_TYPE, 'any');
  s = s.replace(/\(\s*\)\s*:\s*\w+\s*=>/g, '() =>');
  s = s.replace(/\((\w+):\s*(?:\w+\.)?\w+(?:<[^>]*>)?\s*\)/g, '($1)');
  s = s.replace(/:\s*object(?=\s*[={;])/g, '');

  s = s.replace(/\n{3,}/g, '\n\n');

  return s.trim();
}

function parseInterface(iface: string, componentName: string): string | null {
  const lines = iface.split('\n').map(l => l.trim());
  if (lines.length < 2) return null;

  const propTypes: string[] = [];
  let hasProps = false;

  for (const line of lines) {
    if (/^(export|interface|type\s|})\s*$/.test(line) || line === '{') continue;

    const match = line.match(/^(\w+)\??:\s*(.+?);?$/);
    if (!match) continue;
    hasProps = true;

    const [, propName, rawType] = match;
    const optional = line.includes('?');
    const typeStr = rawType.trim();

    const pt = typeToPropType(typeStr);
    const suffix = optional ? '' : '.isRequired';
    propTypes.push(`  ${propName}: ${pt}${suffix},`);
  }

  if (!hasProps) return null;

  return `import PropTypes from 'prop-types';\n\n${componentName}.propTypes = {\n${propTypes.join('\n')}\n};`;
}

function typeToPropType(type: string): string {
  const t = type.replace(/<[^>]*>/g, '').trim();

  if (t === 'string') return 'PropTypes.string';
  if (t === 'number') return 'PropTypes.number';
  if (t === 'boolean' || t === 'bool') return 'PropTypes.bool';
  if (t === 'React.ReactNode' || t === 'ReactNode' || t === 'node') return 'PropTypes.node';
  if (t.startsWith('() =>') || t.startsWith('=>')) return 'PropTypes.func';
  if (t.startsWith('(') && t.includes('=>')) return 'PropTypes.func';
  if (t === 'any') return 'PropTypes.any';

  if (t.endsWith('[]')) return 'PropTypes.array';

  if (t.startsWith("'") && t.includes("|")) {
    const values = t.split('|').map(v => v.trim().replace(/^'|'$/g, '')).filter(v => v);
    return `PropTypes.oneOf([${values.map(v => `'${v}'`).join(', ')}])`;
  }

  if (t.startsWith('{')) return 'PropTypes.object';
  if (t.startsWith('Record<') || t === 'object') return 'PropTypes.object';

  return 'PropTypes.any';
}

export function toJSX(code: string, propsInterface: string, componentName: string): { code: string; props: string } {
  const cleanedCode = stripTypeScript(code);

  let propsCode = propsInterface;
  const firstInterface = propsInterface.split(/^export (?:interface|type)\s/m).filter(Boolean)[0] || propsInterface;
  const propTypes = parseInterface(firstInterface, componentName);
  if (propTypes) {
    const importLine = "import PropTypes from 'prop-types';";
    const finalCode = cleanedCode.includes("import PropTypes")
      ? cleanedCode + '\n\n' + propTypes.replace(/^import PropTypes from 'prop-types';\n\n/, '')
      : cleanedCode.replace(/^(import React[^;]*);/m, `$1;\n${importLine}`) + '\n\n' + propTypes.replace(/^import PropTypes from 'prop-types';\n\n/, '');
    return { code: finalCode, props: propsCode };
  }

  return { code: cleanedCode, props: propsCode };
}
