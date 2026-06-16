interface BuildStarterTemplateFilesInput {
  themeName: string;
  themeCss: string;
  componentsCss: string;
  motionCss: string;
  tailwindConfig: string;
  tokensJson: string;
  w3cDesignTokensJson: string;
  styleDictionaryJson: string;
  copyOncePrompt: string;
  tokenSavingsPrompt: string;
  iterationNotes: string;
  screenBuildPrompts: string;
  guardrailsPrompt: string;
  boilerplateNamingGuide: string;
  designRules: string;
  accessibilityNotes: string;
  baselineFrameworkGuide: string;
  templateStrategy: string;
}

interface StarterTemplateDefinition {
  id: string;
  title: string;
  baseline: string;
  screens: string[];
  components: string[];
  prompt: string;
}

const starterTemplates: StarterTemplateDefinition[] = [
  {
    id: 'core-wails-business-app',
    title: 'Core Wails Business App',
    baseline: 'Use C:\\Users\\Home\\Desktop\\Test Framework as the gold baseline architecture.',
    screens: ['Dashboard', 'Operations Register', 'Reports', 'Administration Console', 'Settings', 'Complete UI states'],
    components: ['AppShell', 'Sidebar', 'Topbar', 'DataTable', 'ReportBuilder', 'SettingsRows', 'HealthBadges'],
    prompt: 'Create the gold offline Wails + React + SQLite business app baseline. Preserve migrations, settings, preferences, audit logging, backup/restore, health checks, scale controls, density controls, table controls, report exports, and AppShell conventions.',
  },
  {
    id: 'react-tailwind-app-shell',
    title: 'React + Tailwind App Shell',
    baseline: 'Use a clean React + TypeScript + Tailwind structure for web-first prototypes.',
    screens: ['Landing or login', 'Dashboard shell', 'List view', 'Form view', 'Settings', 'Responsive states'],
    components: ['AppShell', 'ResponsiveSidebar', 'Topbar', 'Button', 'Card', 'Input', 'Tabs', 'Toast'],
    prompt: 'Create a web app shell using the exported theme.css, components.css, and Tailwind token mappings. Prioritize responsive layout, reusable primitives, and clean AI-readable file structure.',
  },
  {
    id: 'admin-dashboard',
    title: 'Admin Dashboard Template',
    baseline: 'Use the Core Wails Business App baseline or React shell depending on target stack.',
    screens: ['Overview dashboard', 'Metrics grid', 'Charts', 'Filtered table', 'Alerts', 'Settings'],
    components: ['StatCards', 'ChartPanel', 'FilterBar', 'DataTable', 'AlertList', 'ExportActions'],
    prompt: 'Create an operational dashboard template with metrics, charts, filters, tables, status badges, empty/loading/error states, and export-ready reports.',
  },
  {
    id: 'document-register',
    title: 'Document / Register Template',
    baseline: 'Use Test Framework patterns and borrow mature document workflow ideas from SAAF Contract Manager only as reference.',
    screens: ['Register table', 'Document detail', 'Import review', 'Audit history', 'Reports', 'Missing documents'],
    components: ['RegisterTable', 'DocumentVault', 'ImportReviewPanel', 'AuditTimeline', 'ReportBuilder', 'FileUpload'],
    prompt: 'Create a document/register starter for records, documents, imports, audit history, filters, column controls, and Excel/PDF/Word exports.',
  },
  {
    id: 'presentation-briefing',
    title: 'Presentation / Briefing Template',
    baseline: 'Use the Wails desktop baseline and SAAF Contract Manager as a mature reference for present mode patterns.',
    screens: ['Briefing overview', 'Slide picker', 'Fullscreen present mode', 'Agenda rail', 'Export briefing', 'Settings'],
    components: ['BriefingSlide', 'SlideNavigator', 'PresentModeShell', 'AgendaRail', 'ExportPanel', 'DensityZoomControls'],
    prompt: 'Create a presentation/briefing starter with fullscreen present mode, slide navigation, briefing details, density/zoom controls, and PowerPoint/export workflow guidance.',
  },
  {
    id: 'crm-booking-client-portal',
    title: 'CRM / Booking / Client Portal Template',
    baseline: 'Use the React shell or Wails baseline depending on whether the app is client-facing or offline desktop.',
    screens: ['Client dashboard', 'CRM detail', 'Booking form', 'Profile', 'Tasks/notes', 'Client documents'],
    components: ['ClientCard', 'BookingFlow', 'CRMDetailTabs', 'TaskList', 'NotesPanel', 'DocumentList'],
    prompt: 'Create a CRM/booking/client portal starter with customer records, appointment or booking flow, profile/detail screens, notes, tasks, documents, and clear client-facing states.',
  },
];

