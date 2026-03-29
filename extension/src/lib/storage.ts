const KEYS = {
  TOKEN: 'aop_token',
  REFRESH_TOKEN: 'aop_refresh_token',
  ACTIVE_ORG: 'aop_active_org',
  API_URL: 'aop_api_url',
} as const;

const DEFAULT_API_URL = 'http://localhost:3001/api';

export async function getToken(): Promise<string | null> {
  const result = await chrome.storage.local.get(KEYS.TOKEN);
  return (result[KEYS.TOKEN] as string) ?? null;
}

export async function getRefreshToken(): Promise<string | null> {
  const result = await chrome.storage.local.get(KEYS.REFRESH_TOKEN);
  return (result[KEYS.REFRESH_TOKEN] as string) ?? null;
}

export async function getActiveOrg(): Promise<string | null> {
  const result = await chrome.storage.local.get(KEYS.ACTIVE_ORG);
  return (result[KEYS.ACTIVE_ORG] as string) ?? null;
}

export async function getApiUrl(): Promise<string> {
  const result = await chrome.storage.local.get(KEYS.API_URL);
  return (result[KEYS.API_URL] as string) ?? DEFAULT_API_URL;
}

export async function setTokens(accessToken: string, refreshToken: string): Promise<void> {
  await chrome.storage.local.set({
    [KEYS.TOKEN]: accessToken,
    [KEYS.REFRESH_TOKEN]: refreshToken,
  });
}

export async function setActiveOrg(orgId: string): Promise<void> {
  await chrome.storage.local.set({ [KEYS.ACTIVE_ORG]: orgId });
}

export async function setApiUrl(url: string): Promise<void> {
  await chrome.storage.local.set({ [KEYS.API_URL]: url });
}

export async function clearAuth(): Promise<void> {
  await chrome.storage.local.remove([KEYS.TOKEN, KEYS.REFRESH_TOKEN, KEYS.ACTIVE_ORG]);
}

export function decodeJwt(token: string): Record<string, unknown> | null {
  try {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
}

export async function isAuthenticated(): Promise<boolean> {
  const token = await getToken();
  if (!token) return false;
  const payload = decodeJwt(token);
  if (!payload || typeof payload.exp !== 'number') return false;
  return payload.exp * 1000 > Date.now();
}
