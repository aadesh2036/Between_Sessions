# Between Sessions — Backend PRD

## 1. Backend Goal

Build the smallest production-shaped AWS backend that supports the complete MVP story:

**Cognito → API Gateway → Lambda → DynamoDB → Strands/Bedrock**, with **Cedar-style policy enforcement for data access**, auditability, and granular consent.

The backend must never trust frontend role/consent state.

---

## 2. Architecture

```text
React + Tailwind
      │
      ▼
Amplify Hosting
      │
      ├── Cognito JWT
      ▼
API Gateway
      │
      ▼
Lambda handlers / domain services
      │
      ├── DynamoDB
      ├── Cedar authorization check
      ├── Strands agent → Bedrock
      └── CloudWatch
```

### Local development

- AWS SAM for Lambda/API definitions.
- LocalStack for DynamoDB/API/event emulation.
- `.env`/parameterized configuration; never hard-code secrets.
- Same request/response contracts locally and in AWS.

### AI

- **PartyRock:** prompt/prototype validation only.
- **Strands + Amazon Bedrock:** actual MVP implementation.
- AI receives only the minimum consent-authorized structured data needed for the requested job.

---

## 3. DynamoDB Strategy

Use a **single-table design** for the MVP to minimize infrastructure and keep access patterns explicit.

### Table

`BetweenSessions`

Primary key:

```text
PK  string
SK  string
```

Sparse GSIs:

```text
GSI1PK
GSI1SK
```

### Core entities

| Entity | PK | SK | Purpose |
|---|---|---|---|
| User profile | `USER#<userId>` | `PROFILE` | Minimal profile/onboarding state |
| Onboarding | `USER#<userId>` | `ONBOARDING` | Goal, language, preferences |
| Check-in | `USER#<userId>` | `CHECKIN#<timestamp>` | Distress/urge rating |
| Journal | `USER#<userId>` | `JOURNAL#<timestamp>#<entryId>` | Behavior event |
| Practice | `USER#<userId>` | `PRACTICE#<timestamp>#<practiceId>` | Exercise attempt/completion |
| AI insight | `USER#<userId>` | `AI#WEEK#<yyyy-mm-dd>` | Weekly summary + source metric IDs |
| Consent | `USER#<userId>` | `CONSENT#<purpose>#<recipientId>` | Granular, revocable sharing permission |
| Connection | `USER#<userId>` | `CONNECTION#<practitionerId>` | User ↔ practitioner state |
| Practitioner profile | `PRACTITIONER#<id>` | `PROFILE` | Public professional profile |
| Verification | `PRACTITIONER#<id>` | `VERIFICATION` | Restricted credential state |
| Request | `PRACTITIONER#<id>` | `REQUEST#<timestamp>#<userId>` | Incoming user request |
| Recommendation | `USER#<userId>` | `RECOMMENDATION#<timestamp>#<id>` | Human-authored next step |
| Audit event | `AUDIT#<date>` | `<timestamp>#<uuid>` | Security-sensitive access/action |
| Education module | `CONTENT#EDUCATION` | `<slug>` | Curated public content |

### GSI usage

`GSI1` is sparse and supports reverse lookups without a second table.

Examples:

```text
GSI1PK = PRACTITIONER#<id>
GSI1SK = REQUEST#<createdAt>#<userId>

GSI1PK = USER#<userId>
GSI1SK = CONNECTION#<status>#<practitionerId>
```

Do not add GSIs until a real query requires one.

---

## 4. Data Model Rules

### User

```json
{
  "userId": "cognito-sub",
  "displayName": "Demo User",
  "ageBand": "18-24",
  "language": "en",
  "goal": "track_patterns",
  "privacyAcknowledgedAt": "ISO-8601",
  "aiSummariesEnabled": true
}
```

Avoid raw DOB, unnecessary address, diagnosis fields, or unrelated behavioral data.

### Journal entry

```json
{
  "entryId": "uuid",
  "timestamp": "ISO-8601",
  "trigger": "short user-controlled description",
  "urge": 7,
  "responseType": "avoidance|compulsion|reassurance|no_response",
  "outcome": "short structured reflection",
  "tags": ["checking", "study"]
}
```

Free text is optional and minimized.

### Practice log

```json
{
  "practiceId": "uuid",
  "exerciseId": "delay-response-01",
  "completed": true,
  "preDistress": 7,
  "postDistress": 4,
  "durationSeconds": 120,
  "completedAt": "ISO-8601"
}
```

### Consent

```json
{
  "consentId": "uuid",
  "purpose": "professional_review|ai_summary|research",
  "recipientId": "practitioner-id",
  "dataCategories": [
    "checkins",
    "journal_structured",
    "practice_logs",
    "ai_summary"
  ],
  "status": "active|revoked",
  "grantedAt": "ISO-8601",
  "revokedAt": null,
  "version": "1"
}
```

Consent is granular and revocable.

### AI insight

```json
{
  "weekStart": "2026-09-14",
  "summary": "…",
  "sourceMetricIds": [
    "CHECKIN#...",
    "PRACTICE#..."
  ],
  "model": "bedrock-model-id",
  "promptVersion": "weekly-summary-v1",
  "generatedAt": "ISO-8601",
  "disclaimer": "Not a diagnosis or medical advice."
}
```

