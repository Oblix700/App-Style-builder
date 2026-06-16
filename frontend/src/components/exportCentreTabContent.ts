import { ExportTabId } from './exportCentreConfig';

export interface ExportTabContent {
  text: string;
  filename: string;
}

export type ExportTabContentMap = Record<ExportTabId, ExportTabContent>;

export interface BuildExportTabContentInput {
  themeCss: string;
  tailwindConfig: string;
  tokensJson: string;
  figmaTokensJson: string;
  w3cDesignTokensJson: string;
  styleDictionaryJson: string;
  echartsThemeJson: string;
  componentsCss: string;
  motionCss: string;
  iconsJson: string;
  aiStyleGuide: string;
  appPreviewHtml: string;
  aiPrompt: string;
  copyOncePrompt: string;
  tokenSavingsPrompt: string;
  iterationNotes: string;
  screenBuildPrompts: string;
  guardrailsPrompt: string;
  boilerplateNamingGuide: string;
  aiBuilderBrief: string;
  designRules: string;
  accessibilityNotes: string;
  baselineFrameworkGuide: string;
  templateStrategy: string;
  googleAiStudioPrompt: string;
  antigravityWorkflow: string;
  codexPrompt: string;
  chatGptPrompt: string;
  claudePrompt: string;
  geminiPrompt: string;
  cursorPrompt: string;
  lovablePrompt: string;
  boltPrompt: string;
  v0Prompt: string;
  replitPrompt: string;
  reactToggleCode: string;
  reactEChartsCode: string;
  goDbCode: string;
  stackReadmeCode: string;
}

export function buildExportTabContent(input: BuildExportTabContentInput): ExportTabContentMap {
  return {
    'theme-css': { text: input.themeCss, filename: 'theme.css' },
    tailwind: { text: input.tailwindConfig, filename: 'tailwind.config.ts' },
    json: { text: input.tokensJson, filename: 'style-tokens.json' },
    'figma-tokens': { text: input.figmaTokensJson, filename: 'figma-tokens.json' },
    'w3c-tokens': { text: input.w3cDesignTokensJson, filename: 'w3c-design-tokens.json' },
    'style-dictionary': { text: input.styleDictionaryJson, filename: 'style-dictionary-tokens.json' },
    'echarts-theme': { text: input.echartsThemeJson, filename: 'echarts-theme.json' },
    components: { text: input.componentsCss, filename: 'components.css' },
    motion: { text: input.motionCss, filename: 'motion.css' },
    icons: { text: input.iconsJson, filename: 'icons.json' },
    guide: { text: input.aiStyleGuide, filename: 'ai-style-guide.md' },
    preview: { text: input.appPreviewHtml, filename: 'app-preview.html' },
    'ai-prompt': { text: input.aiPrompt, filename: 'ai-prompt.txt' },
    'copy-once-prompt': { text: input.copyOncePrompt, filename: 'COPY_ONCE_PROMPT.md' },
    'token-savings-prompt': { text: input.tokenSavingsPrompt, filename: 'TOKEN_SAVINGS_PROMPT.md' },
    'iteration-notes': { text: input.iterationNotes, filename: 'ITERATION_NOTES.md' },
    'screen-build-prompts': { text: input.screenBuildPrompts, filename: 'SCREEN_BUILD_PROMPTS.md' },
    guardrails: { text: input.guardrailsPrompt, filename: 'DO_NOT_CHANGE_GUARDRAILS.md' },
    'boilerplate-naming-guide': { text: input.boilerplateNamingGuide, filename: 'BOILERPLATE_NAMING_GUIDE.md' },
    'ai-builder-brief': { text: input.aiBuilderBrief, filename: 'AI_BUILDER_BRIEF.md' },
    'design-rules': { text: input.designRules, filename: 'DESIGN_RULES.md' },
    'accessibility-notes': { text: input.accessibilityNotes, filename: 'ACCESSIBILITY_NOTES.md' },
    'baseline-framework-guide': { text: input.baselineFrameworkGuide, filename: 'BASELINE_FRAMEWORK_GUIDE.md' },
    'template-strategy': { text: input.templateStrategy, filename: 'TEMPLATE_STRATEGY.md' },
    'google-ai-studio-prompt': { text: input.googleAiStudioPrompt, filename: 'GOOGLE_AI_STUDIO_PROMPT.md' },
    'antigravity-workflow': { text: input.antigravityWorkflow, filename: 'ANTIGRAVITY_WORKFLOW.md' },
    'codex-prompt': { text: input.codexPrompt, filename: 'CODEX_PROMPT.md' },
    'chatgpt-prompt': { text: input.chatGptPrompt, filename: 'CHATGPT_PROMPT.md' },
    'claude-prompt': { text: input.claudePrompt, filename: 'CLAUDE_PROMPT.md' },
    'gemini-prompt': { text: input.geminiPrompt, filename: 'GEMINI_PROMPT.md' },
    'cursor-prompt': { text: input.cursorPrompt, filename: 'CURSOR_PROMPT.md' },
    'lovable-prompt': { text: input.lovablePrompt, filename: 'LOVABLE_PROMPT.md' },
    'bolt-prompt': { text: input.boltPrompt, filename: 'BOLT_PROMPT.md' },
    'v0-prompt': { text: input.v0Prompt, filename: 'V0_PROMPT.md' },
    'replit-prompt': { text: input.replitPrompt, filename: 'REPLIT_PROMPT.md' },
    'react-toggle': { text: input.reactToggleCode, filename: 'ThemeToggle.tsx' },
    'react-echarts': { text: input.reactEChartsCode, filename: 'EChartsWrapper.tsx' },
    'go-db': { text: input.goDbCode, filename: 'theme_store.go' },
    'stack-readme': { text: input.stackReadmeCode, filename: 'README.md' },
  };
}
