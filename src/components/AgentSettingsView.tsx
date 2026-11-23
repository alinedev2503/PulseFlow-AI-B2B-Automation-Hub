import React, { useEffect, useState } from 'react';
import { CheckCircle2, Loader2, RotateCcw, Save } from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';
import { TemplateId, VALIDATION_LIMITS } from '../types/workflow';

const ACCENT_PRESETS = [
  { label: 'Cobalt', hex: '#2563eb' },
  { label: 'Slate', hex: '#0f172a' },
  { label: 'Emerald', hex: '#059669' },
  { label: 'Indigo', hex: '#4f46e5' },
  { label: 'Amber', hex: '#d97706' },
  { label: 'Crimson', hex: '#dc2626' },
];

const DEFAULT_INSTRUCTION =
  'Analyze B2B submissions objectively. Prioritize clarity, measurable commercial impact, explicit risk detection, and actionable next steps.';
const DEFAULT_RULES =
  'Enterprise threshold: >$50k ARR or >100 seats -> High/Critical priority. Flag missing security compliance (SOC2/GDPR) or unlimited liability clauses immediately.';

export function AgentSettingsView() {
  const { workspace, t, updateWorkspaceSettings } = useWorkspace();

  const [name, setName] = useState('');
  const [agentName, setAgentName] = useState('');
  const [defaultTemplate, setDefaultTemplate] = useState<TemplateId>('lead_qualification');
  const [accentColor, setAccentColor] = useState('#2563eb');
  const [systemInstruction, setSystemInstruction] = useState('');
  const [businessRules, setBusinessRules] = useState('');
  const [saving, setSaving] = useState(false);
  const [savedNotice, setSavedNotice] = useState(false);

  useEffect(() => {
    if (workspace) {
      setName(workspace.name);
      setAgentName(workspace.agentName);
      setDefaultTemplate(workspace.defaultTemplate);
      setAccentColor(workspace.accentColor);
      setSystemInstruction(workspace.systemInstruction);
      setBusinessRules(workspace.businessRules);
    }
  }, [workspace]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !agentName.trim() || !systemInstruction.trim()) return;
    setSaving(true);
    setSavedNotice(false);
    try {
      await updateWorkspaceSettings({
        name,
        agentName,
        defaultTemplate,
        accentColor: VALIDATION_LIMITS.HEX_COLOR_PATTERN.test(accentColor)
          ? accentColor
          : '#2563eb',
        systemInstruction,
        businessRules,
      });
      setSavedNotice(true);
      setTimeout(() => setSavedNotice(false), 3000);
    } finally {
      setSaving(false);
    }
  };

  const handleRestoreDefaults = () => {
    setSystemInstruction(DEFAULT_INSTRUCTION);
    setBusinessRules(DEFAULT_RULES);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="space-y-1">
        <h1 className="font-display text-2xl font-bold text-slate-900 tracking-tight text-balance">
          {t.settings.pageTitle}
        </h1>
        <p className="text-sm text-slate-600">{t.settings.pageSubtitle}</p>
      </div>

      {savedNotice && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-medium text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{t.settings.saveSuccess}</span>
        </div>
      )}

      <form
        onSubmit={(e) => void handleSubmit(e)}
        className="bg-white border border-slate-200 rounded-xl p-6 space-y-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <label htmlFor="ws-name" className="block text-xs font-medium text-slate-700">
              {t.settings.workspaceNameLabel}
            </label>
            <input
              id="ws-name"
              type="text"
              required
              maxLength={VALIDATION_LIMITS.WORKSPACE_NAME_MAX}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/15 focus:border-slate-400"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="agent-name" className="block text-xs font-medium text-slate-700">
              {t.settings.agentNameLabel}
            </label>
            <input
              id="agent-name"
              type="text"
              required
              maxLength={VALIDATION_LIMITS.AGENT_NAME_MAX}
              value={agentName}
              onChange={(e) => setAgentName(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/15 focus:border-slate-400"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2 border-t border-slate-100">
          <div className="space-y-1.5">
            <label htmlFor="default-tpl" className="block text-xs font-medium text-slate-700">
              {t.settings.defaultTemplateLabel}
            </label>
            <select
              id="default-tpl"
              value={defaultTemplate}
              onChange={(e) => setDefaultTemplate(e.target.value as TemplateId)}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/15 focus:border-slate-400"
            >
              <option value="lead_qualification">{t.templates.lead_qualification.name}</option>
              <option value="support_triage">{t.templates.support_triage.name}</option>
              <option value="contract_analysis">{t.templates.contract_analysis.name}</option>
            </select>
          </div>

          <div className="space-y-2">
            <label htmlFor="accent-hex" className="block text-xs font-medium text-slate-700">
              {t.settings.accentColorLabel}
            </label>
            <div className="flex flex-wrap items-center gap-2">
              {ACCENT_PRESETS.map((preset) => (
                <button
                  key={preset.hex}
                  type="button"
                  onClick={() => setAccentColor(preset.hex)}
                  title={preset.label}
                  className={`w-7 h-7 rounded-lg border transition-transform cursor-pointer ${
                    accentColor.toLowerCase() === preset.hex
                      ? 'ring-2 ring-offset-2 ring-slate-900 scale-105'
                      : 'border-slate-200'
                  }`}
                  style={{ backgroundColor: preset.hex }}
                  aria-label={preset.label}
                />
              ))}
              <input
                id="accent-hex"
                type="text"
                maxLength={7}
                value={accentColor}
                onChange={(e) => setAccentColor(e.target.value)}
                pattern="^#[0-9A-Fa-f]{6}$"
                className="w-24 px-2.5 py-1.5 text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white focus:border-slate-400"
              />
            </div>
            <p className="text-xs text-slate-500">{t.settings.accentColorHint}</p>
          </div>
        </div>

        <div className="space-y-1.5 pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <label htmlFor="sys-inst" className="block text-xs font-medium text-slate-700">
              {t.settings.systemInstructionLabel}
            </label>
            <span className="text-xs font-mono tabular-nums text-slate-400">
              {systemInstruction.length} / {VALIDATION_LIMITS.SYSTEM_INSTRUCTION_MAX}
            </span>
          </div>
          <textarea
            id="sys-inst"
            required
            rows={4}
            maxLength={VALIDATION_LIMITS.SYSTEM_INSTRUCTION_MAX}
            value={systemInstruction}
            onChange={(e) => setSystemInstruction(e.target.value)}
            className="w-full px-3 py-2.5 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/15 focus:border-slate-400 leading-relaxed"
          />
          <p className="text-xs text-slate-500">{t.settings.systemInstructionHint}</p>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="biz-rules" className="block text-xs font-medium text-slate-700">
              {t.settings.businessRulesLabel}
            </label>
            <span className="text-xs font-mono tabular-nums text-slate-400">
              {businessRules.length} / {VALIDATION_LIMITS.BUSINESS_RULES_MAX}
            </span>
          </div>
          <textarea
            id="biz-rules"
            rows={4}
            maxLength={VALIDATION_LIMITS.BUSINESS_RULES_MAX}
            value={businessRules}
            onChange={(e) => setBusinessRules(e.target.value)}
            className="w-full px-3 py-2.5 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/15 focus:border-slate-400 leading-relaxed"
          />
          <p className="text-xs text-slate-500">{t.settings.businessRulesHint}</p>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-200">
          <button
            type="button"
            onClick={handleRestoreDefaults}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer whitespace-nowrap"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            {t.settings.resetDefaults}
          </button>

          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white rounded-lg transition-colors cursor-pointer disabled:opacity-60 whitespace-nowrap"
            style={{ backgroundColor: 'var(--brand-accent)' }}
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {t.common.saving}
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                {t.settings.saveButton}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
