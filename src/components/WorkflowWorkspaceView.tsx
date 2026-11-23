import React, { useEffect, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Code2,
  Copy,
  FileText,
  Layers,
  Loader2,
  Play,
  Sparkles,
  Trash2,
} from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';
import {
  TemplateId,
  VALIDATION_LIMITS,
  WorkflowRunRecord,
} from '../types/workflow';

const TEMPLATE_ORDER: TemplateId[] = [
  'lead_qualification',
  'support_triage',
  'contract_analysis',
];

interface WorkflowWorkspaceViewProps {
  prefillRun?: WorkflowRunRecord | null;
  onClearPrefill?: () => void;
}

export function WorkflowWorkspaceView({
  prefillRun,
  onClearPrefill,
}: WorkflowWorkspaceViewProps) {
  const { workspace, t, executeWorkflow } = useWorkspace();

  const [templateId, setTemplateId] = useState<TemplateId>(
    workspace?.defaultTemplate || 'lead_qualification'
  );
  const [inputTitle, setInputTitle] = useState('');
  const [companyOrClient, setCompanyOrClient] = useState('');
  const [sourceContext, setSourceContext] = useState('');
  const [rawInput, setRawInput] = useState('');

  const [running, setRunning] = useState(false);
  const [activeRun, setActiveRun] = useState<WorkflowRunRecord | null>(null);
  const [viewMode, setViewMode] = useState<'structured' | 'json'>('structured');
  const [copiedJson, setCopiedJson] = useState(false);
  const [bannerMessage, setBannerMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  useEffect(() => {
    if (workspace?.defaultTemplate && !inputTitle && !rawInput && !prefillRun) {
      setTemplateId(workspace.defaultTemplate);
    }
  }, [workspace?.defaultTemplate]);

  useEffect(() => {
    if (prefillRun) {
      setTemplateId(prefillRun.templateId);
      setInputTitle(prefillRun.inputTitle);
      setCompanyOrClient(prefillRun.inputPayload.companyOrClient);
      setSourceContext(prefillRun.inputPayload.sourceContext);
      setRawInput(prefillRun.inputPayload.rawInput);
      setActiveRun(prefillRun);
      onClearPrefill?.();
    }
  }, [prefillRun, onClearPrefill]);

  const handleLoadSample = () => {
    const sample = t.templates[templateId].sample;
    setInputTitle(sample.title);
    setCompanyOrClient(sample.companyOrClient);
    setSourceContext(sample.sourceContext);
    setRawInput(sample.rawInput);
    setBannerMessage(null);
  };

  const handleClear = () => {
    setInputTitle('');
    setCompanyOrClient('');
    setSourceContext('');
    setRawInput('');
    setBannerMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputTitle.trim() || !companyOrClient.trim() || !rawInput.trim()) return;

    setRunning(true);
    setBannerMessage(null);
    try {
      const result = await executeWorkflow({
        templateId,
        inputTitle,
        inputPayload: {
          companyOrClient,
          sourceContext,
          rawInput,
        },
      });
      setActiveRun(result);
      setBannerMessage(
        result.status === 'completed'
          ? { type: 'success', text: t.workspace.executionSaved }
          : { type: 'error', text: t.workspace.executionFallbackWarning }
      );
    } catch (err) {
      setBannerMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Workflow execution failed.',
      });
    } finally {
      setRunning(false);
    }
  };

  const handleCopyJson = async () => {
    if (!activeRun) return;
    await navigator.clipboard.writeText(JSON.stringify(activeRun.outputJson, null, 2));
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 1800);
  };

  const priorityTone = (priority: string): string => {
    const p = priority.toLowerCase();
    if (p.includes('critical') || p.includes('crític')) return 'text-red-700';
    if (p.includes('high') || p.includes('alt')) return 'text-amber-700';
    if (p.includes('medium') || p.includes('médi') || p.includes('medi')) return 'text-slate-800';
    return 'text-emerald-700';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="font-display text-2xl font-bold text-slate-900 tracking-tight text-balance">
            {t.workspace.pageTitle}
          </h1>
          <p className="text-sm text-slate-600 max-w-2xl">{t.workspace.pageSubtitle}</p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleLoadSample}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-slate-500" />
            {t.workspace.loadSample}
          </button>
          <button
            type="button"
            onClick={handleClear}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5 text-slate-400" />
            {t.workspace.clearForm}
          </button>
        </div>
      </div>

      {/* Template Segmented Selector */}
      <div className="space-y-2">
        <span className="block text-xs font-medium text-slate-600">
          {t.workspace.selectTemplate}
        </span>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {TEMPLATE_ORDER.map((id) => {
            const tpl = t.templates[id];
            const selected = templateId === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setTemplateId(id)}
                className={`text-left p-4 rounded-xl border transition-colors cursor-pointer ${
                  selected
                    ? 'bg-white border-slate-900 ring-1 ring-slate-900'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-display text-sm font-semibold text-slate-900">
                    {tpl.name}
                  </span>
                  <span
                    className={`w-2 h-2 rounded-full shrink-0 ${
                      selected ? '' : 'bg-slate-200'
                    }`}
                    style={selected ? { backgroundColor: 'var(--brand-accent)' } : undefined}
                  />
                </div>
                <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">
                  {tpl.description}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {bannerMessage && (
        <div
          className={`p-3.5 rounded-xl border text-xs font-medium flex items-center gap-2.5 ${
            bannerMessage.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          {bannerMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 shrink-0" />
          )}
          <span>{bannerMessage.text}</span>
        </div>
      )}

      {/* Main Split Workspace: Left Input Form, Right Structured Output */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        <form
          onSubmit={(e) => void handleSubmit(e)}
          className="xl:col-span-5 bg-white border border-slate-200 rounded-xl p-6 space-y-4"
        >
          <div className="space-y-1.5">
            <label htmlFor="wf-title" className="block text-xs font-medium text-slate-700">
              {t.workspace.titleLabel}
            </label>
            <input
              id="wf-title"
              type="text"
              required
              maxLength={VALIDATION_LIMITS.INPUT_TITLE_MAX}
              value={inputTitle}
              onChange={(e) => setInputTitle(e.target.value)}
              placeholder={t.workspace.titlePlaceholder}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/15 focus:border-slate-400"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="wf-company" className="block text-xs font-medium text-slate-700">
                {t.workspace.companyLabel}
              </label>
              <input
                id="wf-company"
                type="text"
                required
                maxLength={VALIDATION_LIMITS.COMPANY_OR_CLIENT_MAX}
                value={companyOrClient}
                onChange={(e) => setCompanyOrClient(e.target.value)}
                placeholder={t.workspace.companyPlaceholder}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/15 focus:border-slate-400"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="wf-context" className="block text-xs font-medium text-slate-700">
                {t.workspace.contextLabel}
              </label>
              <input
                id="wf-context"
                type="text"
                maxLength={VALIDATION_LIMITS.SOURCE_CONTEXT_MAX}
                value={sourceContext}
                onChange={(e) => setSourceContext(e.target.value)}
                placeholder={t.workspace.contextPlaceholder}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/15 focus:border-slate-400"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="wf-raw" className="block text-xs font-medium text-slate-700">
                {t.workspace.payloadLabel}
              </label>
              <span className="text-xs font-mono tabular-nums text-slate-400">
                {rawInput.length} / {VALIDATION_LIMITS.RAW_INPUT_MAX}
              </span>
            </div>
            <textarea
              id="wf-raw"
              required
              rows={8}
              maxLength={VALIDATION_LIMITS.RAW_INPUT_MAX}
              value={rawInput}
              onChange={(e) => setRawInput(e.target.value)}
              placeholder={t.workspace.payloadPlaceholder}
              className="w-full px-3 py-2.5 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/15 focus:border-slate-400 leading-relaxed resize-y"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={running}
              className="w-full py-2.5 px-4 rounded-lg text-sm font-semibold text-white transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 whitespace-nowrap"
              style={{ backgroundColor: 'var(--brand-accent)' }}
            >
              {running ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {t.workspace.runningButton}
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  {t.workspace.runButton}
                </>
              )}
            </button>
          </div>
        </form>

        {/* Right Output Panel */}
        <div className="xl:col-span-7 bg-white border border-slate-200 rounded-xl p-6 min-h-[440px] flex flex-col">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200">
            <div>
              <h2 className="font-display text-base font-semibold text-slate-900">
                {t.workspace.outputHeader}
              </h2>
              {activeRun && (
                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500 font-mono tabular-nums">
                  <span>{activeRun.modelUsed}</span>
                  <span aria-hidden="true">·</span>
                  <span>
                    {activeRun.latencyMs} {t.common.msUnit}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>
                    {activeRun.attempts} {t.common.attemptsUnit}
                  </span>
                </div>
              )}
            </div>

            {activeRun && (
              <div className="flex items-center gap-2">
                <div className="inline-flex items-center p-1 bg-slate-100 rounded-lg border border-slate-200">
                  <button
                    type="button"
                    onClick={() => setViewMode('structured')}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                      viewMode === 'structured'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5" />
                    {t.workspace.structuredViewToggle}
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('json')}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                      viewMode === 'json'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Code2 className="w-3.5 h-3.5" />
                    {t.workspace.rawJsonToggle}
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => void handleCopyJson()}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors whitespace-nowrap cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  {copiedJson ? t.common.copied : t.common.copy}
                </button>
              </div>
            )}
          </div>

          {running ? (
            <div className="flex-1 flex flex-col justify-center py-10 space-y-5">
              <div className="flex items-center gap-2.5 text-sm font-medium text-slate-700">
                <Loader2 className="w-4 h-4 animate-spin text-slate-900" />
                <span>{t.workspace.runningNotice}</span>
              </div>
              <div className="space-y-3 animate-pulse">
                <div className="grid grid-cols-3 gap-4">
                  <div className="h-16 bg-slate-100 rounded-lg" />
                  <div className="h-16 bg-slate-100 rounded-lg" />
                  <div className="h-16 bg-slate-100 rounded-lg" />
                </div>
                <div className="h-20 bg-slate-100 rounded-lg" />
                <div className="h-28 bg-slate-100 rounded-lg" />
              </div>
            </div>
          ) : !activeRun ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-12 px-4 space-y-3">
              <div className="w-11 h-11 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="font-display text-base font-semibold text-slate-900">
                {t.workspace.emptyOutputTitle}
              </h3>
              <p className="text-sm text-slate-600 max-w-md leading-relaxed">
                {t.workspace.emptyOutputBody}
              </p>
            </div>
          ) : viewMode === 'json' ? (
            <div className="pt-4 flex-1">
              <pre className="text-xs font-mono bg-slate-900 text-slate-100 rounded-lg p-4 overflow-x-auto leading-relaxed">
                {JSON.stringify(activeRun.outputJson, null, 2)}
              </pre>
            </div>
          ) : (
            <div className="pt-5 space-y-6">
              {/* Primary Metrics Strip */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pb-5 border-b border-slate-100">
                <div>
                  <span className="block text-xs text-slate-500">
                    {t.workspace.classification}
                  </span>
                  <span className="mt-1 block text-sm font-semibold text-slate-900">
                    {activeRun.outputJson.classification}
                  </span>
                </div>
                <div>
                  <span className="block text-xs text-slate-500">{t.workspace.priority}</span>
                  <span
                    className={`mt-1 block text-sm font-semibold ${priorityTone(
                      activeRun.outputJson.priority
                    )}`}
                  >
                    {activeRun.outputJson.priority}
                  </span>
                </div>
                <div>
                  <span className="block text-xs text-slate-500">{t.workspace.confidence}</span>
                  <span className="mt-1 block text-sm font-mono tabular-nums font-semibold text-slate-900">
                    {activeRun.outputJson.confidenceScore}%
                  </span>
                </div>
              </div>

              {/* Estimated Impact / Quote */}
              <div className="space-y-1">
                <span className="block text-xs font-medium text-slate-500">
                  {t.workspace.estimatedValue}
                </span>
                <p className="text-sm font-semibold text-slate-900">
                  {activeRun.outputJson.estimatedImpactOrValue}
                </p>
              </div>

              {/* Executive Summary */}
              <div className="space-y-1.5">
                <span className="block text-xs font-medium text-slate-500">
                  {t.workspace.summary}
                </span>
                <p className="text-sm text-slate-700 leading-relaxed">
                  {activeRun.outputJson.executiveSummary}
                </p>
              </div>

              {/* Recommended Actions */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <span className="block text-xs font-medium text-slate-500">
                  {t.workspace.recommendedActions}
                </span>
                <ol className="space-y-2">
                  {activeRun.outputJson.recommendedActions.map((action, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-sm text-slate-800">
                      <span className="font-mono tabular-nums text-xs font-semibold text-slate-500 mt-0.5 shrink-0">
                        0{idx + 1}.
                      </span>
                      <span className="leading-relaxed">{action}</span>
                    </li>
                  ))}
                </ol>
              </div>

              {/* Risk Flags */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <span className="block text-xs font-medium text-slate-500">
                  {t.workspace.riskFlags}
                </span>
                {activeRun.outputJson.riskFlags.length === 0 ? (
                  <p className="text-xs text-slate-500">{t.workspace.noRiskFlags}</p>
                ) : (
                  <ul className="space-y-1.5">
                    {activeRun.outputJson.riskFlags.map((flag, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs text-amber-800">
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-600" />
                        <span>{flag}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
