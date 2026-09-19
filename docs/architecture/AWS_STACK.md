# Between Sessions — AWS Serverless Stack & SAM Specification

> **Target Platform:** Amazon Web Services (AWS) Serverless Architecture  
> **Infrastructure as Code (IaC):** AWS Serverless Application Model (SAM)  
> **Template File:** `backend/between-sessions-backend/template.yaml`  
> **Runtime:** Node.js 22.x (x86_64)

---

## 1. AWS Architecture Components

Between Sessions is built entirely on native AWS serverless primitives:

```
                  ┌───────────────────────────────┐
                  │      Amazon Route 53 &        │
                  │       AWS CloudFront          │
                  │   (Static Frontend Edge)      │
                  └───────────────┬───────────────┘
                                  │ HTTPS
                                  ▼
                  ┌───────────────────────────────┐
                  │    Amazon API Gateway (v1)    │
                  │   REST API + CORS Preflights  │
                  └───────────────┬───────────────┘
                                  │
         ┌────────────────────────┼────────────────────────┐
         │                        │                        │
         ▼                        ▼                        ▼
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│  AuthFunction   │      │PractitionerFunc │      │CheckinsFunction │
│ (Lambda Node22) │      │ (Lambda Node22) │      │ (Lambda Node22) │
└────────┬────────┘      └────────┬────────┘      └────────┬────────┘
         │                        │                        │
         │                        ▼                        │
         │               ┌─────────────────┐               │
         │               │ AWS Cedar WASM  │               │
         │               │ (Policy Engine) │               │
         │               └────────┬────────┘               │
         │                        │                        │
         └────────────────────────┼────────────────────────┘
                                  │ AWS SDK v3
                                  ▼
                  ┌───────────────────────────────┐
                  │    Amazon DynamoDB Table      │
                  │     BetweenSessionsTable      │
                  │   (Single-Table PAY_PER_REQ)  │
                  └───────────────────────────────┘
```

---

## 2. SAM Lambda Functions Inventory

The serverless stack encapsulates 13 decoupled Lambda functions defined in `template.yaml`:

| Lambda Function | Source Handler | Purpose | Triggers |
|---|---|---|---|
| **AuthFunction** | `auth.handler` | Authentication, registration, password resets, verification, health check | `POST /auth/*`, `GET /api/health`, `GET /` |
| **PractitionerFunction** | `practitioner.handler` | Practitioner dashboard, roster, Cedar patient summary, recommendations, **AI decision support** | `GET /practitioner/*`, `POST /practitioner/*`, `POST .../ai-summary` |
| **CheckinsFunction** | `checkins.handler` | SUDS and compulsive urge logging | `GET/POST /checkins` |
| **PracticeFunction** | `practice.handler` | Exposure & Response Prevention (ERP) practice logs & curated plans | `GET/POST /practice`, `GET /practice/plans` |
| **JournalFunction** | `journal.handler` | Structured behavioral tracking (delay, mindfulness, substitution) | `GET/POST /journal` |
| **DashboardFunction** | `dashboard.handler` | Individual aggregated telemetry, longitudinal check-in count | `GET /dashboard` |
| **ProgressFunction** | `progress.handler` | Longitudinal distress trends & range aggregation | `GET /progress` |
| **AiSummaryFunction** | `aiSummary.handler` | Weekly patient practice summary calculation | `GET/POST /ai/weekly-summary` |
| **ConsentsFunction** | `consents.handler` | User-controlled granular sharing scopes | `GET/PUT /consents` |
| **ConnectionsFunction**| `connections.handler`| Mutual patient-practitioner linkage & Cedar evaluation test | `GET/POST/DELETE /connections`, `GET /connections/cedar-eval` |
| **ToolkitFunction** | `toolkit.handler` | Somatic grounding, box breathing, urge surfing logs | `GET/POST /toolkit/interactions` |
| **ValuesFunction** | `values.handler` | Life Outside OCD values commitments and action logs | `GET/POST /values/*` |
| **LearningFunction** | `learning.handler` | Curated educational books, chapters, and completion tracking | `GET/POST /learn/*` |

---

## 3. Local Serverless Emulation with AWS SAM CLI

Between Sessions provides full local parity with AWS Cloud without incurring cloud costs during development:

### Prerequisites
* **AWS SAM CLI:** `v1.130.0` or higher
* **Container Engine:** Podman (`unix:///run/user/1000/podman/podman.sock`) or Docker
* **Java JRE 17+:** For native DynamoDB Local on port 8000

### Launching the Stack
Run the root orchestrator:
```bash
./start_sam.sh
```

This script:
1. Verifies Java and the Podman user socket.
2. Starts native **DynamoDB Local** on port 8000 (cached in `.dynamodb-local/`).
3. Seeds synthetic demo personas (Priya, Alex, Dr. Mehra).
4. Executes `sam local start-api --port 3000 --warm-containers EAGER`.
5. Starts the Vite frontend server on port 5173.

---

## 4. Deploying to AWS Cloud

To deploy the stack to your AWS account:

```bash
cd backend/between-sessions-backend

# 1. Build the Lambda deployment packages
sam build

# 2. Deploy guided CloudFormation stack
sam deploy --guided \
  --stack-name between-sessions-production \
  --region ap-south-1 \
  --capabilities CAPABILITY_IAM
```

During the guided deployment:
- **Stack Name:** `between-sessions-production`
- **AWS Region:** `ap-south-1` (or your preferred region)
- **Parameter TABLE_NAME:** `BetweenSessionsTable`
- **Allow SAM CLI to create IAM roles with required permissions:** Yes
- **Save arguments to configuration file (samconfig.toml):** Yes

---

## 5. Security & Compliance Architecture

* **Server-Side Encryption:** DynamoDB table has `SSESpecification: SSEEnabled: true`.
* **Zero Real EHR Integration:** System operates as an intentional between-session companion, avoiding unauthorized PHI storage.
* **Cryptographic Authorization:** Evaluated via `@cedar-policy/cedar-wasm/nodejs` within Lambda execution context before touching patient partition keys.
* **JWT Integrity:** Signed with SHA-256 HMAC tokens with role claims (`practitioner` vs `individual`).