Every displayed claim must be traceable to source metrics.

---

## 5. API Contract

Base path:

```text
/api/v1
```

### User

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/me` | Current profile + onboarding state |
| PUT | `/me/onboarding` | Save onboarding |
| GET | `/education` | Education index |
| GET | `/education/{slug}` | Education module |
| GET | `/dashboard` | Aggregated user dashboard |
| POST | `/checkins` | Create daily check-in |
| GET | `/checkins?from=&to=` | Check-in history |
| POST | `/journal` | Create behavioral log |
| GET | `/journal?from=&to=` | Journal history |
| POST | `/practice` | Log curated exercise |
| GET | `/practice?from=&to=` | Practice history |
| GET | `/progress?range=7d|30d` | Aggregated progress |
| POST | `/ai/weekly-summary` | Generate/re-generate weekly summary |
| GET | `/ai/weekly-summary?week=` | Read weekly summary |
| GET | `/consents` | Current sharing permissions |
| PUT | `/consents/{consentId}` | Grant/update/revoke consent |
| GET | `/practitioners` | Verified practitioner discovery |
| POST | `/connections` | Create patient request |
| GET | `/connections` | User's connections/requests |
| DELETE | `/connections/{id}` | Disconnect/revoke relationship |
| GET | `/recommendations` | Professional recommendations |

### Practitioner

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/practitioner/me` | Practitioner profile + verification status |
| POST | `/practitioner/verification` | Submit demo credentials |
| GET | `/practitioner/requests` | Incoming connection requests |
| POST | `/practitioner/requests/{id}/accept` | Accept request |
| POST | `/practitioner/requests/{id}/decline` | Decline request |
| GET | `/practitioner/patients/{userId}/summary` | Consent-filtered patient summary |
| GET | `/practitioner/patients/{userId}/consent` | Exact authorized categories |
| POST | `/practitioner/patients/{userId}/recommendations` | Human-authored next step/referral |

No endpoint returns private patient data merely because the caller knows a `userId`.

---

## 6. Authorization

Use three layers:

1. **Cognito** — identity.
2. **API/Lambda role checks** — coarse actor boundary (`user`, `practitioner`, future `admin`).
3. **Cedar** — resource/action authorization using identity, connection state, consent, and requested data category.

Conceptual policy:

```text
ALLOW practitioner
TO action = "read_patient_summary"
ON user
WHEN:
  practitioner.verified == true
  AND connection.status == "active"
  AND consent contains requested data category
```

Explicitly deny when:

- practitioner is unverified;
- connection does not exist/is revoked;
- requested data category is not consented;
- actor does not own the user resource.

Every sensitive read/write creates an audit event.

---

## 7. Lambda Boundaries

Prefer domain handlers over one giant Lambda:

```text
auth/profile
onboarding
checkins
journal
practice
dashboard/progress
consent
practitioner
connection
ai-summary
audit
```

Shared modules:

```text
authContext
authorization
consentResolver
dynamoRepository
validation
auditLogger
aiService
```

Use idempotency for writes that can be retried.

---

## 8. AI Flow

```text
POST /ai/weekly-summary
        ↓
Authenticate user
        ↓
Check aiSummariesEnabled
        ↓
Query structured weekly metrics
        ↓
Strands workflow
        ↓
Bedrock
        ↓
Validate output schema
        ↓
Store sourceMetricIds + model version
        ↓
Return summary + disclaimer
```

Prompt boundary:

- summarize observed metrics;
- no diagnosis;
- no causal claims;
- no medication advice;
- no individualized treatment plan;
- no reassurance loop;
- no autonomous crisis/risk judgment.

Example acceptable output:

> “You logged avoidance in 4 of 7 tracked situations and completed 3 practice sessions.”

Avoid unsupported interpretations such as:

> “Your anxiety is getting worse.”

---

## 9. Security / Privacy

- TLS in transit.
- DynamoDB encryption at rest.
- Secrets in AWS Secrets Manager / Parameter Store.
- No credentials in Git.
- Least-privilege IAM.
- CloudWatch structured logs.
- Never log full journal free text.
- Audit sensitive reads/writes.
- Data minimization and purpose limitation.
- Consent revocation must immediately block new practitioner reads.
- Support export/delete semantics for MVP where technically feasible.
- Keep safety resources available without requiring the user to share data.

---

## 10. Error Contract

```json
{
  "error": {
    "code": "CONSENT_REQUIRED",
    "message": "This data category has not been authorized for this practitioner."
  },
  "requestId": "uuid"
}
```

Core errors:

```text
UNAUTHORIZED
FORBIDDEN
CONSENT_REQUIRED
NOT_FOUND
VALIDATION_ERROR
CONFLICT
RATE_LIMITED
AI_UNAVAILABLE
INTERNAL_ERROR
```

Never expose DynamoDB errors, stack traces, model prompts, credentials, or internal policy details.

---

## 11. Demo Seed Data

Seed only synthetic/demo records:

- 1 demo user
- 1 verified demo practitioner
- 1 active connection
- 7 days of check-ins
- 5–10 behavioral logs
- 3–5 practice logs
- 1 generated weekly insight
- 1 recommendation

This makes the 3-minute demo deterministic without using real mental-health data.
