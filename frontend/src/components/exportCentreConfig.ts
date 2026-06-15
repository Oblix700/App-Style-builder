export type ExportTabId =
  | 'theme-css'
  | 'tailwind'
  | 'json'
  | 'figma-tokens'
  | 'w3c-tokens'
  | 'style-dictionary'
  | 'echarts-theme'
  | 'components'
  | 'motion'
  | 'icons'
  | 'guide'
  | 'preview'
  | 'ai-prompt'
  | 'copy-once-prompt'
  | 'token-savings-prompt'
  | 'iteration-notes'
  | 'screen-build-prompts'
  | 'guardrails'
  | 'boilerplate-naming-guide'
  | 'ai-builder-brief'
  | 'design-rules'
  | 'accessibility-notes'
  | 'baseline-framework-guide'
  | 'template-strategy'
  | 'google-ai-studio-prompt'
  | 'antigravity-workflow'
  | 'codex-prompt'
  | 'chatgpt-prompt'
  | 'claude-prompt'
  | 'gemini-prompt'
  | 'cursor-prompt'
  | 'lovable-prompt'
  | 'bolt-prompt'
  | 'v0-prompt'
  | 'replit-prompt'
  | 'react-toggle'
  | 'react-echarts'
  | 'go-db'
  | 'stack-readme';

export interface ExportTabItem {
  id: ExportTabId;
  name: string;
}

export const standardExportTabs: ExportTabItem[] = [
  { id: 'theme-css', name: 'CSS Variables (theme.css)' },
  { id: 'tailwind', name: 'Tailwind Config (tailwind.config.ts)' },
  { id: 'json', name: 'Design Tokens (style-tokens.json)' },
  { id: 'figma-tokens', name: 'Figma W3C Tokens (figma-tokens.json)' },
  { id: 'w3c-tokens', name: 'W3C Design Tokens (w3c-design-tokens.json)' },
  { id: 'style-dictionary', name: 'Style Dictionary Tokens (style-dictionary-tokens.json)' },
  { id: 'echarts-theme', name: 'ECharts Theme (echarts-theme.json)' },
  { id: 'components', name: 'Component CSS (components.css)' },
  { id: 'motion', name: 'Motion CSS (motion.css)' },
  { id: 'icons', name: 'Icon Mapping (icons.json)' },
  { id: 'guide', name: 'AI Style Guide (ai-style-guide.md)' },
  { id: 'preview', name: 'HTML Preview (app-preview.html)' },
];

export const aiHandoffTabs: ExportTabItem[] = [
  { id: 'ai-prompt', name: 'Copy AI Builder Prompt' },
  { id: 'copy-once-prompt', name: 'Copy Once Prompt' },
  { id: 'token-savings-prompt', name: 'Token Savings Mode' },
  { id: 'iteration-notes', name: 'Iteration Notes' },
  { id: 'screen-build-prompts', name: 'Screen Build Prompts' },
  { id: 'guardrails', name: 'Do Not Change Guardrails' },
  { id: 'boilerplate-naming-guide', name: 'Boilerplate Naming Guide' },
  { id: 'ai-builder-brief', name: 'AI Builder Brief' },
  { id: 'design-rules', name: 'Design Rules' },
  { id: 'accessibility-notes', name: 'Accessibility Notes' },
  { id: 'baseline-framework-guide', name: 'Baseline Framework Guide' },
  { id: 'template-strategy', name: 'Template Strategy' },
  { id: 'google-ai-studio-prompt', name: 'Google AI Studio Prompt' },
  { id: 'antigravity-workflow', name: 'Antigravity Workflow' },
  { id: 'codex-prompt', name: 'Codex Prompt' },
  { id: 'chatgpt-prompt', name: 'ChatGPT Prompt' },
  { id: 'claude-prompt', name: 'Claude Prompt' },
  { id: 'gemini-prompt', name: 'Gemini Prompt' },
  { id: 'cursor-prompt', name: 'Cursor Prompt' },
  { id: 'lovable-prompt', name: 'Lovable Prompt' },
  { id: 'bolt-prompt', name: 'Bolt Prompt' },
  { id: 'v0-prompt', name: 'v0 Prompt' },
  { id: 'replit-prompt', name: 'Replit Prompt' },
];

export const wailsStackTabs: ExportTabItem[] = [
  { id: 'react-toggle', name: 'Theme Toggle (ThemeToggle.tsx)' },
  { id: 'react-echarts', name: 'ECharts Wrapper (EChartsWrapper.tsx)' },
  { id: 'go-db', name: 'SQLite Manager (database.go)' },
  { id: 'stack-readme', name: 'Stack Setup Guide (README.md)' },
];
