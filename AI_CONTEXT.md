# App Style Studio - AI Collaboration & Context Guide

This document serves as a permanent state checkpoint and alignment guide for any AI model (including future sessions or compacts) collaborating on the development of **App Style Studio**. 

Read this file first to understand the application's architecture, stack, database structure, core features, active roadmap, and design philosophy.

---

## 1. Project Overview & Philosophy

**App Style Studio** is a professional design token workstation and guided app-style builder built for non-coders, AI-assisted builders, developers, and designers. It allows users to visually configure entire application design systems (Colors, Typography, Spacing, Elevation, Icons, Motion, and component patterns) and export them as production-ready bundles.

### The Vision
The app solves a major pain point for developers using AI code assistants (like ChatGPT, Claude, Gemini, etc.) to build applications:
1. **Helps Non-Coders/Developers Build Beautiful UIs:** Constrains design choices to Sajid's OKLCH color palettes, accessible contrast checks, harmonious layout ratios, and proven component patterns so apps look professionally designed without requiring design knowledge.
2. **Saves AI Tokens & Iteration Time:** Instead of wasting thousands of tokens asking an AI assistant to "make the button padding smaller", "round the corners a bit more", or "change colors to a cooler blue", the developer feeds the app's exported Tailwind configuration and `theme.css` to the AI *once*. The AI can then build perfectly-styled components on the first try.

### Product Inspiration
The app should borrow the strongest ideas from:
* **Sajid / iamsajid.com:** preserve the clarity of Sajid's design teaching: simple color axes, strong contrast, tasteful highlights, useful shadows, semantic alerts, and code-first handoff.
* **UI Colors by Sajid:** elevate the "only color palette you need to build any UI" concept into a full professional app design system builder.
* **Sajid's YouTube / design education style:** keep the workflow visual, practical, and easy to understand. Explain design decisions through immediate examples instead of abstract theory.
* **Figma:** direct manipulation, variable/token language, inspectable surfaces, and predictable visual feedback.
* **Flex-style no-code builders:** guided choices, plain-English controls, and fast app-shape presets for users who do not think in CSS.
* **Mobbin:** curated screen/component patterns that teach users what good apps look like by example.
* **Developer handoff tools:** exports that make implementation unambiguous for AI coding agents and human developers.

### North Star UX
The best version of App Style Studio should feel like: "Pick the kind of app you are building, choose a visual personality, inspect real screens, adjust plain-language controls, then export an AI-ready style package." Advanced users can still tune tokens directly, but non-coders should never need to understand OKLCH, CSS variables, or Tailwind internals to get a polished result.

### Core Product Thesis
The strongest product loop is:
1. Use App Style Studio to create a professional app design system.
2. Turn that design system into boilerplates, templates, and starter kits.
3. Give those templates to AI coding tools so they build apps with the right UI from the first prompt.
4. Save user tokens by preventing repeated "make it better", "fix spacing", "change colors", and "polish the UI" iterations.

This app should become the missing layer between non-coders and AI coding tools: not a generic app generator, but a design-system-first template generator that makes AI-built apps look intentional.

### Offline-First Product Rule
App Style Studio should be a standalone offline desktop app that can run from a normal folder or USB stick. Core features must never require login, cloud sync, API keys, or internet access.

The app can optionally help online workflows, but only through export/handoff features:
* Generate prompts for Antigravity, Codex, ChatGPT, Claude, Gemini, Cursor, Lovable, Bolt, v0, Replit, and similar tools.
* Export markdown briefs, design rules, starter templates, and workflow files that users can take to their preferred AI tool.
* Keep "bring your own API key" or embedded AI chat as a possible future advanced feature, not a core dependency.

Strategic position: **App Style Studio designs the system and creates the starter kit. The user's chosen AI tool builds the app.**

### Recommended AI Build Methodology
Frame the user's workflow like this:

**Design once in App Style Studio. Generate or refine templates in Google AI Studio. Build and test in Antigravity/Codex.**

The intended speed/token-saving flow:
1. **App Style Studio:** Create the design system offline, including colors, typography, spacing, radius, shadows, motion, screen patterns, and design rules.
2. **Google AI Studio:** Use the exported brief to generate or refine reusable boilerplates/templates, screen ideas, and app-specific implementation prompts.
3. **Antigravity / Codex:** Use the exported template pack, `AI_BUILDER_BRIEF.md`, `DESIGN_RULES.md`, `BASELINE_FRAMEWORK_GUIDE.md`, `TEMPLATE_STRATEGY.md`, `ANTIGRAVITY_WORKFLOW.md`, `CODEX_PROMPT.md`, `theme.css`, and `components.css` to build and verify the real app.

