import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import * as alerteService from '../services/alerteService'

export default function Navbar({ onMenuClick }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [nonLues, setNonLues] = useState(0)

  useEffect(() => {
    alerteService.getNonLues()
      .then((res) => {
        const data = res.data
        if (Array.isArray(data)) {
          setNonLues(data.length)
        } else if (typeof data === 'number') {
          setNonLues(data)
        }
      })
      .catch(() => {})
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const initials = user
    ? `${(user.prenom || user.nom || user.sub || 'U')[0].toUpperCase()}`
    : 'U'

  const displayName = user
    ? `${user.prenom || ''} ${user.nom || ''}`.trim() || user.email || user.sub || 'Utilisateur'
    : 'Utilisateur'

  const role = user?.role || ''

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <button className="hamburger" onClick={onMenuClick} aria-label="Menu">
          &#9776;
        </button>
        <span className="navbar-brand">PassationApp</span>
      </div>

      <div className="navbar-right">
        <button
          className="bell-btn"
          onClick={() => navigate('/alertes')}
          title="Alertes"
          aria-label="Alertes"
        >
          &#128276;
          {nonLues > 0 && (
            <span className="bell-badge">{nonLues > 9 ? '9+' : nonLues}</span>
          )}
        </button>

        <div className="user-info">
          <div className="user-avatar" title={displayName}>{initials}</div>
          <span className="user-name">{displayName}</span>
          {role && <span className="badge badge-primary">{role}</span>}
        </div>

        <button className="btn btn-secondary btn-sm" onClick={handleLogout}>
          Deconnexion
        </button>
      </div>
    </nav>
  )
}
