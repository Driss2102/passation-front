import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ children, roles }) {
  const { token, user, loading } = useAuth()

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner spinner-lg" />
        <span>Chargement...</span>
      </div>
    )
  }

  if (!token) {
    return <Navigate to="/login" replace />
  }

  if (roles && user && !roles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />
  }

  return children
}