Why this saves tokens:
* The coding AI receives exact design decisions upfront instead of vague polish requests.
* Users avoid repeated prompts like "make it modern", "fix the spacing", "change the colors", or "make this table nicer".
* Template files let the AI modify concrete code instead of inventing structure from scratch.
* Tool-specific prompt files keep handoff short and targeted.

Product implication: App Style Studio should export portable handoff files for many AI tools rather than depending on an embedded AI chat. The highest-value exports are:
* `AI_BUILDER_BRIEF.md`
* `DESIGN_RULES.md`
* `BASELINE_FRAMEWORK_GUIDE.md`
* `TEMPLATE_STRATEGY.md`
* `GOOGLE_AI_STUDIO_PROMPT.md`
* `ANTIGRAVITY_WORKFLOW.md`
* `CODEX_PROMPT.md`
* `theme.css`
* `components.css`
* starter template files

### Template Creation Strategy
Remember this planning decision:

1. **Build App Style Studio first.** The app is the source of truth for visual systems, UX rules, AI handoff files, and export quality.
2. **Create one excellent baseline template next.** Do not rush into many half-finished starters. The first "gold baseline" should be a clean Wails + React + SQLite business app based on `C:\Users\Home\Desktop\Test Framework`, upgraded with App Style Studio tokens, handoff rules, and proven operational UI patterns.
3. **Use `SAAF CONTRACT MANAGER` as the maturity reference.** Borrow patterns from it for reports, presentation mode, import review, document workflows, dashboards, table behavior, and app robustness, but do not copy its domain data or business rules.
4. **Only then create template variants.** Once the gold baseline is strong, produce 3-5 focused variants from the same foundation so every starter feels consistent and professional.

Recommended starter template order:
1. **Core Wails Business App** - the gold baseline for offline desktop apps.
2. **Admin Dashboard Template** - metrics, charts, tables, filters, and settings.
3. **Document/Register Template** - managed documents, records, import/review, exports, and audit history.
4. **Presentation/Briefing Template** - present mode, slide picker, fullscreen briefing, and PowerPoint export.
5. **CRM/Booking/Client Portal Template** - customer records, appointments/bookings, forms, detail modals, and status workflows.

Template quality rule: one complete, reusable, tested baseline is more valuable than five incomplete templates. Every later template should inherit the same design tokens, export reports, 10% scale controls, density controls, table search/filter/sort/resize behavior, presentation/fullscreen patterns where relevant, and AI handoff files.

### User Baseline Framework
The user has an existing baseline template at:

`C:\Users\Home\Desktop\Test Framework`

Treat this as the user's current **Business App Framework** standard when generating handoff prompts, starter templates, or AI instructions.

Baseline strengths discovered:
* Wails + React + TypeScript desktop app structure.
* Standard folders: `data/`, `migrations/`, `imports/`, `exports/`, `logs/`, `backups/`, `attachments/`, `config/`, `internal/`, and `frontend/`.
* SQLite app database at `data/app.db` with migration runner and `sys_migrations`.
* System tables for settings, user preferences, audit log, and backups.
* Go services for settings, preferences, audit logging, backup/restore, and system health checks.
* Frontend `AppShell` with sidebar navigation, theme toggle, UI scale, density control, SQLite status, disk/write health, and dynamic app name/logo preferences.
* Standard shell controls that must be preserved: 10% scale down/up, auto-fit UI scale, table density selector, dark/light theme toggle, sidebar collapse, and health/status badges.
* Standard app pages: Dashboard, Operations Register, Reports, and Administration Console.
* Operations Register table standards: global search, column visibility toggles, sorting, density-aware row padding, status badges, and export action affordances.
* Report Engine standards: field/column slicers, filter and sort engine, saved report templates, report preview, column left/right reordering, and Excel/PDF/Word exports.
* Export helper standards: Excel auto-filter/freeze/estimated column widths, PDF portrait/landscape export with page numbers, Word document table export, summary lines, and generated dates.
* Frontend libraries suited to business apps: React Router, TanStack Table, React Hook Form, Zod, ECharts, XLSX, jsPDF, docx, and file-saver.

How to use it:
* In AI handoff prompts, say: **"Use `C:\Users\Home\Desktop\Test Framework` as the baseline project architecture and apply the App Style Studio design system on top."**
* Preserve the baseline's service architecture unless the user asks to change it.
* Preserve operational UI features such as scale controls, density controls, presentation/fullscreen modes if present, filter/sort/search tables, column visibility/reordering/resizing behavior, saved report templates, and report exports.
* Apply `theme.css`, `components.css`, Tailwind mappings, and handoff rules to the baseline UI.
* Use this baseline for Wails desktop starter templates before inventing a new project structure.

What not to copy into generated starter packs by default:
* `.git/`
* `build/`
* live SQLite files such as `data/app.db`, `data/app.db-wal`, and `data/app.db-shm`
* large user-specific image assets unless the user explicitly wants them
* generated Wails bindings unless the target project matches the same Go services

