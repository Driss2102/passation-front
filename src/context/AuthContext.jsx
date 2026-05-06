import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

function decodeJwt(token) {
  try {
    const payload = token.split('.')[1]
    const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')))
    return decoded
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem('token')
    if (stored) {
      const decoded = decodeJwt(stored)
      if (decoded) {
        setToken(stored)
        setUser(decoded)
      } else {
        localStorage.removeItem('token')
      }
    }
    setLoading(false)
  }, [])

  const login = (newToken) => {
    const decoded = decodeJwt(newToken)
    if (decoded) {
      localStorage.setItem('token', newToken)
      setToken(newToken)
      setUser(decoded)
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
