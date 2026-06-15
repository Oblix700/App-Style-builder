import React, { useEffect, useState } from 'react';
import { ThemeDetail } from '../types';
import * as Icons from 'lucide-react';

interface PreviewGalleryProps {
  detail: ThemeDetail;
  mode: 'light' | 'dark';
  onInspectSection?: (stepIndex: number, elementId?: string) => void;
}

type ActivePreviewTab = 'dashboard' | 'table' | 'form' | 'modal' | 'report' | 'login' | 'settings' | 'alerts' | 'states' | 'patterns';

export function PreviewGallery({ detail, mode, onInspectSection }: PreviewGalleryProps) {
  const [activeTab, setActiveTab] = useState<ActivePreviewTab>('dashboard');
  const [showModal, setShowModal] = useState(false);
  const [inspectMode, setInspectMode] = useState(false);
  const [previewViewport, setPreviewViewport] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');

  // Mobbin Component States
  const [capacityValue, setCapacityValue] = useState(4);
  const [serverEnv, setServerEnv] = useState<'dev' | 'staging' | 'prod'>('dev');
  const [ratingValue, setRatingValue] = useState(4);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [accordionOpen, setAccordionOpen] = useState(false);

  // Helper to dynamically resolve and render icons based on settings
  const renderMappedIcon = (actionKey: string, className = '', overrideSize?: string) => {
    const iconName = detail.icon_settings.mappings[actionKey] || 'HelpCircle';
    const IconComponent = (Icons as any)[iconName] || Icons.HelpCircle;
    
    // Convert string size (e.g. "20px") to numbers/classes if needed
    const size = overrideSize || detail.icon_settings.default_size || '20px';
    const strokeWidth = parseFloat(detail.icon_settings.stroke_width) || 2;
    
    // Resolve icon color behaviour
    let colorClass = 'text-current';
    if (detail.icon_settings.colour_behaviour === 'muted') {
      colorClass = 'text-[var(--text-muted)]';
    } else if (detail.icon_settings.colour_behaviour === 'primary') {
      colorClass = 'text-[var(--primary)]';
    }

    return (
      <span style={{ width: size, height: size }} className={`inline-flex items-center justify-center shrink-0 ${colorClass} ${className}`}>
        <IconComponent strokeWidth={strokeWidth} size="100%" />
      </span>
    );
  };

  const handleInspectClick = (e: React.MouseEvent, stepIndex: number, elementId?: string) => {
    if (!inspectMode) return;
    e.preventDefault();
    e.stopPropagation();
    if (onInspectSection) {
      onInspectSection(stepIndex, elementId);
    }
  };

  const viewportOptions = [
    { key: 'desktop', label: 'Desktop', width: '100%', icon: Icons.Monitor },
    { key: 'tablet', label: 'Tablet', width: '820px', icon: Icons.Tablet },
    { key: 'mobile', label: 'Mobile', width: '390px', icon: Icons.Smartphone },
  ] as const;

  const selectedViewport = viewportOptions.find((item) => item.key === previewViewport) || viewportOptions[0];

  const blueprintMeta = detail.component_styles?.styles || {};
  const blueprintScreenSet = blueprintMeta.blueprint_screen_set || detail.theme.app_type || '';
  const blueprintTargetStack = blueprintMeta.blueprint_target_stack || 'Template exploration';

  const tabDefinitions = [
    { key: 'dashboard', name: 'Dashboard.tsx', iconName: 'LayoutGrid' },
    { key: 'table', name: 'DataTable.tsx', iconName: 'Table' },
    { key: 'form', name: 'FormView.tsx', iconName: 'CheckSquare' },
    { key: 'modal', name: 'ModalPortal.tsx', iconName: 'Layers' },
    { key: 'report', name: 'AnalyticsReport.tsx', iconName: 'BarChart3' },
    { key: 'login', name: 'LoginScreen.tsx', iconName: 'LogIn' },
    { key: 'settings', name: 'AppSettings.tsx', iconName: 'Settings' },
    { key: 'alerts', name: 'SystemAlerts.tsx', iconName: 'Bell' },
    { key: 'states', name: 'States.tsx', iconName: 'ListChecks' },
    { key: 'patterns', name: 'Patterns.tsx', iconName: 'PanelsTopLeft' },
  ] as const;

  const getRecommendedTabs = (screenSet: string): ActivePreviewTab[] => {
    const normalized = screenSet.toLowerCase();

    if (normalized.includes('landing') || normalized.includes('onboarding')) {
      return ['patterns', 'login', 'form', 'settings', 'states'];
    }
    if (normalized.includes('crm')) {
      return ['patterns', 'dashboard', 'table', 'modal', 'form', 'states'];
    }
    if (normalized.includes('booking') || normalized.includes('checkout')) {
      return ['patterns', 'form', 'modal', 'login', 'settings', 'states'];
    }
    if (normalized.includes('import') || normalized.includes('documents') || normalized.includes('audit')) {
      return ['table', 'report', 'alerts', 'modal', 'states', 'patterns'];
    }
    if (normalized.includes('present') || normalized.includes('briefing') || normalized.includes('exports')) {
      return ['report', 'dashboard', 'patterns', 'settings', 'states'];
    }

    return ['dashboard', 'table', 'report', 'settings', 'states', 'patterns'];
  };

  const getStarterTemplateRoute = (screenSet: string) => {
    const normalized = screenSet.toLowerCase();

    if (normalized.includes('crm') || normalized.includes('booking') || normalized.includes('checkout')) {
      return 'CRM / Booking / Client Portal starter';
    }
    if (normalized.includes('present') || normalized.includes('briefing') || normalized.includes('exports')) {
      return 'Presentation / Briefing starter';
    }
    if (normalized.includes('import') || normalized.includes('documents') || normalized.includes('audit')) {
      return 'Document / Register starter';
    }
    if (normalized.includes('landing') || normalized.includes('onboarding')) {
      return 'React + Tailwind app shell';
    }

    return 'Core Wails Business App gold baseline';
  };

  const recommendedTabs = getRecommendedTabs(blueprintScreenSet);
  const recommendedTabSet = new Set<ActivePreviewTab>(recommendedTabs);
  const orderedTabs = [
    ...recommendedTabs.map((key) => tabDefinitions.find((tab) => tab.key === key)).filter(Boolean),
    ...tabDefinitions.filter((tab) => !recommendedTabSet.has(tab.key)),
  ] as typeof tabDefinitions[number][];
  const starterTemplateRoute = getStarterTemplateRoute(blueprintScreenSet);

  useEffect(() => {
    setActiveTab(recommendedTabs[0] || 'dashboard');
  }, [detail.theme.id, blueprintScreenSet]);

  const screenPatterns = [
    {
      title: 'Onboarding',
      useCase: 'Best for first-run setup, imports, permissions, and profile completion.',
      action: 'Start setup',
      iconName: 'Sparkles',
      mock: 'steps',
      note: 'Use three to five guided steps with one obvious primary action.',
    },
    {
      title: 'Pricing',
      useCase: 'Best for SaaS plans, service tiers, subscriptions, and quote packages.',
      action: 'Choose plan',
      iconName: 'BadgeDollarSign',
      mock: 'pricing',
      note: 'Make the recommended option visually clear, then explain trade-offs.',
    },
    {
      title: 'Profile',
      useCase: 'Best for account pages, client records, personnel files, and user settings.',
      action: 'Update profile',
      iconName: 'UserRound',
      mock: 'profile',
      note: 'Lead with identity, then show permissions, activity, and key metadata.',
    },
    {
      title: 'Checkout / Booking',
      useCase: 'Best for appointments, rentals, service orders, reservations, and purchases.',
      action: 'Confirm booking',
      iconName: 'CalendarCheck',
      mock: 'checkout',
      note: 'Keep selection, details, and confirmation visible in one predictable flow.',
    },
    {
      title: 'CRM Detail',
      useCase: 'Best for leads, customers, contracts, cases, tasks, and communication history.',
      action: 'Add note',
      iconName: 'Contact',
      mock: 'crm',
      note: 'Pair a rich detail header with tabs for notes, tasks, files, and timeline.',
    },
    {
      title: 'Project Board',
      useCase: 'Best for operational work queues, issue tracking, approvals, and production status.',
      action: 'Create task',
      iconName: 'KanbanSquare',
      mock: 'board',
      note: 'Use status columns, compact cards, ownership, and due-date signals.',
    },
    {
      title: 'Finance Tracker',
      useCase: 'Best for budgets, invoices, statements, spend dashboards, and forecasts.',
      action: 'Export report',
      iconName: 'LineChart',
      mock: 'finance',
      note: 'Show summary cards first, then trends, exceptions, and the working table.',
    },
    {
      title: 'Client Portal',
      useCase: 'Best for customer-facing dashboards, documents, tickets, and progress tracking.',
      action: 'Share update',
      iconName: 'PanelTop',
      mock: 'portal',
      note: 'Give clients a calm overview, clear next steps, and visible documents.',
    },
    {
      title: 'Empty State',
      useCase: 'Best for new projects, missing records, filtered tables, and fresh installs.',
      action: 'Create first item',
      iconName: 'FolderPlus',
      mock: 'empty',
      note: 'Explain what belongs here and provide exactly one useful next action.',
    },
  ] as const;

  const componentPatterns = [
    { title: 'Nav / Sidebar', iconName: 'PanelLeft', role: 'Primary app movement and section awareness.', anatomy: ['Logo', 'Sections', 'Active state'] },
    { title: 'Command Bar', iconName: 'Search', role: 'Fast actions, search, filters, and keyboard-friendly workflows.', anatomy: ['Search', 'Actions', 'Shortcuts'] },
    { title: 'Cards', iconName: 'PanelTop', role: 'Group related information without making every section feel heavy.', anatomy: ['Title', 'Summary', 'Action'] },
    { title: 'Stats', iconName: 'Activity', role: 'Show the most important numbers before the user enters detail views.', anatomy: ['Metric', 'Change', 'Context'] },
    { title: 'Charts', iconName: 'BarChart3', role: 'Explain trends, comparisons, and exceptions visually.', anatomy: ['Legend', 'Trend', 'Insight'] },
    { title: 'Data Table', iconName: 'Table2', role: 'Support scanning, sorting, filtering, and export-heavy operations.', anatomy: ['Columns', 'Rows', 'Actions'] },
    { title: 'Filters', iconName: 'SlidersHorizontal', role: 'Let users narrow data without losing sight of current results.', anatomy: ['Slicers', 'Reset', 'Count'] },
    { title: 'Forms', iconName: 'ClipboardList', role: 'Capture structured data with clear labels and validation.', anatomy: ['Fields', 'Help text', 'Submit'] },
    { title: 'Modals', iconName: 'Layers', role: 'Handle focused decisions, details, confirmations, and quick edits.', anatomy: ['Header', 'Body', 'Footer'] },
    { title: 'Toasts', iconName: 'MessageSquare', role: 'Confirm system feedback without interrupting the workflow.', anatomy: ['Status', 'Message', 'Undo'] },
    { title: 'Tabs', iconName: 'FolderKanban', role: 'Split related views without sending users to a new screen.', anatomy: ['Tab list', 'Panel', 'Active'] },
    { title: 'Accordions', iconName: 'Rows3', role: 'Hide secondary information while keeping it easy to inspect.', anatomy: ['Trigger', 'Panel', 'State'] },
    { title: 'Badges', iconName: 'BadgeCheck', role: 'Communicate status, priority, type, and risk in compact space.', anatomy: ['Label', 'Tone', 'Shape'] },
    { title: 'File Upload', iconName: 'UploadCloud', role: 'Import documents, spreadsheets, images, or reference files safely.', anatomy: ['Drop zone', 'Progress', 'Review'] },
    { title: 'Date Picker Shell', iconName: 'CalendarDays', role: 'Select deadlines, bookings, periods, and reporting ranges.', anatomy: ['Input', 'Calendar', 'Range'] },
    { title: 'Settings Rows', iconName: 'Settings2', role: 'Expose preferences, toggles, admin controls, and defaults.', anatomy: ['Label', 'Control', 'Hint'] },
  ] as const;

  const renderPatternMock = (mock: typeof screenPatterns[number]['mock']) => {
    if (mock === 'steps') {
      return (
        <div className="space-y-3">
          {[1, 2, 3].map((step) => (
            <div key={step} className="flex items-center gap-3">
              <span className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold ${step === 1 ? 'bg-[var(--primary)] text-white' : 'bg-[var(--primary-muted)] text-[var(--primary)]'}`}>{step}</span>
              <div className="flex-1">
                <div className="h-2 rounded-full bg-[var(--text)]/25 w-2/3" />
                <div className="h-1.5 rounded-full bg-[var(--border-muted)] w-1/2 mt-1.5" />
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (mock === 'pricing') {
      return (
        <div className="grid grid-cols-3 gap-2">
          {[0, 1, 2].map((plan) => (
            <div key={plan} className={`rounded-[var(--radius-md)] border p-2 ${plan === 1 ? 'border-[var(--primary)] bg-[var(--primary-muted)]' : 'border-[var(--border)] bg-[var(--bg)]'}`}>
              <div className="h-2 rounded-full bg-[var(--text)]/25" />
              <div className="h-5 rounded bg-[var(--border-muted)] mt-3" />
              <div className="h-1.5 rounded-full bg-[var(--border-muted)] mt-2" />
            </div>
          ))}
        </div>
      );
    }

    if (mock === 'profile') {
      return (
        <div className="flex gap-3">
          <div className="w-14 h-14 rounded-full bg-[var(--primary-muted)]" />
          <div className="flex-1 space-y-2">
            <div className="h-3 rounded-full bg-[var(--text)]/25 w-2/3" />
            <div className="h-2 rounded-full bg-[var(--border-muted)] w-1/2" />
            <div className="grid grid-cols-3 gap-2 pt-2">
              <div className="h-10 rounded-[var(--radius-sm)] bg-[var(--bg)] border border-[var(--border)]" />
              <div className="h-10 rounded-[var(--radius-sm)] bg-[var(--bg)] border border-[var(--border)]" />
              <div className="h-10 rounded-[var(--radius-sm)] bg-[var(--bg)] border border-[var(--border)]" />
            </div>
          </div>
        </div>
      );
    }

    if (mock === 'checkout') {
      return (
        <div className="grid grid-cols-[1.2fr_0.8fr] gap-3">
          <div className="space-y-2">
            <div className="h-8 rounded-[var(--radius-sm)] bg-[var(--bg)] border border-[var(--border)]" />
            <div className="h-8 rounded-[var(--radius-sm)] bg-[var(--bg)] border border-[var(--border)]" />
          </div>
          <div className="rounded-[var(--radius-md)] bg-[var(--primary-muted)] p-3 space-y-2">
            <div className="h-2 rounded-full bg-[var(--primary)]/45" />
            <div className="h-2 rounded-full bg-[var(--primary)]/25" />
            <div className="h-7 rounded-[var(--radius-sm)] bg-[var(--primary)] mt-3" />
          </div>
        </div>
      );
    }

    if (mock === 'crm') {
      return (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="h-3 rounded-full bg-[var(--text)]/25 w-1/3" />
            <div className="h-6 rounded-full bg-[var(--success)]/20 w-16" />
          </div>
          <div className="grid grid-cols-4 gap-2">
            {[0, 1, 2, 3].map((tab) => <div key={tab} className={`h-7 rounded-[var(--radius-sm)] ${tab === 0 ? 'bg-[var(--primary)]' : 'bg-[var(--bg)] border border-[var(--border)]'}`} />)}
          </div>
          <div className="h-12 rounded-[var(--radius-md)] bg-[var(--bg)] border border-[var(--border)]" />
        </div>
      );
    }

    if (mock === 'board') {
      return (
        <div className="grid grid-cols-3 gap-2">
          {[0, 1, 2].map((col) => (
            <div key={col} className="space-y-2">
              <div className="h-2 rounded-full bg-[var(--text)]/25 w-2/3" />
              <div className="h-10 rounded-[var(--radius-sm)] bg-[var(--bg)] border border-[var(--border)]" />
              <div className="h-10 rounded-[var(--radius-sm)] bg-[var(--bg)] border border-[var(--border)]" />
            </div>
          ))}
        </div>
      );
    }

    if (mock === 'finance') {
      return (
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-2">
            {[0, 1, 2].map((card) => <div key={card} className="h-10 rounded-[var(--radius-sm)] bg-[var(--bg)] border border-[var(--border)]" />)}
          </div>
          <div className="h-16 rounded-[var(--radius-md)] bg-[linear-gradient(135deg,var(--primary-muted),transparent)] border border-[var(--border)]" />
        </div>
      );
    }

    if (mock === 'portal') {
      return (
        <div className="grid grid-cols-[0.8fr_1.2fr] gap-3">
          <div className="rounded-[var(--radius-md)] bg-[var(--primary-muted)] p-3 space-y-2">
            <div className="h-8 w-8 rounded-full bg-[var(--primary)]/35" />
            <div className="h-2 rounded-full bg-[var(--primary)]/35" />
          </div>
          <div className="space-y-2">
            <div className="h-7 rounded-[var(--radius-sm)] bg-[var(--bg)] border border-[var(--border)]" />
            <div className="h-7 rounded-[var(--radius-sm)] bg-[var(--bg)] border border-[var(--border)]" />
            <div className="h-7 rounded-[var(--radius-sm)] bg-[var(--bg)] border border-[var(--border)]" />
          </div>
        </div>
      );
    }

    return (
      <div className="text-center py-2">
        <div className="mx-auto w-12 h-12 rounded-[var(--radius-lg)] bg-[var(--primary-muted)] flex items-center justify-center text-[var(--primary)]">
          <Icons.FolderPlus size={24} />
        </div>
        <div className="h-2 rounded-full bg-[var(--text)]/25 w-1/2 mx-auto mt-4" />
        <div className="h-2 rounded-full bg-[var(--border-muted)] w-2/3 mx-auto mt-2" />
      </div>
    );
  };

  return (
    <div className={`flex flex-col h-full bg-[#111422] rounded-r-xl overflow-hidden border-l border-[#202538] relative ${inspectMode ? 'inspect-active' : ''}`}>
      {/* Dynamic Inspector Styles */}
      <style dangerouslySetInnerHTML={{ __html: `
        .inspect-active .inspect-element {
          position: relative;
          cursor: pointer !important;
          transition: outline 0.12s ease, box-shadow 0.12s ease;
        }
        .inspect-active .inspect-element:hover {
          outline: 2px solid var(--primary) !important;
          outline-offset: 2px;
          box-shadow: 0 0 0 6px rgba(98, 113, 243, 0.25);
          z-index: 40;
        }
        .inspect-active .inspect-element:hover::after {
          content: attr(data-inspect-label);
          position: absolute;
          top: -20px;
          left: 0;
          background: var(--primary);
          color: #ffffff;
          font-size: 8px;
          font-weight: 700;
          font-family: monospace;
          padding: 2px 6px;
          border-radius: 3px;
          white-space: nowrap;
          z-index: 50;
          pointer-events: none;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
      `}} />

      {/* Workspace Document Tabs */}
      <div className="bg-[#121625] border-b border-[#202538] select-none shrink-0 flex items-center justify-between px-3 h-11">
        {/* Document Tab Row */}
        <div className="flex items-center h-full overflow-x-auto no-scrollbar">
          {orderedTabs.map((tab) => {
            const isSelected = activeTab === tab.key;
            const isRecommended = recommendedTabSet.has(tab.key);
            const TabIcon = (Icons as any)[tab.iconName] || Icons.HelpCircle;
            return (
              <button
                key={tab.key}
                disabled={inspectMode}
                onClick={() => setActiveTab(tab.key)}
                className={`h-full px-4 text-xs font-medium transition-all flex items-center gap-2 border-r border-[#202538] relative ${
                  inspectMode ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'
                } ${
                  isSelected
                    ? 'bg-[#111422] text-[var(--primary)] font-semibold border-b-2 border-b-[var(--primary)]'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-[#1a1e30]'
                }`}
              >
                <TabIcon size={12} className={isSelected ? 'text-[var(--primary)]' : 'text-gray-500'} />
                <span>{tab.name}</span>
                {isRecommended && (
                  <span className="text-[8px] px-1 py-0.5 rounded bg-[var(--primary)]/15 text-[var(--primary)] font-black uppercase">
                    Pick
                  </span>
                )}
                {isSelected && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary)] ml-1" />
                )}
              </button>
            );
          })}
        </div>

        {/* Workspace Labels/Actions */}
        <div className="flex items-center gap-3 text-[10px] font-mono shrink-0 pl-2">
          <div className="hidden xl:flex items-center gap-1 bg-[#0c0f1b] border border-[#242b47] rounded-lg p-0.5 font-sans">
            {viewportOptions.map((item) => {
              const Icon = item.icon;
              const isActive = previewViewport === item.key;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setPreviewViewport(item.key)}
                  className={`px-2 py-1 rounded-md flex items-center gap-1 text-[10px] font-bold transition-all ${
                    isActive
                      ? 'bg-[#1a1f35] text-[var(--primary)]'
                      : 'text-gray-500 hover:text-gray-200 hover:bg-[#161b2d]'
                  }`}
                  title={`Preview ${item.label} width`}
                >
                  <Icon size={11} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Inspect Mode Toggle */}
          <button
            onClick={() => setInspectMode(!inspectMode)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded border transition-all cursor-pointer font-sans font-bold uppercase tracking-wider ${
              inspectMode 
                ? 'bg-[var(--primary)] text-white border-[var(--primary)] shadow-md animate-pulse'
                : 'bg-[#1a1e32] text-gray-400 border-[#242b47] hover:text-white hover:bg-[#202640]'
            }`}
            title="Toggle Live Canvas Inspector Mode"
          >
            <Icons.MousePointerClick size={12} />
            <span>Inspector: {inspectMode ? 'ON' : 'OFF'}</span>
          </button>

          <span className="text-gray-500 uppercase tracking-widest">Canvas Studio</span>
          <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
        </div>
      </div>

      {/* Main Preview Container */}
      <div 
        className="flex-1 p-6 overflow-y-auto transition-all duration-300 relative"
        style={
          detail.colour_tokens.glass_enabled
            ? {
                backgroundImage: 'radial-gradient(circle at 15% 25%, rgba(98, 113, 243, 0.4) 0%, transparent 35%), radial-gradient(circle at 85% 75%, rgba(220, 102, 197, 0.4) 0%, transparent 40%), radial-gradient(circle at 50% 50%, rgba(91, 234, 135, 0.15) 0%, transparent 50%)',
                backgroundSize: 'cover',
              }
            : undefined
        }
      >
        <div
          className={`preview-scope transition-all duration-300 mx-auto relative ${
            previewViewport === 'desktop'
              ? 'min-h-full'
              : 'min-h-full border border-[#2a3150] rounded-2xl shadow-2xl overflow-hidden bg-[var(--bg-dark)]'
          }`}
          style={{ width: selectedViewport.width, maxWidth: '100%' }}
        >
          {previewViewport !== 'desktop' && (
            <div className="h-8 px-3 border-b border-[#2a3150] bg-[#0c0f1b] text-[10px] text-gray-400 font-mono flex items-center justify-between">
              <span>{selectedViewport.label} preview</span>
              <span>{selectedViewport.width}</span>
            </div>
          )}
          <div className={previewViewport === 'desktop' ? '' : 'p-4'}>
            <div className="mb-5 p-3 bg-[var(--bg-light)] border border-[var(--border)] rounded-[var(--radius-md)] shadow-[var(--shadow-card)] flex flex-col xl:flex-row xl:items-center xl:justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-[var(--primary)]">
                  <Icons.Route size={13} />
                  Blueprint preview path
                </div>
                <p className="text-xs text-[var(--text-muted)] mt-1">
                  Recommended for <span className="font-bold text-[var(--text)]">{blueprintScreenSet}</span> on <span className="font-bold text-[var(--text)]">{blueprintTargetStack}</span>.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] px-2.5 py-1 rounded-full bg-[var(--primary-muted)] text-[var(--primary)] font-bold">
                  {starterTemplateRoute}
                </span>
                {recommendedTabs.slice(0, 4).map((tabKey) => {
                  const tab = tabDefinitions.find((item) => item.key === tabKey);
                  return tab ? (
                    <button
                      key={tab.key}
                      type="button"
                      disabled={inspectMode}
                      onClick={() => setActiveTab(tab.key)}
                      className="text-[10px] px-2 py-1 rounded-full border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--primary)] hover:border-[var(--primary)] transition-all disabled:opacity-50"
                    >
                      {tab.name.replace('.tsx', '')}
                    </button>
                  ) : null;
                })}
              </div>
            </div>
        
        {/* TAB 1: ADMIN DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="anim-fade-in space-y-6">
            {/* Topbar Mock */}
            <div className="flex justify-between items-center pb-4 border-b border-[var(--border-muted)] h-[var(--topbar-height)]">
              <div className="flex items-center gap-3">
                {renderMappedIcon('Dashboard', 'text-[var(--primary)]', '24px')}
                <h1 className="text-xl font-bold tracking-tight select-none">{detail.theme.name} Command</h1>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <input
                    type="text"
                    disabled={inspectMode}
                    placeholder="Search console..."
                    className="w-48 px-3 py-1.5 text-xs bg-[var(--bg-light)] border border-[var(--border-muted)] rounded-[var(--radius-sm)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                  />
                  <div className="absolute right-2.5 top-2">
                    {renderMappedIcon('Search', 'w-3 h-3')}
                  </div>
                </div>
                <button 
                  onClick={(e) => handleInspectClick(e, 4, 'slider-radius-sm')}
                  data-inspect-label="Small Corner: Setup Icon"
                  className="inspect-element p-1.5 bg-[var(--bg-light)] border border-[var(--border-muted)] rounded-[var(--radius-sm)] hover:bg-[var(--primary-muted)] transition-all"
                >
                  {renderMappedIcon('Setup', 'w-4 h-4')}
                </button>
              </div>
            </div>

            {/* Metrics cards grid */}
            <div 
              onClick={(e) => handleInspectClick(e, 3, 'slider-grid-gap')}
              data-inspect-label="Spacing: Grid Gap"
              className="inspect-element grid grid-cols-1 md:grid-cols-3 gap-[var(--dashboard-grid-gap)]"
            >
              <div 
                onClick={(e) => handleInspectClick(e, 4, 'slider-radius-lg')}
                data-inspect-label="Card: Large Corner & Padding"
                className="inspect-element p-[var(--card-padding)] bg-[var(--bg-light)] border border-[var(--border)] rounded-[var(--radius-lg)] shadow-[var(--shadow-card)] card-hover-lift transition-all"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs text-[var(--text-muted)] font-medium">Monthly Accounts</p>
                    <h3 className="text-2xl font-bold mt-1">$45,231</h3>
                  </div>
                  <div className="p-2 bg-[var(--primary-muted)] rounded-[var(--radius-sm)]">
                    {renderMappedIcon('Finance')}
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-1.5 text-xs text-[var(--success)]">
                  {renderMappedIcon('Success', 'w-3.5 h-3.5')}
                  <span>+12.4% increase</span>
                </div>
              </div>

              <div 
                onClick={(e) => handleInspectClick(e, 4, 'slider-radius-lg')}
                data-inspect-label="Card: Large Corner & Padding"
                className="inspect-element p-[var(--card-padding)] bg-[var(--bg-light)] border border-[var(--border)] rounded-[var(--radius-lg)] shadow-[var(--shadow-card)] card-hover-lift transition-all"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs text-[var(--text-muted)] font-medium">Active Members</p>
                    <h3 className="text-2xl font-bold mt-1">2,341</h3>
                  </div>
                  <div className="p-2 bg-[var(--primary-muted)] rounded-[var(--radius-sm)]">
                    {renderMappedIcon('Users')}
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-1.5 text-xs text-[var(--success)]">
                  {renderMappedIcon('Success', 'w-3.5 h-3.5')}
                  <span>+8.2% new signs</span>
                </div>
              </div>

              <div 
                onClick={(e) => handleInspectClick(e, 4, 'slider-radius-lg')}
                data-inspect-label="Card: Large Corner & Padding"
                className="inspect-element p-[var(--card-padding)] bg-[var(--bg-light)] border border-[var(--border)] rounded-[var(--radius-lg)] shadow-[var(--shadow-card)] card-hover-lift transition-all"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs text-[var(--text-muted)] font-medium">Completion Rate</p>
                    <h3 className="text-2xl font-bold mt-1">94.8%</h3>
                  </div>
                  <div className="p-2 bg-[var(--primary-muted)] rounded-[var(--radius-sm)]">
                    {renderMappedIcon('Reports')}
                  </div>
                </div>
                <div className="mt-4">
                  <div className="w-full bg-[var(--bg-dark)] h-1.5 rounded-full overflow-hidden">
                    <div className="bg-[var(--primary)] h-full rounded-full" style={{ width: '94.8%' }}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Dashboard Content split */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div 
                onClick={(e) => handleInspectClick(e, 4, 'slider-radius-lg')}
                data-inspect-label="Card: Medium/Large Radius"
                className="inspect-element lg:col-span-2 p-5 bg-[var(--bg-light)] border border-[var(--border)] rounded-[var(--radius-lg)]"
              >
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-sm font-bold tracking-tight">System Performance Monitor</h3>
                  <button 
                    onClick={(e) => handleInspectClick(e, 4, 'slider-radius-md')}
                    data-inspect-label="Button Corner & Shadow"
                    className="inspect-element px-2.5 py-1 text-xs font-semibold bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)] rounded-[var(--radius-sm)] shadow-[var(--shadow-button)] transition-all"
                  >
                    Generate Report
                  </button>
                </div>
                {/* Mock Chart Area */}
                <div className="h-44 bg-[var(--bg-dark)] rounded-[var(--radius-md)] border border-[var(--border-muted)] flex items-end p-4 gap-2">
                  <div className="bg-[var(--primary-muted)] w-full h-[40%] rounded-[var(--radius-sm)] transition-all hover:bg-[var(--primary)]"></div>
                  <div className="bg-[var(--primary-muted)] w-full h-[60%] rounded-[var(--radius-sm)] transition-all hover:bg-[var(--primary)]"></div>
                  <div className="bg-[var(--primary)] w-full h-[75%] rounded-[var(--radius-sm)] transition-all"></div>
                  <div className="bg-[var(--primary-muted)] w-full h-[45%] rounded-[var(--radius-sm)] transition-all hover:bg-[var(--primary)]"></div>
                  <div className="bg-[var(--primary)] w-full h-[90%] rounded-[var(--radius-sm)] transition-all"></div>
                  <div className="bg-[var(--secondary)] w-full h-[65%] rounded-[var(--radius-sm)] transition-all"></div>
                  <div className="bg-[var(--primary)] w-full h-[100%] rounded-[var(--radius-sm)] transition-all"></div>
                </div>
              </div>

              {/* Side activities */}
              <div 
                onClick={(e) => handleInspectClick(e, 4, 'slider-radius-lg')}
                data-inspect-label="Card: Spacing & Shadow"
                className="inspect-element p-5 bg-[var(--bg-light)] border border-[var(--border)] rounded-[var(--radius-lg)] space-y-4"
              >
                <h3 className="text-sm font-bold tracking-tight">Recent Alerts</h3>
                <div className="space-y-3">
                  <div 
                    onClick={(e) => handleInspectClick(e, 1, 'colour_tokens')}
                    data-inspect-label="Color & Icon System"
                    className="inspect-element flex items-start gap-2.5 p-2 bg-[var(--bg-dark)] border-l-2 border-[var(--danger)] rounded-r-[var(--radius-sm)]"
                  >
                    {renderMappedIcon('Warning', 'text-[var(--danger)] w-4 h-4 mt-0.5')}
                    <div className="text-xs">
                      <p className="font-semibold">CPU limit reached</p>
                      <p className="text-[var(--text-muted)] mt-0.5">Host #12 reported 99% usage</p>
                    </div>
                  </div>
                  <div 
                    onClick={(e) => handleInspectClick(e, 1, 'colour_tokens')}
                    data-inspect-label="Color & Icon System"
                    className="inspect-element flex items-start gap-2.5 p-2 bg-[var(--bg-dark)] border-l-2 border-[var(--success)] rounded-r-[var(--radius-sm)]"
                  >
                    {renderMappedIcon('Success', 'text-[var(--success)] w-4 h-4 mt-0.5')}
                    <div className="text-xs">
                      <p className="font-semibold">Backup finished</p>
                      <p className="text-[var(--text-muted)] mt-0.5">Database storage synced</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: DATA TABLE */}
        {activeTab === 'table' && (
          <div className="anim-fade-in space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-2">
              <div>
                <h2 className="text-lg font-bold tracking-tight">Customer Database</h2>
                <p className="text-xs text-[var(--text-muted)]">Active records and status monitoring</p>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={(e) => handleInspectClick(e, 4, 'slider-radius-md')}
                  data-inspect-label="Button Styles"
                  className="inspect-element px-3 py-1.5 text-xs bg-[var(--bg-light)] border border-[var(--border)] text-[var(--text)] hover:bg-[var(--primary-muted)] rounded-[var(--radius-sm)] flex items-center gap-1.5 transition-all"
                >
                  {renderMappedIcon('Filter', 'w-3.5 h-3.5')}
                  Filter
                </button>
                <button 
                  onClick={(e) => handleInspectClick(e, 4, 'slider-radius-md')}
                  data-inspect-label="Button Styles"
                  className="inspect-element px-3 py-1.5 text-xs bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)] rounded-[var(--radius-sm)] shadow-[var(--shadow-button)] flex items-center gap-1.5 transition-all"
                >
                  {renderMappedIcon('Export', 'w-3.5 h-3.5')}
                  Export CSV
                </button>
              </div>
            </div>

            {/* Table layout */}
            <div 
              onClick={(e) => handleInspectClick(e, 3, 'slider-table-padding')}
              data-inspect-label="Table Layout & Cell Padding"
              className="inspect-element overflow-x-auto bg-[var(--bg-light)] border border-[var(--border)] rounded-[var(--radius-lg)]"
            >
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[var(--border)] bg-[var(--bg-dark)]">
                    <th style={{ padding: detail.spacing_tokens.table_cell_padding }} className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Client</th>
                    <th style={{ padding: detail.spacing_tokens.table_cell_padding }} className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Status</th>
                    <th style={{ padding: detail.spacing_tokens.table_cell_padding }} className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Date Joined</th>
                    <th style={{ padding: detail.spacing_tokens.table_cell_padding }} className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-muted)]">
                  <tr className="hover:bg-[var(--bg-dark)] transition-colors duration-150">
                    <td style={{ padding: detail.spacing_tokens.table_cell_padding }} className="text-xs">
                      <p className="font-semibold text-sm">Amara Vance</p>
                      <p className="text-[var(--text-muted)] text-[10px]">amara@company.io</p>
                    </td>
                    <td style={{ padding: detail.spacing_tokens.table_cell_padding }}>
                      <span 
                        onClick={(e) => handleInspectClick(e, 4, 'slider-radius-sm')}
                        data-inspect-label="Badge Corner: Small Radius"
                        className="inspect-element inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold uppercase rounded-full bg-[var(--success)] text-[var(--bg-dark)]"
                      >
                        {renderMappedIcon('Success', 'w-3 h-3 text-[var(--bg-dark)]', '12px')}
                        Active
                      </span>
                    </td>
                    <td style={{ padding: detail.spacing_tokens.table_cell_padding }} className="text-xs text-[var(--text-muted)]">June 12, 2026</td>
                    <td style={{ padding: detail.spacing_tokens.table_cell_padding }} className="text-right">
                      <div className="inline-flex gap-2">
                        <button 
                          onClick={(e) => handleInspectClick(e, 4, 'slider-radius-md')}
                          data-inspect-label="Button Corner"
                          className="inspect-element p-1 hover:bg-[var(--primary-muted)] rounded-[var(--radius-sm)]"
                        >
                          {renderMappedIcon('Edit', 'w-3.5 h-3.5')}
                        </button>
                        <button 
                          onClick={(e) => handleInspectClick(e, 4, 'slider-radius-md')}
                          data-inspect-label="Button Corner"
                          className="inspect-element p-1 hover:bg-[var(--danger)] hover:text-white rounded-[var(--radius-sm)] text-[var(--danger)]"
                        >
                          {renderMappedIcon('Delete', 'w-3.5 h-3.5')}
                        </button>
                      </div>
                    </td>
                  </tr>

                  <tr className="hover:bg-[var(--bg-dark)] transition-colors duration-150">
                    <td style={{ padding: detail.spacing_tokens.table_cell_padding }} className="text-xs">
                      <p className="font-semibold text-sm">Marcus Drake</p>
                      <p className="text-[var(--text-muted)] text-[10px]">marcus@drake.tech</p>
                    </td>
                    <td style={{ padding: detail.spacing_tokens.table_cell_padding }}>
                      <span 
                        onClick={(e) => handleInspectClick(e, 4, 'slider-radius-sm')}
                        data-inspect-label="Badge Corner: Small Radius"
                        className="inspect-element inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold uppercase rounded-full bg-[var(--warning)] text-[var(--bg-dark)]"
                      >
                        {renderMappedIcon('Warning', 'w-3 h-3 text-[var(--bg-dark)]', '12px')}
                        Pending
                      </span>
                    </td>
                    <td style={{ padding: detail.spacing_tokens.table_cell_padding }} className="text-xs text-[var(--text-muted)]">June 10, 2026</td>
                    <td style={{ padding: detail.spacing_tokens.table_cell_padding }} className="text-right">
                      <div className="inline-flex gap-2">
                        <button 
                          onClick={(e) => handleInspectClick(e, 4, 'slider-radius-md')}
                          data-inspect-label="Button Corner"
                          className="inspect-element p-1 hover:bg-[var(--primary-muted)] rounded-[var(--radius-sm)]"
                        >
                          {renderMappedIcon('Edit', 'w-3.5 h-3.5')}
                        </button>
                        <button 
                          onClick={(e) => handleInspectClick(e, 4, 'slider-radius-md')}
                          data-inspect-label="Button Corner"
                          className="inspect-element p-1 hover:bg-[var(--danger)] hover:text-white rounded-[var(--radius-sm)] text-[var(--danger)]"
                        >
                          {renderMappedIcon('Delete', 'w-3.5 h-3.5')}
                        </button>
                      </div>
                    </td>
                  </tr>

                  <tr className="hover:bg-[var(--bg-dark)] transition-colors duration-150">
                    <td style={{ padding: detail.spacing_tokens.table_cell_padding }} className="text-xs">
                      <p className="font-semibold text-sm">Elena Rostova</p>
                      <p className="text-[var(--text-muted)] text-[10px]">elena@rostova.org</p>
                    </td>
                    <td style={{ padding: detail.spacing_tokens.table_cell_padding }}>
                      <span 
                        onClick={(e) => handleInspectClick(e, 4, 'slider-radius-sm')}
                        data-inspect-label="Badge Corner: Small Radius"
                        className="inspect-element inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold uppercase rounded-full bg-[var(--danger)] text-white"
                      >
                        {renderMappedIcon('Warning', 'w-3 h-3 text-white', '12px')}
                        Suspended
                      </span>
                    </td>
                    <td style={{ padding: detail.spacing_tokens.table_cell_padding }} className="text-xs text-[var(--text-muted)]">May 28, 2026</td>
                    <td style={{ padding: detail.spacing_tokens.table_cell_padding }} className="text-right">
                      <div className="inline-flex gap-2">
                        <button 
                          onClick={(e) => handleInspectClick(e, 4, 'slider-radius-md')}
                          data-inspect-label="Button Corner"
                          className="inspect-element p-1 hover:bg-[var(--primary-muted)] rounded-[var(--radius-sm)]"
                        >
                          {renderMappedIcon('Edit', 'w-3.5 h-3.5')}
                        </button>
                        <button 
                          onClick={(e) => handleInspectClick(e, 4, 'slider-radius-md')}
                          data-inspect-label="Button Corner"
                          className="inspect-element p-1 hover:bg-[var(--danger)] hover:text-white rounded-[var(--radius-sm)] text-[var(--danger)]"
                        >
                          {renderMappedIcon('Delete', 'w-3.5 h-3.5')}
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex justify-between items-center text-xs text-[var(--text-muted)] mt-4">
              <span>Showing 3 of 48 clients</span>
              <div className="inline-flex gap-1">
                <button className="px-2.5 py-1 bg-[var(--bg-light)] border border-[var(--border)] rounded-[var(--radius-sm)] hover:bg-[var(--primary-muted)] transition-all">Prev</button>
                <button className="px-2.5 py-1 bg-[var(--primary)] text-white rounded-[var(--radius-sm)]">1</button>
                <button className="px-2.5 py-1 bg-[var(--bg-light)] border border-[var(--border)] rounded-[var(--radius-sm)] hover:bg-[var(--primary-muted)] transition-all">2</button>
                <button className="px-2.5 py-1 bg-[var(--bg-light)] border border-[var(--border)] rounded-[var(--radius-sm)] hover:bg-[var(--primary-muted)] transition-all">Next</button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: DATA CAPTURE FORM */}
        {activeTab === 'form' && (
          <div 
            onClick={(e) => handleInspectClick(e, 4, 'slider-radius-lg')}
            data-inspect-label="Form Card Corner"
            className="inspect-element max-w-xl mx-auto p-6 bg-[var(--bg-light)] border border-[var(--border)] rounded-[var(--radius-lg)] shadow-[var(--shadow-card)]"
          >
            <h2 className="text-lg font-bold tracking-tight mb-4">Create Configuration Profile</h2>
            <form onSubmit={(e) => e.preventDefault()} 
              onClick={(e) => handleInspectClick(e, 3, 'slider-form-gap')}
              data-inspect-label="Form Element Spacing Gaps"
              className="inspect-element space-y-[var(--form-gap)]"
            >
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-1.5">Profile Name</label>
                <input
                  type="text"
                  disabled={inspectMode}
                  placeholder="e.g. Standard Web Nodes"
                  className="w-full px-3 py-2 bg-[var(--bg-dark)] border border-[var(--border)] rounded-[var(--radius-sm)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)] focus:border-[var(--primary)] text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-1.5">Node Location</label>
                  <select 
                    disabled={inspectMode}
                    className="w-full px-3 py-2 bg-[var(--bg-dark)] border border-[var(--border)] rounded-[var(--radius-sm)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)] text-sm text-[var(--text)]"
                  >
                    <option>US-East (Virginia)</option>
                    <option>EU-West (Frankfurt)</option>
                    <option>AP-South (Mumbai)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-1.5">Minimum Capacity</label>
                  <div className="flex items-center bg-[var(--bg-dark)] border border-[var(--border)] rounded-[var(--radius-sm)] overflow-hidden w-full h-[38px]">
                    <button
                      type="button"
                      disabled={inspectMode}
                      onClick={() => setCapacityValue(Math.max(1, capacityValue - 1))}
                      className="px-3 h-full hover:bg-[var(--border-muted)] text-[var(--text)] transition-colors border-r border-[var(--border)] text-sm font-bold disabled:opacity-50 cursor-pointer"
                    >
                      -
                    </button>
                    <span className="flex-1 text-center text-sm font-semibold select-none">{capacityValue}</span>
                    <button
                      type="button"
                      disabled={inspectMode}
                      onClick={() => setCapacityValue(capacityValue + 1)}
                      className="px-3 h-full hover:bg-[var(--border-muted)] text-[var(--text)] transition-colors border-l border-[var(--border)] text-sm font-bold cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-1.5">Server Environment</label>
                  <div className="flex p-0.5 bg-[var(--bg-dark)] border border-[var(--border)] rounded-[var(--radius-sm)] w-full h-[38px] items-center">
                    {(['dev', 'staging', 'prod'] as const).map((env) => (
                      <button
                        key={env}
                        type="button"
                        disabled={inspectMode}
                        onClick={() => setServerEnv(env)}
                        className={`flex-1 h-full text-[10px] font-bold rounded-[var(--radius-sm)] transition-all uppercase cursor-pointer ${
                          serverEnv === env
                            ? 'bg-[var(--primary)] text-white shadow-sm'
                            : 'text-[var(--text-muted)] hover:text-[var(--text)]'
                        }`}
                      >
                        {env}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-1.5">Activation Date</label>
                  <input
                    type="date"
                    disabled={inspectMode}
                    defaultValue="2026-06-14"
                    className="w-full px-3 py-2 bg-[var(--bg-dark)] border border-[var(--border)] rounded-[var(--radius-sm)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)] text-sm text-[var(--text)] h-[38px] scheme-dark"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-1.5">System Priority Rating</label>
                <div className="flex items-center gap-1.5 py-1">
                  {[1, 2, 3, 4, 5].map((star) => {
                    const isFilled = hoverRating !== null ? star <= hoverRating : star <= ratingValue;
                    return (
                      <button
                        key={star}
                        type="button"
                        disabled={inspectMode}
                        onClick={() => setRatingValue(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(null)}
                        className="transition-all duration-[var(--duration-fast)] ease-[var(--ease-standard)] hover:scale-125 focus:outline-none cursor-pointer"
                        style={{ color: isFilled ? 'var(--primary)' : 'var(--border)' }}
                      >
                        <Icons.Star size={16} fill={isFilled ? 'currentColor' : 'transparent'} />
                      </button>
                    );
                  })}
                  <span className="text-[10px] text-[var(--text-muted)] ml-2 font-semibold">Priority: {ratingValue}/5</span>
                </div>
              </div>

              {/* Toggle switch */}
              <div className="flex items-center justify-between py-2 border-t border-[var(--border-muted)] mt-2">
                <div>
                  <p className="text-sm font-semibold">Enable Automated Auto-scaling</p>
                  <p className="text-xs text-[var(--text-muted)]">Scale nodes automatically on traffic spikes</p>
                </div>
                <button
                  type="button"
                  onClick={(e) => handleInspectClick(e, 4, 'slider-radius-sm')}
                  data-inspect-label="Toggle: Small Corner Radius"
                  className="inspect-element w-10 h-6 bg-[var(--primary)] rounded-full p-0.5 flex justify-end cursor-pointer focus:outline-none"
                >
                  <span className="w-5 h-5 bg-white rounded-full shadow"></span>
                </button>
              </div>

              {/* Radio options */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-2">Priority Level</label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
                    <input type="radio" disabled={inspectMode} name="priority" defaultChecked className="accent-[var(--primary)]" />
                    <span>Low Priority (Slower provisioning)</span>
                  </label>
                  <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
                    <input type="radio" disabled={inspectMode} name="priority" className="accent-[var(--primary)]" />
                    <span>High Priority (Instant boot, higher cost)</span>
                  </label>
                </div>
              </div>

              {/* Footer buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-[var(--border-muted)] mt-4">
                <button 
                  onClick={(e) => handleInspectClick(e, 4, 'slider-radius-md')}
                  data-inspect-label="Button Corner"
                  className="inspect-element px-4 py-2 text-xs font-semibold bg-[var(--bg-dark)] border border-[var(--border)] hover:bg-[var(--border-muted)] rounded-[var(--radius-sm)] transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={(e) => handleInspectClick(e, 4, 'slider-radius-md')}
                  data-inspect-label="Button Corner & Shadow"
                  className="inspect-element px-4 py-2 text-xs font-semibold bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)] rounded-[var(--radius-sm)] shadow-[var(--shadow-button)] flex items-center gap-1.5 transition-all"
                >
                  {renderMappedIcon('Save', 'w-3.5 h-3.5')}
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB 4: MODAL POPUP */}
        {activeTab === 'modal' && (
          <div 
            onClick={(e) => handleInspectClick(e, 4, 'slider-radius-xl')}
            data-inspect-label="Modal Border & Corner"
            className="inspect-element flex flex-col items-center justify-center p-12 bg-[var(--bg-dark)] border border-[var(--border-muted)] rounded-[var(--radius-xl)]"
          >
            <p className="text-sm text-[var(--text-muted)] mb-4 text-center">Click the button below to preview your dialog box elevation and shadow.</p>
            <button
              onClick={(e) => {
                if (inspectMode) {
                  handleInspectClick(e, 4, 'slider-radius-md');
                } else {
                  setShowModal(true);
                }
              }}
              data-inspect-label="Button Corner & Shadow"
              className="inspect-element px-5 py-2.5 bg-[var(--primary)] text-white font-semibold rounded-[var(--radius-md)] shadow-[var(--shadow-button)] btn-hover-scale btn-press-scale transition-all"
            >
              Open Dialog Box
            </button>

            {showModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 anim-fade-in">
                <div 
                  onClick={(e) => handleInspectClick(e, 4, 'slider-radius-xl')}
                  data-inspect-label="Modal Dialog Corner"
                  className="inspect-element anim-fade-in-scale w-full max-w-md p-6 bg-[var(--bg-light)] border border-[var(--border-highlight)] rounded-[var(--radius-lg)] shadow-[var(--shadow-modal)] relative"
                >
                  <button
                    onClick={() => setShowModal(false)}
                    className="absolute right-4 top-4 p-1 rounded-full hover:bg-[var(--border-muted)] text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
                  >
                    <Icons.X size={16} />
                  </button>

                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-[var(--danger)]/20 text-[var(--danger)] rounded-full">
                      {renderMappedIcon('Warning', 'w-6 h-6 text-[var(--danger)]', '24px')}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold">Destroy Database Server?</h3>
                      <p className="text-xs text-[var(--text-muted)] mt-1">
                        Are you sure you want to delete database node #US-12? This action is permanent and cannot be undone. All customer table indices will be lost.
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-[var(--border-muted)]">
                    <button
                      onClick={() => setShowModal(false)}
                      className="px-4 py-2 text-xs font-semibold bg-[var(--bg-dark)] border border-[var(--border)] hover:bg-[var(--border-muted)] rounded-[var(--radius-sm)]"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => setShowModal(false)}
                      className="px-4 py-2 text-xs font-semibold bg-[var(--danger)] text-white hover:opacity-90 rounded-[var(--radius-sm)] shadow-[var(--shadow-button)]"
                    >
                      Destroy Node
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 5: REPORT PAGE */}
        {activeTab === 'report' && (
          <div 
            onClick={(e) => handleInspectClick(e, 2, 'typography_tokens')}
            data-inspect-label="Typography Font & Scale"
            className="inspect-element max-w-3xl mx-auto p-8 bg-[var(--bg-light)] border border-[var(--border)] rounded-[var(--radius-lg)] shadow-[var(--shadow-card)] space-y-6 text-left"
          >
            <header className="border-b border-[var(--border-muted)] pb-4">
              <h1 className="text-3xl font-extrabold tracking-tight mb-2">Annual Architecture Review</h1>
              <p className="text-sm text-[var(--text-muted)]">Security Audit and Style Consistency Guidelines</p>
            </header>

            <section className="space-y-3">
              <h2 className="text-xl font-bold tracking-tight text-[var(--primary)]">1. Executive Summary</h2>
              <p className="text-sm leading-relaxed text-[var(--text)]">
                Our application style builder establishes standardized visual rules for developer deployment. Implementing a shared design schema ensures compliance with contrast ratios and increases coding throughput.
              </p>
              <p className="text-sm leading-relaxed text-[var(--text)]">
                To fulfill accessibility principles, developers must ensure contrast is monitored before pushing code.
              </p>
            </section>

            <blockquote className="border-l-4 border-[var(--primary)] p-4 bg-[var(--bg-dark)] text-sm rounded-r-[var(--radius-sm)] italic">
              "Consistency is not simply about colors; it is about establishing systematic rules that guide user interactions."
            </blockquote>

            <section className="space-y-2">
              <h2 className="text-xl font-bold tracking-tight text-[var(--primary)]">2. Proposed Directives</h2>
              <ul className="list-disc pl-5 text-sm space-y-1 text-[var(--text)]">
                <li>Verify text readability in dark themes.</li>
                <li>Avoid hard-coded layout parameters; prefer custom spacers (`var(--space-sm)`).</li>
                <li>Configure hover states explicitly on all buttons.</li>
              </ul>
            </section>
          </div>
        )}

        {/* TAB 6: LOGIN PAGE */}
        {activeTab === 'login' && (
          <div className="anim-fade-in flex flex-col items-center justify-center p-12">
            <div 
              onClick={(e) => handleInspectClick(e, 4, 'slider-radius-lg')}
              data-inspect-label="Card: Large Radius"
              className="inspect-element w-full max-w-sm p-6 bg-[var(--bg-light)] border border-[var(--border)] rounded-[var(--radius-lg)] shadow-[var(--shadow-card)] space-y-6"
            >
              <div className="text-center">
                <div className="w-12 h-12 bg-[var(--primary-muted)] rounded-full flex items-center justify-center mx-auto mb-3">
                  {renderMappedIcon('Dashboard', 'text-[var(--primary)] w-6 h-6', '24px')}
                </div>
                <h2 className="text-lg font-bold">Welcome back</h2>
                <p className="text-xs text-[var(--text-muted)]">Enter credentials to log into your console</p>
              </div>

              <div className="space-y-4">
                <div>
                  <input
                    type="email"
                    disabled={inspectMode}
                    placeholder="Email address"
                    className="w-full px-3 py-2 bg-[var(--bg-dark)] border border-[var(--border)] rounded-[var(--radius-sm)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)] text-sm"
                  />
                </div>
                <div>
                  <input
                    type="password"
                    disabled={inspectMode}
                    placeholder="Password"
                    className="w-full px-3 py-2 bg-[var(--bg-dark)] border border-[var(--border)] rounded-[var(--radius-sm)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)] text-sm"
                  />
                </div>

                <div className="flex justify-between items-center text-xs">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input type="checkbox" disabled={inspectMode} className="accent-[var(--primary)]" />
                    <span>Keep logged in</span>
                  </label>
                  <a href="#" className="text-[var(--primary)] hover:underline font-semibold">Forgot pass?</a>
                </div>

                <button 
                  onClick={(e) => handleInspectClick(e, 4, 'slider-radius-md')}
                  data-inspect-label="Button Corner & shadow"
                  className="inspect-element w-full py-2.5 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white text-xs font-semibold rounded-[var(--radius-sm)] shadow-[var(--shadow-button)] btn-hover-scale btn-press-scale transition-all"
                >
                  Sign in
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 7: SETTINGS PAGE */}
        {activeTab === 'settings' && (
          <div className="anim-fade-in max-w-xl mx-auto space-y-6 text-left">
            <div>
              <h2 className="text-lg font-bold tracking-tight">System Settings</h2>
              <p className="text-xs text-[var(--text-muted)]">Configure workspace properties and defaults</p>
            </div>

            <div 
              onClick={(e) => handleInspectClick(e, 3, 'slider-card-padding')}
              data-inspect-label="Card Spacing & Padding"
              className="inspect-element bg-[var(--bg-light)] border border-[var(--border)] rounded-[var(--radius-lg)] p-5 space-y-4"
            >
              <div className="flex justify-between items-center pb-3 border-b border-[var(--border-muted)]">
                <div>
                  <p className="text-sm font-semibold">Auto backup databases</p>
                  <p className="text-xs text-[var(--text-muted)]">Perform daily SQLite snapshot backup</p>
                </div>
                <button 
                  onClick={(e) => handleInspectClick(e, 4, 'slider-radius-sm')}
                  data-inspect-label="Small Corner Radius"
                  className="inspect-element w-10 h-6 bg-[var(--primary)] rounded-full p-0.5 flex justify-end cursor-pointer"
                >
                  <span className="w-5 h-5 bg-white rounded-full shadow"></span>
                </button>
              </div>

              <div className="flex justify-between items-center pb-3 border-b border-[var(--border-muted)]">
                <div>
                  <p className="text-sm font-semibold">Export compression</p>
                  <p className="text-xs text-[var(--text-muted)]">Zip output packages automatically</p>
                </div>
                <button 
                  onClick={(e) => handleInspectClick(e, 4, 'slider-radius-sm')}
                  data-inspect-label="Small Corner Radius"
                  className="inspect-element w-10 h-6 bg-[var(--border-muted)] rounded-full p-0.5 flex justify-start cursor-pointer"
                >
                  <span className="w-5 h-5 bg-white rounded-full shadow"></span>
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-1.5">Backup Frequency (Hours)</label>
                <input
                  type="range"
                  min="1"
                  max="48"
                  disabled={inspectMode}
                  defaultValue={24}
                  className="w-full h-1 bg-[var(--bg-dark)] rounded-lg appearance-none cursor-pointer accent-[var(--primary)]"
                />
                <div className="flex justify-between text-[10px] text-[var(--text-muted)] mt-1">
                  <span>1 Hour</span>
                  <span>24 Hours</span>
                  <span>48 Hours</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button 
                onClick={(e) => handleInspectClick(e, 4, 'slider-radius-md')}
                data-inspect-label="Button Corner"
                className="inspect-element px-4 py-2 text-xs font-semibold bg-[var(--bg-light)] border border-[var(--border)] hover:bg-[var(--border-muted)] rounded-[var(--radius-sm)]"
              >
                Restore Factory Defaults
              </button>
              <button 
                onClick={(e) => handleInspectClick(e, 4, 'slider-radius-md')}
                data-inspect-label="Button Corner & shadow"
                className="inspect-element px-4 py-2 text-xs font-semibold bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)] rounded-[var(--radius-sm)] shadow-[var(--shadow-button)]"
              >
                Save Adjustments
              </button>
            </div>
          </div>
        )}

        {/* TAB 8: ALERTS AND STATUS PREVIEW */}
        {activeTab === 'alerts' && (
          <div className="anim-fade-in max-w-xl mx-auto space-y-4">
            <div>
              <h2 className="text-lg font-bold tracking-tight">Alert States</h2>
              <p className="text-xs text-[var(--text-muted)]">Standard system response banner templates (accessible)</p>
            </div>

            {/* DANGER */}
            <div 
              onClick={(e) => handleInspectClick(e, 4, 'slider-radius-md')}
              data-inspect-label="Alert Box Corner"
              className="inspect-element p-4 bg-[var(--danger)]/15 border border-[var(--danger)]/40 rounded-[var(--radius-md)] flex items-start gap-3"
            >
              {renderMappedIcon('Warning', 'text-[var(--danger)] w-5 h-5 mt-0.5', '20px')}
              <div>
                <h4 className="text-sm font-bold text-[var(--danger)]">Execution Error</h4>
                <p className="text-xs text-[var(--text)] mt-0.5">
                  Database transaction failed. Constraint violated: UNIQUE theme id. Please correct values.
                </p>
              </div>
            </div>

            {/* WARNING */}
            <div 
              onClick={(e) => handleInspectClick(e, 4, 'slider-radius-md')}
              data-inspect-label="Alert Box Corner"
              className="inspect-element p-4 bg-[var(--warning)]/15 border border-[var(--warning)]/40 rounded-[var(--radius-md)] flex items-start gap-3"
            >
              {renderMappedIcon('Warning', 'text-[var(--warning)] w-5 h-5 mt-0.5', '20px')}
              <div>
                <h4 className="text-sm font-bold text-[var(--warning)]">Uncommitted Modifications</h4>
                <p className="text-xs text-[var(--text)] mt-0.5">
                  Your local color overrides have not been synchronized with the SQLite instance.
                </p>
              </div>
            </div>

            {/* SUCCESS */}
            <div 
              onClick={(e) => handleInspectClick(e, 4, 'slider-radius-md')}
              data-inspect-label="Alert Box Corner"
              className="inspect-element p-4 bg-[var(--success)]/15 border border-[var(--success)]/40 rounded-[var(--radius-md)] flex items-start gap-3"
            >
              {renderMappedIcon('Success', 'text-[var(--success)] w-5 h-5 mt-0.5', '20px')}
              <div>
                <h4 className="text-sm font-bold text-[var(--success)]">Time Sync Done</h4>
                <p className="text-xs text-[var(--text)] mt-0.5">
                  Design tokens saved to stylesheet configuration package `style-tokens.json` successfully.
                </p>
              </div>
            </div>

            {/* INFO */}
            <div 
              onClick={(e) => handleInspectClick(e, 4, 'slider-radius-md')}
              data-inspect-label="Alert Box Corner"
              className="inspect-element p-4 bg-[var(--info)]/15 border border-[var(--info)]/40 rounded-[var(--radius-md)] flex items-start gap-3"
            >
              {renderMappedIcon('Info', 'text-[var(--info)] w-5 h-5 mt-0.5', '20px')}
              <div>
                <h4 className="text-sm font-bold text-[var(--info)]">Update Notice</h4>
                <p className="text-xs text-[var(--text)] mt-0.5">
                  A newer package of Lucide icons is ready for compilation in your node environment.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 9: COMPLETE UI STATES */}
        {activeTab === 'states' && (
          <div className="anim-fade-in space-y-6">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold tracking-tight">Complete State System</h2>
                <p className="text-xs text-[var(--text-muted)]">
                  Every exported app template should include these states before business logic is considered complete.
                </p>
              </div>
              <span className="text-[10px] px-2.5 py-1 rounded-full bg-[var(--primary-muted)] text-[var(--primary)] font-bold uppercase self-start md:self-auto">
                AI handoff checklist
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-[var(--dashboard-grid-gap)]">
              <div className="inspect-element p-[var(--card-padding)] bg-[var(--bg-light)] border border-[var(--border)] rounded-[var(--radius-lg)] shadow-[var(--shadow-card)]">
                <div className="flex items-start gap-3">
                  <div className="app-spinner shrink-0" />
                  <div>
                    <h3 className="text-sm font-bold">Loading state</h3>
                    <p className="text-xs text-[var(--text-muted)] mt-1">Keep layout stable while records, charts, or reports load.</p>
                    <div className="mt-4 space-y-2">
                      <div className="h-2.5 rounded-full bg-[var(--border-muted)] animate-pulse" />
                      <div className="h-2.5 w-2/3 rounded-full bg-[var(--border-muted)] animate-pulse" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="inspect-element p-[var(--card-padding)] bg-[var(--bg-light)] border border-dashed border-[var(--border)] rounded-[var(--radius-lg)] text-center">
                <div className="mx-auto w-11 h-11 rounded-[var(--radius-lg)] bg-[var(--primary-muted)] text-[var(--primary)] flex items-center justify-center mb-3">
                  <Icons.FolderOpen size={22} />
                </div>
                <h3 className="text-sm font-bold">Empty state</h3>
                <p className="text-xs text-[var(--text-muted)] mt-1">Explain what is missing and give one clear next action.</p>
                <button className="mt-4 px-3 py-2 text-xs font-bold bg-[var(--primary)] text-white rounded-[var(--radius-sm)] shadow-[var(--shadow-button)]">
                  Create first record
                </button>
              </div>

              <div className="inspect-element p-[var(--card-padding)] bg-[var(--danger)]/12 border border-[var(--danger)]/45 rounded-[var(--radius-lg)]">
                <div className="flex items-start gap-3">
                  <Icons.AlertTriangle size={20} className="text-[var(--danger)] shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-bold text-[var(--danger)]">Error state</h3>
                    <p className="text-xs text-[var(--text)] mt-1">Make errors specific, recoverable, and tied to the failed action.</p>
                    <button className="mt-4 px-3 py-2 text-xs font-bold bg-[var(--danger)] text-white rounded-[var(--radius-sm)]">
                      Retry import
                    </button>
                  </div>
                </div>
              </div>

              <div className="inspect-element p-[var(--card-padding)] bg-[var(--success)]/12 border border-[var(--success)]/45 rounded-[var(--radius-lg)]">
                <div className="flex items-start gap-3">
                  <Icons.CheckCircle2 size={20} className="text-[var(--success)] shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-bold text-[var(--success)]">Success state</h3>
                    <p className="text-xs text-[var(--text)] mt-1">Confirm what changed and where the user can go next.</p>
                    <span className="inline-flex mt-4 px-2 py-1 rounded-full bg-[var(--success)]/15 text-[var(--success)] text-[10px] font-bold uppercase">
                      Saved locally
                    </span>
                  </div>
                </div>
              </div>

              <div className="inspect-element p-[var(--card-padding)] bg-[var(--warning)]/12 border border-[var(--warning)]/45 rounded-[var(--radius-lg)]">
                <div className="flex items-start gap-3">
                  <Icons.AlertCircle size={20} className="text-[var(--warning)] shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-bold text-[var(--warning)]">Warning state</h3>
                    <p className="text-xs text-[var(--text)] mt-1">Warn before a decision becomes destructive or hard to reverse.</p>
                    <div className="mt-4 flex gap-2">
                      <button className="px-3 py-2 text-xs font-bold bg-[var(--warning)] text-black rounded-[var(--radius-sm)]">Review</button>
                      <button className="px-3 py-2 text-xs font-bold border border-[var(--border)] rounded-[var(--radius-sm)]">Dismiss</button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="inspect-element p-[var(--card-padding)] bg-[var(--bg-light)] border border-[var(--border)] rounded-[var(--radius-lg)]">
                <h3 className="text-sm font-bold">Disabled state</h3>
                <p className="text-xs text-[var(--text-muted)] mt-1">Disabled controls should look unavailable and explain why nearby.</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <button disabled className="px-3 py-2 text-xs font-bold bg-[var(--border-muted)] text-[var(--text-muted)] rounded-[var(--radius-sm)] opacity-60 cursor-not-allowed">
                    Export unavailable
                  </button>
                  <span className="text-[10px] text-[var(--text-muted)] self-center">Add at least one screen first.</span>
                </div>
              </div>

              <div className="inspect-element p-[var(--card-padding)] bg-[var(--bg-light)] border border-[var(--border)] rounded-[var(--radius-lg)]">
                <h3 className="text-sm font-bold">Hover, focus, and selected</h3>
                <p className="text-xs text-[var(--text-muted)] mt-1">Interactive states must be visible without changing the design language.</p>
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button className="px-3 py-2 text-xs font-bold border border-[var(--border)] hover:bg-[var(--primary-muted)] hover:text-[var(--primary)] rounded-[var(--radius-sm)] transition-all">
                    Hover me
                  </button>
                  <button className="px-3 py-2 text-xs font-bold border border-[var(--primary)] ring-2 ring-[var(--primary)]/35 rounded-[var(--radius-sm)]">
                    Focused
                  </button>
                  <button className="px-3 py-2 text-xs font-bold bg-[var(--primary-muted)] text-[var(--primary)] border border-[var(--primary)] rounded-[var(--radius-sm)]">
                    Selected
                  </button>
                </div>
              </div>

              <div className="inspect-element p-[var(--card-padding)] bg-[var(--bg-light)] border border-[var(--danger)]/50 rounded-[var(--radius-lg)]">
                <h3 className="text-sm font-bold text-[var(--danger)]">Destructive state</h3>
                <p className="text-xs text-[var(--text-muted)] mt-1">Destructive actions need danger styling, confirmation, and a safe cancel path.</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <button className="px-3 py-2 text-xs font-bold bg-[var(--danger)] text-white rounded-[var(--radius-sm)]">
                    Delete template
                  </button>
                  <button className="px-3 py-2 text-xs font-bold border border-[var(--border)] rounded-[var(--radius-sm)]">
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 10: SCREEN PATTERN LIBRARY */}
        {activeTab === 'patterns' && (
          <div className="anim-fade-in space-y-6">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold tracking-tight">Mobbin-Style Screen Patterns</h2>
                <p className="text-xs text-[var(--text-muted)]">
                  Proven app screens non-coders can choose from before asking AI to build the real template.
                </p>
              </div>
              <span className="text-[10px] px-2.5 py-1 rounded-full bg-[var(--primary-muted)] text-[var(--primary)] font-bold uppercase self-start md:self-auto">
                Template starter map
              </span>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-[var(--dashboard-grid-gap)]">
              {screenPatterns.map((pattern) => {
                const PatternIcon = (Icons as any)[pattern.iconName] || Icons.LayoutTemplate;
                return (
                  <div
                    key={pattern.title}
                    onClick={(e) => handleInspectClick(e, 4, 'slider-radius-md')}
                    data-inspect-label={`${pattern.title} Pattern`}
                    className="inspect-element bg-[var(--bg-light)] border border-[var(--border)] rounded-[var(--radius-lg)] shadow-[var(--shadow-card)] overflow-hidden"
                  >
                    <div className="p-[var(--card-padding)] border-b border-[var(--border)]">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="w-10 h-10 rounded-[var(--radius-md)] bg-[var(--primary-muted)] text-[var(--primary)] flex items-center justify-center shrink-0">
                            <PatternIcon size={19} />
                          </span>
                          <div className="min-w-0">
                            <h3 className="text-sm font-bold truncate">{pattern.title}</h3>
                            <p className="text-[11px] text-[var(--text-muted)] leading-relaxed mt-1">{pattern.useCase}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-[var(--card-padding)] bg-[var(--bg)]/45">
                      <div className="min-h-[128px] rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--bg-light)] p-3">
                        {renderPatternMock(pattern.mock)}
                      </div>
                    </div>

                    <div className="p-[var(--card-padding)] pt-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <button className="px-3 py-2 text-xs font-bold bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white rounded-[var(--radius-sm)] shadow-[var(--shadow-button)] transition-all">
                          {pattern.action}
                        </button>
                        <span className="text-[10px] px-2 py-1 rounded-full border border-[var(--border)] text-[var(--text-muted)] uppercase font-bold">
                          AI-ready
                        </span>
                      </div>
                      <p className="mt-3 text-[11px] leading-relaxed text-[var(--text-muted)]">
                        <span className="font-bold text-[var(--text)]">Pattern note:</span> {pattern.note}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-2 space-y-4">
              <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
                <div>
                  <h3 className="text-base font-bold tracking-tight">Component Pattern Coverage</h3>
                  <p className="text-xs text-[var(--text-muted)]">
                    Reusable building blocks that should appear in exported templates before app-specific features are added.
                  </p>
                </div>
                <span className="text-[10px] px-2.5 py-1 rounded-full border border-[var(--border)] text-[var(--text-muted)] font-bold uppercase self-start md:self-auto">
                  {componentPatterns.length} core patterns
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-[var(--dashboard-grid-gap)]">
                {componentPatterns.map((pattern) => {
                  const ComponentIcon = (Icons as any)[pattern.iconName] || Icons.Box;
                  return (
                    <div
                      key={pattern.title}
                      onClick={(e) => handleInspectClick(e, 4, 'slider-radius-md')}
                      data-inspect-label={`${pattern.title} Component Pattern`}
                      className="inspect-element p-4 bg-[var(--bg-light)] border border-[var(--border)] rounded-[var(--radius-lg)] shadow-[var(--shadow-card)]"
                    >
                      <div className="flex items-start gap-3">
                        <span className="w-9 h-9 rounded-[var(--radius-md)] bg-[var(--primary-muted)] text-[var(--primary)] flex items-center justify-center shrink-0">
                          <ComponentIcon size={17} />
                        </span>
                        <div className="min-w-0">
                          <h4 className="text-sm font-bold truncate">{pattern.title}</h4>
                          <p className="text-[11px] leading-relaxed text-[var(--text-muted)] mt-1">{pattern.role}</p>
                        </div>
                      </div>

                      <div className="mt-4 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--bg)] p-3 space-y-2">
                        {pattern.anatomy.map((item, index) => (
                          <div key={item} className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${index === 0 ? 'bg-[var(--primary)]' : 'bg-[var(--border-muted)]'}`} />
                            <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase">{item}</span>
                            <span className="h-px flex-1 bg-[var(--border-muted)]" />
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

          </div>
        </div>
      </div>

      {/* Floating Action Button (FAB) */}
      {(activeTab === 'dashboard' || activeTab === 'table' || activeTab === 'form' || activeTab === 'settings' || activeTab === 'alerts' || activeTab === 'states') && (
        <button
          key="fab-button"
          type="button"
          disabled={inspectMode}
          onClick={(e) => {
            if (inspectMode) {
              handleInspectClick(e, 4, 'slider-radius-md');
            } else {
              alert('Floating Action Button clicked!');
            }
          }}
          data-inspect-label="FAB: Round Pill & Shadow"
          className="inspect-element absolute bottom-6 right-6 w-12 h-12 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white rounded-full shadow-[var(--shadow-modal)] flex items-center justify-center transition-all duration-[var(--duration-fast)] ease-[var(--ease-bounce)] hover:scale-110 active:scale-95 z-30 cursor-pointer"
        >
          <Icons.Plus size={20} className="text-white" />
        </button>
      )}

    </div>
  );
}
