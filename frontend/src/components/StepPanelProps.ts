import { ThemeDetail } from '../types';

/**
 * Shared props interface for all Step panel components.
 * Each step receives the current theme detail, a save handler, 
 * and the current UI mode (easy vs advanced).
 */
export interface StepPanelProps {
  detail: ThemeDetail;
  onSave: (updated: ThemeDetail) => void;
  uiMode: 'easy' | 'advanced';
}

/**
 * Extended props for steps that need preview mode control (e.g., Step 0 Identity).
 */
export interface StepPanelWithPreviewProps extends StepPanelProps {
  previewMode: 'dark' | 'light';
  setPreviewMode: (mode: 'dark' | 'light') => void;
}

/**
 * Extended props for steps that need notification display (e.g., presets).
 */
export interface StepPanelWithNotifyProps extends StepPanelProps {
  showNotification: (message: string, type: 'success' | 'error' | 'info') => void;
}

/**
 * Full props for steps that need everything.
 */
export interface StepPanelFullProps extends StepPanelProps {
  previewMode: 'dark' | 'light';
  setPreviewMode: (mode: 'dark' | 'light') => void;
  showNotification: (message: string, type: 'success' | 'error' | 'info') => void;
}
