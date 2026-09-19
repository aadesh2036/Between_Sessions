# Between Sessions — AI & LLM Provider Setup Guide

> **Audience:** Developers, DevOps, and Hackathon Evaluators  
> **Last Updated:** 2026-09-19  
> **Target LLM:** Open-Weight Instruct Models via Hugging Face Inference API / Serverless Router

---

## 1. Executive Summary

Between Sessions incorporates a **clinician-facing AI/RAG decision-support pipeline**. It synthesizes patient behavioral practice logs and distress trajectories between sessions, grounded in established clinical OCD/ERP literature.

The platform uses an **open-weight, cost-efficient, high-performance model**:
- **Default Recommended Model:** `Qwen/Qwen2.5-7B-Instruct`
- **Alternative Supported Models:** `meta-llama/Llama-3.1-8B-Instruct`, `mistralai/Mistral-7B-Instruct-v0.3`
- **Zero-Credential Fallback:** If no `HF_TOKEN` is supplied, the system automatically falls back to an offline deterministic mock provider (`mock-clinical-v1`) that runs locally without requiring network access or external credentials.

---

## 2. Where to Add Your Hugging Face Token (`HF_TOKEN`)

You can provide your Hugging Face Access Token in any of the following locations depending on how you run the application:

### Option A: In the Root `.env` File (Recommended for Local Dev)
Create or edit `.env` in the repository root directory:

```bash
# /Between_Sessions/.env

# AI Provider Configuration
AI_PROVIDER=huggingface
HF_TOKEN=hf_YourActualHuggingFaceTokenHere
HF_MODEL=Qwen/Qwen2.5-7B-Instruct
```

### Option B: For AWS SAM Local (`start_sam.sh` or `sam local start-api`)
In `backend/between-sessions-backend/env.json`:

```json
{
  "PractitionerFunction": {
    "AI_PROVIDER": "huggingface",
    "HF_TOKEN": "hf_YourActualHuggingFaceTokenHere",
    "HF_MODEL": "Qwen/Qwen2.5-7B-Instruct",
    "TABLE_NAME": "BetweenSessionsTable",
    "DYNAMODB_ENDPOINT": "http://host.containers.internal:8000",
    "JWT_SECRET": "between-sessions-secret-key-2026"
  }
}
```
Or pass it directly when starting SAM via shell:
```bash
HF_TOKEN="hf_YourToken" ./start_sam.sh
```

### Option C: For Express Dev Server (`start_express.sh`)
```bash
HF_TOKEN="hf_YourToken" ./start_express.sh
```
Or export it in your shell environment:
```bash
export HF_TOKEN="hf_YourToken"
export HF_MODEL="Qwen/Qwen2.5-7B-Instruct"
```

### Option D: For Cloud Deployment (AWS CloudFormation / Lambda)
Set the environment variable in the CloudFormation parameter or AWS Secrets Manager:
```yaml
# In template.yaml (production deployment)
Parameters:
  HuggingFaceToken:
    Type: String
    NoEcho: true
    Description: "Hugging Face Inference API Token"
```

---

## 3. How to Obtain a Free Hugging Face Token

1. Go to [https://huggingface.co/settings/tokens](https://huggingface.co/settings/tokens).
2. Click **Create new token**.
3. Select **Read** permissions (sufficient for Serverless Inference API calls).
4. Copy the token (starts with `hf_...`).
5. Set `HF_TOKEN=hf_...`.

---

## 4. Why `Qwen/Qwen2.5-7B-Instruct` is Selected

`Qwen/Qwen2.5-7B-Instruct` is selected as the default model for Between Sessions because:
1. **Exceptional JSON Schema Conformance:** Consistently outputs valid, structured JSON without hallucinating extraneous conversational fluff or dropping closing braces.
2. **Clinical & Technical Reasoning:** Ranks highest in instruction-following benchmarks among sub-10B open-weight models.
3. **Low Latency & Fast Cold Starts:** Supported natively on the free Hugging Face Serverless Router (`https://router.huggingface.co/hf-inference/v1/chat/completions`).
4. **Permissive Open-Source License:** Apache 2.0.

To switch to `Llama-3.1-8B-Instruct`:
```bash
export HF_MODEL="meta-llama/Llama-3.1-8B-Instruct"
```

---

## 5. Offline / Zero-Credential Fallback Behavior

If `HF_TOKEN` is unset or Hugging Face rate limits are encountered:
1. The backend logs a single notice: `[HuggingFaceProvider] No HF_TOKEN provided; falling back to MockLLMProvider.`
2. The mock provider synthesizes **real patient telemetry from DynamoDB** (actual check-in count, average SUDS, peak SUDS, practice responses) and **real retrieved knowledge chunks** (Craske et al., Abramowitz).
3. The returned payload is labeled with `"provider": "mock-clinical-v1"`.
4. All frontend and backend features continue to work seamlessly.
5. All test suites pass without needing live internet or paid credits.

---

## 6. Testing Your AI Configuration

Run the dedicated AI & RAG test suite:
```bash
cd backend/between-sessions-backend
node test_ai_rag.js
```

Expected output:
```
======================================================
   ALL 23 / 23 AI & RAG TESTS PASSED!
   STRICT SECURITY, ISOLATION & CITATIONS VERIFIED
======================================================
```
