import React, { useMemo, useState } from 'react';
import {
  Activity,
  History,
  Menu,
  PlaySquare,
  Settings,
  Terminal,
  X,
} from 'lucide-react';
import { ErrorBoundary } from './components/ErrorBoundary';
import { WorkspaceProvider, useWorkspace } from './context/WorkspaceContext';
import { WorkflowWorkspaceView } from './components/WorkflowWorkspaceView';
import { ExecutionHistoryView } from './components/ExecutionHistoryView';
import { AgentSettingsView } from './components/AgentSettingsView';
import { AdminErrorDrawer } from './components/AdminErrorDrawer';
import { DeployGuideModal } from './components/DeployGuideModal';
import { LanguageSwitcher } from './components/LanguageSwitcher';
import { ActiveView, WorkflowRunRecord } from './types/workflow';

function ConsoleShell() {
  const { workspace, errorLogs, t } = useWorkspace();

  const [activeView, setActiveView] = useState<ActiveView>('workspace');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [adminDrawerOpen, setAdminDrawerOpen] = useState(false);
  const [deployModalOpen, setDeployModalOpen] = useState(false);
  const [prefillRun, setPrefillRun] = useState<WorkflowRunRecord | null>(null);

  const openErrorCount = useMemo(
    () => errorLogs.filter((e) => !e.resolved).length,
    [errorLogs]
  );

  const navItems: { id: ActiveView; label: string; icon: React.ReactNode }[] = [
    {
      id: 'workspace',
      label: t.nav.workspace,
      icon: <PlaySquare className="w-4 h-4 shrink-0" />,
    },
    {
      id: 'history',
      label: t.nav.history,
      icon: <History className="w-4 h-4 shrink-0" />,
    },
    {
      id: 'settings',
      label: t.nav.settings,
      icon: <Settings className="w-4 h-4 shrink-0" />,
    },
  ];

  const breadcrumbText =
    activeView === 'workspace'
      ? t.workspace.breadcrumb
      : activeView === 'history'
      ? t.history.breadcrumb
      : t.settings.breadcrumb;

  const handleNavigate = (view: ActiveView, prefill?: WorkflowRunRecord) => {
    if (prefill) {
      setPrefillRun(prefill);
    }
    setActiveView(view);
    setMobileNavOpen(false);
  };

  const sidebarContent = (
    <div className="flex flex-col h-full justify-between p-4 text-slate-200">
      <div className="space-y-6">
        <div className="px-2 pt-1 flex items-center justify-between gap-2">
          <span className="font-display text-lg font-bold tracking-tight text-white whitespace-nowrap shrink-0">
            {t.brandName}
          </span>
          <button
            type="button"
            onClick={() => setMobileNavOpen(false)}
            className="lg:hidden p-1.5 text-slate-400 hover:text-white rounded-md cursor-pointer"
            aria-label={t.common.close}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-2 py-2.5 rounded-lg bg-slate-800/60 border border-slate-800 space-y-0.5">
          <span className="block text-[11px] font-medium text-slate-400">
            {t.nav.workspaceLabel}
          </span>
          <span className="block text-xs font-semibold text-white truncate">
            {workspace?.name || 'PulseFlow Automation Hub'}
          </span>
        </div>

        <nav className="space-y-1" aria-label="Primary navigation">
          {navItems.map((item) => {
            const active = activeView === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavigate(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap cursor-pointer ${
                  active
                    ? 'text-white bg-slate-800'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <span
                  className="shrink-0"
                  style={active ? { color: 'var(--brand-accent)' } : undefined}
                >
                  {item.icon}
                </span>
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="pt-4 border-t border-slate-800 space-y-1">
          <button
            type="button"
            onClick={() => {
              setAdminDrawerOpen(true);
              setMobileNavOpen(false);
            }}
            className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/50 transition-colors whitespace-nowrap cursor-pointer"
          >
            <span className="flex items-center gap-2.5 truncate">
              <Activity className="w-4 h-4 shrink-0" />
              <span className="truncate">{t.nav.adminDrawer}</span>
            </span>
            {openErrorCount > 0 && (
              <span className="font-mono tabular-nums text-[11px] font-semibold text-red-400 shrink-0">
                {openErrorCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              setDeployModalOpen(true);
              setMobileNavOpen(false);
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/50 transition-colors whitespace-nowrap cursor-pointer"
          >
            <Terminal className="w-4 h-4 shrink-0" />
            <span className="truncate">{t.nav.deploymentGuide}</span>
          </button>
        </div>
      </div>

      <div className="space-y-4 pt-4 border-t border-slate-800">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs text-slate-400">{t.common.language}</span>
          <LanguageSwitcher variant="dark" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 shrink-0 bg-slate-900 border-r border-slate-800 sticky top-0 h-screen">
        {sidebarContent}
      </aside>

      {/* Mobile Slide-Over Sidebar */}
      {mobileNavOpen && (
        <div
          className="fixed inset-0 z-50 lg:hidden bg-slate-900/50 flex"
          onClick={() => setMobileNavOpen(false)}
        >
          <aside
            className="w-72 max-w-[85vw] bg-slate-900 h-full"
            onClick={(e) => e.stopPropagation()}
          >
            {sidebarContent}
          </aside>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="sticky top-0 z-30 bg-white border-b border-slate-200 px-4 sm:px-8 py-3.5 flex items-center justify-between gap-6">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileNavOpen(true)}
              className="lg:hidden p-2 -ml-2 text-slate-600 hover:text-slate-900 rounded-lg cursor-pointer"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <span className="text-xs sm:text-sm font-medium text-slate-600 truncate">
              {breadcrumbText}
            </span>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="hidden sm:block">
              <LanguageSwitcher />
            </div>
            <button
              type="button"
              onClick={() => setAdminDrawerOpen(true)}
              className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Activity className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">{t.nav.adminDrawer}</span>
              {openErrorCount > 0 && (
                <span className="font-mono tabular-nums font-semibold text-red-600">
                  {openErrorCount}
                </span>
              )}
            </button>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">
          {activeView === 'workspace' && (
            <WorkflowWorkspaceView
              prefillRun={prefillRun}
              onClearPrefill={() => setPrefillRun(null)}
            />
          )}
          {activeView === 'history' && (
            <ExecutionHistoryView
              onNavigateToWorkspace={(run) => handleNavigate('workspace', run)}
            />
          )}
          {activeView === 'settings' && <AgentSettingsView />}
        </main>
      </div>

      <AdminErrorDrawer open={adminDrawerOpen} onClose={() => setAdminDrawerOpen(false)} />
      <DeployGuideModal open={deployModalOpen} onClose={() => setDeployModalOpen(false)} />
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <WorkspaceProvider>
        <ConsoleShell />
      </WorkspaceProvider>
    </ErrorBoundary>
  );
}
