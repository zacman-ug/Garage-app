const TOKEN_KEY = 'gm_token';
const USER_KEY = 'gm_user';

export function getStoredToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredUser() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function persistSession({ token, user }) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

const baseUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api';

async function request(path, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers ?? {}),
  };

  const token = getStoredToken();
  if (token && !headers.Authorization) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let message = 'Request failed';
    try {
      const body = await response.json();
      message = body.message || message;
    } catch {
      const text = await response.text();
      if (text) message = text;
    }
    const error = new Error(message);
    error.status = response.status;
    throw error;
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

export const api = {
  get: (path, headers) => request(path, { method: 'GET', headers }),
  post: (path, body, headers) => request(path, { method: 'POST', body: JSON.stringify(body), headers }),
  put: (path, body, headers) => request(path, { method: 'PUT', body: JSON.stringify(body), headers }),
  patch: (path, body, headers) => request(path, { method: 'PATCH', body: JSON.stringify(body), headers }),
  del: (path, headers) => request(path, { method: 'DELETE', headers }),
};

export async function loginRequest({ email, password }) {
  return api.post('/auth/login', { email, password });
}

export async function forgotPasswordRequest({ email }) {
  return api.post('/auth/forgot-password', { email });
}

export async function resetPasswordRequest({ token, password }) {
  return api.post('/auth/reset-password', { token, password });
}

export async function fetchMe() {
  return api.get('/auth/me');
}

export async function fetchGarage() {
  return api.get('/garage');
}

export async function fetchAdminOverview() {
  return api.get('/admin/overview');
}

export async function fetchAdminJobs() {
  return api.get('/admin/jobs');
}

export async function updateJobStatus(jobId, { status, notes }) {
  return api.patch(`/jobs/${jobId}`, { status, notes });
}

export async function fetchInventory() {
  return api.get('/inventory');
}

export async function adjustInventory(payload) {
  return api.post('/inventory/adjust', payload);
}
