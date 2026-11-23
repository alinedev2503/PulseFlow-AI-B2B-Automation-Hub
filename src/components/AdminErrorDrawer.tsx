import React, { useMemo } from 'react';
import { Timestamp } from 'firebase/firestore';
import { AlertOctagon, CheckCircle2, ShieldAlert, X } from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';

function formatLogTime(ts: unknown): string {
  if (!ts) return '—';
  let date: Date | null = null;
  if (ts instanceof Timestamp) date = ts.toDate();
  else if (typeof ts === 'object' && ts !== null && 'seconds' in ts) {
    date = new Date(Number((ts as { seconds: number }).seconds) * 1000);
  }
  return date
    ? date.toLocaleString(undefined, {
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '—';
}

interface AdminErrorDrawerProps {
  open: boolean;
  onClose: () => void;
}

export function AdminErrorDrawer({ open, onClose }: AdminErrorDrawerProps) {
  const { runs, errorLogs, t, resolveErrorLog } = useWorkspace();

  const metrics = useMemo(() => {
    const total = runs.length;
    const completed = runs.filter((r) => r.status === 'completed').length;
    const successRate = total > 0 ? Math.round((completed / total) * 100) : 100;
    const avgLatency =
      total > 0
        ? Math.round(runs.reduce((acc, r) => acc + (r.latencyMs || 0), 0) / total)
        : 0;
    const openErrors = errorLogs.filter((e) => !e.resolved).length;
    return { total, successRate, avgLatency, openErrors };
  }, [runs, errorLogs]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40" onClick={onClose}>
      <aside
        className="w-full max-w-lg bg-white h-full border-l border-slate-200 flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-slate-200 flex items-start justify-between gap-4">
          <div>
            <h2 className="font-display text-base font-bold text-slate-900">
              {t.adminDrawer.title}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">{t.adminDrawer.subtitle}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
            aria-label={t.common.close}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Aggregate Operational Metrics */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
              <span className="block text-xs text-slate-500">{t.adminDrawer.totalRuns}</span>
              <span className="mt-1 block text-xl font-mono tabular-nums font-bold text-slate-900">
                {metrics.total}
              </span>
            </div>
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
              <span className="block text-xs text-slate-500">{t.adminDrawer.successRate}</span>
              <span className="mt-1 block text-xl font-mono tabular-nums font-bold text-emerald-700">
                {metrics.successRate}%
              </span>
            </div>
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
              <span className="block text-xs text-slate-500">{t.adminDrawer.avgLatency}</span>
              <span className="mt-1 block text-xl font-mono tabular-nums font-bold text-slate-900">
                {metrics.avgLatency} {t.common.msUnit}
              </span>
            </div>
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
              <span className="block text-xs text-slate-500">{t.adminDrawer.openErrors}</span>
              <span
                className={`mt-1 block text-xl font-mono tabular-nums font-bold ${
                  metrics.openErrors > 0 ? 'text-red-700' : 'text-slate-900'
                }`}
              >
                {metrics.openErrors}
              </span>
            </div>
          </div>

          {/* Dead-Letter Queue */}
          <div className="space-y-3">
            <h3 className="font-display text-sm font-semibold text-slate-900">
              {t.adminDrawer.errorLogsHeading}
            </h3>

            {errorLogs.length === 0 ? (
              <div className="p-8 rounded-xl border border-slate-200 text-center space-y-2">
                <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto" />
                <p className="text-sm font-semibold text-slate-900">
                  {t.adminDrawer.emptyErrorsTitle}
                </p>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {t.adminDrawer.emptyErrorsBody}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {errorLogs.map((log) => (
                  <div
                    key={log.logId}
                    className="p-4 rounded-xl border border-slate-200 bg-white space-y-2.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5 text-xs font-mono font-semibold text-slate-900">
                          {log.resolved ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          ) : (
                            <AlertOctagon className="w-3.5 h-3.5 text-red-600 shrink-0" />
                          )}
                          <span>{log.errorCode}</span>
                        </div>
                        <div className="text-xs text-slate-500 font-mono tabular-nums">
                          {t.templates[log.templateId].shortLabel} · {log.attempts}{' '}
                          {t.common.attemptsUnit} · {formatLogTime(log.createdAt)}
                        </div>
                      </div>

                      {!log.resolved ? (
                        <button
                          type="button"
                          onClick={() => void resolveErrorLog(log.logId)}
                          className="px-2.5 py-1 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                        >
                          {t.adminDrawer.markResolved}
                        </button>
                      ) : (
                        <span className="text-xs font-medium text-emerald-700">
                          {t.adminDrawer.resolvedLabel}
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-700 leading-relaxed break-words">
                      {log.errorMessage}
                    </p>

                    <div className="text-xs text-slate-500 truncate pt-1 border-t border-slate-100 flex items-center gap-1.5">
                      <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{log.inputSummary}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </aside>
    </div>
  );
}
