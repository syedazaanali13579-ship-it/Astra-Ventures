import type { AdminLoginResponse, LpInquiry, NewLpInquiry, NewSubmission, Submission, WebsiteContent } from './types';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, init);
  if (!response.ok) {
    const body = await response.json().catch(() => null) as { message?: string | string[] } | null;
    const message = Array.isArray(body?.message) ? body.message.join(', ') : body?.message;
    throw new Error(message || `Request failed (${response.status}).`);
  }
  return response.json() as Promise<T>;
}

function bearerHeaders(token: string): HeadersInit {
  return { Authorization: 'Bearer ' + token };
}

export const getContent = () => request<WebsiteContent>('/content');

export const loginAdmin = (email: string, password: string) =>
  request<AdminLoginResponse>('/admin/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });

export const submitFounderInquiry = (submission: NewSubmission) =>
  request<{ id: string; createdAt: string }>('/submissions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(submission)
  });

export const submitLpInquiry = (inquiry: NewLpInquiry) =>
  request<{ id: string; createdAt: string }>('/lp-submissions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(inquiry)
  });

export const getSubmissions = (token: string) =>
  request<Submission[]>('/submissions', { headers: bearerHeaders(token) });

export const getLpInquiries = (token: string) =>
  request<LpInquiry[]>('/lp-submissions', { headers: bearerHeaders(token) });

export const updateContent = (token: string, key: string, value: unknown) =>
  request<WebsiteContent>(`/content/${encodeURIComponent(key)}`, {
    method: 'PUT',
    headers: {
      ...bearerHeaders(token),
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ value })
  });
