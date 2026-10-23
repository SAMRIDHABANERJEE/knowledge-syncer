/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { UserProfile } from '../types';

const AUTH_STORAGE_KEY = 'autodoc_google_user_v1';

export function getStoredUser(): UserProfile | null {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.warn('Failed to parse user session:', err);
  }
  return null;
}

export function saveUserSession(user: UserProfile | null): void {
  try {
    if (user) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  } catch (err) {
    console.warn('Failed to save user session:', err);
  }
}

// Parse Google JWT credential token returned by Google Identity Services
export function parseJwt(token: string): any {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error('Failed to decode JWT token:', e);
    return null;
  }
}

// Generate Google-style avatar SVG data URL if none provided
export function generateGoogleAvatar(name: string, email: string): string {
  const initial = (name || email || 'G').charAt(0).toUpperCase();
  const colors = ['#ea4335', '#4285f4', '#fbbc05', '#34a853', '#673ab7', '#3f51b5'];
  const colorIndex = (name.charCodeAt(0) || 0) % colors.length;
  const bgColor = colors[colorIndex];

  return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64"><rect width="64" height="64" rx="32" fill="${bgColor}"/><text x="32" y="40" font-size="28" font-family="Roboto, sans-serif" font-weight="bold" fill="white" text-anchor="middle">${initial}</text></svg>`;
}

// Reauthenticate and renew user login credentials
export function reauthenticateUser(user: UserProfile): UserProfile {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24-hour token validity
  const updated: UserProfile = {
    ...user,
    lastReauthenticatedAt: now.toISOString(),
    tokenExpiresAt: expiresAt.toISOString(),
  };
  saveUserSession(updated);
  return updated;
}

export function formatLastAuthTime(isoString?: string): string {
  if (!isoString) return 'Just now';
  const d = new Date(isoString);
  if (isNaN(d.getTime())) return 'Recently';
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

