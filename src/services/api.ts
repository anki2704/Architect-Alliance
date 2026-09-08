import type {
  Project,
  Booking,
  ContactMessage,
  User,
  TeamMember,
  Testimonial,
  JournalArticle
} from '../types';

const TOKEN_KEY = 'architech_token';
const USER_KEY = 'architech_user';

// ====================== IMPORTANT ======================
// Production mein Render URL use hoga, local mein blank (same domain)
const API_BASE = import.meta.env.VITE_API_URL || '';
// =======================================================

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredUser(): User | null {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

export function setStoredAuth(user: User, token: string) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearStoredAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> | undefined)
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  // Changed: ab API_BASE use ho raha hai
  const res = await fetch(`${API_BASE}/api${path}`, { ...options, headers });

  if (res.status === 204) return undefined as T;

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    if (res.status === 401) clearStoredAuth();
    throw new ApiError(data.error || `Request failed (${res.status})`, res.status);
  }

  return data as T;
}

// ---- Auth ----
export const authApi = {
  register: (name: string, email: string, password: string, phone?: string) =>
    apiFetch<{ user: User; token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, phone })
    }),

  login: async (email: string, password: string) => {
    // Changed: API_BASE use kiya
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok) return data as { user: User; token: string };
    if (data.requiresOtp) {
      return data as {
        requiresOtp: true;
        email: string;
        error: string;
        emailSent?: boolean;
        devOtp?: string;
      };
    }
    throw new ApiError(data.error || `Request failed (${res.status})`, res.status);
  },

  verifyOtp: (email: string, otp: string) =>
    apiFetch<{ user: User; token: string }>('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ email, otp })
    }),

  forgotPassword: (email: string) =>
    apiFetch<{ message: string; email?: string; emailSent?: boolean; devOtp?: string }>(
      '/auth/forgot-password',
      {
        method: 'POST',
        body: JSON.stringify({ email })
      }
    ),

  resendLoginOtp: (email: string) =>
    apiFetch<{ message: string; email?: string; emailSent?: boolean; devOtp?: string }>(
      '/auth/resend-login-otp',
      {
        method: 'POST',
        body: JSON.stringify({ email })
      }
    ),

  resetPassword: (email: string, otp: string, newPassword: string) =>
    apiFetch<{ message: string }>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ email, otp, newPassword })
    }),

  me: () => apiFetch<{ user: User }>('/auth/me'),

  logout: () =>
    apiFetch<{ message: string }>('/auth/logout', {
      method: 'POST',
      body: JSON.stringify({})
    })
};

// ---- Projects ----
export const projectsApi = {
  list: () => apiFetch<Project[]>('/projects'),
  get: (id: string) => apiFetch<Project>(`/projects/${id}`),
  create: (data: Partial<Project>) =>
    apiFetch<Project>('/projects', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Partial<Project>) =>
    apiFetch<Project>(`/projects/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  remove: (id: string) => apiFetch<void>(`/projects/${id}`, { method: 'DELETE' })
};

// ---- Upload ----
export const uploadApi = {
  image: (imageDataUrl: string, filename?: string) =>
    apiFetch<{ url: string }>('/upload', {
      method: 'POST',
      body: JSON.stringify({ image: imageDataUrl, filename })
    })
};

// ---- Team ----
export const teamApi = {
  list: () => apiFetch<TeamMember[]>('/team')
};

// ---- Testimonials ----
export const testimonialsApi = {
  list: () => apiFetch<Testimonial[]>('/testimonials'),
  create: (data: Partial<Testimonial>) =>
    apiFetch<Testimonial>('/testimonials', { method: 'POST', body: JSON.stringify(data) })
};

// ---- Journal ----
export const journalApi = {
  list: () => apiFetch<JournalArticle[]>('/journal'),
  get: (id: string) => apiFetch<JournalArticle>(`/journal/${id}`),
  create: (data: Partial<JournalArticle>) =>
    apiFetch<JournalArticle>('/journal', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Partial<JournalArticle>) =>
    apiFetch<JournalArticle>(`/journal/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  remove: (id: string) => apiFetch<void>(`/journal/${id}`, { method: 'DELETE' })
};

// ---- Bookings ----
export const bookingsApi = {
  list: () => apiFetch<Booking[]>('/bookings'),
  create: (data: Partial<Booking>) =>
    apiFetch<Booking>('/bookings', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Partial<Booking>) =>
    apiFetch<Booking>(`/bookings/${id}`, { method: 'PATCH', body: JSON.stringify(data) })
};

// ---- Contact messages ----
export const messagesApi = {
  list: () => apiFetch<ContactMessage[]>('/messages'),
  create: (data: Partial<ContactMessage>) =>
    apiFetch<ContactMessage>('/messages', { method: 'POST', body: JSON.stringify(data) })
};

// ---- Users (admin only) ----
export const usersApi = {
  list: (role?: string) => apiFetch<User[]>(`/users${role ? `?role=${role}` : ''}`),
  createDesigner: (name: string, email: string, password: string) =>
    apiFetch<User>('/users', { method: 'POST', body: JSON.stringify({ name, email, password }) }),
  removeDesigner: (id: string) => apiFetch<void>(`/users/${id}`, { method: 'DELETE' })
};

export { ApiError };