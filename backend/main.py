"""
PulseFlow AI — Resilient FastAPI Webhook Automation Engine
----------------------------------------------------------
Production Python backend for Cloud Run deployment.
Connects validated B2B workflow payloads to Google Gemini (gemini-2.5-flash)
with strict JSON schema enforcement, exponential backoff retries,
and atomic Cloud Firestore persistence (workflow_runs + error_logs).
"""

from __future__ import annotations

import asyncio
import json
import logging
import os
import random
import time
import uuid
from datetime import datetime, timezone
from enum import Enum
from typing import Any, Dict, List, Optional

import firebase_admin
from dotenv import load_dotenv
from fastapi import Depends, FastAPI, Header, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from firebase_admin import auth as fb_auth
from firebase_admin import credentials, firestore
from google import genai
from google.genai import types
from pydantic import BaseModel, Field, field_validator

load_dotenv()

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("pulseflow.backend")

# ---------------------------------------------------------------------------
# Firebase Admin Initialization (Application Default Credentials in Cloud Run)
# ---------------------------------------------------------------------------
if not firebase_admin._apps:
    cred_path = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")
    if cred_path and os.path.exists(cred_path):
        firebase_admin.initialize_app(credentials.Certificate(cred_path))
    else:
        firebase_admin.initialize_app()

FIRESTORE_DB_ID = os.getenv("FIRESTORE_DATABASE_ID", "(default)")
db = firestore.client(database_id=FIRESTORE_DB_ID) if FIRESTORE_DB_ID != "(default)" else firestore.client()

# ---------------------------------------------------------------------------
# Google GenAI SDK Initialization
# ---------------------------------------------------------------------------
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
genai_client = genai.Client(api_key=GEMINI_API_KEY)


# ---------------------------------------------------------------------------
# Strict Pydantic Schemas
# ---------------------------------------------------------------------------
class TemplateId(str, Enum):
    LEAD_QUALIFICATION = "lead_qualification"
    SUPPORT_TRIAGE = "support_triage"
    CONTRACT_ANALYSIS = "contract_analysis"


class LocaleCode(str, Enum):
    EN = "en"
    PT = "pt"
    ES = "es"


class WorkflowInputPayload(BaseModel):
    companyOrClient: str = Field(..., min_length=1, max_length=200)
    sourceContext: str = Field(default="", max_length=500)
    rawInput: str = Field(..., min_length=1, max_length=12000)


class AgentConfigOverride(BaseModel):
    agentName: str = Field(default="PulseFlow Analyst", min_length=1, max_length=80)
    systemInstruction: str = Field(..., min_length=1, max_length=4000)
    businessRules: str = Field(default="", max_length=4000)


class WorkflowExecuteRequest(BaseModel):
    workspaceId: str = Field(..., min_length=1, max_length=128, pattern=r"^[a-zA-Z0-9_\-]+$")
    ownerId: str = Field(..., min_length=1, max_length=128, pattern=r"^[a-zA-Z0-9_\-]+$")
    templateId: TemplateId
    locale: LocaleCode = LocaleCode.EN
    inputTitle: str = Field(..., min_length=1, max_length=180)
    inputPayload: WorkflowInputPayload
    agentConfig: AgentConfigOverride

    @field_validator("inputTitle")
    @classmethod
    def strip_title(cls, v: str) -> str:
        return v.strip()


class StructuredWorkflowOutput(BaseModel):
    classification: str = Field(..., description="Primary category or qualification tier.")
    priority: str = Field(..., description="Urgency level: Low, Medium, High, or Critical.")
    confidenceScore: int = Field(..., ge=0, le=100, description="Model confidence percentage 0-100.")
    executiveSummary: str = Field(..., description="Concise 2-3 sentence executive synthesis.")
    estimatedImpactOrValue: str = Field(..., description="Estimated deal quote, SLA target, or contract exposure.")
    riskFlags: List[str] = Field(default_factory=list, description="Detected blockers, compliance risks, or missing details.")
    recommendedActions: List[str] = Field(..., description="Ordered list of concrete next steps.")


