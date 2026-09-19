# Between Sessions — AWS Cloud Production Deployment Guide

> **Target Architecture:** AWS Serverless Application Model (SAM) + DynamoDB + Amazon S3 + Amazon CloudFront  
> **Region:** `us-east-1` (or your chosen production AWS region)  
> **Authoritative SAM Template:** `infrastructure/template.yaml`  
> **SAM Deployment Configuration:** `infrastructure/samconfig.toml`

---

## 1. Prerequisites

Before initiating an AWS cloud deployment, ensure your deployment workstation or CI/CD runner has the following tools installed and configured:

1. **AWS CLI v2** (`aws --version`): Configured with an IAM identity with permissions for CloudFormation, Lambda, API Gateway, DynamoDB, IAM role creation, S3, and CloudFront.
   ```bash
   aws configure
   # Enter AWS Access Key ID, Secret Access Key, Default region (us-east-1), and output format (json)
   aws sts get-caller-identity
   ```
2. **AWS SAM CLI** (`sam --version` ≥ 1.110.0):
   ```bash
   sam --version
   ```
3. **Node.js** (`node -v` ≥ 20.x or 22.x LTS) & **npm** (`npm -v` ≥ 10.x).
4. **Valid Secrets**:
   * Mailtrap SMTP production credentials (or Amazon SES credentials) for email verification and password reset dispatch.
   * Hugging Face Inference API Token (`HF_API_KEY`) for Qwen 2.5 7B Instruct clinical reasoning (optional; falls back to deterministic MockLLM provider if omitted).
   * Cryptographic JWT Secret (`JWT_SECRET`) for production authentication token signing.

---

## 2. Directory Architecture & Boundaries

The deployment structure separates infrastructure from application code:

```
Between_Sessions/
├── backend/
│   └── src/                    # Node.js 22.x Lambda microservices & Cedar WASM policies
├── frontend/
│   ├── src/                    # React 19 / Vite application
│   └── dist/                   # Production frontend distribution bundle
├── infrastructure/
│   ├── template.yaml           # SAM template: 13 Lambda functions, API Gateway, DynamoDB Table
│   ├── samconfig.toml          # CloudFormation stack parameters and capabilities
│   └── events/                 # Synthetic invocation payloads for smoke testing
├── scripts/
│   ├── start_local.sh          # Local developer launcher
│   ├── seed.sh                 # DynamoDB Local seed utility
│   └── run_tests.sh            # Automated verification test runner
├── tests/                      # Automated end-to-end and AI test suites
└── docs/
    └── deployment/             # Deployment runbooks and cloud architecture guides
```

---

## 3. Step-by-Step Serverless Backend Deployment

### Step 3.1: Build the Serverless Artifacts

From the project root or `infrastructure/` directory, compile the Lambda packages:

```bash
cd infrastructure
sam build
```

SAM will:
* Inspect `infrastructure/template.yaml`.
* Resolve `CodeUri: ../backend/src/` for each of the 13 serverless Lambda functions.
* Execute `npm install --production` and bundle dependencies into `.aws-sam/build/`.
* Emit the deployable CloudFormation template at `.aws-sam/build/template.yaml`.

### Step 3.2: Deploy via Guided SAM Mode (First Time)

For the initial deployment to create the CloudFormation stack and configure parameters:

```bash
cd infrastructure
sam deploy --guided
```

Provide the configuration inputs when prompted:
* **Stack Name:** `between-sessions-production` (or `between-sessions-staging`)
* **AWS Region:** `us-east-1`
* **Confirm changes before deploy:** `Y` (recommended for production safety)
* **Allow SAM CLI to create IAM roles:** `Y`
* **Disable rollback:** `N` (keep rollback enabled for safety)
* **AuthFunction may not have authorization defined:** `Y` (public auth endpoints: login, register, verify, forgot-password)
* **Save arguments to configuration file:** `Y`
* **SAM configuration file:** `samconfig.toml`
* **SAM configuration environment:** `default` (or `prod`)

### Step 3.3: Subsequent Automated Deploys

Once `infrastructure/samconfig.toml` contains your parameters, subsequent CI/CD deployments execute with:

```bash
cd infrastructure
sam deploy --no-confirm-changeset
```

---

## 4. Environment Variables & Production Secrets

### 4.1 Global Lambda Parameters

In `infrastructure/template.yaml`, the `Globals.Function.Environment.Variables` block defines runtime configuration:

