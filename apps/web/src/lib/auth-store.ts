import { create } from 'zustand'
import { api, loadMeRequest, loginRequest, Me, tokenStorage } from './api'

type AuthState = { user: Me['user'] | null; role: string | null; permissions: string[]; modules: string[]; loading: boolean; error: string | null; login: (email: string, password: string) => Promise<void>; loadMe: () => Promise<void>; logout: () => Promise<void> }
export const useAuthStore = create<AuthState>((set) => ({
  user: null, role: null, permissions: [], modules: [], loading: false, error: null,
  login: async (email, password) => { set({ loading: true, error: null }); try { await loginRequest(email, password); const me = await loadMeRequest(); set({ user: me.user, role: typeof me.role === 'string' ? me.role : me.role.uniqueKey || me.role.key || null, permissions: me.permissions, modules: me.modules, loading: false }) } catch (error) { set({ loading: false, error: error instanceof Error ? error.message : 'Unable to sign in' }); throw error } },
  loadMe: async () => { if (!tokenStorage.getAccess()) return; set({ loading: true }); try { const me = await loadMeRequest(); set({ user: me.user, role: typeof me.role === 'string' ? me.role : me.role.uniqueKey || me.role.key || null, permissions: me.permissions, modules: me.modules, loading: false }) } catch { tokenStorage.clear(); set({ user: null, role: null, permissions: [], modules: [], loading: false }) } },
  logout: async () => { await api.logout(); tokenStorage.clear(); set({ user: null, role: null, permissions: [], modules: [], error: null }) },
}))
