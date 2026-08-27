import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { User, authAPI, usersAPI } from './api'

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  setAuth: (user: User, token: string) => void
  updateUser: (user: User) => void
  logout: () => void
  checkAuth: () => Promise<void>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      setAuth: (user, token) => {
        if (typeof window !== 'undefined') {
          localStorage.setItem('access_token', token)
        }
        set({ user, token, isAuthenticated: true })
      },
      updateUser: (user) => set({ user }),
      logout: () => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('access_token')
        }
        set({ user: null, token: null, isAuthenticated: false })
      },
      checkAuth: async () => {
        const token = get().token
        if (!token) {
          set({ isAuthenticated: false, user: null })
          return
        }

        set({ isLoading: true })
        try {
          const user = await usersAPI.getMe()
          set({ user, isAuthenticated: true, isLoading: false })
        } catch {
          set({ user: null, token: null, isAuthenticated: false, isLoading: false })
          if (typeof window !== 'undefined') {
            localStorage.removeItem('access_token')
          }
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user, token: state.token, isAuthenticated: state.isAuthenticated }),
    }
  )
)

// Custom hook for using auth
import { useEffect } from 'react'

export function useAuth() {
  const { user, token, isAuthenticated, isLoading, logout, checkAuth } = useAuthStore()

  useEffect(() => {
    if (token && !user) {
      checkAuth()
    }
  }, [token, user])

  return { user, token, isAuthenticated, isLoading, logout }
}