class WorkflowExecuteResponse(BaseModel):
    runId: str
    status: str
    latencyMs: int
    attempts: int
    modelUsed: str
    outputJson: Dict[str, Any]
    errorCode: Optional[str] = None
    errorMessage: Optional[str] = None


# ---------------------------------------------------------------------------
# FastAPI App & Auth Dependency
# ---------------------------------------------------------------------------
app = FastAPI(
    title="PulseFlow AI Automation Webhook",
    version="1.0.0",
    description="Resilient B2B Gemini workflow engine with Firestore audit logging.",
)

ALLOWED_ORIGINS = [
    origin.strip()
    for origin in os.getenv("CORS_ALLOW_ORIGINS", "http://localhost:3000").split(",")
    if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)


# ---------------------------------------------------------------------------
# Helpers: System Instruction & Exponential Backoff
# ---------------------------------------------------------------------------
LOCALE_NAME_MAP = {
    LocaleCode.EN: "English",
    LocaleCode.PT: "Portuguese (Brazil/Portugal)",
    LocaleCode.ES: "Spanish",
}


def build_system_instruction(req: WorkflowExecuteRequest) -> str:
    language_name = LOCALE_NAME_MAP[req.locale]
    return (
        f"You are {req.agentConfig.agentName}, an enterprise B2B workflow automation analyst.\n"
        f"Custom Workspace System Instruction:\n{req.agentConfig.systemInstruction}\n\n"
        f"Workspace Business Rules:\n{req.agentConfig.businessRules or 'Apply standard B2B operational best practices.'}\n\n"
        f"Active Workflow Template: {req.templateId.value}\n"
        f"Output Language Requirement: All natural-language string fields inside the JSON response "
        f"MUST be written in {language_name}."
    )


def write_dead_letter_error(
    req: WorkflowExecuteRequest,
    error_code: str,
    error_message: str,
    attempts: int,
) -> str:
    log_id = f"err_{uuid.uuid4().hex[:16]}"
    try:
        db.collection("error_logs").document(log_id).set(
            {
                "logId": log_id,
                "workspaceId": req.workspaceId,
                "ownerId": req.ownerId,
                "endpoint": "/api/v1/execute-workflow",
                "templateId": req.templateId.value,
                "errorCode": error_code[:80],
                "errorMessage": error_message[:1000],
                "attempts": attempts,
                "inputSummary": f"{req.inputTitle[:120]} ({req.inputPayload.companyOrClient[:60]})",
                "resolved": False,
                "createdAt": firestore.SERVER_TIMESTAMP,
            }
        )
    except Exception as firestore_err:
        logger.error("Failed to write dead-letter log %s: %s", log_id, firestore_err)
    return log_id


@app.get("/health")
async def health_check() -> Dict[str, str]:
    return {"status": "ok", "model": GEMINI_MODEL, "timestamp": datetime.now(timezone.utc).isoformat()}


