import 'dotenv/config';
import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';
import { z } from 'zod';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

const GEMINI_MODEL = 'gemini-2.5-flash';

const ExecuteWorkflowSchema = z.object({
  workspaceId: z.string().min(1).max(128).regex(/^[a-zA-Z0-9_-]+$/),
  ownerId: z.string().min(1).max(128).regex(/^[a-zA-Z0-9_-]+$/),
  templateId: z.enum(['lead_qualification', 'support_triage', 'contract_analysis']),
  locale: z.enum(['en', 'pt', 'es']).default('en'),
  inputTitle: z.string().trim().min(1).max(180),
  inputPayload: z.object({
    companyOrClient: z.string().trim().min(1).max(200),
    sourceContext: z.string().trim().max(500).default(''),
    rawInput: z.string().trim().min(1).max(12000),
  }),
  agentConfig: z.object({
    agentName: z.string().trim().min(1).max(80).default('PulseFlow Analyst'),
    systemInstruction: z.string().trim().min(1).max(4000),
    businessRules: z.string().trim().max(4000).default(''),
  }),
});

const LOCALE_LABELS: Record<'en' | 'pt' | 'es', string> = {
  en: 'English',
  pt: 'Portuguese',
  es: 'Spanish',
};

const TEMPLATE_GUIDANCE: Record<
  'lead_qualification' | 'support_triage' | 'contract_analysis',
  string
> = {
  lead_qualification:
    'Evaluate B2B lead fit, budget/timeline readiness, qualification tier (e.g., Tier 1 Enterprise, Tier 2 Mid-Market, Nurture), estimated deal/quote range, risks, and sales follow-up plan.',
  support_triage:
    'Classify support escalation category, assign SLA priority, diagnose root cause, propose resolution steps, and highlight churn or security risks.',
  contract_analysis:
    'Analyze contract/document intake for agreement type, commercial obligations, liability/renewal risk flags, estimated contract exposure/value, and legal/procurement next steps.',
};

