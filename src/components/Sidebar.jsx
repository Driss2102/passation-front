import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const allLinks = [
  { to: '/dashboard', icon: '&#127968;', label: 'Tableau de bord', roles: null },
  { to: '/passations', icon: '&#128196;', label: 'Passations', roles: null },
  { to: '/alertes', icon: '&#128276;', label: 'Alertes', roles: null },
  { to: '/analytics', icon: '&#128202;', label: 'Analytiques', roles: ['MANAGER_RH', 'ADMIN'] },
  { to: '/admin/users', icon: '&#128101;', label: 'Gestion Utilisateurs', roles: ['ADMIN'] },
  { to: '/admin/checklists', icon: '&#9989;', label: 'Checklists', roles: ['ADMIN'] },
]

export default function Sidebar({ isOpen, onClose }) {
  const { user } = useAuth()
  const role = user?.role || ''

  const visibleLinks = allLinks.filter((link) => {
    if (!link.roles) return true
    return link.roles.includes(role)
  })

  return (
    <>
      <div
        className={`sidebar-overlay ${isOpen ? 'visible' : ''}`}
        onClick={onClose}
      />
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <span className="sidebar-logo">PassationApp</span>
          <button className="sidebar-close" onClick={onClose} aria-label="Fermer sidebar">
            &times;
          </button>
        </div>

        <nav className="sidebar-nav">
          <div className="sidebar-section-title">Navigation</div>
          {visibleLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `sidebar-link${isActive ? ' active' : ''}`
              }
              onClick={onClose}
            >
              <span
                className="link-icon"
                dangerouslySetInnerHTML={{ __html: link.icon }}
              />
              {link.label}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  )
}
