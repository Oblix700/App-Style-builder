import { ThemeDetail } from '../types';

interface DesignColorSummary {
  primary?: string;
  bgDark?: string;
  bg?: string;
  bgLight?: string;
  text?: string;
  textMuted?: string;
}

interface BuildDesignRulesInput {
  detail: ThemeDetail;
  mode: 'light' | 'dark';
  colors: DesignColorSummary;
}

interface BuildAccessibilityNotesInput {
  detail: ThemeDetail;
  textContrast: number;
  mutedContrast: number;
  primaryContrast: number;
}

export function buildDesignRules({ detail, mode, colors }: BuildDesignRulesInput) {
  return `# Design Rules - ${detail.theme.name}

These rules are strict. Use them to keep AI-generated apps visually consistent with the App Style Studio design system.

## Source of Truth
- Use \`theme.css\` for design tokens.
- Use \`components.css\` for reusable component classes.
- Use \`tailwind.config.ts\` only as a mapping layer to the CSS variables.
- Do not redesign the theme unless the user explicitly asks.

## Do Not Change
- Do not replace tokenized colors with random hex values.
- Do not introduce unrelated color palettes.
- Do not change typography families without asking.
- Do not remove focus rings or keyboard-visible states.
- Do not remove empty, loading, error, success, warning, disabled, hover, focus, and selected states.
- Do not mix multiple unrelated radius systems.
- Do not use decorative gradients or large abstract backgrounds unless they are already part of the theme.

## Required Token Usage
- App backgrounds: \`var(--bg-dark)\`, \`var(--bg)\`, \`var(--bg-light)\`
- Text: \`var(--text)\`, \`var(--text-muted)\`
- Borders: \`var(--border)\`, \`var(--border-muted)\`, \`var(--border-highlight)\`
- Actions: \`var(--primary)\`, \`var(--primary-hover)\`, \`var(--primary-muted)\`, \`var(--secondary)\`
- Alerts: \`var(--danger)\`, \`var(--warning)\`, \`var(--success)\`, \`var(--info)\`
- Radius: \`var(--radius-sm)\`, \`var(--radius-md)\`, \`var(--radius-lg)\`, \`var(--radius-xl)\`, \`var(--radius-pill)\`
- Spacing: \`var(--page-padding)\`, \`var(--card-padding)\`, \`var(--form-gap)\`, \`var(--table-cell-padding)\`, \`var(--dashboard-grid-gap)\`
- Shadows: \`var(--shadow-card)\`, \`var(--shadow-modal)\`, \`var(--shadow-button)\`, \`var(--shadow-focus-ring)\`

## Component Rules
- Cards use \`var(--bg-light)\`, \`var(--border)\`, \`var(--radius-lg)\`, \`var(--card-padding)\`, and \`var(--shadow-card)\`.
- Primary buttons use \`var(--primary)\`, white text, \`var(--radius-sm)\`, and \`var(--shadow-button)\`.
- Secondary buttons use \`var(--bg-light)\`, \`var(--border)\`, and \`var(--text)\`.
- Inputs use \`var(--bg-dark)\`, \`var(--border)\`, \`var(--radius-sm)\`, and visible focus styling.
- Tables use \`var(--table-cell-padding)\`, muted headers, clear row borders, and readable density.
- Modals use \`var(--shadow-modal)\`, clear hierarchy, and accessible close/cancel actions.
- Alerts must use semantic alert tokens and should include an icon, title, and short explanation.

## UX Quality Rules
- Every screen should have a clear primary action.
- Important actions must be visually distinct from secondary actions.
- Forms should group related fields and show validation states.
- Empty states should explain what to do next.
- Loading states should be calm and not shift layout.
- Error states should be specific and recoverable.
- Destructive actions should use danger styling and confirmation.

## Theme Snapshot
- Theme: ${detail.theme.name}
- App type: ${detail.theme.app_type}
- Mood: ${detail.theme.style_mood}
- Density: ${detail.theme.density}
- Component style: ${detail.theme.component_style}
- Mode: ${mode}
- Primary: ${colors.primary}
- Background: ${colors.bgDark} / ${colors.bg} / ${colors.bgLight}
- Text: ${colors.text}
- Muted text: ${colors.textMuted}`;
}

export function buildAccessibilityNotes({
  detail,
  textContrast,
  mutedContrast,
  primaryContrast,
}: BuildAccessibilityNotesInput) {
  return `# Accessibility Notes - ${detail.theme.name}

Use this file as a required accessibility checklist when implementing the App Style Studio export.

## Contrast Snapshot
- Text on app background: ${textContrast.toFixed(2)}:1 (${textContrast >= 4.5 ? 'AA pass' : 'Needs improvement'})
- Muted text on app background: ${mutedContrast.toFixed(2)}:1 (${mutedContrast >= 4.5 ? 'AA pass' : 'Use sparingly or improve'})
- Primary action on app background: ${primaryContrast.toFixed(2)}:1 (${primaryContrast >= 3 ? 'Usable for large/action UI' : 'Needs stronger contrast'})

## Required Color Rules
- Use semantic tokens from \`theme.css\`; do not replace them with random hex values.
- Body text should use \`var(--text)\`.
- Secondary text should use \`var(--text-muted)\`, but avoid using muted text for critical instructions.
- Destructive UI must use \`var(--danger)\` and include confirmation/cancel paths.
- Warning, success, and info states must use their semantic alert tokens and include text, not color alone.

## Focus And Keyboard Rules
- Keep visible focus states on buttons, links, inputs, selects, tabs, table actions, and modal controls.
- Use \`var(--shadow-focus-ring)\` or an equivalent high-contrast outline.
- Never remove focus outlines without replacing them with an accessible focus style.
- Modal dialogs must support Escape/cancel behavior and a clear close action.
- Keyboard order should follow the visible reading order.

## Font Size Guidance
- Base body size: ${detail.typography_tokens.base_font_size}px.
- Body font: ${detail.typography_tokens.body_font}.
- Heading font: ${detail.typography_tokens.heading_font}.
- Avoid body text below 14px.
- Data tables should keep readable row height; current table cell padding is ${detail.spacing_tokens.table_cell_padding}.
- Labels, helper text, and validation messages must stay readable and close to their fields.

## Tap Target And Density Guidance
- Current density: ${detail.theme.density}.
- Primary buttons and important row actions should be at least 36px high; use 44px for touch-heavy/mobile views.
- Current card padding: ${detail.spacing_tokens.card_padding}.
- Current form gap: ${detail.spacing_tokens.form_gap}.
- If using compact density, keep table actions and checkboxes easy to click.

## Motion And Reduced Motion
- Motion enabled: ${detail.motion_tokens.enabled ? 'yes' : 'no'}.
- Fast duration: ${detail.motion_tokens.duration_fast}.
- Normal duration: ${detail.motion_tokens.duration_normal}.
- Slow duration: ${detail.motion_tokens.duration_slow}.
- Respect \`prefers-reduced-motion\`: disable non-essential scale, slide, bounce, and parallax animations.
- Loading states should avoid layout shift and should not flash rapidly.

## State Coverage Required
Every generated app/template should include:
- Loading state
- Empty state
- Error state
- Success state
- Warning state
- Disabled state
- Hover state
- Focus state
- Selected state
- Destructive confirmation state

## AI Implementation Instruction
Preserve this accessibility checklist while implementing the app. If a design token conflicts with readability, report the issue and propose a token-level fix instead of hard-coding local exceptions.`;
}
