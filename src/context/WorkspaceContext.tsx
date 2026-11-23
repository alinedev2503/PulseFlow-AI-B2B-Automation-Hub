import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  Timestamp,
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { OperationType, handleFirestoreError } from '../lib/firestoreError';
import { TRANSLATIONS, TranslationBundle } from '../i18n/translations';
import {
  ErrorLogRecord,
  LocaleCode,
  StructuredWorkflowOutput,
  TemplateId,
  VALIDATION_LIMITS,
  WorkflowInputPayload,
  WorkflowRunRecord,
  WorkspaceConfig,
} from '../types/workflow';

const DEFAULT_WORKSPACE_ID = 'ws_default';
const DEFAULT_OWNER_ID = 'workspace_owner';

const DEFAULT_SYSTEM_INSTRUCTION =
  'Analyze B2B submissions objectively. Prioritize clarity, measurable commercial impact, explicit risk detection, and actionable next steps.';
const DEFAULT_BUSINESS_RULES =
  'Enterprise threshold: >$50k ARR or >100 seats -> High/Critical priority. Flag missing security compliance (SOC2/GDPR) or unlimited liability clauses immediately.';

function makeId(prefix: string): string {
  const randomPart =
    typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID().replace(/-/g, '').slice(0, 16)
      : Math.random().toString(36).slice(2, 14);
  return `${prefix}_${randomPart}`;
}

function getTimestampMillis(ts: unknown): number {
  if (!ts) return 0;
  if (ts instanceof Timestamp) return ts.toMillis();
  if (typeof ts === 'object' && ts !== null && 'seconds' in ts) {
    return Number((ts as { seconds: number }).seconds) * 1000;
  }
  return 0;
}

