export interface UserProfile {
  name: string;
  email: string;
  photo?: string | null;
}

export interface Session {
  token: string; // Simple opaque token
  expiresAt: number; // Epoch ms
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

export function saveSession(token: string, expiresAt: number): Session {
  const session: Session = { token, expiresAt };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return session;
}

export function startSession(hours = 4): Session {
  const expiresAt = Date.now() + hours * 60 * 60 * 1000;
  // Esta função será mantida para compatibilidade com o código existente
  // Mas deve ser substituída por saveSession em novas implementações
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

export function updateProfile(profile: UserProfile) {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}

export function logoutAll() {
  clearSession();
  clearProfile();
  // Backward-compat cleanup
  localStorage.removeItem('userName');
  localStorage.removeItem('userPhoto');
}

// Função para manter compatibilidade entre formato antigo e novo de usuário
export function syncUserData() {
  // Primeiro, tentar obter do profile
  const profile = getProfile();

  if (profile) {
    // Se temos profile, garantir que os dados legados estão sincronizados
    localStorage.setItem('userName', profile.name);
    if (profile.photo) {
      localStorage.setItem('userPhoto', profile.photo);
    }
    return true;
  } else {
    // Se do not temos profile mas temos dados legados, criar profile
    const oldUserName = localStorage.getItem('userName');
    const oldUserPhoto = localStorage.getItem('userPhoto');

    if (oldUserName) {
      const newProfile = {
        name: oldUserName,
        email: 'usuario@local.com', // Email padrão para usuários legados
        photo: oldUserPhoto || 'assets/avatar-1.jpg'
      };
      saveProfile(newProfile);
      return true;
    }
  }
  return false;
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