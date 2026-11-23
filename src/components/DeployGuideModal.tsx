import React, { useState } from 'react';
import { Copy, Terminal, X } from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';

const PYTHON_MAIN_SNIPPET = `# backend/main.py — FastAPI + google-genai + firebase-admin
# Full source included in repository under /backend/main.py

@app.post("/api/v1/execute-workflow", response_model=WorkflowExecuteResponse)
async def execute_workflow(
    payload: WorkflowExecuteRequest,
    decoded_user: Dict[str, Any] = Depends(verify_firebase_token),
) -> WorkflowExecuteResponse:
    # 1. Enforce workspace ownership against verified Firebase ID token
    # 2. Retry Gemini 2.5 Flash structured JSON calls with exponential backoff
    # 3. Persist atomic audit records to Firestore (workflow_runs)
    # 4. Write dead-letter failures to error_logs & return standardized fallback
    ...`;

const REQUIREMENTS_SNIPPET = `fastapi>=0.115.0,<1.0.0
uvicorn[standard]>=0.32.0,<1.0.0
pydantic>=2.9.0,<3.0.0
google-genai>=1.0.0,<2.0.0
firebase-admin>=6.6.0,<7.0.0
python-dotenv>=1.0.1,<2.0.0`;

const CLOUD_RUN_SNIPPET = `# 1. Deploy Firestore security rules
firebase deploy --only firestore:rules

# 2. Deploy Python FastAPI webhook to Google Cloud Run
cd backend
gcloud run deploy pulseflow-ai-api \\
  --source . \\
  --region us-central1 \\
  --allow-unauthenticated \\
  --set-env-vars "GEMINI_MODEL=gemini-2.5-flash" \\
  --set-secrets "GEMINI_API_KEY=GEMINI_API_KEY:latest"

# 3. Build & deploy frontend to Vercel
npm install && npm run build
npx vercel --prod`;

interface DeployGuideModalProps {
  open: boolean;
  onClose: () => void;
}

export function DeployGuideModal({ open, onClose }: DeployGuideModalProps) {
  const { t } = useWorkspace();
  const [tab, setTab] = useState<'main' | 'req' | 'cloud'>('cloud');
  const [copied, setCopied] = useState(false);

  if (!open) return null;

  const content =
    tab === 'main'
      ? PYTHON_MAIN_SNIPPET
      : tab === 'req'
      ? REQUIREMENTS_SNIPPET
      : CLOUD_RUN_SNIPPET;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white border border-slate-200 rounded-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <Terminal className="w-4 h-4 text-slate-700 shrink-0" />
            <div>
              <h2 className="font-display text-base font-bold text-slate-900">
                {t.deployGuide.title}
              </h2>
              <p className="text-xs text-slate-500">{t.deployGuide.subtitle}</p>
            </div>
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

        <div className="p-6 space-y-4 overflow-y-auto">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="inline-flex items-center p-1 bg-slate-100 rounded-lg border border-slate-200">
              <button
                type="button"
                onClick={() => setTab('cloud')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                  tab === 'cloud' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                }`}
              >
                {t.deployGuide.tabCloudRun}
              </button>
              <button
                type="button"
                onClick={() => setTab('main')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                  tab === 'main' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                }`}
              >
                {t.deployGuide.tabMainPy}
              </button>
              <button
                type="button"
                onClick={() => setTab('req')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                  tab === 'req' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                }`}
              >
                {t.deployGuide.tabRequirements}
              </button>
            </div>

            <button
              type="button"
              onClick={() => void handleCopy()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors whitespace-nowrap cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5" />
              {copied ? t.common.copied : t.deployGuide.copySnippet}
            </button>
          </div>

          <pre className="p-4 rounded-lg bg-slate-900 text-slate-100 text-xs font-mono overflow-x-auto leading-relaxed">
            {content}
          </pre>
        </div>
      </div>
    </div>
  );
}
