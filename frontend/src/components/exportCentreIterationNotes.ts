import { ThemeDetail } from '../types';

type SnapshotValue = string | number | boolean | null | SnapshotValue[] | { [key: string]: SnapshotValue };

export interface IterationSnapshot {
  theme: {
    name: string;
    app_type: string;
    style_mood: string;
    density: string;
    component_style: string;
  };
  colors: Record<string, string>;
  typography: ThemeDetail['typography_tokens'];
  spacing: ThemeDetail['spacing_tokens'];
  radius: ThemeDetail['radius_tokens'];
  shadows: ThemeDetail['shadow_tokens'];
  motion: ThemeDetail['motion_tokens'];
  icons: ThemeDetail['icon_settings'];
}

export function getIterationSnapshotKey(detail: ThemeDetail) {
  return `app-style-studio:iteration-snapshot:${detail.theme.id || detail.theme.name}`;
}

export function createIterationSnapshot(detail: ThemeDetail, colors: Record<string, { hex: string }>): IterationSnapshot {
  return {
    theme: {
      name: detail.theme.name,
      app_type: detail.theme.app_type,
      style_mood: detail.theme.style_mood,
      density: detail.theme.density,
      component_style: detail.theme.component_style,
    },
    colors: Object.fromEntries(Object.entries(colors).map(([key, value]) => [key, value.hex])),
    typography: detail.typography_tokens,
    spacing: detail.spacing_tokens,
    radius: detail.radius_tokens,
    shadows: detail.shadow_tokens,
    motion: detail.motion_tokens,
    icons: detail.icon_settings,
  };
}

function flattenSnapshot(value: SnapshotValue, prefix = ''): Record<string, string> {
  if (value === null || typeof value !== 'object') {
    return { [prefix]: String(value) };
  }

  if (Array.isArray(value)) {
    const flattened: Record<string, string> = {};
    value.forEach((child, index) => {
      Object.assign(flattened, flattenSnapshot(child, prefix ? `${prefix}.${index}` : String(index)));
    });
    return flattened;
  }

  const flattened: Record<string, string> = {};
  Object.entries(value).forEach(([key, child]) => {
    Object.assign(flattened, flattenSnapshot(child, prefix ? `${prefix}.${key}` : key));
  });
  return flattened;
}

export function buildIterationNotesMarkdown(detail: ThemeDetail, currentSnapshot: IterationSnapshot, previousRaw: string | null) {
  const currentFlat = flattenSnapshot(currentSnapshot as unknown as SnapshotValue);
  const previousSnapshot = previousRaw ? JSON.parse(previousRaw) : null;
  const previousFlat = previousSnapshot ? flattenSnapshot(previousSnapshot) : {};
  const changed = Object.entries(currentFlat)
    .filter(([key, value]) => previousFlat[key] !== value)
    .map(([key, value]) => ({ key, before: previousFlat[key] || '(not in previous snapshot)', after: value }));

  return `# Iteration Notes - ${detail.theme.name}

Use this after the first full handoff. Send only these changed values to the AI tool instead of resending the whole design system.

## Snapshot
- Theme: ${detail.theme.name}
- Previous snapshot: ${previousSnapshot ? 'Found in this browser' : 'Not found. This export will become the first local comparison baseline after saving.'}
- Changed token paths: ${changed.length}

## Changed Tokens
${changed.length ? changed.map((item) => `- \`${item.key}\`: \`${item.before}\` -> \`${item.after}\``).join('\n') : '- No token changes detected since the previous local iteration snapshot.'}

## Paste To AI
\`\`\`text
Update the app style using only these changed App Style Studio tokens. Do not redesign or restate the full design system. Keep existing components and screens, apply the token deltas above, run the build, and report changed files plus verification.
\`\`\`

## Snapshot Rule
Saving this file updates the local comparison snapshot for this theme.`;
}
