# Demo Accounts & Credentials — Between Sessions

This document provides all deterministic demo accounts seeded in DynamoDB Local for evaluating and testing the Between Sessions application.

---

## 1. Clinician / Practitioner Portal

Access at: [`/practitioner/login`](http://localhost:5173/practitioner/login)

| Field | Value | Notes |
|---|---|---|
| **Name** | Dr. Kavita Mehra | MCI Registered Psychiatrist · ERP Specialist |
| **Email** | `kavita@betweensessions.com` | Primary seeded login email |
| **Alias Email** | `practitioner@betweensessions.com` | Alternate alias |
| **Password** | `Prac1234!` | Exact seeded password (case-sensitive) |
| **Practitioner ID** | `MCI-2024-KM-7741` | Demo government certification number |
| **Specialisation** | OCD, Anxiety Disorders, ERP | |
| **Languages** | English, Hindi | |
| **Active Patients** | Priya Sharma (`usr_priya_sharma_001`) | Connected with consent |

### Practitioner Registration / Synthetic ID Format
To register new synthetic clinicians on [`/practitioner/login`](http://localhost:5173/practitioner/login), any synthetic ID adhering to this format is accepted:
* **Format Regex:** `^MCI-(202[4-6])-[A-Z]{2}-\d{4}$`
* **Valid Sample IDs:**
  - `MCI-2024-KM-7741` (Dr. Kavita Mehra — existing)
  - `MCI-2024-RD-3829` (Dr. Ritu Desai)
  - `MCI-2025-AS-9182` (Dr. Arjun Sethi)
  - `MCI-2025-NK-5540` (Dr. Neha Kulkarni)
  - `MCI-2025-PB-1204` (Dr. Pradeep Bannerjee)
  - `MCI-2026-TS-8891` (Dr. Tanvi Shah)
  - `MCI-2025-RP-3312` (Any new clinician)

---

## 2. Individual / Patient Accounts

Access at: [`/login`](http://localhost:5173/login)

### Account A — Priya Sharma (Veteran User with Clinician Link)
*Best for testing clinician collaboration, longitudinal trends, consent toggles, and clinician recommendations.*

| Field | Value |
|---|---|
| **Name** | Priya Sharma |
| **Email** | `priya@betweensessions.com` (or `demo@betweensessions.com`) |
| **Password** | `Demo1234!` |
| **Tenure** | 21 days active longitudinal logging |
| **Check-ins** | 21 consecutive daily SUDS entries (trending 9 → 3) |
| **Practitioner** | Connected to Dr. Kavita Mehra (`status: active`) |
| **Practitioner Recommendation** | Active recommendation in Care tab |
| **Values** | Career, Family, Reading, Yoga |

---

### Account B — Alex Chen (New User, Standalone)
*Best for testing onboarding, initial pattern tracking, and practitioner discovery / connection invitations.*

| Field | Value |
|---|---|
| **Name** | Alex Chen |
| **Email** | `alex@betweensessions.com` |
| **Password** | `Demo1234!` |
| **Tenure** | 3 days |
| **Check-ins** | 3 daily SUDS entries (8 → 6) |
| **Practitioner** | None (unconnected; discovery banner displayed in Care tab) |
| **Values** | Studies, Photography, Gaming, Friends |

---

## 3. Quick Copy Reference

```text
# CLINICIAN
Email:           kavita@betweensessions.com
Password:        Prac1234!
Practitioner ID: MCI-2024-KM-7741

# PATIENT (CONNECTED)
Email:           priya@betweensessions.com
Password:        Demo1234!

# PATIENT (STANDALONE)
Email:           alex@betweensessions.com
Password:        Demo1234!
```

---

## 4. Re-seeding the Database
To reset the local database back to this exact deterministic state at any time:
```bash
cd backend/between-sessions-backend
node src/seed.js
```
