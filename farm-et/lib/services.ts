
import api from './api';
import type { OnboardingFormData } from './validations/auth-schema';

// ─── Cookie helpers (used by Next.js middleware for route protection) ─────────

function setAuthCookie(token: string) {
  // Session cookie — expires when browser closes
  document.cookie = `auth_token=${token}; path=/; SameSite=Lax`;
}

function clearAuthCookie() {
  document.cookie = `auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
}

// ─── Auth Services ────────────────────────────────────────────────────────────

export const registerUser = async (payload: {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}) => {
  const response = await api.post('/register', payload);
  if (response.data.access_token) {
    localStorage.setItem('token', response.data.access_token);
    setAuthCookie(response.data.access_token);
  }
  return response.data;
};

export const loginUser = async (credentials: { email: string; password: string }) => {
  const response = await api.post('/login', credentials);
  if (response.data.access_token) {
    localStorage.setItem('token', response.data.access_token);
    setAuthCookie(response.data.access_token);
  }
  return response.data;
};

export const logoutUser = async () => {
  try {
    await api.post('/logout');
  } finally {
    localStorage.removeItem('token');
    clearAuthCookie();
  }
};

export const fetchUserProfile = async () => {
  const response = await api.get('/me');
  return response.data;
};

export const verifyEmailOtp = async (otp: string) => {
  const response = await api.post('/email/verify', { otp });
  return response.data;
};

export const resendVerificationOtp = async () => {
  const response = await api.post('/email/resend');
  return response.data;
};

// ─── Onboarding ───────────────────────────────────────────────────────────────

export const submitOnboarding = async (data: OnboardingFormData) => {
  const response = await api.post('/onboarding', {
    firstName:  data.firstName,
    lastName:   data.lastName,
    farmName:   data.farmName,
    latitude:   data.latitude,
    longitude:  data.longitude,
    unitSystem: data.unitSystem,
    timezone:   data.timezone,
    currency:   data.currency,
  });
  return response.data;
};

// ─── Transaction Services ─────────────────────────────────────────────────────

export const fetchTransactions = async () => {
  const response = await api.get('/transactions');
  return response.data;
};

export const createTransaction = async (data: {
  type: 'Income' | 'Expense';
  amount: number;
  payeeCustomer?: string;
  category: string;
  date: string;
  reportingYear: number;
  description?: string;
  checkNumber?: string;
  associatedTo?: string;
  keywords?: string;
}) => {
  const response = await api.post('/transactions', data);
  return response.data;
};

// ─── Financial Summary Report ─────────────────────────────────────────────────

export const fetchFinancialSummary = async (year: number = new Date().getFullYear()) => {
  const response = await api.get(`/reports/summary?year=${year}`);
  return response.data;
};

// ─── Market Listings (public) ─────────────────────────────────────────────────

export const fetchMarketListings = async () => {
  // This endpoint is public — no auth token needed
  const response = await api.get('/market/listings');
  return response.data; // { data: [...], total: n }
};

// ─── Admin Services (Restricted) ──────────────────────────────────────────────

export const fetchAdminUsers = async () => {
  const response = await api.get('/admin/users');
  return response.data;
};

export const fetchAdminUserDetails = async (userId: number | string) => {
  const response = await api.get(`/admin/users/${userId}`);
  return response.data;
};
