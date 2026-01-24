import { http, HttpResponse } from 'msw';

const baseURL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080';

export const handlers = [
  // Example: Mocking /api/v1/auth/me
  http.get(`${baseURL}/api/v1/auth/me`, () => {
    return HttpResponse.json({
      role: 'Admin',
      name: 'Mock Admin',
      email: 'admin@example.com',
      siteEmail: 'admin@mysite.com',
      mobile: '010-1234-5678',
      createdAt: new Date().toISOString(),
    });
  }),

  // Example: Mocking Admin Dashboard Summary
  http.get(`${baseURL}/api/v1/admin/dashboard/summary`, () => {
    return HttpResponse.json({
      serverStatus: { status: 'NORMAL' },
      totalUsers: 1234,
      savedArtworks: 567,
      activeSessions: 89,
    });
  }),
];
