import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import * as authService from '../services/authService'

const DEMO_USERS = [
  { label: 'Admin',      email: 'admin@example.com',       role: 'Administrateur' },
  { label: 'Manager RH', email: 'bob.dupont@example.com',  role: 'Manager RH' },
  { label: 'Employé',    email: 'alice.martin@example.com',role: 'Employé partant' },
  { label: 'Remplaçant', email: 'claire.leclerc@example.com', role: 'Remplaçant' },
]

export default function Login() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const { login }   = useAuth()
  const navigate    = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await authService.login(email, password)
      const token = res.data?.token || res.data?.accessToken || res.data
      if (!token) throw new Error('Token non reçu')
      login(token)
      navigate('/dashboard')
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data || err.message || 'Erreur de connexion'
      setError(typeof msg === 'string' ? msg : 'Identifiants incorrects')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      background: 'var(--bg)',
    }}>
      {/* Left panel */}
      <div style={{
        flex: '0 0 45%',
        background: 'var(--sidebar-bg)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '48px',
        color: 'white',
      }} className="login-panel-left">

        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '38px', height: '38px',
            background: 'var(--primary)',
            borderRadius: '10px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.1rem',
          }}>📋</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '1rem', color: '#F8FAFC' }}>PassationApp</div>
            <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)' }}>Gestion des transitions</div>
          </div>
        </div>

        {/* Center quote */}
        <div>
          <div style={{
            fontSize: '1.75rem',
            fontWeight: 700,
            lineHeight: 1.3,
            color: '#F1F5F9',
            letterSpacing: '-0.02em',
            marginBottom: '16px',
          }}>
            Assurez la continuité<br />de vos projets
          </div>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem', lineHeight: 1.7 }}>
            Suivez vos passations en temps réel, anticipez les risques
            et garantissez des transitions fluides entre vos collaborateurs.
          </p>

          {/* Stats */}
          <div style={{
            display: 'flex', gap: '32px', marginTop: '36px',
          }}>
            {[
              { v: '4', l: 'Passations actives' },
              { v: '8', l: 'Projets suivis' },
              { v: '100%', l: 'Taux de réussite' },
            ].map(({ v, l }) => (
              <div key={l}>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary)' }}>{v}</div>
                <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', marginTop: '2px' }}>{l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.25)' }}>
          © 2025 PassationApp · Tous droits réservés
        </div>
      </div>

      {/* Right panel — form */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 24px',
      }}>
        <div style={{ width: '100%', maxWidth: '400px' }}>

          <div style={{ marginBottom: '36px' }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.02em', marginBottom: '6px' }}>
              Connexion
            </h1>
            <p style={{ color: 'var(--text-sub)', fontSize: '0.875rem' }}>
              Connectez-vous à votre espace de travail
            </p>
          </div>

          {error && <div className="error-container">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Adresse e-mail</label>
              <input
                id="email" type="email"
                className="form-control"
                placeholder="prenom.nom@entreprise.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required autoComplete="email" autoFocus
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Mot de passe</label>
              <input
                id="password" type="password"
                className="form-control"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg"
              disabled={loading}
              style={{ width: '100%', marginTop: '8px' }}
            >
              {loading ? (
                <><span className="spinner" style={{ width: '15px', height: '15px', borderWidth: '2px' }} /> Connexion…</>
              ) : 'Se connecter →'}
            </button>
          </form>

          {/* Demo accounts */}
          <div style={{ marginTop: '36px' }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px',
            }}>
              <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                Comptes de démonstration
              </span>
              <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              {DEMO_USERS.map((u) => (
                <button
                  key={u.email}
                  type="button"
                  onClick={() => { setEmail(u.email); setPassword('password123') }}
                  style={{
                    padding: '10px 12px',
                    border: '1.5px solid var(--border)',
                    borderRadius: 'var(--radius)',
                    background: email === u.email ? 'var(--primary-light)' : 'var(--bg-card)',
                    borderColor: email === u.email ? 'var(--primary)' : 'var(--border)',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.15s',
                  }}
                >
                  <div style={{ fontWeight: 600, fontSize: '0.8rem', color: 'var(--text)' }}>{u.label}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>{u.role}</div>
                </button>
              ))}
            </div>
            <p style={{ textAlign: 'center', marginTop: '10px', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              Mot de passe : <strong>password123</strong>
            </p>
          </div>
        </div>
      </div>

      {/* Hide left panel on mobile */}
      <style>{`
        @media (max-width: 768px) {
          .login-panel-left { display: none !important; }
        }
      `}</style>
    </div>
  )
}