### User Mature Reference App
The user also has a more complete production-style reference app at:

`C:\Users\Home\Desktop\SAAF CONTRACT MANAGER`

Use this as a **mature workflow/reference app**, not as the default blank template. It contains domain-specific SAAF contract data, PDFs, releases, backups, generated files, and app-specific business logic that should not be copied blindly.

Reference strengths discovered:
* Offline Wails + React desktop app built for restricted/no-cloud environments.
* SQL-driven contract system with migrations, import normalization, source workbook ingestion, raw/import review concepts, and backup/restore.
* Mature dashboard/action-board thinking: risk contracts, pending allocation, missing PDFs, recent imports, and direct routing from overview to working views.
* Contract master table patterns: filters, archive mode, view modes, column persistence, column width capture, detail/edit modals, document linking, and managed PDF vault behavior.
* Document workflows: contract PDF linking, URS linking, document register, missing/legacy/managed document review.
* Report engine patterns: report templates, selected columns, filters, sorting, live preview, summary lines, Excel/PDF/Word export.
* Presentation mode patterns: live briefing slides, fullscreen slideshow simulation, slide navigation, hidden controls, cursor hiding, briefing details modal, agenda rail, template modes, density/zoom controls, and PowerPoint export.
* Financial views and lifecycle metrics: financial statement, lifecycle presentation slides, bottlenecks panel, contract lifecycle health/risk concepts.
* App robustness patterns: error boundary, toast feedback, typed hooks, admin operations, regression tests, import scope tests, financial service tests.

How to use it:
* Treat `SAAF CONTRACT MANAGER` as the example of a complete offline operational app.
* Mine it for feature patterns and UX maturity when designing templates.
* Use it to improve requirements and handoff prompts, especially for reporting, presentation, import review, document workflows, admin areas, and dashboards.
* Do not use it as the default starter copy. Use `Test Framework` as the clean baseline, then borrow selected mature patterns from `SAAF CONTRACT MANAGER`.

What not to copy from the mature reference app by default:
* `.git/`, `.agents/`, `.codex-run/`, `.cursor/`, `.vscode/`
* `build/`, `RELEASES/`, `SAAF_MASTER_DIST/`, `graphify-out/`
* compiled executables
* domain PDFs and source spreadsheets under `data/`
* backups and release snapshots
* SAAF-specific names, logos, restricted markings, contract data, and military-domain business rules unless explicitly requested

### Product Success Tests
Every major feature should be judged against these questions:
1. **Can a non-coder use this easily?** The user should be able to make good choices without knowing CSS, Tailwind, OKLCH, accessibility formulas, or design terminology.
2. **Will this improve their app building?** The output should make AI-generated apps more coherent, polished, accessible, and consistent.
3. **Does this cover award-level UI/UX foundations?** The app should cover colors, typography, spacing, layout, radius, shadows, icons, motion, states, responsive previews, accessibility, and real screen patterns.
4. **Is export easy for AI tools?** The user should get copyable prompts, structured tokens, CSS, Tailwind config, and complete starter templates that Codex, ChatGPT, Claude, Gemini, Cursor, Lovable, Bolt, v0, Replit, and similar tools can understand.
5. **Does it save tokens?** The generated handoff should reduce vague prompting and visual rework by giving AI a complete design system and starter UI kit upfront.
6. **Can templates become fast app starters?** The app should export boilerplates/templates that let a user quickly create a dashboard, booking app, CRM, client portal, finance tracker, admin panel, or Wails desktop app using the chosen style.

### Sajid-Inspired Product Principles
* **Keep the model simple:** Start from Sajid's core axes: Neutral/Vivid, Warmer/Cooler, Contrast, Gradients, Highlight, and Shadows.
* **Make every token visible:** Background, text, border, action, and alert tokens should always be shown through real UI examples.
* **Teach by preview:** Instead of long explanations, show cards, buttons, tables, forms, alerts, and screens responding instantly.
* **Elevate into production:** Add typography, spacing, radius, motion, icons, screen blueprints, import/export, accessibility checks, and AI handoff on top of the original color idea.
* **Stay respectful:** This app is inspired by Sajid's public work, but it should become its own professional workstation with broader scope and implementation depth.

