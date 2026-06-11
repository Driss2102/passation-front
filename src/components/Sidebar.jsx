import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const sections = [
  {
    label: 'Principal',
    links: [
      { to: '/dashboard', icon: '⊞', label: 'Tableau de bord', roles: null },
      { to: '/passations', icon: '↔', label: 'Passations',      roles: null },
      { to: '/alertes',   icon: '◉', label: 'Alertes',          roles: null },
    ],
  },
  {
    label: 'Rapports',
    links: [
      { to: '/analytics', icon: '▦', label: 'Analytiques', roles: ['MANAGER_RH', 'ADMIN'] },
    ],
  },
  {
    label: 'Administration',
    links: [
      { to: '/admin/users',      icon: '◎', label: 'Utilisateurs', roles: ['ADMIN'] },
      { to: '/admin/checklists', icon: '☑', label: 'Checklists',   roles: ['ADMIN'] },
    ],
  },
]

const roleLabel = {
  ADMIN:      'Administrateur',
  MANAGER_RH: 'Manager RH',
  EMPLOYE:    'Employé',
  REMPLACANT: 'Remplaçant',
}

export default function Sidebar({ isOpen, onClose }) {
  const { user } = useAuth()
  const role = user?.role || ''

  const initial = (user?.prenom || user?.nom || 'U')[0].toUpperCase()
  const displayName = `${user?.prenom || ''} ${user?.nom || ''}`.trim() || user?.email || 'Utilisateur'

  return (
    <>
      <div
        className={`sidebar-overlay ${isOpen ? 'visible' : ''}`}
        onClick={onClose}
      />
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>

        {/* Header / Brand */}
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <div className="sidebar-brand-icon">📋</div>
            <div>
              <div className="sidebar-brand-name">Passation</div>
              <span className="sidebar-brand-tag">Gestion des transitions</span>
            </div>
          </div>
          <button className="sidebar-close" onClick={onClose} aria-label="Fermer">✕</button>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          {sections.map((section) => {
            const visibleLinks = section.links.filter(
              (l) => !l.roles || l.roles.includes(role)
            )
            if (!visibleLinks.length) return null

            return (
              <div key={section.label} className="sidebar-section">
                <div className="sidebar-section-label">{section.label}</div>
                {visibleLinks.map((link) => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    className={({ isActive }) =>
                      `sidebar-link${isActive ? ' active' : ''}`
                    }
                    onClick={onClose}
                  >
                    <span className="link-icon">{link.icon}</span>
                    {link.label}
                  </NavLink>
                ))}
              </div>
            )
          })}
        </nav>

        {/* Footer / User */}
        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-avatar">{initial}</div>
            <div style={{ minWidth: 0 }}>
              <div className="sidebar-user-name truncate">{displayName}</div>
              <div className="sidebar-user-role">{roleLabel[role] || role}</div>
            </div>
          </div>
        </div>

      </aside>
    </>
  )
}