export function buildStarterTemplateFiles(input: BuildStarterTemplateFilesInput): Record<string, string> {
  const files: Record<string, string> = {
    "README.md": `# ${input.themeName} - Starter Template Pack

This pack contains focused starter-template instructions generated from App Style Studio.

## How To Use
1. Pick one folder under \`templates/\`.
2. Open its \`BUILD_PROMPT.md\` in your AI coding tool.
3. Attach or copy the shared files under \`shared/\`.
4. Build the chosen template first, then create variants from that baseline.

## Shared Design Source
- \`shared/styles/theme.css\`
- \`shared/styles/components.css\`
- \`shared/config/tailwind.config.ts\`
- \`shared/handoff/COPY_ONCE_PROMPT.md\`
- \`shared/handoff/DO_NOT_CHANGE_GUARDRAILS.md\`
- \`shared/handoff/BOILERPLATE_NAMING_GUIDE.md\`
- \`shared/handoff/DESIGN_RULES.md\`
- \`shared/handoff/BASELINE_FRAMEWORK_GUIDE.md\`
- \`shared/handoff/TEMPLATE_STRATEGY.md\`

## Recommended Order
1. Core Wails Business App
2. Admin Dashboard
3. Document / Register
4. Presentation / Briefing
5. CRM / Booking / Client Portal
6. React + Tailwind App Shell for web-first variants
`,
    "shared/styles/theme.css": input.themeCss,
    "shared/styles/components.css": input.componentsCss,
    "shared/styles/motion.css": input.motionCss,
    "shared/config/tailwind.config.ts": input.tailwindConfig,
    "shared/tokens/style-tokens.json": input.tokensJson,
    "shared/tokens/w3c-design-tokens.json": input.w3cDesignTokensJson,
    "shared/tokens/style-dictionary-tokens.json": input.styleDictionaryJson,
    "shared/handoff/COPY_ONCE_PROMPT.md": input.copyOncePrompt,
    "shared/handoff/TOKEN_SAVINGS_PROMPT.md": input.tokenSavingsPrompt,
    "shared/handoff/ITERATION_NOTES.md": input.iterationNotes,
    "shared/handoff/SCREEN_BUILD_PROMPTS.md": input.screenBuildPrompts,
    "shared/handoff/DO_NOT_CHANGE_GUARDRAILS.md": input.guardrailsPrompt,
    "shared/handoff/BOILERPLATE_NAMING_GUIDE.md": input.boilerplateNamingGuide,
    "shared/handoff/DESIGN_RULES.md": input.designRules,
    "shared/handoff/ACCESSIBILITY_NOTES.md": input.accessibilityNotes,
    "shared/handoff/BASELINE_FRAMEWORK_GUIDE.md": input.baselineFrameworkGuide,
    "shared/handoff/TEMPLATE_STRATEGY.md": input.templateStrategy,
  };

  starterTemplates.forEach((template) => {
    files[`templates/${template.id}/README.md`] = `# ${template.title}

## Purpose
${template.prompt}

## Baseline
${template.baseline}

## Screens
${template.screens.map((screen) => `- ${screen}`).join('\n')}

## Components
${template.components.map((component) => `- ${component}`).join('\n')}

## Design System
Use the shared App Style Studio files. Do not invent a new palette, spacing scale, radius system, shadow style, or typography system.
`;

    files[`templates/${template.id}/BUILD_PROMPT.md`] = `# Build Prompt - ${template.title}

Use App Style Studio as the design-system source of truth.

## Task
${template.prompt}

## Required Shared Files
- \`shared/styles/theme.css\`
- \`shared/styles/components.css\`
- \`shared/config/tailwind.config.ts\`
- \`shared/handoff/COPY_ONCE_PROMPT.md\`
- \`shared/handoff/DESIGN_RULES.md\`
- \`shared/handoff/ACCESSIBILITY_NOTES.md\`

## Build Rules
- Use CSS variables from \`theme.css\`.
- Use semantic classes from \`components.css\`.
- Include loading, empty, error, success, warning, disabled, hover, focus, selected, and destructive states.
- Build reusable components before screens.
- Run the local build and report changed files.

## First Screens
${template.screens.map((screen) => `- ${screen}`).join('\n')}

## First Components
${template.components.map((component) => `- ${component}`).join('\n')}
`;

    files[`templates/${template.id}/FILE_STRUCTURE.md`] = `# Suggested File Structure - ${template.title}

\`\`\`text
src/
  app/
    AppShell.tsx
    routes.tsx
  components/
${template.components.map((component) => `    ${component}.tsx`).join('\n')}
  screens/
${template.screens.map((screen) => `    ${screen.replace(/[^a-zA-Z0-9]+/g, '')}.tsx`).join('\n')}
  styles/
    theme.css
    components.css
    motion.css
  utils/
    designTokens.ts
\`\`\`
`;
  });

  return files;
}
