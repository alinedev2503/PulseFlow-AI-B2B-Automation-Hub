export type LocaleCode = 'en' | 'pt' | 'es';

export type TemplateId =
  | 'lead_qualification'
  | 'support_triage'
  | 'contract_analysis';

export type RunStatus = 'completed' | 'failed';

export type ActiveView = 'workspace' | 'history' | 'settings';

/**
 * Validation constants synchronized verbatim with firebase-blueprint.json
 * and firestore.rules.
 */
export const VALIDATION_LIMITS = {
  ID_PATTERN: /^[a-zA-Z0-9_-]+$/,
  HEX_COLOR_PATTERN: /^#[0-9A-Fa-f]{6}$/,
  DISPLAY_NAME_MAX: 120,
  WORKSPACE_NAME_MAX: 100,
  AGENT_NAME_MAX: 80,
  SYSTEM_INSTRUCTION_MAX: 4000,
  BUSINESS_RULES_MAX: 4000,
  INPUT_TITLE_MAX: 180,
  COMPANY_OR_CLIENT_MAX: 200,
  SOURCE_CONTEXT_MAX: 500,
  RAW_INPUT_MAX: 12000,
  ERROR_MESSAGE_MAX: 1000,
  INPUT_SUMMARY_MAX: 300,
} as const;

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  preferredLocale: LocaleCode;
  defaultWorkspaceId: string;
  createdAt: unknown;
}

export interface WorkspaceConfig {
  workspaceId: string;
  ownerId: string;
  name: string;
  agentName: string;
  systemInstruction: string;
  businessRules: string;
  accentColor: string;
  defaultTemplate: TemplateId;
  createdAt: unknown;
  updatedAt: unknown;
}

export interface WorkflowInputPayload {
  companyOrClient: string;
  sourceContext: string;
  rawInput: string;
}

export interface StructuredWorkflowOutput {
  classification: string;
  priority: string;
  confidenceScore: number;
  executiveSummary: string;
  estimatedImpactOrValue: string;
  riskFlags: string[];
  recommendedActions: string[];
}

export interface WorkflowRunRecord {
  runId: string;
  workspaceId: string;
  ownerId: string;
  templateId: TemplateId;
  locale: LocaleCode;
  inputTitle: string;
  inputPayload: WorkflowInputPayload;
  outputJson: StructuredWorkflowOutput;
  status: RunStatus;
  latencyMs: number;
  attempts: number;
  modelUsed: string;
  createdAt: unknown;
}

export interface ErrorLogRecord {
  logId: string;
  workspaceId: string;
  ownerId: string;
  endpoint: string;
  templateId: TemplateId;
  errorCode: string;
  errorMessage: string;
  attempts: number;
  inputSummary: string;
  resolved: boolean;
  createdAt: unknown;
}
