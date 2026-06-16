import { ThemeDetail } from '../types';

interface ToolPromptColorSummary {
  primary?: string;
  bgDark?: string;
  bg?: string;
  bgLight?: string;
  text?: string;
  textMuted?: string;
}

interface BuildPerToolPromptsInput {
  detail: ThemeDetail;
  mode: 'light' | 'dark';
  blueprintTitle?: string;
  blueprintAudience?: string;
  blueprintScreenSet?: string;
  blueprintTargetStack?: string;
  recommendedStarterTemplate: string;
  colors: ToolPromptColorSummary;
}

export function buildPerToolPrompts({
  detail,
  mode,
  blueprintTitle,
  blueprintAudience,
  blueprintScreenSet,
  blueprintTargetStack,
  recommendedStarterTemplate,
  colors,
}: BuildPerToolPromptsInput) {
  const antigravityWorkflow = `# Antigravity Workflow - Build With ${detail.theme.name}

## Description
Use this workflow in Antigravity to build an app from the App Style Studio export while preserving the design system.

## Mission
Build a working ${detail.theme.app_type} app using the exported design tokens and component rules. The app should look production-ready before adding complex business logic.

## Required Inputs
- Baseline project: \`C:\\Users\\Home\\Desktop\\Test Framework\`
- \`styles/theme.css\`
- \`styles/components.css\`
- \`config/tailwind.config.ts\`
- \`AI_BUILDER_BRIEF.md\`
- \`ACCESSIBILITY_NOTES.md\`
- \`BASELINE_FRAMEWORK_GUIDE.md\`
- Optional starter files from the exported template pack

## Steps
1. Inspect \`C:\\Users\\Home\\Desktop\\Test Framework\` and identify its Wails, Go service, SQLite, migration, and frontend structure.
2. Install or verify Tailwind, React, TypeScript, and required dependencies.
3. Import \`theme.css\` and \`components.css\` in the app entry.
4. Merge the exported Tailwind config values without deleting existing project config.
5. Create reusable UI primitives:
   - AppShell
   - Sidebar
   - Topbar
   - Button
   - Card
   - Input
   - Select
   - Table
   - Modal
   - Badge
   - Alert
6. Build these screens:
   - Dashboard
   - Data table/list
   - Form/create-edit page
   - Detail/report page
   - Settings
   - Empty/error/loading states
7. Verify that all colors, spacing, radius, shadows, fonts, and motion use App Style Studio tokens.
8. Preserve the baseline settings, preferences, audit, backup, health, imports, exports, migrations, and AppShell conventions.
9. Run the project build and fix errors.
10. Provide a short summary of files changed, verification results, and any remaining gaps.

## Guardrails
- Do not redesign the theme.
- Do not replace tokens with hard-coded hex values.
- Do not remove focus styles.
- Do not introduce a different component library unless the user asks.
- Do not replace the Test Framework architecture unless the user asks.
- Keep UI decisions aligned to ${detail.theme.style_mood}, ${detail.theme.density}, and ${detail.theme.component_style}.

## Paste-Once Prompt
Use \`C:\\Users\\Home\\Desktop\\Test Framework\` as the baseline Wails business app architecture and apply the attached App Style Studio export to build a ${detail.theme.app_type}. Follow \`BASELINE_FRAMEWORK_GUIDE.md\`, \`AI_BUILDER_BRIEF.md\`, \`DESIGN_RULES.md\`, \`ACCESSIBILITY_NOTES.md\`, and this workflow exactly. First wire in the theme files, then restyle/create reusable components, then build the screens, then run the build and report results.`;

  const googleAiStudioPrompt = `# Google AI Studio Prompt - Template Generator

Use this prompt in Google AI Studio to generate or refine reusable templates before building the real app in Antigravity, Codex, Cursor, or another coding tool.

## Prompt
You are a senior product designer and frontend architect. I am using App Style Studio to create an offline design system and AI-ready app templates.

Generate a reusable ${detail.theme.app_type} template plan using this style:
- Theme: ${detail.theme.name}
- Mood: ${detail.theme.style_mood}
- Mode: ${mode}
- Density: ${detail.theme.density}
- Component style: ${detail.theme.component_style}
- Blueprint: ${blueprintTitle || 'Not specified'}
- Audience: ${blueprintAudience || 'Not specified'}
- First screen pack: ${blueprintScreenSet || 'Not specified'}
- Build target: ${blueprintTargetStack || 'Not specified'}
- Primary color: ${colors.primary}
- Background colors: ${colors.bgDark}, ${colors.bg}, ${colors.bgLight}
- Text colors: ${colors.text}, ${colors.textMuted}
- Heading font: ${detail.typography_tokens.heading_font}
- Body font: ${detail.typography_tokens.body_font}
- Card padding: ${detail.spacing_tokens.card_padding}
- Grid gap: ${detail.spacing_tokens.dashboard_grid_gap}
- Radius: sm ${detail.radius_tokens.sm}, md ${detail.radius_tokens.md}, lg ${detail.radius_tokens.lg}, xl ${detail.radius_tokens.xl}

Please create:
1. A compact app architecture for a ${detail.theme.app_type}, using \`C:\\Users\\Home\\Desktop\\Test Framework\` as the baseline if a Wails desktop app is requested.
2. A screen list with purpose and primary user action.
3. Reusable component list.
4. Empty/loading/error/success/warning states.
5. A React + Tailwind file structure.
6. A concise implementation prompt I can paste into Antigravity or Codex.

Rules:
- Do not invent a new design system.
- Use App Style Studio tokens from \`theme.css\` and \`components.css\`.
- If using the desktop app baseline, preserve the Test Framework's SQLite, migrations, AppShell, settings, preferences, audit, backup, and health conventions.
- Prioritize non-coder clarity, production polish, and token efficiency.
- Keep the output practical enough to become a starter template.`;

  const codexPrompt = `# Codex Prompt - Build From App Style Studio Export

Use this prompt with Codex after exporting the App Style Studio handoff pack into your project folder.

## Task
Build a polished ${detail.theme.app_type} using the App Style Studio export in this workspace.

## Context
The design system is already defined. Read and follow:
- \`handoff/AI_BUILDER_BRIEF.md\`
- \`handoff/DESIGN_RULES.md\`
- \`handoff/ACCESSIBILITY_NOTES.md\`
- \`handoff/BASELINE_FRAMEWORK_GUIDE.md\`
- \`styles/theme.css\`
- \`styles/components.css\`
- \`config/tailwind.config.ts\`

Use \`C:\\Users\\Home\\Desktop\\Test Framework\` as the baseline Wails business app architecture when creating or adapting the app.

## Implementation Plan
1. Inspect the existing project structure and the baseline framework conventions.
2. Preserve the baseline SQLite, migrations, settings, preferences, audit, backup, health, imports, exports, AppShell, and page conventions.
3. Wire in \`theme.css\` and \`components.css\`.
4. Merge Tailwind token mappings without breaking existing config.
5. Create reusable components:
   - AppShell
   - Sidebar
   - Topbar
   - Button
   - Card
   - Input
   - Select
   - Table
   - Modal
   - Badge
   - Alert
6. Build the first screens:
   - Dashboard overview
   - Data table/list page
   - Create/edit form
   - Detail/report page
   - Settings page
   - Empty/loading/error states
7. Verify by running the local build/test commands.
8. Report changed files, verification results, and remaining gaps.

## Hard Rules
- Do not invent new colors, spacing, radius, shadows, or fonts.
- Use CSS variables and exported component classes.
- Keep focus states and accessibility states visible.
- Ask before introducing a new UI library.
- Do not replace the baseline framework architecture without asking.
- Keep implementation scoped and avoid unrelated refactors.

## Token-Saving Instruction
Do not restate the full design system in every response. Read the exported files once, apply them consistently, and only mention token details when they affect an implementation decision.`;

  const makeToolPrompt = (
    toolName: string,
    role: string,
    bestUse: string,
    extraInstructions: string[]
  ) => `# ${toolName} Prompt - App Style Studio Handoff

## Role
${role}

## Best Use
${bestUse}

## Project Goal
Build or refine a polished ${detail.theme.app_type} using the App Style Studio export as the source of truth.

## Design Context
- Theme: ${detail.theme.name}
- Mood: ${detail.theme.style_mood}
- Mode: ${mode}
- Density: ${detail.theme.density}
- Component style: ${detail.theme.component_style}
- Blueprint: ${blueprintTitle || 'Not specified'}
- Audience: ${blueprintAudience || 'Not specified'}
- Screen pack: ${blueprintScreenSet || 'Not specified'}
- Target stack: ${blueprintTargetStack || 'Not specified'}
- Recommended starter: ${recommendedStarterTemplate}

## Required Inputs
Use these files when available:
- \`COPY_ONCE_PROMPT.md\`
- \`AI_BUILDER_BRIEF.md\`
- \`DESIGN_RULES.md\`
- \`ACCESSIBILITY_NOTES.md\`
- \`BASELINE_FRAMEWORK_GUIDE.md\`
- \`TEMPLATE_STRATEGY.md\`
- \`theme.css\`
- \`components.css\`
- \`tailwind.config.ts\`

## Hard Rules
- Do not invent a new design system.
- Do not replace exported tokens with random hex values.
- Use CSS variables and exported component classes.
- Preserve visible focus, responsive layouts, and complete UI states.
- Build reusable components before screens.
- If this is a Wails desktop app, preserve the Test Framework architecture and local SQLite-first workflow.

## Tool-Specific Instructions
${extraInstructions.map((item) => `- ${item}`).join('\n')}

## Expected Output
Return a practical implementation plan or code changes for the chosen tool. Keep the answer concise, file-oriented, and ready to apply.`;

  return {
    antigravityWorkflow,
    googleAiStudioPrompt,
    codexPrompt,
    chatGptPrompt: makeToolPrompt(
      'ChatGPT',
      'Act as a senior product designer and frontend architect helping a non-coder turn a design system into a clear app implementation plan.',
      'Use this for planning, improving prompts, explaining trade-offs, and generating concise implementation instructions before coding.',
      [
        'Start with the screen/component plan, then provide the implementation prompt.',
        'Use plain English and avoid long theory.',
        'Keep the output easy to paste into a coding tool.',
      ]
    ),
    claudePrompt: makeToolPrompt(
      'Claude',
      'Act as a careful product engineer reviewing architecture, UX flow, and design-system consistency.',
      'Use this for thoughtful planning, docs, refactors, accessibility checks, and careful codebase reasoning.',
      [
        'Prioritize risks, missing states, accessibility gaps, and architecture drift.',
        'Preserve the exported design rules exactly.',
        'When editing code, keep changes scoped and explain verification steps.',
      ]
    ),
    geminiPrompt: makeToolPrompt(
      'Gemini',
      'Act as a multimodal product designer and implementation planner.',
      'Use this for exploring variants, screen ideas, template plans, and Google AI Studio workflows.',
      [
        'Generate compact template plans and screen packs.',
        'Suggest UI variants only within the exported design tokens.',
        'Return a short implementation prompt for Antigravity, Codex, or another coding tool.',
      ]
    ),
    cursorPrompt: makeToolPrompt(
      'Cursor',
      'Act as an in-repo coding assistant applying the exported design system to existing files.',
      'Use this when working directly inside a React, Wails, or Tailwind codebase.',
      [
        'Read the local files before editing.',
        'Wire in theme.css and components.css before restyling screens.',
        'Use small commits or focused changes, then run the project build.',
      ]
    ),
    lovablePrompt: makeToolPrompt(
      'Lovable',
      'Act as a no-code app generator that must follow a supplied design system.',
      'Use this for quick web-app prototypes, SaaS shells, dashboards, landing/onboarding flows, and client portals.',
      [
        'Build the first usable screen, not a marketing explanation.',
        'Use the exported colors, spacing, radius, shadows, and typography.',
        'Include loading, empty, error, success, and form validation states.',
      ]
    ),
    boltPrompt: makeToolPrompt(
      'Bolt',
      'Act as a fast full-stack prototype builder using the App Style Studio tokens.',
      'Use this for rapid React/Tailwind prototypes and starter apps.',
      [
        'Create a runnable project structure with reusable UI components.',
        'Use CSS variables from theme.css instead of hard-coded design values.',
        'Prioritize app shell, dashboard/list/form/settings screens, then polish states.',
      ]
    ),
    v0Prompt: makeToolPrompt(
      'v0',
      'Act as a UI generator producing high-quality React components from an existing design system.',
      'Use this for isolated screens, components, and responsive UI patterns.',
      [
        'Generate React + Tailwind components that reference App Style Studio CSS variables.',
        'Avoid unrelated shadcn/theme changes unless explicitly requested.',
        'Include desktop and mobile responsive behavior in the generated components.',
      ]
    ),
    replitPrompt: makeToolPrompt(
      'Replit',
      'Act as an online coding agent building a runnable prototype from exported design rules.',
      'Use this for quick hosted demos, simple full-stack prototypes, and shareable experiments.',
      [
        'Create clear setup/run scripts and keep dependencies minimal.',
        'Import the exported theme and component CSS at the app entry point.',
        'Verify the app runs and report the preview URL or run command.',
      ]
    ),
  };
}
