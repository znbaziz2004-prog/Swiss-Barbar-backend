import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { loginRequest } from '../services/adminService'
import { TOKEN_KEY, USER_KEY } from '../services/api'

const AdminAuthContext = createContext(null)

const readUser = () => {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY) || 'null')
  } catch {
    return null
  }
}

export function AdminAuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY))
  const [user, setUser] = useState(readUser)

  const login = useCallback(async (email, password) => {
    const data = await loginRequest({ email, password })

    if (!data?.token) throw new Error('Login failed. No token received.')

    if (data.user?.role && data.user.role !== 'super_admin') {
      throw new Error('This account does not have Super Admin access.')
    }

    localStorage.setItem(TOKEN_KEY, data.token)
    localStorage.setItem(USER_KEY, JSON.stringify(data.user || {}))
    setToken(data.token)
    setUser(data.user || {})
    return data.user
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    setToken(null)
    setUser(null)
    window.location.href = '/admin/login'
  }, [])

  const value = useMemo(
    () => ({ token, user, isAuthenticated: Boolean(token), login, logout }),
    [token, user, login, logout],
  )

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  )
}

export const useAdminAuth = () => {
  const ctx = useContext(AdminAuthContext)
  if (!ctx) throw new Error('useAdminAuth must be used inside AdminAuthProvider')
  return ctx
}
