import React from 'react';
import * as Icons from 'lucide-react';

export interface BuilderNextAction {
  title: string;
  description: string;
  button: string;
  icon: React.ElementType;
  targetStep?: number;
  targetScreen?: 'export';
}

export const builderNextActions: BuilderNextAction[] = [
  {
    title: 'Next: choose the app personality',
    description: 'Use the plain-English buttons first. Watch the preview on the right and stop when it feels close.',
    button: 'Tune colours',
    icon: Icons.Sparkles,
    targetStep: 1,
  },
  {
    title: 'Next: check readability',
    description: 'Colours are the emotional layer. After this, make sure the type feels clear and professional.',
    button: 'Tune fonts',
    icon: Icons.Type,
    targetStep: 2,
  },
  {
    title: 'Next: set the breathing room',
    description: 'Typography sets trust. Spacing decides whether the app feels cramped, calm, or premium.',
    button: 'Tune spacing',
    icon: Icons.Grid,
    targetStep: 3,
  },
  {
    title: 'Next: shape the interface',
    description: 'Use the preview to test tables, cards, forms, and reports before changing corners or shadows.',
    button: 'Tune elevation',
    icon: Icons.Layers,
    targetStep: 4,
  },
  {
    title: 'Next: make actions recognizable',
    description: 'Corners and shadows are now set. Icons make buttons, menus, and app actions easier to understand.',
    button: 'Tune icons',
    icon: Icons.Smile,
    targetStep: 5,
  },
  {
    title: 'Next: test movement',
    description: 'Icons are mapped. Add only enough motion to make the app feel responsive and polished.',
    button: 'Tune motion',
    icon: Icons.Activity,
    targetStep: 6,
  },
  {
    title: 'Next: compare against full presets',
    description: 'Motion is the final polish layer. Use presets only if you want to change the whole direction.',
    button: 'View presets',
    icon: Icons.BookOpen,
    targetStep: 7,
  },
  {
    title: 'Next: export for your AI workflow',
    description: 'If the preview feels right, export a compact handoff for Google AI Studio, Codex, or Antigravity.',
    button: 'Open exports',
    icon: Icons.Download,
    targetScreen: 'export',
  },
];

export function getBuilderNextAction(activeStep: number) {
  const fallbackIndex = Math.min(activeStep + 1, builderNextActions.length - 1);
  return builderNextActions[activeStep] || builderNextActions[fallbackIndex];
}
