import { ThemeDetail } from '../types';

interface CorePromptColorSummary {
  primary?: string;
  primaryHover?: string;
  secondary?: string;
  bgDark?: string;
  bg?: string;
  bgLight?: string;
  text?: string;
  textMuted?: string;
  border?: string;
  success?: string;
  warning?: string;
  danger?: string;
  info?: string;
}

interface BuildCoreHandoffPromptsInput {
  detail: ThemeDetail;
  mode: 'light' | 'dark';
  blueprintTitle?: string;
  blueprintAudience?: string;
  blueprintScreenSet?: string;
  blueprintTargetStack?: string;
  recommendedStarterTemplate: string;
  colors: CorePromptColorSummary;
}

export function buildCoreHandoffPrompts({
  detail,
  mode,
  blueprintTitle,
  blueprintAudience,
  blueprintScreenSet,
  blueprintTargetStack,
  recommendedStarterTemplate,
  colors,
}: BuildCoreHandoffPromptsInput) {
  const blueprintContext = [blueprintTitle, blueprintAudience, blueprintScreenSet, blueprintTargetStack].some(Boolean)
    ? `
## Guided Blueprint Context
- Blueprint: ${blueprintTitle || 'Not specified'}
- Audience: ${blueprintAudience || 'Not specified'}
- First screen pack: ${blueprintScreenSet || 'Not specified'}
- Build target: ${blueprintTargetStack || 'Not specified'}
`
    : '';

  const aiBuilderBrief = `# AI Builder Brief - ${detail.theme.name}

Use this brief to build an app with an AI coding tool such as Codex, Antigravity, Cursor, Claude, ChatGPT, Gemini, Lovable, Bolt, v0, or Replit.

## Goal
Build a polished ${detail.theme.app_type} using the design system below. Do not invent a new visual style. Treat these tokens, component rules, and UX constraints as the source of truth.
${blueprintContext}

## App Style
- Theme name: ${detail.theme.name}
- App type: ${detail.theme.app_type}
- Mood: ${detail.theme.style_mood}
- Preferred mode: ${mode}
- Density: ${detail.theme.density}
- Component style: ${detail.theme.component_style}
- Border style: ${detail.theme.border_style}

## Design System Rules
1. Use CSS variables from \`theme.css\` for colors, spacing, radius, shadows, typography, and motion.
2. Use semantic tokens instead of hard-coded colors:
   - Background: \`var(--bg-dark)\`, \`var(--bg)\`, \`var(--bg-light)\`
   - Text: \`var(--text)\`, \`var(--text-muted)\`
   - Borders: \`var(--border)\`, \`var(--border-muted)\`, \`var(--border-highlight)\`
   - Actions: \`var(--primary)\`, \`var(--primary-hover)\`, \`var(--primary-muted)\`, \`var(--secondary)\`
   - Alerts: \`var(--danger)\`, \`var(--warning)\`, \`var(--success)\`, \`var(--info)\`
3. Cards and panels should use \`var(--bg-light)\`, \`var(--border)\`, \`var(--radius-lg)\`, \`var(--card-padding)\`, and \`var(--shadow-card)\`.
4. Buttons should use the exported component classes or the same token structure:
   - Primary: \`bg-[var(--primary)]\`, white text, \`var(--radius-sm)\`, \`var(--shadow-button)\`
   - Secondary: \`var(--bg-light)\`, \`var(--border)\`, \`var(--text)\`
5. Forms, tables, modals, alerts, nav items, badges, and loading states should reuse classes from \`components.css\`.
6. Keep the UI consistent across loading, empty, error, disabled, hover, focus, and selected states.
7. Preserve accessibility: visible focus states, readable text, and clear alert colors.

## Token Summary
### Colors
- Primary: ${colors.primary}
- Primary hover: ${colors.primaryHover}
- Secondary: ${colors.secondary}
- Background dark: ${colors.bgDark}
- Background: ${colors.bg}
- Surface: ${colors.bgLight}
- Text: ${colors.text}
- Muted text: ${colors.textMuted}
- Border: ${colors.border}
- Success: ${colors.success}
- Warning: ${colors.warning}
- Danger: ${colors.danger}
- Info: ${colors.info}

### Typography
- Heading font: ${detail.typography_tokens.heading_font}
- Body font: ${detail.typography_tokens.body_font}
- Mono font: ${detail.typography_tokens.mono_font}
- Base size: ${detail.typography_tokens.base_font_size}px

### Layout
- Page padding: ${detail.spacing_tokens.page_padding}
- Card padding: ${detail.spacing_tokens.card_padding}
- Form gap: ${detail.spacing_tokens.form_gap}
- Table cell padding: ${detail.spacing_tokens.table_cell_padding}
- Dashboard grid gap: ${detail.spacing_tokens.dashboard_grid_gap}
- Sidebar width: ${detail.spacing_tokens.sidebar_width}

### Shape and Depth
- Radius sm: ${detail.radius_tokens.sm}
- Radius md: ${detail.radius_tokens.md}
- Radius lg: ${detail.radius_tokens.lg}
- Radius xl: ${detail.radius_tokens.xl}
- Card shadow: ${detail.shadow_tokens.card}
- Modal shadow: ${detail.shadow_tokens.modal}
- Button shadow: ${detail.shadow_tokens.button}

### Motion
- Fast: ${detail.motion_tokens.duration_fast}
- Normal: ${detail.motion_tokens.duration_normal}
- Slow: ${detail.motion_tokens.duration_slow}
- Standard ease: ${detail.motion_tokens.ease_standard}

## Recommended Screens
Build the app shell with these screens first:
- Dashboard overview
- Data table/list page
- Create/edit form
- Detail/report page
- Settings page
- Login/auth screen if relevant
- Empty, loading, error, success, and warning states

## Implementation Instructions
1. Install or create a React + TypeScript + Tailwind project unless the user provides another stack.
2. Add \`theme.css\` and \`components.css\` to the app.
3. Configure Tailwind using the exported \`tailwind.config.ts\`.
4. Build reusable components first: Button, Card, Input, Select, Table, Modal, Badge, Alert, Sidebar, Topbar.
5. Compose screens from those components.
6. Do not change the design system unless the user explicitly asks.

## Token-Saving Prompt
Build a ${detail.theme.app_type} using the attached App Style Studio design system. Use \`theme.css\`, \`components.css\`, and the exported Tailwind config as source of truth. Do not invent new colors, spacing, radii, shadows, or typography. Create reusable components and screens that match the brief above.`;

  const copyOncePrompt = `# Copy Once Prompt - ${detail.theme.name}

You are building a polished app from an App Style Studio export. Use this prompt as the compact source of truth and avoid asking for repeated visual polish instructions.

## Build Target
- App: ${detail.theme.app_type}
- Style: ${detail.theme.style_mood}
- Mode: ${mode}
- Density: ${detail.theme.density}
- Component style: ${detail.theme.component_style}
- Blueprint: ${blueprintTitle || 'Not specified'}
- Audience: ${blueprintAudience || 'Not specified'}
- Screen pack: ${blueprintScreenSet || 'Dashboard + register + reports'}
- Target stack: ${blueprintTargetStack || 'Not specified'}
- Recommended starter: ${recommendedStarterTemplate}

## Baseline Rule
If building an offline Wails desktop app, use \`C:\\Users\\Home\\Desktop\\Test Framework\` as the baseline architecture. Preserve its SQLite, migrations, AppShell, settings, preferences, audit, backup, health checks, table controls, scale controls, density controls, and report/export patterns.

## Required Files
Use these exported files as source of truth:
- \`theme.css\`
- \`components.css\`
- \`tailwind.config.ts\`
- \`AI_BUILDER_BRIEF.md\`
- \`DESIGN_RULES.md\`
- \`ACCESSIBILITY_NOTES.md\`
- \`BASELINE_FRAMEWORK_GUIDE.md\`
- \`TEMPLATE_STRATEGY.md\`

## Non-Negotiable Design Rules
- Do not invent new colors, spacing, radius, shadows, typography, or motion.
- Use CSS variables such as \`var(--primary)\`, \`var(--bg-light)\`, \`var(--text)\`, \`var(--border)\`, \`var(--radius-lg)\`, \`var(--card-padding)\`, and \`var(--shadow-card)\`.
- Use \`components.css\` classes for buttons, cards, inputs, selects, tables, badges, nav items, modals, alerts, and loaders.
- Include loading, empty, error, success, warning, disabled, hover, focus, selected, and destructive states.
- Keep visible focus styles and readable contrast.
- Build reusable primitives before screens: AppShell, Sidebar, Topbar, Button, Card, Input, Select, Table, Modal, Badge, Alert, Tabs, Toast, FileUpload, DatePicker shell, SettingsRow.

## Token Summary
- Primary: ${colors.primary}
- Primary hover: ${colors.primaryHover}
- Background dark: ${colors.bgDark}
- Background: ${colors.bg}
- Surface: ${colors.bgLight}
- Text: ${colors.text}
- Muted text: ${colors.textMuted}
- Border: ${colors.border}
- Success: ${colors.success}
- Warning: ${colors.warning}
- Danger: ${colors.danger}
- Info: ${colors.info}
- Heading font: ${detail.typography_tokens.heading_font}
- Body font: ${detail.typography_tokens.body_font}
- Page padding: ${detail.spacing_tokens.page_padding}
- Card padding: ${detail.spacing_tokens.card_padding}
- Table padding: ${detail.spacing_tokens.table_cell_padding}
- Radius: ${detail.radius_tokens.sm}, ${detail.radius_tokens.md}, ${detail.radius_tokens.lg}, ${detail.radius_tokens.xl}
- Shadows: card \`${detail.shadow_tokens.card}\`, modal \`${detail.shadow_tokens.modal}\`, button \`${detail.shadow_tokens.button}\`

## First Build Sequence
1. Wire in \`theme.css\`, \`components.css\`, and Tailwind mappings.
2. Create/reuse the component primitives listed above.
3. Build the recommended screen pack first.
4. Verify responsive desktop/tablet/mobile layout and all UI states.
5. Run the project build and report changed files, checks, and remaining gaps.

Do not redesign. Implement the app using this system.`;

  const tokenSavingsPrompt = `# Token Savings Mode - ${detail.theme.name}

Paste this once into an AI coding tool with the exported files. Keep future prompts short.

\`\`\`text
Read these files once and use them as source of truth: theme.css, components.css, tailwind.config.ts, COPY_ONCE_PROMPT.md, DESIGN_RULES.md, ACCESSIBILITY_NOTES.md, BASELINE_FRAMEWORK_GUIDE.md.

Build target: ${detail.theme.app_type}. Blueprint: ${blueprintTitle || 'not specified'}. Screen pack: ${blueprintScreenSet || 'dashboard/register/reports'}. Stack: ${blueprintTargetStack || 'not specified'}.

Design tokens: primary ${colors.primary}, bg ${colors.bgDark}/${colors.bg}/${colors.bgLight}, text ${colors.text}/${colors.textMuted}, border ${colors.border}, font ${detail.typography_tokens.heading_font}/${detail.typography_tokens.body_font}, padding page ${detail.spacing_tokens.page_padding}, card ${detail.spacing_tokens.card_padding}, table ${detail.spacing_tokens.table_cell_padding}, radius ${detail.radius_tokens.sm}/${detail.radius_tokens.md}/${detail.radius_tokens.lg}/${detail.radius_tokens.xl}.

Rules: do not invent new colors, fonts, spacing, radius, shadows, or motion. Use CSS variables and components.css classes. Include loading, empty, error, success, warning, disabled, hover, focus, selected, and destructive states. Build reusable components before screens. If Wails desktop, use C:\\Users\\Home\\Desktop\\Test Framework as baseline and preserve SQLite, migrations, AppShell, settings, audit, backup, health, table controls, scale/density controls, and report exports.

When responding, avoid restating the design system. Give only changed files, commands run, build result, and remaining gaps.
\`\`\``;

  return {
    aiBuilderBrief,
    copyOncePrompt,
    tokenSavingsPrompt,
  };
}