function hexToSoftTint(hex: string): string {
  const clean = hex.replace('#', '');
  if (clean.length !== 6) return '#eff6ff';
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, 0.08)`;
}

function darkenHex(hex: string, amount = 18): string {
  const clean = hex.replace('#', '');
  if (clean.length !== 6) return '#1d4ed8';
  const r = Math.max(0, parseInt(clean.slice(0, 2), 16) - amount);
  const g = Math.max(0, parseInt(clean.slice(2, 4), 16) - amount);
  const b = Math.max(0, parseInt(clean.slice(4, 6), 16) - amount);
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

export interface ExecuteWorkflowInput {
  templateId: TemplateId;
  inputTitle: string;
  inputPayload: WorkflowInputPayload;
}

interface WorkspaceContextValue {
  workspace: WorkspaceConfig | null;
  runs: WorkflowRunRecord[];
  errorLogs: ErrorLogRecord[];
  dataLoading: boolean;
  locale: LocaleCode;
  t: TranslationBundle;
  setLocale: (next: LocaleCode) => Promise<void>;
  executeWorkflow: (input: ExecuteWorkflowInput) => Promise<WorkflowRunRecord>;
  updateWorkspaceSettings: (patch: {
    name: string;
    agentName: string;
    systemInstruction: string;
    businessRules: string;
    accentColor: string;
    defaultTemplate: TemplateId;
  }) => Promise<void>;
  deleteWorkflowRun: (runId: string) => Promise<void>;
  resolveErrorLog: (logId: string) => Promise<void>;
}

const WorkspaceContext = createContext<WorkspaceContextValue | undefined>(undefined);

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const [workspace, setWorkspace] = useState<WorkspaceConfig | null>(null);
  const [runs, setRuns] = useState<WorkflowRunRecord[]>([]);
  const [errorLogs, setErrorLogs] = useState<ErrorLogRecord[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [locale, setLocaleState] = useState<LocaleCode>(() => {
    try {
      const saved = window.localStorage.getItem('pulseflow_locale');
      if (saved === 'en' || saved === 'pt' || saved === 'es') return saved;
    } catch {
      // Ignore storage access errors
    }
    return 'en';
  });

  const t = useMemo(() => TRANSLATIONS[locale], [locale]);

  // Apply dynamic white-label brand accent color to CSS custom properties
  useEffect(() => {
    const accent =
      workspace?.accentColor && VALIDATION_LIMITS.HEX_COLOR_PATTERN.test(workspace.accentColor)
        ? workspace.accentColor
        : '#2563eb';
    document.documentElement.style.setProperty('--brand-accent', accent);
    document.documentElement.style.setProperty('--brand-accent-hover', darkenHex(accent));
    document.documentElement.style.setProperty('--brand-accent-soft', hexToSoftTint(accent));
  }, [workspace?.accentColor]);

  // Bootstrap default workspace in Firestore and attach live onSnapshot listeners immediately
  useEffect(() => {
    let cancelled = false;
    let unsubWorkspace: (() => void) | undefined;
    let unsubRuns: (() => void) | undefined;
    let unsubErrors: (() => void) | undefined;

    const initializeAndSubscribe = async () => {
      setDataLoading(true);
      const wsPath = `workspaces/${DEFAULT_WORKSPACE_ID}`;

      try {
        const wsRef = doc(db, 'workspaces', DEFAULT_WORKSPACE_ID);
        const wsSnap = await getDoc(wsRef);
        if (!wsSnap.exists()) {
          await setDoc(wsRef, {
            workspaceId: DEFAULT_WORKSPACE_ID,
            ownerId: DEFAULT_OWNER_ID,
            name: 'PulseFlow Automation Hub',
            agentName: 'PulseFlow Analyst',
            systemInstruction: DEFAULT_SYSTEM_INSTRUCTION,
            businessRules: DEFAULT_BUSINESS_RULES,
            accentColor: '#2563eb',
            defaultTemplate: 'lead_qualification',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        }
      } catch (err) {
        if (!cancelled) {
          setDataLoading(false);
        }
        handleFirestoreError(err, OperationType.WRITE, wsPath);
      }

      if (cancelled) return;

      unsubWorkspace = onSnapshot(
        doc(db, 'workspaces', DEFAULT_WORKSPACE_ID),
        (snapshot) => {
          if (snapshot.exists()) {
            setWorkspace(snapshot.data() as WorkspaceConfig);
          }
          setDataLoading(false);
        },
        (error) => {
          setDataLoading(false);
          handleFirestoreError(error, OperationType.GET, wsPath);
        }
      );

      const runsPath = 'workflow_runs';
      const runsQuery = query(
        collection(db, runsPath),
        where('workspaceId', '==', DEFAULT_WORKSPACE_ID)
      );
      unsubRuns = onSnapshot(
        runsQuery,
        (snapshot) => {
          const items = snapshot.docs
            .map((d) => d.data() as WorkflowRunRecord)
            .sort((a, b) => getTimestampMillis(b.createdAt) - getTimestampMillis(a.createdAt));
          setRuns(items);
        },
        (error) => {
          handleFirestoreError(error, OperationType.LIST, runsPath);
        }
      );

      const errorsPath = 'error_logs';
      const errorsQuery = query(
        collection(db, errorsPath),
        where('workspaceId', '==', DEFAULT_WORKSPACE_ID)
      );
      unsubErrors = onSnapshot(
        errorsQuery,
        (snapshot) => {
          const items = snapshot.docs
            .map((d) => d.data() as ErrorLogRecord)
            .sort((a, b) => getTimestampMillis(b.createdAt) - getTimestampMillis(a.createdAt));
          setErrorLogs(items);
        },
        (error) => {
          handleFirestoreError(error, OperationType.LIST, errorsPath);
        }
      );
    };

    void initializeAndSubscribe();

    return () => {
      cancelled = true;
      if (unsubWorkspace) unsubWorkspace();
      if (unsubRuns) unsubRuns();
      if (unsubErrors) unsubErrors();
    };
  }, []);

  const setLocale = useCallback(async (next: LocaleCode) => {
    setLocaleState(next);
    try {
      window.localStorage.setItem('pulseflow_locale', next);
    } catch {
      // Ignore storage access errors
    }
  }, []);

  const executeWorkflow = useCallback(
    async ({ templateId, inputTitle, inputPayload }: ExecuteWorkflowInput): Promise<WorkflowRunRecord> => {
      const activeWsId = workspace?.workspaceId || DEFAULT_WORKSPACE_ID;
      const activeOwnerId = workspace?.ownerId || DEFAULT_OWNER_ID;

      const sanitizedTitle = inputTitle.trim().slice(0, VALIDATION_LIMITS.INPUT_TITLE_MAX);
      const sanitizedPayload: WorkflowInputPayload = {
        companyOrClient: inputPayload.companyOrClient
          .trim()
          .slice(0, VALIDATION_LIMITS.COMPANY_OR_CLIENT_MAX),
        sourceContext: inputPayload.sourceContext
          .trim()
          .slice(0, VALIDATION_LIMITS.SOURCE_CONTEXT_MAX),
        rawInput: inputPayload.rawInput.trim().slice(0, VALIDATION_LIMITS.RAW_INPUT_MAX),
      };

      const response = await fetch('/api/v1/execute-workflow', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          workspaceId: activeWsId,
          ownerId: activeOwnerId,
          templateId,
          locale,
          inputTitle: sanitizedTitle,
          inputPayload: sanitizedPayload,
          agentConfig: {
            agentName: workspace?.agentName || 'PulseFlow Analyst',
            systemInstruction: workspace?.systemInstruction || DEFAULT_SYSTEM_INSTRUCTION,
            businessRules: workspace?.businessRules || DEFAULT_BUSINESS_RULES,
          },
        }),
      });

      const body = await response.json();
      const runId = makeId('run');

      if (!response.ok || body.status === 'failed') {
        const errCode = String(body.errorCode || `HTTP_${response.status}`).slice(0, 80);
        const errMsg = String(body.errorMessage || 'Workflow execution failed').slice(
          0,
          VALIDATION_LIMITS.ERROR_MESSAGE_MAX
        );
        const attempts = Math.min(10, Math.max(1, Number(body.attempts || 1)));
        const latencyMs = Math.min(300000, Math.max(0, Number(body.latencyMs || 0)));

        const logId = makeId('err');
        try {
          await setDoc(doc(db, 'error_logs', logId), {
            logId,
            workspaceId: activeWsId,
            ownerId: activeOwnerId,
            endpoint: '/api/v1/execute-workflow',
            templateId,
            errorCode: errCode,
            errorMessage: errMsg,
            attempts,
            inputSummary: `${sanitizedTitle} (${sanitizedPayload.companyOrClient})`.slice(
              0,
              VALIDATION_LIMITS.INPUT_SUMMARY_MAX
            ),
            resolved: false,
            createdAt: serverTimestamp(),
          });
        } catch (fsErr) {
          handleFirestoreError(fsErr, OperationType.CREATE, `error_logs/${logId}`);
        }

        const fallbackOutput: StructuredWorkflowOutput = body.fallbackOutput || {
          classification: 'Execution Failed',
          priority: 'High',
          confidenceScore: 0,
          executiveSummary: errMsg,
          estimatedImpactOrValue: 'Pending review',
          riskFlags: [errCode],
          recommendedActions: ['Inspect error details in the Admin Error Logs drawer.'],
        };

        const failedRun: WorkflowRunRecord = {
          runId,
          workspaceId: activeWsId,
          ownerId: activeOwnerId,
          templateId,
          locale,
          inputTitle: sanitizedTitle,
          inputPayload: sanitizedPayload,
          outputJson: fallbackOutput,
          status: 'failed',
          latencyMs,
          attempts,
          modelUsed: String(body.modelUsed || 'gemini-2.5-flash').slice(0, 80),
          createdAt: serverTimestamp(),
        };

        try {
          await setDoc(doc(db, 'workflow_runs', runId), failedRun);
        } catch (fsErr) {
          handleFirestoreError(fsErr, OperationType.CREATE, `workflow_runs/${runId}`);
        }

        return { ...failedRun, createdAt: Timestamp.now() };
      }

      const completedRun: WorkflowRunRecord = {
        runId,
        workspaceId: activeWsId,
        ownerId: activeOwnerId,
        templateId,
        locale,
        inputTitle: sanitizedTitle,
        inputPayload: sanitizedPayload,
        outputJson: body.outputJson as StructuredWorkflowOutput,
        status: 'completed',
        latencyMs: Math.min(300000, Math.max(0, Number(body.latencyMs || 0))),
        attempts: Math.min(10, Math.max(1, Number(body.attempts || 1))),
        modelUsed: String(body.modelUsed || 'gemini-2.5-flash').slice(0, 80),
        createdAt: serverTimestamp(),
      };

      try {
        await setDoc(doc(db, 'workflow_runs', runId), completedRun);
      } catch (fsErr) {
        handleFirestoreError(fsErr, OperationType.CREATE, `workflow_runs/${runId}`);
      }

      return { ...completedRun, createdAt: Timestamp.now() };
    },
    [workspace, locale]
  );

  const updateWorkspaceSettings = useCallback(
    async (patch: {
      name: string;
      agentName: string;
      systemInstruction: string;
      businessRules: string;
      accentColor: string;
      defaultTemplate: TemplateId;
    }) => {
      const wsId = workspace?.workspaceId || DEFAULT_WORKSPACE_ID;
      const wsPath = `workspaces/${wsId}`;
      try {
        await updateDoc(doc(db, 'workspaces', wsId), {
          name: patch.name.trim().slice(0, VALIDATION_LIMITS.WORKSPACE_NAME_MAX),
          agentName: patch.agentName.trim().slice(0, VALIDATION_LIMITS.AGENT_NAME_MAX),
          systemInstruction: patch.systemInstruction
            .trim()
            .slice(0, VALIDATION_LIMITS.SYSTEM_INSTRUCTION_MAX),
          businessRules: patch.businessRules
            .trim()
            .slice(0, VALIDATION_LIMITS.BUSINESS_RULES_MAX),
          accentColor: VALIDATION_LIMITS.HEX_COLOR_PATTERN.test(patch.accentColor)
            ? patch.accentColor
            : '#2563eb',
          defaultTemplate: patch.defaultTemplate,
          updatedAt: serverTimestamp(),
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, wsPath);
      }
    },
    [workspace]
  );

  const deleteWorkflowRun = useCallback(async (runId: string) => {
    const runPath = `workflow_runs/${runId}`;
    try {
      await deleteDoc(doc(db, 'workflow_runs', runId));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, runPath);
    }
  }, []);

  const resolveErrorLog = useCallback(async (logId: string) => {
    const errPath = `error_logs/${logId}`;
    try {
      await updateDoc(doc(db, 'error_logs', logId), {
        resolved: true,
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, errPath);
    }
  }, []);

  const value: WorkspaceContextValue = {
    workspace,
    runs,
    errorLogs,
    dataLoading,
    locale,
    t,
    setLocale,
    executeWorkflow,
    updateWorkspaceSettings,
    deleteWorkflowRun,
    resolveErrorLog,
  };

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
}

export function useWorkspace(): WorkspaceContextValue {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider.');
  }
  return ctx;
}
