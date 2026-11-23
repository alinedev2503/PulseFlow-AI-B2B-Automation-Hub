import React, { useMemo, useState } from 'react';
import { Timestamp } from 'firebase/firestore';
import {
  AlertTriangle,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';
import { RunStatus, TemplateId, WorkflowRunRecord } from '../types/workflow';

function formatRunDate(ts: unknown): string {
  if (!ts) return '—';
  let date: Date | null = null;
  if (ts instanceof Timestamp) {
    date = ts.toDate();
  } else if (typeof ts === 'object' && ts !== null && 'seconds' in ts) {
    date = new Date(Number((ts as { seconds: number }).seconds) * 1000);
  }
  if (!date) return '—';
  return date.toLocaleString(undefined, {
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

interface ExecutionHistoryViewProps {
  onNavigateToWorkspace: (prefill?: WorkflowRunRecord) => void;
}

export function ExecutionHistoryView({
  onNavigateToWorkspace,
}: ExecutionHistoryViewProps) {
  const { runs, dataLoading, t, deleteWorkflowRun } = useWorkspace();

  const [searchQuery, setSearchQuery] = useState('');
  const [templateFilter, setTemplateFilter] = useState<'all' | TemplateId>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | RunStatus>('all');
  const [inspectedRun, setInspectedRun] = useState<WorkflowRunRecord | null>(null);

  const filteredRuns = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return runs.filter((run) => {
      if (templateFilter !== 'all' && run.templateId !== templateFilter) return false;
      if (statusFilter !== 'all' && run.status !== statusFilter) return false;
      if (!q) return true;
      return (
        run.inputTitle.toLowerCase().includes(q) ||
        run.inputPayload.companyOrClient.toLowerCase().includes(q) ||
        run.outputJson.classification.toLowerCase().includes(q)
      );
    });
  }, [runs, searchQuery, templateFilter, statusFilter]);

  const handleDelete = async (runId: string) => {
    await deleteWorkflowRun(runId);
    if (inspectedRun?.runId === runId) {
      setInspectedRun(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="font-display text-2xl font-bold text-slate-900 tracking-tight text-balance">
          {t.history.pageTitle}
        </h1>
        <p className="text-sm text-slate-600">{t.history.pageSubtitle}</p>
      </div>

      {/* Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.history.searchPlaceholder}
            className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white focus:border-slate-400"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex items-center p-1 bg-slate-100 rounded-lg border border-slate-200">
            {(['all', 'lead_qualification', 'support_triage', 'contract_analysis'] as const).map(
              (tpl) => (
                <button
                  key={tpl}
                  type="button"
                  onClick={() => setTemplateFilter(tpl)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                    templateFilter === tpl
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {tpl === 'all' ? t.common.all : t.templates[tpl].shortLabel}
                </button>
              )
            )}
          </div>

          <div className="inline-flex items-center p-1 bg-slate-100 rounded-lg border border-slate-200">
            {(['all', 'completed', 'failed'] as const).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                  statusFilter === st
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {st === 'all'
                  ? t.common.all
                  : st === 'completed'
                  ? t.common.completed
                  : t.common.failed}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table / List */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        {dataLoading ? (
          <div className="p-6 space-y-3 animate-pulse">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="h-11 bg-slate-100 rounded-lg" />
            ))}
          </div>
        ) : filteredRuns.length === 0 ? (
          <div className="py-14 px-6 text-center space-y-3">
            <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center mx-auto">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="font-display text-base font-semibold text-slate-900">
              {t.history.emptyTitle}
            </h3>
            <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
              {t.history.emptyBody}
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={() => onNavigateToWorkspace()}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white rounded-lg transition-colors cursor-pointer whitespace-nowrap"
                style={{ backgroundColor: 'var(--brand-accent)' }}
              >
                {t.history.emptyCta}
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-xs font-medium text-slate-500">
                  <th className="py-3 px-4">{t.history.colWorkflow}</th>
                  <th className="py-3 px-4">{t.history.colTemplate}</th>
                  <th className="py-3 px-4">{t.history.colClassification}</th>
                  <th className="py-3 px-4">{t.history.colStatus}</th>
                  <th className="py-3 px-4 text-right">{t.history.colLatency}</th>
                  <th className="py-3 px-4 text-right">{t.history.colTimestamp}</th>
                  <th className="py-3 px-4 text-right" aria-label="Actions" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredRuns.map((run) => (
                  <tr
                    key={run.runId}
                    onClick={() => setInspectedRun(run)}
                    className="hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-900 truncate max-w-[260px]">
                        {run.inputTitle}
                      </div>
                      <div className="text-xs text-slate-500 truncate max-w-[260px]">
                        {run.inputPayload.companyOrClient}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-600 whitespace-nowrap">
                      {t.templates[run.templateId].shortLabel}
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-800 max-w-[200px] truncate">
                      {run.outputJson.classification}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      {run.status === 'completed' ? (
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          {t.common.completed}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-red-700">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          {t.common.failed}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums text-xs text-slate-600 whitespace-nowrap">
                      {run.latencyMs} {t.common.msUnit}
                    </td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums text-xs text-slate-500 whitespace-nowrap">
                      {formatRunDate(run.createdAt)}
                    </td>
                    <td
                      className="py-3 px-4 text-right whitespace-nowrap"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        onClick={() => void handleDelete(run.runId)}
                        title={t.common.delete}
                        className="p-1.5 text-slate-400 hover:text-red-600 rounded-md hover:bg-red-50 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Audit Detail Modal */}
      {inspectedRun && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/40 flex items-center justify-center p-4"
          onClick={() => setInspectedRun(null)}
        >
          <div
            className="bg-white border border-slate-200 rounded-xl w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between gap-4">
              <div>
                <h3 className="font-display text-base font-bold text-slate-900">
                  {t.history.inspectTitle}
                </h3>
                <p className="text-xs font-mono text-slate-500 mt-0.5">
                  {inspectedRun.runId} · {inspectedRun.latencyMs} {t.common.msUnit} ·{' '}
                  {inspectedRun.attempts} {t.common.attemptsUnit}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    onNavigateToWorkspace(inspectedRun);
                    setInspectedRun(null);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white rounded-lg cursor-pointer whitespace-nowrap"
                  style={{ backgroundColor: 'var(--brand-accent)' }}
                >
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  {t.adminDrawer.loadIntoWorkspace}
                </button>
                <button
                  type="button"
                  onClick={() => setInspectedRun(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
                  aria-label={t.common.close}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto space-y-5">
              <div className="space-y-1.5">
                <span className="block text-xs font-medium text-slate-500">
                  {t.history.inputSnapshot}
                </span>
                <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-1.5">
                  <div className="font-semibold text-slate-900">
                    {inspectedRun.inputTitle} — {inspectedRun.inputPayload.companyOrClient}
                  </div>
                  {inspectedRun.inputPayload.sourceContext && (
                    <div className="text-slate-500">{inspectedRun.inputPayload.sourceContext}</div>
                  )}
                  <p className="text-slate-700 whitespace-pre-wrap pt-1 leading-relaxed">
                    {inspectedRun.inputPayload.rawInput}
                  </p>
                </div>
              </div>

              <div className="space-y-1.5">
                <span className="block text-xs font-medium text-slate-500">
                  {t.history.outputSnapshot}
                </span>
                <pre className="p-4 rounded-lg bg-slate-900 text-slate-100 text-xs font-mono overflow-x-auto leading-relaxed">
                  {JSON.stringify(inspectedRun.outputJson, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
