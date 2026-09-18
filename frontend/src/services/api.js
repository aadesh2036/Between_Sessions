/**
 * api.js — Centralised API service layer
 *
 * All requests automatically attach the JWT bearer token stored in localStorage.
 * Errors are normalised to { message, code } so UI components don't need to
 * understand backend error shapes.
 */

const BASE_URL = 'http://localhost:3000/api/v1';

/** Retrieve the stored JWT token */
function getToken() {
  return localStorage.getItem('bs_token');
}

/**
 * Core fetch wrapper.
 * @param {string} path       - e.g. '/dashboard'
 * @param {object} [options]  - fetch options override
 */
async function apiFetch(path, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  // Parse JSON body (even for error responses)
  let data;
  try {
    data = await res.json();
  } catch {
    data = {};
  }

  if (!res.ok) {
    const msg =
      data?.error?.message ||
      data?.error ||
      data?.message ||
      `Request failed (${res.status})`;
    const err = new Error(msg);
    err.code = data?.error?.code || 'UNKNOWN_ERROR';
    err.status = res.status;
    throw err;
  }

  return data;
}

// ── Auth & User ──────────────────────────────────────────────────────────────

export const authApi = {
  register: (email, password, name) =>
    apiFetch('/auth/register', { method: 'POST', body: JSON.stringify({ email, password, name }) }),

  login: (email, password) =>
    apiFetch('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),

  verifyEmail: (token) =>
    apiFetch('/auth/verify', { method: 'POST', body: JSON.stringify({ token }) }),

  resendVerification: (email) =>
    apiFetch('/auth/resend', { method: 'POST', body: JSON.stringify({ email }) }),

  forgotPassword: (email) =>
    apiFetch('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) }),

  resetPassword: (token, newPassword) =>
    apiFetch('/auth/reset-password', { method: 'POST', body: JSON.stringify({ token, newPassword }) }),

  updateUser: (updates) =>
    apiFetch('/user/update', { method: 'PUT', body: JSON.stringify(updates) }),
};

// ── Dashboard ────────────────────────────────────────────────────────────────

export const dashboardApi = {
  get: () => apiFetch('/dashboard'),
};

// ── Check-ins ────────────────────────────────────────────────────────────────

export const checkinsApi = {
  create: (payload) =>
    apiFetch('/checkins', { method: 'POST', body: JSON.stringify(payload) }),

  list: (from, to) => {
    const qs = new URLSearchParams();
    if (from) qs.set('from', from);
    if (to) qs.set('to', to);
    return apiFetch(`/checkins?${qs.toString()}`);
  },
};

// ── Journal ──────────────────────────────────────────────────────────────────

export const journalApi = {
  create: (payload) =>
    apiFetch('/journal', { method: 'POST', body: JSON.stringify(payload) }),

  list: (from, to) => {
    const qs = new URLSearchParams();
    if (from) qs.set('from', from);
    if (to) qs.set('to', to);
    return apiFetch(`/journal?${qs.toString()}`);
  },
};

// ── Practice ─────────────────────────────────────────────────────────────────

export const practiceApi = {
  /** Legacy behavioral event log (Pause & Choose) */
  logEvent: (userId, responseType) =>
    apiFetch('/practice', { method: 'POST', body: JSON.stringify({ userId, responseType }) }),
};

// ── Progress ─────────────────────────────────────────────────────────────────

export const progressApi = {
  get: (range = '7d') => apiFetch(`/progress?range=${range}`),
};

// ── AI Summary ───────────────────────────────────────────────────────────────

export const aiSummaryApi = {
  generate: () => apiFetch('/ai/weekly-summary', { method: 'POST' }),
  get: (week) => {
    const qs = week ? `?week=${week}` : '';
    return apiFetch(`/ai/weekly-summary${qs}`);
  },
};

// ── Consents ─────────────────────────────────────────────────────────────────

export const consentsApi = {
  list: () => apiFetch('/consents'),

  upsert: (consentId, payload) => {
    const path = consentId ? `/consents/${consentId}` : '/consents';
    return apiFetch(path, { method: 'PUT', body: JSON.stringify(payload) });
  },

  revoke: (consentId, payload) =>
    apiFetch(`/consents/${consentId}`, {
      method: 'PUT',
      body: JSON.stringify({ ...payload, status: 'revoked' }),
    }),
};

// ── Connections ──────────────────────────────────────────────────────────────

export const connectionsApi = {
  list: () => apiFetch('/connections'),

  create: (practitionerId, message) =>
    apiFetch('/connections', {
      method: 'POST',
      body: JSON.stringify({ practitionerId, message }),
    }),

  remove: (practitionerId) =>
    apiFetch(`/connections/${practitionerId}`, { method: 'DELETE' }),

  cedarEval: (practitionerId) => {
    const qs = practitionerId ? `?practitionerId=${encodeURIComponent(practitionerId)}` : '';
    return apiFetch(`/connections/cedar-eval${qs}`);
  },
};

// ── Practitioner (Clinician Dashboard) ───────────────────────────────────────

function getPracToken() {
  return localStorage.getItem('bs_prac_token');
}

/**
 * Fetch wrapper that uses the practitioner JWT (bs_prac_token).
 */
async function pracFetch(path, options = {}) {
  const token = getPracToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  let data;
  try {
    data = await res.json();
  } catch {
    data = {};
  }

  if (!res.ok) {
    const msg =
      data?.error?.message ||
      data?.error ||
      data?.message ||
      `Request failed (${res.status})`;
    const err = new Error(msg);
    err.code = data?.error?.code || 'UNKNOWN_ERROR';
    err.status = res.status;
    throw err;
  }

  return data;
}

// ── Recommendations (Patient View) ───────────────────────────────────────────

export const recommendationsApi = {
  list: () => apiFetch('/recommendations'),
};

// ── Public Practitioner Directory ────────────────────────────────────────────

export const practitionersApi = {
  list: () => apiFetch('/practitioners'),
};

export const practitionerApi = {
  /** Authenticate a practitioner — uses apiFetch (no token needed for login) */
  login: (email, password, govCertId) =>
    apiFetch('/auth/practitioner-login', { method: 'POST', body: JSON.stringify({ email, password, practitionerId: govCertId }) }),

  /** Register a new practitioner with synthetic demo credential */
  register: (payload) =>
    apiFetch('/auth/practitioner-register', { method: 'POST', body: JSON.stringify(payload) }),

  /** Get the currently authenticated practitioner's profile */
  me: () => pracFetch('/practitioner/me'),

  /** Get the currently authenticated practitioner's profile (alias) */
  getMe: () => pracFetch('/practitioner/me'),

  /** Get all pending connection requests */
  getRequests: () => pracFetch('/practitioner/requests'),

  /** Get all active patients */
  getPatients: () => pracFetch('/practitioner/patients'),

  /** Accept a connection request from a patient */
  acceptRequest: (userId) =>
    pracFetch(`/practitioner/requests/${userId}/accept`, { method: 'POST', body: JSON.stringify({ userId }) }),

  /** Decline a connection request from a patient */
  declineRequest: (userId) =>
    pracFetch(`/practitioner/requests/${userId}/decline`, { method: 'POST', body: JSON.stringify({ userId }) }),

  /** Get a consented summary for a specific patient */
  getPatientSummary: (userId) => pracFetch(`/practitioner/patients/${userId}/summary`),

  /** Get consent status for a specific patient */
  getPatientConsent: (userId) => pracFetch(`/practitioner/patients/${userId}/consent`),

  /** Post a clinical recommendation for a patient */
  postRecommendation: (userId, payload) =>
    pracFetch(`/practitioner/patients/${userId}/recommendations`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
};

