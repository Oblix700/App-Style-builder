import { ThemeDetail } from '../types';

export function buildScreenBuildPrompts(detail: ThemeDetail) {
  return `# Screen Build Prompts - ${detail.theme.name}

Use these snippets when you want an AI tool to build one screen at a time. Attach or reference \`theme.css\`, \`components.css\`, \`DESIGN_RULES.md\`, and \`TOKEN_SAVINGS_PROMPT.md\`.

## Shared Rules
- Build with App Style Studio tokens only.
- Do not invent colors, fonts, spacing, radius, shadows, or motion.
- Use reusable primitives before screen code.
- Include loading, empty, error, success, disabled, hover, focus, selected, and destructive states where relevant.
- Run the build and report changed files plus verification.

## Dashboard.tsx
\`\`\`text
Build the Dashboard screen for ${detail.theme.app_type}. Use cards, stat summaries, chart panels, recent activity, system status, and one clear primary action. Use App Style Studio tokens and components.css classes. Keep density ${detail.theme.density} and style ${detail.theme.style_mood}.
\`\`\`

## DataTable.tsx
\`\`\`text
Build the DataTable/List screen. Include search, filters, sort, column visibility, density-aware rows, status badges, row actions, empty/loading/error states, and export affordances. Preserve table readability and tap targets.
\`\`\`

## FormView.tsx
\`\`\`text
Build the Create/Edit Form screen. Include grouped fields, labels, help text, validation states, disabled state, primary/secondary actions, and a safe cancel path. Use exported input, select, checkbox, and button styling.
\`\`\`

## ModalPortal.tsx
\`\`\`text
Build the Modal/Detail screen. Include header hierarchy, detail sections, confirmation footer, close/cancel actions, keyboard-visible focus, and destructive-state handling. Use modal shadow, radius, and spacing tokens.
\`\`\`

## AnalyticsReport.tsx
\`\`\`text
Build the Report/Analytics screen. Include summary cards, chart area, report filters, selected columns, preview table, and export actions for Excel/PDF/Word. Keep report templates and generated-date conventions in mind.
\`\`\`

## LoginScreen.tsx
\`\`\`text
Build the Login/Auth screen. Include brand panel, email/password fields, validation errors, remember option, secure submit state, and useful empty/error feedback. Keep it visually aligned with the app shell.
\`\`\`

## AppSettings.tsx
\`\`\`text
Build the Settings screen. Include settings rows, toggles, theme/default preferences, density controls, backup/export controls, health status, and admin-safe destructive actions.
\`\`\`

## SystemAlerts.tsx
\`\`\`text
Build the Alerts screen. Include success, warning, danger, info, unread/read, dismissed, retryable, and audit-style alert states. Each alert needs icon, title, short explanation, timestamp, and action.
\`\`\`

## States.tsx
\`\`\`text
Build the complete UI states page. Show loading, empty, error, success, warning, disabled, hover, focus, selected, and destructive states for the primary components. This is the QA checklist for generated templates.
\`\`\`

## Patterns.tsx
\`\`\`text
Build the Pattern Library screen. Include screen pattern cards for onboarding, pricing, profile, checkout/booking, CRM detail, project board, finance tracker, client portal, and empty state. Include component pattern coverage for nav/sidebar, command bar, cards, stats, charts, tables, filters, forms, modals, toasts, tabs, accordions, badges, file upload, date picker shell, and settings rows.
\`\`\``;
}

