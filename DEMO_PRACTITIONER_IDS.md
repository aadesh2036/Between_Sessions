# Between Sessions — Demo Practitioner Identifiers

> **Status:** Authoritative Demo Credential Registry  
> **Environment:** Local Prototype / Evaluation Environment  
> **Notice:** All credentials in this file are **synthetic demonstration identifiers** designed for deterministic testing of practitioner onboarding, verification, and role-based access control. None of these represent real government medical credentials.

---

## 1. Synthetic Credential Format Specification

Practitioner registration and login validate credentials against a deterministic synthetic specification:

* **Format:** `MCI-YYYY-II-NNNN`
  * `MCI`: Prefix denoting synthetic Medical Council accreditation (Demo).
  * `YYYY`: Year of accreditation (`2024`, `2025`, or `2026`).
  * `II`: Two-letter practitioner initials in uppercase (`[A-Z]{2}`).
  * `NNNN`: Four-digit synthetic serial number (`\d{4}`).
* **Validation Regex:**
  ```regex
  ^MCI-(202[4-6])-[A-Z]{2}-\d{4}$
  ```

---

## 2. Seeded & Deterministic Demo Practitioners

The following synthetic IDs are pre-seeded or guaranteed to pass validation in the Between Sessions prototype:

| Synthetic Credential ID | Practitioner Name | Role / Specialty | Status | Seeded Account | Notes |
|---|---|---|---|---|---|
| **`MCI-2024-KM-7741`** | **Dr. Kavita Mehra** | MD, Psychiatry · ERP Specialist | **Verified** | `kavita@betweensessions.com` / `Prac1234!` | **Primary seeded demo practitioner.** Connected to Priya Sharma. |
| **`MCI-2024-RD-3829`** | Dr. Rohan Desai | PhD, Clinical Psychology · CBT | Verified | Available for registration | Synthetic specialist in cognitive restructuring. |
| **`MCI-2025-AS-9182`** | Dr. Ananya Sen | MD, Behavioral Medicine · ERP | Verified | Available for registration | Synthetic specialist in severe checking rituals. |
| **`MCI-2025-NK-5540`** | Dr. Nikhil Kapoor | DPM, Behavioral Neurology | Verified | Available for registration | Synthetic specialist in Tourettic OCD & tics. |
| **`MCI-2025-PB-1204`** | Dr. Pooja Bhatia | M.Phil, Clinical Psychology | Verified | Available for registration | Synthetic specialist in contamination & scrupulosity. |
| **`MCI-2026-TS-8891`** | Dr. Tarun Sharma | MD, Psychiatry · Adolescent OCD | Verified | Available for registration | Synthetic specialist in young adult care continuity. |

---

## 3. UI and Compliance Guardrails

1. **Mandatory Disclaimer:** Whenever a practitioner logs in or registers with a demo ID, the user interface must display:
   > *"Demo credential — not a real government ID"*
2. **Deterministic Evaluation:** The backend validation accepts any synthetically formed ID matching the regex above or directly matching any entry in the table above.
3. **No External Verification:** Production credential verification against state or national medical councils is strictly out of scope for this hackathon MVP and will be integrated in future phases via certified medical registry APIs.