| Variable Name | Description | Recommended Cloud Value |
|---|---|---|
| `TABLE_NAME` | DynamoDB Table Name | `BetweenSessionsTable` |
| `DYNAMODB_ENDPOINT` | Custom endpoint (Local only) | *Leave unset in production* (SDK defaults to AWS) |
| `AWS_REGION` | Target AWS Region | `us-east-1` |
| `JWT_SECRET` | Secret key for JWT auth | Store in AWS Secrets Manager or pass via CloudFormation parameter |
| `MAILTRAP_SMTP_HOST` | SMTP server host | `sandbox.smtp.mailtrap.io` (or `email-smtp.us-east-1.amazonaws.com`) |
| `MAILTRAP_SMTP_PORT` | SMTP server port | `2525` (or `587` for SES) |
| `MAILTRAP_SMTP_USER` | SMTP username | Pass via AWS Parameter Store / Secrets Manager |
| `MAILTRAP_SMTP_PASS` | SMTP password | Pass via AWS Parameter Store / Secrets Manager |
| `AI_PROVIDER` | AI reasoning provider | `huggingface` (or `mock` for deterministic staging) |
| `HF_MODEL` | Hugging Face model repository | `Qwen/Qwen2.5-7B-Instruct` |
| `HF_API_KEY` | Hugging Face Inference API token | Pass via CloudFormation parameter or AWS SSM Parameter Store |

### 4.2 Passing Secure Secrets via SAM Parameters

To avoid committing secrets to version control, declare parameters in `infrastructure/template.yaml`:

```yaml
Parameters:
  JwtSecretParam:
    Type: String
    NoEcho: true
    Description: Production JWT signing secret key
  HfApiKeyParam:
    Type: String
    NoEcho: true
    Description: Hugging Face Inference API Key
```

Deploy with parameter overrides:

```bash
sam deploy \
  --parameter-overrides \
    JwtSecretParam="$PROD_JWT_SECRET" \
    HfApiKeyParam="$PROD_HF_API_KEY"
```

---

## 5. DynamoDB Production Configuration

* **Table Structure:** Single-table design (`BetweenSessionsTable`) with Partition Key `PK` (String) and Sort Key `SK` (String).
* **Capacity Mode:** `PAY_PER_REQUEST` (On-Demand billing mode configured in `template.yaml` — zero idle capacity cost, automatically scales to thousands of concurrent requests).
* **Point-in-Time Recovery (PITR):** Enable for healthcare data protection:
  ```bash
  aws dynamodb update-continuous-backups \
    --table-name BetweenSessionsTable \
    --point-in-time-recovery-specification PointInTimeRecoveryEnabled=true
  ```
* **Server-Side Encryption:** Configured with AWS-managed KMS key (`SSESpecification.SSEEnabled: true`).

---

## 6. Frontend Production Build & Hosting (S3 + CloudFront)

### Step 6.1: Build the React Client

1. Retrieve the live API Gateway endpoint URL from your SAM deployment outputs (e.g. `https://<api-id>.execute-api.us-east-1.amazonaws.com/Prod`).
2. Set `VITE_API_BASE` in `frontend/.env.production`:
   ```env
   VITE_API_BASE=https://<api-id>.execute-api.us-east-1.amazonaws.com/Prod/api/v1
   ```
3. Compile the production Vite bundle:
   ```bash
   cd frontend
   npm run build
   ```
   Artifacts are output to `frontend/dist/`.

### Step 6.2: Create S3 Hosting Bucket & CloudFront CDN

```bash
# 1. Create secure S3 bucket
BUCKET_NAME="betweensessions-frontend-$(aws sts get-caller-identity --query Account --output text)"
aws s3 mb "s3://$BUCKET_NAME" --region us-east-1
aws s3 website "s3://$BUCKET_NAME" --index-document index.html --error-document index.html

# 2. Sync distribution assets
aws s3 sync frontend/dist/ "s3://$BUCKET_NAME/" --delete

# 3. Invalidate CloudFront CDN cache (if CloudFront distribution is attached)
aws cloudfront create-invalidation \
  --distribution-id <DISTRIBUTION_ID> \
  --paths "/*"
```

---

## 7. Post-Deployment Verification (Smoke Tests)

Once deployed, execute the smoke verification suite against the live AWS endpoint:

```bash
# 1. Health check
curl -f -s https://<api-id>.execute-api.us-east-1.amazonaws.com/Prod/api/health | jq .

# 2. Public Practitioner Discovery
curl -f -s https://<api-id>.execute-api.us-east-1.amazonaws.com/Prod/api/v1/practitioners | jq .

# 3. Run automated tests against cloud endpoint
API_BASE="https://<api-id>.execute-api.us-east-1.amazonaws.com/Prod/api/v1" \
HEALTH_URL="https://<api-id>.execute-api.us-east-1.amazonaws.com/Prod/api/health" \
npm run test
```

---

## 8. Rollback & Disaster Recovery Procedures

### 8.1 Immediate Rollback via CloudFormation

If any critical issue arises during or after deployment:

```bash
# Roll back to the previous stable CloudFormation stack state
aws cloudformation rollback-stack \
  --stack-name between-sessions-production \
  --region us-east-1
```

### 8.2 Safe Teardown

If you need to completely remove the demo/evaluation stack:

```bash
cd infrastructure
sam delete --stack-name between-sessions-production --region us-east-1
```
*(Note: DynamoDB retains data if deletion protection is enabled in production).*