export function buildGuardrailsPrompt(detail: ThemeDetail) {
  return `# Do Not Change Guardrails - ${detail.theme.name}

Use this file with AI coding tools to prevent design drift. These rules protect the App Style Studio design system, the offline app architecture, and the user's reusable template workflow.

## Protected Design Rules
- Do not change exported design tokens unless the user explicitly asks for a style change.
- Do not replace CSS variables with hard-coded colors, spacing, radius, shadows, typography, or motion values.
- Do not invent new palettes, gradients, fonts, icon styles, border radii, shadow systems, or animation timings.
- Do not remove accessible focus rings, keyboard states, contrast-safe text colors, labels, helper text, or validation messages.
- Do not remove loading, empty, error, success, warning, disabled, hover, focus, selected, destructive, and read-only states.
- Do not change density, scale, present mode, report/export patterns, filter/sort controls, column resizing, or user preference behavior unless asked.
- Do not introduce a new UI library, charting library, CSS framework, router, state manager, or persistence layer without asking first.
- Do not rename core files, exported token names, CSS variables, or handoff documents unless the user asks for a migration.

## Protected Architecture Rules
- Preserve the offline-first Wails + React + TypeScript + SQLite direction when building desktop templates.
- Preserve the baseline architecture from \`C:\\Users\\Home\\Desktop\\Test Framework\` when the user says to use the baseline.
- Use \`C:\\Users\\Home\\Desktop\\SAAF CONTRACT MANAGER\` as reference only for mature patterns, not as a file-copy source.
- Preserve AppShell, sidebar/topbar, settings, preferences, backup/restore, audit logging, migrations, health checks, and export/report conventions where present.
- Keep generated files readable for non-coders: clear names, plain labels, obvious folders, and no clever abstractions unless they reduce real complexity.

## Allowed Changes
- Add screens, components, data models, and workflows requested by the user.
- Improve accessibility, responsiveness, empty states, error handling, performance, and tests while preserving the design tokens.
- Refactor large files into smaller modules when behavior stays the same and the build remains green.
- Add comments only where the code would otherwise be hard to understand.
- Extend templates using the exported theme, component classes, Tailwind mappings, and AI handoff files.

## Before Handoff
- Run the project build.
- Report changed files, verification commands, and any gaps.
- If a requested change conflicts with these guardrails, stop and ask the user before changing protected rules.`;
}

export function buildBoilerplateNamingGuide(detail: ThemeDetail) {
  return `# Boilerplate Naming and File Structure - ${detail.theme.name}

Use this guide when generating reusable app templates from App Style Studio. The goal is a clean baseline that non-coders can understand, reuse, and hand to AI tools without wasting tokens on explanations.

## Naming Rules
- Use PascalCase for React components: \`Dashboard.tsx\`, \`DataTable.tsx\`, \`ReportBuilder.tsx\`.
- Use camelCase for functions, hooks, variables, and local helpers: \`formatStatus\`, \`useThemePreference\`, \`exportReport\`.
- Use kebab-case for CSS files and folders: \`theme.css\`, \`components.css\`, \`app-shell\` only when the framework expects it.
- Use snake_case only where Go, SQLite, JSON exports, or database conventions already use it.
- Name screens by user task, not technical cleverness: \`ClientRegister\`, \`BookingForm\`, \`Settings\`, \`Reports\`.
- Keep file names stable after the first template build so later AI iterations can target exact files.

## Recommended React Structure
\`\`\`text
src/
  app/
    AppShell.tsx
    routes.ts
  screens/
    Dashboard.tsx
    DataTableScreen.tsx
    FormScreen.tsx
    ReportsScreen.tsx
    SettingsScreen.tsx
    StatesScreen.tsx
  components/
    ui/
      Button.tsx
      Card.tsx
      Input.tsx
      Modal.tsx
      Tabs.tsx
      Toast.tsx
    layout/
      Sidebar.tsx
      Topbar.tsx
      CommandBar.tsx
    data/
      DataTable.tsx
      FilterBar.tsx
      StatusBadge.tsx
  hooks/
    useThemePreference.ts
    useTableState.ts
  styles/
    theme.css
    components.css
    motion.css
  utils/
    formatters.ts
    validators.ts
    exportHelpers.ts
\`\`\`

## Recommended Wails / SQLite Structure
\`\`\`text
backend/
  database/
    migrations.go
    theme_store.go
    backup.go
  services/
    reports.go
    settings.go
    audit.go
frontend/
  src/
    app/
    screens/
    components/
    styles/
Data/
  app.db
  backups/
  exports/
\`\`\`

## Template Generation Rules
- Start with one gold baseline template before creating variants.
- Put domain-specific screens in \`screens/\`; put reusable pieces in \`components/\`.
- Keep report/export logic in named helpers so AI tools can extend Excel, PDF, Word, and CSV behavior without rewriting screens.
- Keep table state such as search, filters, sort, visible columns, column widths, density, and pagination in one clear hook or state module.
- Keep scale controls, present mode, user preferences, and accessibility states as reusable app-level patterns.
- Add a short \`README.md\` to every template folder with purpose, screens, commands, and known guardrails.

## AI Prompt Rule
When asking an AI tool to build from this boilerplate, paste the exact file path you want changed and say: "Follow \`BOILERPLATE_NAMING_GUIDE.md\`, preserve the existing folder structure, and add new files only when the responsibility is clearly separate."`;
}
