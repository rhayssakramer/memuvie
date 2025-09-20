export interface UserProfile {
  name: string;
  email: string;
  photo?: string | null;
}

export interface Session {
  token: string; // simple opaque token
  expiresAt: number; // epoch ms
}

const PROFILE_KEY = 'userProfile';
const SESSION_KEY = 'session';

export function saveProfile(profile: UserProfile) {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}

export function getProfile(): UserProfile | null {
  const raw = localStorage.getItem(PROFILE_KEY);
  try { return raw ? JSON.parse(raw) as UserProfile : null; } catch { return null; }
}

export function clearProfile() {
  localStorage.removeItem(PROFILE_KEY);
}

export function startSession(hours = 4): Session {
  const expiresAt = Date.now() + hours * 60 * 60 * 1000;
  const session: Session = { token: cryptoRandom(), expiresAt };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return session;
}

export function getSession(): Session | null {
  const raw = localStorage.getItem(SESSION_KEY);
  try { return raw ? JSON.parse(raw) as Session : null; } catch { return null; }
}

export function isSessionValid(): boolean {
  const s = getSession();
  return !!(s && s.expiresAt > Date.now());
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

export function logoutAll() {
  clearSession();
  clearProfile();
  // Backward-compat cleanup
  localStorage.removeItem('userName');
  localStorage.removeItem('userPhoto');
}

function cryptoRandom() {
  try {
    const arr = new Uint8Array(16);
    (window.crypto || (window as any).msCrypto).getRandomValues(arr);
    return Array.from(arr).map(b => b.toString(16).padStart(2, '0')).join('');
  } catch {
    return Math.random().toString(36).slice(2) + Date.now().toString(36);
  }
}
