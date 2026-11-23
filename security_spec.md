# Security Specification — PulseFlow AI

## 1. Data Invariants
1. **User Profile Ownership**: A `/users/{userId}` document may only be read, created, or updated by the verified authenticated user whose `request.auth.uid == userId`.
2. **Workspace Isolation**: A `/workspaces/{workspaceId}` document must always belong to an authenticated, email-verified `ownerId == request.auth.uid`, and `ownerId` + `workspaceId` + `createdAt` are immutable after creation.
3. **Workflow Run Integrity**: A `/workflow_runs/{runId}` document cannot exist without an existing parent `/workspaces/{workspaceId}` owned by `request.auth.uid`, and runs are immutable once created (audit-only, delete permitted only to owner).
4. **Dead-Letter Error Logs**: An `/error_logs/{logId}` document cannot exist without an existing parent `/workspaces/{workspaceId}` owned by `request.auth.uid`. Only the `resolved` boolean may transition from `false` to `true` (terminal state lock).

## 2. Adversarial "Dirty Dozen" Payloads (Expected: PERMISSION_DENIED)
1. **Shadow Field Injection on User**: `create /users/uid1` with `{ ...validUser, isAdmin: true }` -> Blocked by `hasOnly(...)`.
2. **Identity Spoofing on Workspace**: `create /workspaces/ws_1` with `ownerId: "other_uid"` -> Blocked by `incoming().ownerId == request.auth.uid`.
3. **Orphaned Workflow Run**: `create /workflow_runs/run_1` referencing non-existent `workspaceId: "ws_fake"` -> Blocked by `exists(...)`.
4. **Cross-Tenant Run Injection**: `create /workflow_runs/run_1` referencing another user's `workspaceId` -> Blocked by `get(...).data.ownerId == request.auth.uid`.
5. **Unverified Email Write**: Any write with `request.auth.token.email_verified == false` -> Blocked by `isEmailVerified()`.
6. **Blanket List Scraping**: `list /workflow_runs` without `where("ownerId", "==", uid)` -> Blocked by `resource.data.ownerId == request.auth.uid`.
7. **ID Poisoning**: `create /workflow_runs/<1.5KB junk string>` -> Blocked by `isValidId(runId)`.
8. **Type / Boundary Poisoning**: `update /workspaces/ws_1` with `systemInstruction` > 4000 chars or invalid hex `accentColor: "red"` -> Blocked by `isValidWorkspace()`.
9. **Immutable Timestamp Tampering**: `create /workflow_runs/run_1` with backdated client `createdAt` -> Blocked by `incoming().createdAt == request.time`.
10. **Audit Trail Mutation**: `update /workflow_runs/run_1` attempting to alter `outputJson` -> Blocked (`allow update: if false`).
11. **Terminal State Re-opening**: `update /error_logs/log_1` setting `resolved: false` when `existing().resolved == true` -> Blocked by `existing().resolved == false && incoming().resolved == true`.
12. **PII Cross-User Read**: `get /users/other_uid` by authenticated user `uid1` -> Blocked by `userId == request.auth.uid`.