@app.post("/api/v1/execute-workflow", response_model=WorkflowExecuteResponse)
async def execute_workflow(
    payload: WorkflowExecuteRequest,
) -> WorkflowExecuteResponse:
    workspace_snap = db.collection("workspaces").document(payload.workspaceId).get()
    if not workspace_snap.exists:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workspace not found.",
        )

    if not GEMINI_API_KEY:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="GEMINI_API_KEY is not configured on the server.",
        )

    run_id = f"run_{uuid.uuid4().hex[:16]}"
    started = time.perf_counter()
    max_attempts = 3
    last_error: Optional[Exception] = None
    attempts_used = 0

    user_prompt = (
        f"Workflow Title: {payload.inputTitle}\n"
        f"Client / Organization: {payload.inputPayload.companyOrClient}\n"
        f"Context / Source: {payload.inputPayload.sourceContext}\n\n"
        f"Submission Details:\n{payload.inputPayload.rawInput}"
    )

    for attempt in range(1, max_attempts + 1):
        attempts_used = attempt
        try:
            response = genai_client.models.generate_content(
                model=GEMINI_MODEL,
                contents=user_prompt,
                config=types.GenerateContentConfig(
                    system_instruction=build_system_instruction(payload),
                    response_mime_type="application/json",
                    response_schema=StructuredWorkflowOutput,
                ),
            )
            raw_text = (response.text or "").strip()
            parsed = StructuredWorkflowOutput.model_validate_json(raw_text).model_dump()
            latency_ms = int((time.perf_counter() - started) * 1000)

            # Atomic persistence to workflow_runs
            db.collection("workflow_runs").document(run_id).set(
                {
                    "runId": run_id,
                    "workspaceId": payload.workspaceId,
                    "ownerId": payload.ownerId,
                    "templateId": payload.templateId.value,
                    "locale": payload.locale.value,
                    "inputTitle": payload.inputTitle,
                    "inputPayload": payload.inputPayload.model_dump(),
                    "outputJson": parsed,
                    "status": "completed",
                    "latencyMs": latency_ms,
                    "attempts": attempts_used,
                    "modelUsed": GEMINI_MODEL,
                    "createdAt": firestore.SERVER_TIMESTAMP,
                }
            )

            return WorkflowExecuteResponse(
                runId=run_id,
                status="completed",
                latencyMs=latency_ms,
                attempts=attempts_used,
                modelUsed=GEMINI_MODEL,
                outputJson=parsed,
            )
        except Exception as exc:
            last_error = exc
            logger.warning(
                "Attempt %d/%d failed for run %s: %s",
                attempt,
                max_attempts,
                run_id,
                exc,
            )
            if attempt < max_attempts:
                backoff_sec = (0.5 * (2 ** (attempt - 1))) + random.uniform(0.05, 0.25)
                await asyncio.sleep(backoff_sec)

    # All retries exhausted -> dead-letter error_logs + standardized fallback payload
    latency_ms = int((time.perf_counter() - started) * 1000)
    err_msg = str(last_error) if last_error else "Unknown upstream AI failure"
    error_code = type(last_error).__name__ if last_error else "WORKFLOW_EXECUTION_ERROR"
    write_dead_letter_error(payload, error_code, err_msg, attempts_used)

    fallback_output = {
        "classification": "Fallback — Manual Review Required",
        "priority": "High",
        "confidenceScore": 0,
        "executiveSummary": "Automated AI execution exhausted retries; input preserved in dead-letter queue for operator review.",
        "estimatedImpactOrValue": "Pending manual review",
        "riskFlags": [f"Upstream error: {error_code}"],
        "recommendedActions": [
            "Inspect dead-letter error log in the Admin Error Drawer.",
            "Verify Gemini API quota and retry workflow payload.",
        ],
    }

    db.collection("workflow_runs").document(run_id).set(
        {
            "runId": run_id,
            "workspaceId": payload.workspaceId,
            "ownerId": payload.ownerId,
            "templateId": payload.templateId.value,
            "locale": payload.locale.value,
            "inputTitle": payload.inputTitle,
            "inputPayload": payload.inputPayload.model_dump(),
            "outputJson": fallback_output,
            "status": "failed",
            "latencyMs": latency_ms,
            "attempts": attempts_used,
            "modelUsed": GEMINI_MODEL,
            "createdAt": firestore.SERVER_TIMESTAMP,
        }
    )

    raise HTTPException(
        status_code=status.HTTP_502_BAD_GATEWAY,
        detail=json.dumps(
            {
                "runId": run_id,
                "status": "failed",
                "errorCode": error_code,
                "errorMessage": err_msg[:300],
                "attempts": attempts_used,
                "latencyMs": latency_ms,
                "fallbackOutput": fallback_output,
            }
        ),
    )
