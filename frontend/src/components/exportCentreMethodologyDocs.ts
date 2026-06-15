import { ThemeDetail } from '../types';

export function buildBaselineFrameworkGuide(detail: ThemeDetail) {
  return `# Baseline Framework Guide - ${detail.theme.name}

Use this guide when building from the user's standard desktop app template.

## Baseline Path
\`C:\\Users\\Home\\Desktop\\Test Framework\`

## Mature Reference App
\`C:\\Users\\Home\\Desktop\\SAAF CONTRACT MANAGER\`

## Main Instruction
Use the baseline project architecture from \`Test Framework\`, then apply this App Style Studio design system on top.

Do not invent a new app structure unless the user explicitly asks. The baseline already contains the user's preferred Wails business-app conventions.

Use \`SAAF CONTRACT MANAGER\` only as a mature feature and workflow reference. Do not copy it wholesale because it includes domain data, PDFs, backups, releases, generated files, and SAAF-specific business logic.

## Preserve These Baseline Ideas
- Wails + React + TypeScript desktop app architecture.
- SQLite local database in a \`data/\` folder.
- Migration-first database setup through \`migrations/\`.
- Standard local folders:
  - \`data/\`
  - \`migrations/\`
  - \`imports/\`
  - \`exports/\`
  - \`logs/\`
  - \`backups/\`
  - \`attachments/\`
  - \`config/\`
  - \`internal/\`
  - \`frontend/\`
- System services:
  - settings
  - preferences
  - audit logging
  - backup/restore
  - system health
- Frontend app shell:
  - sidebar navigation
  - top header
  - theme toggle
  - 10% UI scale down/up controls
  - auto-fit UI scale control
  - density control
  - SQLite connection status
  - disk/write health status
  - dynamic app name/logo preference
- Operational table behavior:
  - global search
  - filter controls
  - sorting
  - column visibility toggles
  - density-aware row padding
  - column reordering/resizing behavior when present
  - status badges
- Report engine behavior:
  - field/column slicers
  - filter and sort engine
  - saved report templates
  - live export preview
  - column left/right reordering
  - Excel export
  - PDF portrait/landscape export
  - Word document export
  - summary lines and generated dates
- Standard starter pages:
  - Dashboard
  - Operations Register
  - Reports
  - Administration Console

## Mature Patterns To Borrow From SAAF Contract Manager
- Offline/no-cloud operational app behavior.
- Action dashboard that routes users directly into correction workflows.
- Import review and source-data ingestion patterns.
- Document linking, managed document vault, and document register patterns.
- Contract/detail style modals for inspecting and editing records.
- Filtered master table with persisted columns and captured column widths.
- Reporting system with selected columns, templates, filters, sorting, preview, and Excel/PDF/Word export.
- Present mode with live briefing slides, fullscreen slideshow, slide navigation, briefing details, agenda rail, density/zoom controls, and PowerPoint export.
- Financial/lifecycle views with risk, bottleneck, and health indicators.
- Toast feedback, error boundary, typed hooks, and regression-test mindset.

## Preferred Frontend Libraries
When useful, preserve or use these baseline-friendly libraries:
- React
- TypeScript
- Tailwind CSS
- Lucide React
- React Router
- TanStack Table
- React Hook Form
- Zod
- ECharts
- XLSX
- jsPDF
- docx
- file-saver

## Apply This Design System
1. Import \`styles/theme.css\` and \`styles/components.css\` into the frontend entry or global CSS.
2. Merge \`config/tailwind.config.ts\` token mappings into the baseline Tailwind config.
3. Replace old hard-coded baseline theme variables with App Style Studio semantic tokens where appropriate.
4. Preserve the baseline app shell behavior while restyling it with:
   - \`var(--bg-dark)\`
   - \`var(--bg)\`
   - \`var(--bg-light)\`
   - \`var(--text)\`
   - \`var(--text-muted)\`
   - \`var(--border)\`
   - \`var(--primary)\`
   - \`var(--radius-md)\`
   - \`var(--shadow-card)\`
5. Build or restyle pages using the component rules from \`DESIGN_RULES.md\`.
6. Preserve functional UX features such as scale controls, density controls, presentation/fullscreen mode if present, filters, sorting, column visibility, column resizing/reordering, saved report templates, and report exports.

## Do Not Copy These By Default
When creating a new template from the baseline, do not copy:
- \`.git/\`
- \`build/\`
- live SQLite files:
  - \`data/app.db\`
  - \`data/app.db-wal\`
  - \`data/app.db-shm\`
- large custom image assets unless the user requests them
- generated Wails bindings unless the service names match the target project
- local logs, backups, imports, or exports created by previous runs
- from SAAF Contract Manager: \`.agents/\`, \`.codex-run/\`, \`.cursor/\`, \`.vscode/\`, \`RELEASES/\`, \`SAAF_MASTER_DIST/\`, \`graphify-out/\`, compiled executables, domain PDFs, source spreadsheets, backup snapshots, SAAF-specific names/logos/restricted markings, or military-domain business rules unless explicitly requested

## Good AI Instruction
Use this exact sentence in AI tools:

\`\`\`text
Use C:\\Users\\Home\\Desktop\\Test Framework as the baseline Wails business app architecture. Preserve its SQLite, migrations, services, AppShell, settings, preferences, audit, backup, health, import/export, page conventions, scale controls, density controls, table filters/sorting/columns, saved report templates, and PDF/Excel/Word export features. Use C:\\Users\\Home\\Desktop\\SAAF CONTRACT MANAGER only as a mature reference for advanced workflows such as dashboards, imports, document registers, reporting, present mode, and PowerPoint export. Apply the App Style Studio design system from theme.css, components.css, DESIGN_RULES.md, and AI_BUILDER_BRIEF.md on top. Do not invent a new architecture and do not copy SAAF domain data.
\`\`\`

## First Build Target
Create a styled ${detail.theme.app_type} from the baseline with:
- Dashboard overview
- Operations/data register
- Reports page
- Admin/settings page
- Empty/loading/error/success/warning states
- Working local build`;
}