### Research Takeaways
Recent AI/no-code app builder positioning validates this direction:
* **Figma Make / AI app builder:** positions the workflow as idea-to-interactive-app, with visual refinement and testing. App Style Studio should complement that by creating the design system and starter kit before generation.
* **Figma AI engineering handoff:** emphasizes production-ready code, staying aligned to tokens/libraries, and reducing translation drift. App Style Studio should export clear tokens, code, and AI briefs for this same reason.
* **No-code AI builders:** compete on prompt-to-app speed, visual editing, backend/data workflows, and deployability. App Style Studio should not try to replace all of them; it should make their UI output better.
* **Tailwind/Figma UI kits and component libraries:** win through depth, component coverage, code parity, and reusable templates. App Style Studio should export styled component kits and screen boilerplates, not only color variables.
* **Design-token handoff practice:** teams need shared tokens, component rules, and implementation guidance. App Style Studio should package these for both humans and AI agents.

Research sources checked in this pass: Figma AI app builder, Figma AI engineering handoff, Sajid UI Colors, Glide, WeWeb, Flowbite Figma, Untitled UI, no-code AI builder comparisons, and AI/design-token workflow articles.

---

## 2. Technology Stack & Database Schema

The workspace runs on a standardized stack:
* **Frontend:** React + TypeScript + Vite + Tailwind CSS + Lucide Icons.
* **Backend:** Go (using the **Wails v2** desktop framework).
* **Database:** SQLite (`app_style_studio.db` located dynamically next to the executable, managed via a pure-Go driver `modernc.org/sqlite` in [db.go](file:///c:/Users/Home/Desktop/App%20Style%20Creator/db.go)).

### Database Structure
The SQLite database stores themes and token blocks. Tokens are stored as serialized JSON strings:
* **`themes`**: Primary keys, names, mood presets (`app_type`, `style_mood`, `default_mode`, `density`, `border_style`, `component_style`).
* **`colour_tokens`**: Stores base hue, chroma, harmony parameters, and manual overrides (`data` JSON).
* **`typography_tokens`**: Heading/body/mono font families, scale ratios, sizes (`data` JSON).
* **`spacing_tokens`**: Padding, page grid gaps, card padding, sidebar sizes (`data` JSON).
* **`radius_tokens`**: `sm`, `md`, `lg`, `xl`, `pill` corner radii (`data` JSON).
* **`shadow_tokens`**: Button, card, modal, and hover shadow variables (`data` JSON).
* **`icon_settings`**: Active library, strokes, colors, and key-to-icon name mappings (`data` JSON).
* **`motion_tokens`**: Global transition timings, eases, hover/press animations (`data` JSON).

---

## 3. Major Features Completed

Completed items should stay marked here so future sessions do not rebuild solved work:

* [x] **Sajid OKLCH Generator:** Automatically generates accessible sRGB/P3-aware palettes based on Hue, Chroma, and Harmony formulas.
* [x] **Semantic Color Groups:** Covers background, text, border, action, and alert token groups inspired by Sajid's UI Colors structure.
* [x] **Contrast Checks:** Shows text/muted/action contrast feedback in the color workflow.
* [x] **Image Color Extractor:** Allows users to upload an image, hover with a magnifying lens, and click to extract a primary hue.
* [x] **Professional Studio Workspace Layout:** Left activity bar/settings forms plus right Figma-style document tabs and Canvas Studio preview.
* [x] **Live Canvas Inspector:** Implemented in [PreviewGallery.tsx](file:///c:/Users/Home/Desktop/App%20Style%20Creator/frontend/src/components/PreviewGallery.tsx) with hover outlines, labels, and click-to-open matching editor steps.
* [x] **Fine-Tuning Sliders:** Implemented/scaffolded for radius and spacing in [App.tsx](file:///c:/Users/Home/Desktop/App%20Style%20Creator/frontend/src/App.tsx) and [StepSpacing.tsx](file:///c:/Users/Home/Desktop/App%20Style%20Creator/frontend/src/components/StepSpacing.tsx).
* [x] **Easy/Advanced Mode Foundation:** Uses `theme.ui_mode` so non-coders get simplified controls while advanced users can tune tokens.
* [x] **Guided Blueprint Picker:** Dashboard now lets users start from app intent such as Admin dashboard, Technical console, Business SaaS, or Friendly client app.
* [x] **Guided Blueprint Wizard:** Dashboard adds non-coder choices for audience, first screen pack, and build target. New themes store this blueprint context so AI handoff exports can describe the intended app more clearly.
* [x] **Plain-English Style Controls:** Easy Mode identity step includes "More premium", "More playful", "More serious", "More spacious", "More compact", "Softer corners", and "Sharper interface" actions that adjust token groups together.
* [x] **Design Health Panel:** Easy Mode identity step scores accessibility, readability, layout comfort, consistency, and AI handoff readiness in plain English.
* [x] **UX Quality Checks:** Design Health now checks density, contrast, tap target size, table readability, form clarity, modal hierarchy, consistency, and AI handoff readiness.
* [x] **One-Click Smart Fixes:** Easy Mode identity step includes smart fixes for contrast, vividness, breathing room, button clarity, and corner consistency.
* [x] **Responsive Preview Modes:** Preview Gallery includes Desktop, Tablet, and Mobile viewport controls so users can inspect style behavior before export.
* [x] **Complete State Preview:** Preview Gallery includes a dedicated `States.tsx` tab covering loading, empty, error, success, warning, disabled, hover, focus, selected, and destructive states.
* [x] **Mobbin-Style Screen Pattern Library:** Preview Gallery includes a dedicated `Patterns.tsx` tab covering onboarding, pricing, profile, checkout/booking, CRM detail, project board, finance tracker, client portal, and empty-state patterns with AI-ready notes.
* [x] **Blueprint-Driven Preview Routing:** Preview Gallery now reads blueprint metadata, reorders/highlights recommended tabs, and shows the matching starter-template route for the selected screen set.
* [x] **Component Pattern Coverage:** Pattern Library now covers nav/sidebar, command bar, cards, stats, charts, data table, filters, forms, modals, toasts, tabs, accordions, badges, file upload, date picker shell, and settings rows.
* [x] **Accessibility Notes Export:** Export Centre includes `ACCESSIBILITY_NOTES.md` with contrast ratios, focus rules, font-size guidance, tap-target guidance, reduced-motion guidance, and required state coverage.
* [x] **Figma/W3C JSON Import:** Implemented in-app through `parseDesignTokens()` and drag/drop handlers in [App.tsx](file:///c:/Users/Home/Desktop/App%20Style%20Creator/frontend/src/App.tsx).
* [x] **Import Summary Feedback:** Import success now reports detected color/spacing/radius counts instead of a generic success message.
* [x] **Import Confidence Report:** Import success now reports confidence level, detected groups, missing token families, guessed values, and defaulted groups in plain English.
* [x] **Broader Token Import Shapes:** In-app import now accepts W3C/Figma JSON, Tokens Studio-style `value/type`, Style Dictionary-ish JSON, CSS variables, and simple Tailwind config fragments.
* [x] **Import Preview Before Save:** Token imports now open a review modal showing confidence, detected mappings, missing/defaulted groups, guessed values, and key theme values before creating the theme.
* [x] **W3C and Style Dictionary Exports:** Export Centre includes `w3c-design-tokens.json` and `style-dictionary-tokens.json`, and packages them into AI handoff, full handoff, and starter template ZIPs.
* [x] **Token Savings Mode:** Export Centre includes `TOKEN_SAVINGS_PROMPT.md`, a no-fluff paste-once prompt that tells AI tools to read source files once, avoid restating the design system, and report only changed files, commands, build results, and gaps.
* [x] **Iteration Notes Export:** Export Centre includes `ITERATION_NOTES.md`, comparing current tokens against the last local saved snapshot so users can send only changed values to AI tools.
* [x] **Screen Build Prompt Snippets:** Export Centre includes `SCREEN_BUILD_PROMPTS.md` with short AI prompts for Dashboard, DataTable, Form, Modal, Report, Login, Settings, Alerts, States, and Patterns preview tabs.
* [x] **Do Not Change Guardrails Export:** Export Centre includes `DO_NOT_CHANGE_GUARDRAILS.md`, protecting design tokens, CSS variables, accessibility states, offline Wails/SQLite architecture, baseline-template conventions, scale/present/report/table controls, and AI build verification expectations.
* [x] **Boilerplate Naming Guide Export:** Export Centre includes `BOILERPLATE_NAMING_GUIDE.md`, giving AI tools stable React/Wails folder structure, naming rules, table/report/export conventions, and baseline-template rules for token-saving app generation.
* [x] **App Error Boundary:** Added a top-level React error boundary so unexpected screen errors show a clear recovery panel instead of a blank desktop app.
* [x] **Export Centre Tab Config Extraction:** Export tab IDs and sidebar menu groups now live in `exportCentreConfig.ts`, reducing the `ExportCentre.tsx` monolith without changing export behavior.
* [x] **Export Centre Sidebar Extraction:** Repeated sidebar tab rendering now lives in `ExportCentreSidebar.tsx`, keeping export behavior stable while shrinking the main export component.
* [x] **Export Centre Toolbar Extraction:** Export, copy, and save toolbar rendering now lives in `ExportCentreToolbar.tsx`, preserving existing handlers/status labels while reducing main component UI noise.
* [x] **Export Centre Code Viewer Extraction:** The right-side export preview frame and readonly textarea now live in `ExportCentreCodeViewer.tsx`, leaving `ExportCentre.tsx` more focused on export data and actions.
* [x] **AI Loop Prompt Builder Extraction:** Screen build prompts, do-not-change guardrails, and boilerplate naming guide markdown now live in `exportCentreAiLoopPrompts.ts`, reducing generated-text bulk in `ExportCentre.tsx`.
* [x] **Quality Doc Builder Extraction:** `DESIGN_RULES.md` and `ACCESSIBILITY_NOTES.md` builders now live in `exportCentreQualityDocs.ts`, keeping contrast and token-rule exports easier to test.
* [x] **Methodology Doc Builder Extraction:** `BASELINE_FRAMEWORK_GUIDE.md` and `TEMPLATE_STRATEGY.md` builders now live in `exportCentreMethodologyDocs.ts`, preserving the Test Framework/SAAF reference workflow while reducing Export Centre bulk.
* [x] **Per-Tool Prompt Builder Extraction:** Google AI Studio, Antigravity, Codex, ChatGPT, Claude, Gemini, Cursor, Lovable, Bolt, v0, and Replit prompt builders now live in `exportCentreToolPrompts.ts`.
* [x] **Core Handoff Prompt Builder Extraction:** `AI_BUILDER_BRIEF.md`, `COPY_ONCE_PROMPT.md`, and `TOKEN_SAVINGS_PROMPT.md` builders now live in `exportCentreCorePrompts.ts`, keeping the central AI handoff docs testable and out of the main component.
* [x] **Stack Boilerplate Builder Extraction:** Theme toggle, ECharts wrapper, Go SQLite helper, and stack README exports now live in `exportCentreStackBoilerplates.ts`.
* [x] **CLI Import Script:** Implemented at [scripts/import_theme.py](file:///c:/Users/Home/Desktop/App%20Style%20Creator/scripts/import_theme.py).
* [x] **Wails Stack Harmony Export:** Generates a compressed `.zip` containing `theme.css`, `components.css`, Tailwind config, React helpers, ECharts helper, Go SQLite helper, and README.
* [x] **AI Handoff Exports:** Export Centre includes `AI_BUILDER_BRIEF.md`, `DESIGN_RULES.md`, `GOOGLE_AI_STUDIO_PROMPT.md`, `ANTIGRAVITY_WORKFLOW.md`, `CODEX_PROMPT.md`, and includes them in ZIP exports.
* [x] **Dedicated AI Handoff ZIP:** Export Centre can package handoff prompts, design rules, CSS, Tailwind config, and token JSON without requiring the full stack bundle.
* [x] **Copy Once Prompt Export:** Export Centre includes `COPY_ONCE_PROMPT.md`, a compact high-signal prompt for token-saving AI handoff, and includes it in Stack ZIP and AI Handoff ZIP exports.
* [x] **Per-Tool Prompt Presets:** Export Centre includes prompt presets for Codex, ChatGPT, Claude, Gemini, Cursor, Lovable, Bolt, v0, Replit, Google AI Studio, and Antigravity.
* [x] **Full Handoff ZIP:** Export Centre includes a complete `full_handoff_pack.zip` with styles, tokens, previews, handoff docs, per-tool prompts, React helpers, SQLite helper, and implementation README.
* [x] **Starter Template ZIPs:** Export Centre includes a `starter_templates.zip` with Core Wails Business App, React + Tailwind App Shell, Admin Dashboard, Document/Register, Presentation/Briefing, and CRM/Booking/Client Portal starter packs.
* [x] **Baseline Framework Guide Export:** Export Centre includes `BASELINE_FRAMEWORK_GUIDE.md` so AI tools can use `C:\Users\Home\Desktop\Test Framework` as the user's standard Wails business app architecture.
* [x] **Template Strategy Export:** Export Centre includes `TEMPLATE_STRATEGY.md` so AI tools understand the sequence: build App Style Studio first, create one gold baseline template, then create focused variants.

---

## 4. Master Implementation Plan

We are now building toward: **the best non-coder app-style system for creating AI-ready app templates.** Follow this plan in order and mark items complete as they ship.

### Phase 1 - Non-Coder Guided Creation
* [x] Add initial dashboard blueprint picker.
* [x] Expand blueprint picker into a proper wizard: app type, audience, mood, density, screen set, and target stack. Mood and density are currently inherited from the selected blueprint preset.
* [x] Add plain-English style controls: "more premium", "more playful", "more serious", "more spacious", "more compact", "softer corners", "sharper interface".
* [x] Add a "Design Health" panel that explains current accessibility, consistency, and polish in simple terms.
* [x] Add one-click smart fixes: "Improve contrast", "Reduce vividness", "Increase breathing room", "Make buttons clearer", "Make corners consistent".

### Phase 2 - Award-Level UI/UX Coverage
* [x] Cover foundational tokens: color, typography, spacing, radius, shadows, icons, and motion.
* [x] Add responsive preview modes: desktop, tablet, mobile.
* [x] Add complete state previews: loading, empty, error, success, warning, disabled, hover, focus, selected, and destructive states.
* [x] Add UX quality checks for density, contrast, tap target size, table readability, form clarity, and modal hierarchy.
* [x] Add accessibility export notes: contrast pass/fail, focus styles, recommended font sizes, and reduced motion guidance.

### Phase 3 - Mobbin-Style Pattern Library
* [x] Existing preview tabs cover dashboard, table, form, modal, report, login, settings, and alerts.
* [x] Add screen pattern packs: onboarding, pricing, profile, checkout/booking, CRM detail, project board, finance tracker, client portal, and empty state.
* [x] Let blueprints choose the most relevant preview tabs and starter templates automatically.
* [x] Add component pattern coverage: nav/sidebar, command bar, cards, stats, charts, data table, filters, forms, modals, toasts, tabs, accordions, badges, file upload, date picker shell, and settings rows.
* [x] Add "pattern notes" explaining why each pattern works in plain English for non-coders.

### Phase 4 - AI Template Export Packs
* [x] Export base design tokens and Wails stack helper files.
* [x] Add an **AI Builder Brief** export: one Markdown file containing app type, style intent, screen list, design rules, token summary, accessibility notes, and exact AI instructions.
* [x] Record the template strategy: build App Style Studio first, then one gold baseline template, then focused variants.
* [x] Add offline-first AI handoff packs:
  * [x] `AI_BUILDER_BRIEF.md`
  * [x] `DESIGN_RULES.md`
  * [x] `ACCESSIBILITY_NOTES.md`
  * [x] `BASELINE_FRAMEWORK_GUIDE.md`
  * [x] `TEMPLATE_STRATEGY.md`
  * [x] `GOOGLE_AI_STUDIO_PROMPT.md`
  * [x] `ANTIGRAVITY_WORKFLOW.md`
  * [x] `CODEX_PROMPT.md`
  * [x] compact "paste once" prompt
* [x] Add `TEMPLATE_STRATEGY.md` export explaining the gold baseline first, variant templates second, and how to use `Test Framework` plus `SAAF CONTRACT MANAGER`.
* [x] Add starter template ZIPs for common targets:
  * [x] Core Wails Business App gold baseline based on `C:\Users\Home\Desktop\Test Framework`.
  * [x] React + Tailwind app shell.
  * [x] Admin dashboard starter.
  * [x] Document/register starter.
  * [x] Presentation/briefing starter.
  * [x] CRM/booking/client portal starter.
* [x] Add per-tool prompt presets: Codex, ChatGPT, Claude, Gemini, Cursor, Lovable, Bolt, v0, and Replit.
* [x] Add "copy once" export mode: all critical context in a compact prompt designed to save user tokens.
* [x] Add "full handoff" export mode: complete files and README for deeper implementation.

### Phase 5 - Import and Interoperability
* [x] In-app Figma/W3C JSON import.
* [x] CLI token import into SQLite.
* [x] Basic import summary feedback.
* [x] Upgrade import summary into a confidence report with detected, missing, guessed, and defaulted tokens.
* [x] Support more token shapes: Figma Variables, Tokens Studio, W3C Design Tokens, Style Dictionary-ish JSON, Tailwind config fragments, and simple CSS variables.
* [x] Add import preview before save, so users can accept/edit detected mappings.
* [x] Add export to W3C design tokens and Style Dictionary-compatible JSON.

### Phase 6 - Token Savings and AI Build Loop
* [x] Add "Token Savings Mode" that produces short, high-signal AI prompts with no redundant prose.
* [x] Add "Iteration Notes" export: only changed tokens since last export, so users do not resend the entire design system.
* [x] Add "Ask AI to build this screen" prompt snippets from each preview tab.
* [x] Add "Do not change these rules" guardrails to prevent AI tools from drifting away from the chosen design system.
* [x] Add reusable boilerplate naming conventions and file structure instructions for generated apps.

### Phase 7 - Quality Bar and Verification
* [x] Add top-level error boundary so unexpected React errors show a recovery UI.
* [x] Begin monolith reduction by extracting Export Centre tab types and sidebar metadata.
* [x] Continue monolith reduction by extracting Export Centre sidebar section rendering.
* [x] Continue monolith reduction by extracting Export Centre toolbar rendering.
* [x] Continue monolith reduction by extracting Export Centre code viewer shell.
* [x] Continue monolith reduction by extracting AI loop prompt builders.
* [x] Continue monolith reduction by extracting design rules and accessibility note builders.
* [x] Continue monolith reduction by extracting baseline framework and template strategy builders.
* [x] Continue monolith reduction by extracting per-tool prompt builders.
* [x] Continue monolith reduction by extracting core AI handoff prompt builders.
* [x] Continue monolith reduction by extracting stack boilerplate builders.
* [x] Frontend build was verified with `npm run build` after guided blueprint/import summary changes.
* [x] Frontend build was verified with `npm run build` after AI Builder Brief and Antigravity Workflow exports.
* [x] Frontend build was verified with `npm run build` after dedicated AI Handoff Pack exports.
* [x] Frontend build was verified with `npm run build` after Baseline Framework Guide export.
* [x] Frontend build was verified with `npm run build` after Template Strategy export.
* [x] Frontend build was verified with `npm run build` after guided blueprint wizard and AI brief metadata changes.
* [x] Frontend build was verified with `npm run build` after Plain-English Style Controls.
* [x] Frontend build was verified with `npm run build` after Design Health Panel.
* [x] Frontend build was verified with `npm run build` after One-Click Smart Fixes.
* [x] Frontend build was verified with `npm run build` after Responsive Preview Modes.
* [x] Frontend build was verified with `npm run build` after Complete State Preview.
* [x] Frontend build was verified with `npm run build` after UX Quality Checks.
* [x] Frontend build was verified with `npm run build` after Accessibility Notes export.
* [x] Frontend build was verified with `npm run build` after Mobbin-style Screen Pattern Library.
* [x] Frontend build was verified with `npm run build` after Blueprint-driven Preview Routing.
* [x] Frontend build was verified with `npm run build` after Component Pattern Coverage.
* [x] Frontend build was verified with `npm run build` after Copy Once Prompt export.
* [x] Frontend build was verified with `npm run build` after Per-Tool Prompt Presets.
* [x] Frontend build was verified with `npm run build` after Full Handoff ZIP export.
* [x] Frontend build was verified with `npm run build` after Starter Template ZIPs.
* [x] Frontend build was verified with `npm run build` after Import Confidence Report.
* [x] Frontend build was verified with `npm run build` after Broader Token Import Shapes.
* [x] Frontend build was verified with `npm run build` after Import Preview Before Save.
* [x] Frontend build was verified with `npm run build` after W3C and Style Dictionary exports.
* [x] Frontend build was verified with `npm run build` after Token Savings Mode.
* [x] Frontend build was verified with `npm run build` after Iteration Notes export.
* [x] Frontend build was verified with `npm run build` after Screen Build Prompt Snippets.
* [x] Frontend build was verified with `npm run build` after Do Not Change Guardrails export.
* [x] Frontend build was verified with `npm run build` after Boilerplate Naming Guide export.
* [x] Frontend build was verified with `npm run build` after App Error Boundary.
* [x] Frontend build was verified with `npm run build` after Export Centre tab config extraction.
* [x] Frontend build was verified with `npm run build` after Export Centre sidebar extraction.
* [x] Frontend build was verified with `npm run build` after Export Centre toolbar extraction.
* [x] Frontend build was verified with `npm run build` after Export Centre code viewer extraction.
* [x] Frontend build was verified with `npm run build` after AI Loop Prompt Builder extraction.
* [x] Frontend build was verified with `npm run build` after Quality Doc Builder extraction.
* [x] Frontend build was verified with `npm run build` after Methodology Doc Builder extraction.
* [x] Frontend build was verified with `npm run build` after Per-Tool Prompt Builder extraction.
* [x] Frontend build was verified with `npm run build` after Core Handoff Prompt Builder extraction.
* [x] Frontend build was verified with `npm run build` after Stack Boilerplate Builder extraction.
* [ ] Run `npm run build` before every handoff.
* [ ] Run `wails build` when backend, export, filesystem, or SQLite behavior changes.
* [ ] Use browser visual QA for major UI layout changes.
* [ ] Maintain AI_CONTEXT.md after each completed phase so future sessions continue from the real state.

---

## 5. Instructions for Future AI Models

If you are continuing work on this codebase in a new session:
1. **Verify SQLite Connection:** Read [db.go](file:///c:/Users/Home/Desktop/App%20Style%20Creator/db.go) and ensure your query modifications match Wails structures.
2. **Ensure Hot-Reload Preview:** Check that changes in the left forms call `handleAutosave(updated)` which updates the parent state in [App.tsx](file:///c:/Users/Home/Desktop/App%20Style%20Creator/frontend/src/App.tsx) so `<PreviewEngine>` instantly compiles variables to the head stylesheet.
3. **Workspace Design Rules:**
   * Keep borders crisp (`border-[#202538]`).
   * Keep styling dark and premium (`bg-[#0c0f1b]`, `bg-[#121625]`).
   * Never use browser frames inside the canvas.
   * Verify all changes compile with `npm run build` and `wails build`.
4. **Non-Coder Product Rules:**
   * Prefer plain-language controls first and token-level controls second.
   * Every advanced concept should have a visible effect in the preview.
   * Import/export flows must explain what happened in human language.
   * The app should always help the user make a good decision, not just expose more sliders.