const WORKFLOW_RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    classification: {
      type: Type.STRING,
      description: 'Primary category, qualification tier, or document classification.',
    },
    priority: {
      type: Type.STRING,
      description: 'Urgency or priority tier: Low, Medium, High, or Critical.',
    },
    confidenceScore: {
      type: Type.INTEGER,
      description: 'Confidence score from 0 to 100.',
    },
    executiveSummary: {
      type: Type.STRING,
      description: 'Concise 2-3 sentence executive synthesis of the submission.',
    },
    estimatedImpactOrValue: {
      type: Type.STRING,
      description: 'Estimated quote range, SLA target window, or commercial value.',
    },
    riskFlags: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'List of detected blockers, compliance risks, or missing data.',
    },
    recommendedActions: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'Ordered list of concrete operational next steps.',
    },
  },
  required: [
    'classification',
    'priority',
    'confidenceScore',
    'executiveSummary',
    'estimatedImpactOrValue',
    'riskFlags',
    'recommendedActions',
  ],
};

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '1mb' }));

  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({
      status: 'ok',
      model: GEMINI_MODEL,
      mode: 'open-workspace',
    });
  });

  app.post('/api/v1/execute-workflow', async (req: Request, res: Response) => {
    // 1. Validate Request Payload with Zod
    const parsedBody = ExecuteWorkflowSchema.safeParse(req.body);
    if (!parsedBody.success) {
      res.status(400).json({
        errorCode: 'VALIDATION_ERROR',
        errorMessage: parsedBody.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; '),
      });
      return;
    }

    const payload = parsedBody.data;

    if (!process.env.GEMINI_API_KEY) {
      res.status(503).json({
        errorCode: 'GEMINI_KEY_MISSING',
        errorMessage: 'GEMINI_API_KEY is not configured in server Secrets.',
      });
      return;
    }

    // 3. Execute Gemini API with Exponential Backoff Retries
    const startedAt = performance.now();
    const maxAttempts = 3;
    let attempts = 0;
    let lastErrorMessage = 'Unknown upstream execution error';
    let lastErrorCode = 'GEMINI_EXECUTION_FAILED';

    const systemInstruction = [
      `You are ${payload.agentConfig.agentName}, a high-precision B2B automation architect.`,
      `Workspace System Instruction:\n${payload.agentConfig.systemInstruction}`,
      `Business Rules:\n${payload.agentConfig.businessRules || 'Follow standard B2B operational rigor.'}`,
      `Template Objective (${payload.templateId}): ${TEMPLATE_GUIDANCE[payload.templateId]}`,
      `Language Mandate: Write all natural-language text values in the JSON output in ${LOCALE_LABELS[payload.locale]}.`,
    ].join('\n\n');

    const userContent = [
      `Submission Title: ${payload.inputTitle}`,
      `Client / Organization: ${payload.inputPayload.companyOrClient}`,
      `Source / Channel Context: ${payload.inputPayload.sourceContext || 'Direct Console Input'}`,
      `Payload Body:\n${payload.inputPayload.rawInput}`,
    ].join('\n\n');

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      attempts = attempt;
      try {
        const response = await ai.models.generateContent({
          model: GEMINI_MODEL,
          contents: userContent,
          config: {
            systemInstruction,
            responseMimeType: 'application/json',
            responseSchema: WORKFLOW_RESPONSE_SCHEMA,
          },
        });

        const rawJsonText = (response.text ?? '').trim();
        if (!rawJsonText) {
          throw new Error('Empty JSON payload returned by Gemini.');
        }

        const outputJson = JSON.parse(rawJsonText);
        const latencyMs = Math.round(performance.now() - startedAt);

        res.json({
          status: 'completed',
          latencyMs,
          attempts,
          modelUsed: GEMINI_MODEL,
          outputJson,
        });
        return;
      } catch (err) {
        lastErrorMessage = err instanceof Error ? err.message : String(err);
        if (lastErrorMessage.includes('429') || lastErrorMessage.includes('RESOURCE_EXHAUSTED')) {
          lastErrorCode = 'RATE_LIMIT_EXCEEDED';
        } else if (lastErrorMessage.includes('403') || lastErrorMessage.includes('PERMISSION_DENIED')) {
          lastErrorCode = 'GEMINI_PERMISSION_DENIED';
        } else if (lastErrorMessage.includes('400') || lastErrorMessage.includes('API_KEY_INVALID')) {
          lastErrorCode = 'GEMINI_INVALID_REQUEST';
        } else if (err instanceof SyntaxError) {
          lastErrorCode = 'JSON_SCHEMA_PARSE_ERROR';
        } else {
          lastErrorCode = 'UPSTREAM_LLM_ERROR';
        }

        const isNonRetryable =
          lastErrorCode === 'GEMINI_PERMISSION_DENIED' ||
          lastErrorCode === 'GEMINI_INVALID_REQUEST';

        if (!isNonRetryable && attempt < maxAttempts) {
          const jitter = Math.floor(Math.random() * 200);
          const delayMs = 500 * Math.pow(2, attempt - 1) + jitter;
          await sleep(delayMs);
          continue;
        }
        break;
      }
    }

    // 4. Standardized Fallback Response (Zero Silent Failures)
    const latencyMs = Math.round(performance.now() - startedAt);
    res.status(502).json({
      status: 'failed',
      errorCode: lastErrorCode,
      errorMessage: lastErrorMessage.slice(0, 500),
      attempts,
      latencyMs,
      modelUsed: GEMINI_MODEL,
      fallbackOutput: {
        classification: 'Manual Review Required',
        priority: 'High',
        confidenceScore: 0,
        executiveSummary:
          'Automated AI execution failed after retries. The request was captured in dead-letter error logs.',
        estimatedImpactOrValue: 'Pending operator triage',
        riskFlags: [`${lastErrorCode}: ${lastErrorMessage.slice(0, 140)}`],
        recommendedActions: [
          'Open the Admin Error Log drawer to inspect the full failure trace.',
          'Verify GEMINI_API_KEY configuration in Settings > Secrets and retry.',
        ],
      },
    });
  });

  // Vite middleware in dev; static dist serving in production
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  const port = Number(process.env.PORT) || 3000;
  app.listen(port, '0.0.0.0', () => {
    console.log(`PulseFlow AI full-stack server running on http://0.0.0.0:${port}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal server startup failure:', err);
  process.exit(1);
});