export function buildTemplateStrategy(detail: ThemeDetail) {
  return `# Template Strategy - ${detail.theme.name}

Use this file to keep the app-building workflow focused, fast, and token-efficient.

## Core Decision
Build in this order:

1. Build App Style Studio first.
2. Create one excellent gold baseline template.
3. Create focused template variants only after the gold baseline is strong.

This avoids scattered starter projects and gives AI tools a reliable foundation to build from.

## Workflow
**Design once in App Style Studio. Generate or refine templates in Google AI Studio. Build and test in Antigravity/Codex.**

1. **App Style Studio**
   - Create the visual system offline.
   - Export \`theme.css\`, \`components.css\`, \`DESIGN_RULES.md\`, \`AI_BUILDER_BRIEF.md\`, \`BASELINE_FRAMEWORK_GUIDE.md\`, and this file.
   - Treat these files as the source of truth.

2. **Google AI Studio**
   - Use the handoff pack to generate or refine template ideas.
   - Ask for screen lists, component plans, empty/loading/error states, and concise implementation prompts.
   - Do not ask it to invent a new design system.

3. **Antigravity / Codex**
   - Use the baseline project and exported files to build the real app.
   - Run builds/tests and fix implementation issues.
   - Preserve the exported visual rules and baseline architecture.

## Gold Baseline
Use this path as the clean starter architecture:

\`C:\\Users\\Home\\Desktop\\Test Framework\`

The gold baseline should be a reusable Wails + React + TypeScript + SQLite business app template with:
- Offline-first desktop behavior.
- Local SQLite database.
- Migration-first schema setup.
- Settings, preferences, audit logging, backup/restore, and health checks.
- AppShell with sidebar, topbar, theme toggle, 10% scale controls, auto-fit UI, density controls, and status badges.
- Data table patterns with search, filters, sorting, column visibility, column resizing/reordering where present, and density-aware rows.
- Report engine with saved templates, filter/sort rules, preview, and Excel/PDF/Word exports.
- App Style Studio theme integration through \`theme.css\`, \`components.css\`, and Tailwind mappings.

## Mature Reference
Use this path only as a maturity reference:

\`C:\\Users\\Home\\Desktop\\SAAF CONTRACT MANAGER\`

Borrow ideas from it for:
- Action dashboards.
- Import review and source-data ingestion.
- Document registers and managed document vaults.
- Detail/edit modals.
- Persisted table columns and captured column widths.
- Report templates and export workflows.
- Present mode, fullscreen briefing, slide navigation, and PowerPoint export.
- Robustness patterns such as toasts, error boundaries, typed hooks, and regression tests.

Do not copy SAAF-specific names, logos, restricted markings, PDFs, source spreadsheets, backups, releases, compiled files, or business rules unless the user explicitly requests that.

## Recommended Template Order
1. **Core Wails Business App** - the gold baseline for offline desktop apps.
2. **Admin Dashboard Template** - metrics, charts, filters, tables, and settings.
3. **Document/Register Template** - records, documents, import/review, audit history, and exports.
4. **Presentation/Briefing Template** - present mode, slide picker, fullscreen briefing, and PowerPoint export.
5. **CRM/Booking/Client Portal Template** - customer records, bookings, forms, detail modals, and status workflows.

## Quality Rule
One complete, reusable, tested baseline is more valuable than five incomplete templates.

Every later template should inherit:
- The same design token system.
- Export report features.
- 10% scale controls.
- Density controls.
- Table search/filter/sort/resize behavior.
- Saved report templates.
- Presentation/fullscreen patterns where relevant.
- AI handoff files for Google AI Studio, Antigravity, Codex, and other tools.

## Paste-Once Prompt
\`\`\`text
Use App Style Studio as the design-system source of truth. Build from C:\\Users\\Home\\Desktop\\Test Framework as the clean Wails + React + SQLite business app baseline. Apply the exported theme.css, components.css, DESIGN_RULES.md, AI_BUILDER_BRIEF.md, BASELINE_FRAMEWORK_GUIDE.md, and TEMPLATE_STRATEGY.md. Use C:\\Users\\Home\\Desktop\\SAAF CONTRACT MANAGER only as a mature reference for reports, document workflows, present mode, imports, dashboards, and robustness. First create one excellent gold baseline template, then create focused variants from that foundation. Do not invent a new architecture or copy SAAF domain data.
\`\`\``;
}
