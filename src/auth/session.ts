/**
 * Sesión en localStorage con expiración de 1 hora.
 * - setSession: guarda usuario y timestamp de expiración
 * - getSession: devuelve usuario solo si no ha expirado; si expiró, limpia y devuelve null
 * - clearSession: borra usuario y expiración (logout)
 */

const STORAGE_USUARIO = "usuario";
const STORAGE_EXPIRES_AT = "sessionExpiresAt";
const UNA_HORA_MS = 60 * 60 * 1000;

export function setSession(usuario: object): void {
  const expiresAt = Date.now() + UNA_HORA_MS;
  localStorage.setItem(STORAGE_USUARIO, JSON.stringify(usuario));
  localStorage.setItem(STORAGE_EXPIRES_AT, String(expiresAt));
}

export function getSession(): unknown {
  const expiresAt = localStorage.getItem(STORAGE_EXPIRES_AT);
  if (!expiresAt || Date.now() > Number(expiresAt)) {
    clearSession();
    return null;
  }
  const raw = localStorage.getItem(STORAGE_USUARIO);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    clearSession();
    return null;
  }
}

export function clearSession(): void {
  localStorage.removeItem(STORAGE_USUARIO);
  localStorage.removeItem(STORAGE_EXPIRES_AT);
}
