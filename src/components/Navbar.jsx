import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import * as alerteService from '../services/alerteService'

const pageTitle = {
  '/dashboard':       'Tableau de bord',
  '/passations':      'Passations',
  '/alertes':         'Alertes',
  '/analytics':       'Analytiques',
  '/admin/users':     'Utilisateurs',
  '/admin/checklists':'Checklists',
}

export default function Navbar({ onMenuClick }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [nonLues, setNonLues] = useState(0)

  const title = pageTitle[window.location.pathname] || 'Passation'

  useEffect(() => {
    alerteService.getNonLues()
      .then((res) => {
        const data = res.data
        if (Array.isArray(data)) setNonLues(data.length)
        else if (typeof data === 'number') setNonLues(data)
      })
      .catch(() => {})
  }, [])

  const handleLogout = () => { logout(); navigate('/login') }

  const initial     = (user?.prenom || user?.nom || 'U')[0].toUpperCase()
  const displayName = `${user?.prenom || ''} ${user?.nom || ''}`.trim() || user?.email || 'Utilisateur'

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <button className="hamburger" onClick={onMenuClick} aria-label="Menu">☰</button>
        <span className="navbar-title">{title}</span>
      </div>

      <div className="navbar-right">
        <button
          className="bell-btn"
          onClick={() => navigate('/alertes')}
          title="Alertes"
          aria-label="Alertes"
        >
          🔔
          {nonLues > 0 && (
            <span className="bell-badge">{nonLues > 9 ? '9+' : nonLues}</span>
          )}
        </button>

        <div className="user-chip">
          <div className="user-avatar" title={displayName}>{initial}</div>
          <div style={{ lineHeight: 1.2 }}>
            <div className="user-name">{displayName}</div>
          </div>
        </div>

        <button className="btn btn-secondary btn-sm" onClick={handleLogout}>
          Déconnexion
        </button>
      </div>
    </nav>
  )
}
