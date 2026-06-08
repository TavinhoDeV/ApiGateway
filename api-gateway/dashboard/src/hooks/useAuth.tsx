import { createContext, useContext, useState, useCallback, ReactNode } from 'react'

interface AuthUser { id: string; name: string; email: string; plan: string; role: string }
interface AuthCtx { token: string | null; user: AuthUser | null; login: (email: string, password: string) => Promise<void>; logout: () => void }

const Ctx = createContext<AuthCtx | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('gw_token'))
  const [user, setUser]   = useState<AuthUser | null>(() => {
    const u = localStorage.getItem('gw_user'); return u ? JSON.parse(u) : null
  })

  const login = useCallback(async (email: string, password: string) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    if (!res.ok) throw new Error((await res.json()).error ?? 'Login falhou')
    const data = await res.json()
    localStorage.setItem('gw_token', data.token)
    localStorage.setItem('gw_user', JSON.stringify(data.user))
    setToken(data.token); setUser(data.user)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('gw_token'); localStorage.removeItem('gw_user')
    setToken(null); setUser(null)
  }, [])

  return <Ctx.Provider value={{ token, user, login, logout }}>{children}</Ctx.Provider>
}

export const useAuth = () => {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useAuth must be inside AuthProvider')
  return ctx
}
