const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1').replace(/\/$/, '')

type TokenPair = { accessToken: string; refreshToken: string }
export type ApiErrorShape = { code: string; message: string; fields?: Record<string, string[]> }
export class ApiError extends Error { constructor(public status: number, public details: ApiErrorShape) { super(details.message); this.name = 'ApiError' } }

const storage = {
  get: (key: string) => window.localStorage.getItem(key),
  set: (key: string, value: string) => window.localStorage.setItem(key, value),
  remove: (key: string) => window.localStorage.removeItem(key),
}
export const tokenStorage = { getAccess: () => storage.get('edumanage.access'), getRefresh: () => storage.get('edumanage.refresh'), set: (tokens: TokenPair) => { storage.set('edumanage.access', tokens.accessToken); storage.set('edumanage.refresh', tokens.refreshToken) }, clear: () => { storage.remove('edumanage.access'); storage.remove('edumanage.refresh') } }

async function request<T>(path: string, init: RequestInit = {}, retry = true): Promise<T> {
  const headers = new Headers(init.headers)
  headers.set('content-type', 'application/json')
  const access = tokenStorage.getAccess()
  if (access) headers.set('authorization', `Bearer ${access}`)
  const response = await fetch(`${API_URL}${path}`, { ...init, headers })
  if (response.status === 401 && retry && tokenStorage.getRefresh()) {
    try { await refresh(); return request<T>(path, init, false) } catch { tokenStorage.clear(); window.dispatchEvent(new Event('edumanage:logout')) }
  }
  const payload = await response.json().catch(() => ({}))
  if (!response.ok) { const details = payload?.error || { code: 'REQUEST_FAILED', message: response.statusText || 'Request failed' }; throw new ApiError(response.status, details) }
  return (payload && Object.prototype.hasOwnProperty.call(payload, 'data') ? payload.data : payload) as T
}
export async function refresh() { const refreshToken = tokenStorage.getRefresh(); if (!refreshToken) throw new Error('No refresh token'); const tokens = await request<TokenPair>('/auth/refresh', { method: 'POST', body: JSON.stringify({ refreshToken }) }, false); tokenStorage.set(tokens); return tokens }
export const api = { get: <T>(path: string) => request<T>(path), post: <T>(path: string, body?: unknown) => request<T>(path, { method: 'POST', body: JSON.stringify(body ?? {}) }), put: <T>(path: string, body?: unknown) => request<T>(path, { method: 'PUT', body: JSON.stringify(body ?? {}) }), patch: <T>(path: string, body?: unknown) => request<T>(path, { method: 'PATCH', body: JSON.stringify(body ?? {}) }), delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }), logout: () => request('/auth/logout', { method: 'POST' }).catch(() => undefined) }
export async function loginRequest(email: string, password: string) { const result = await request<TokenPair>('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }, false); tokenStorage.set(result); return result }
export type Me = { user: { id: string; email: string; name?: string }; role: { uniqueKey?: string; key?: string } | string; permissions: string[]; modules: string[]; branch?: unknown }
export const loadMeRequest = () => api.get<Me>('/auth/me')
export { API_URL }
