import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import * as authService from '../services/authService'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await authService.login(email, password)
      const token = res.data?.token || res.data?.accessToken || res.data
      if (!token) throw new Error('Token non recu')
      login(token)
      navigate('/dashboard')
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data ||
        err.message ||
        'Erreur de connexion'
      setError(typeof msg === 'string' ? msg : 'Identifiants incorrects')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg)',
      padding: '16px',
    }}>
      <div style={{ width: '100%', maxWidth: '400px' }}>
        <div className="card" style={{ padding: '40px' }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{
              width: '56px',
              height: '56px',
              background: 'var(--primary)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              fontSize: '1.5rem',
            }}>
              &#128196;
            </div>
            <h1 style={{ fontSize: '1.5rem', color: 'var(--text)', marginBottom: '4px' }}>
              PassationApp
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Connectez-vous a votre compte
            </p>
          </div>

          {error && (
            <div className="error-container" style={{ marginBottom: '20px' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Adresse email</label>
              <input
                id="email"
                type="email"
                className="form-control"
                placeholder="vous@exemple.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                autoFocus
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Mot de passe</label>
              <input
                id="password"
                type="password"
                className="form-control"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg"
              disabled={loading}
              style={{ width: '100%', marginTop: '8px' }}
            >
              {loading ? (
                <>
                  <span className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }} />
                  Connexion...
                </>
              ) : (
                'Se connecter'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
