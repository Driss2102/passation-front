import { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import PassationList from './pages/PassationList'
import PassationDetail from './pages/PassationDetail'
import AlertesPage from './pages/AlertesPage'
import AnalyticsPage from './pages/AnalyticsPage'
import AdminUsers from './pages/AdminUsers'
import AdminChecklists from './pages/AdminChecklists'
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'

function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="app-layout">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="main-area">
        <Navbar onMenuClick={() => setSidebarOpen(true)} />
        <main className="main-content">{children}</main>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Navigate to="/dashboard" />} />
          <Route path="/dashboard" element={
            <ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>
          } />
          <Route path="/passations" element={
            <ProtectedRoute><Layout><PassationList /></Layout></ProtectedRoute>
          } />
          <Route path="/passations/:id" element={
            <ProtectedRoute><Layout><PassationDetail /></Layout></ProtectedRoute>
          } />
          <Route path="/alertes" element={
            <ProtectedRoute><Layout><AlertesPage /></Layout></ProtectedRoute>
          } />
          <Route path="/analytics" element={
            <ProtectedRoute roles={['MANAGER_RH', 'ADMIN']}><Layout><AnalyticsPage /></Layout></ProtectedRoute>
          } />
          <Route path="/admin/users" element={
            <ProtectedRoute roles={['ADMIN']}><Layout><AdminUsers /></Layout></ProtectedRoute>
          } />
          <Route path="/admin/checklists" element={
            <ProtectedRoute roles={['ADMIN']}><Layout><AdminChecklists /></Layout></ProtectedRoute>
          } />
          <Route path="/unauthorized" element={
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', flexDirection: 'column', gap: '16px' }}>
              <h1>403 - Acces refuse</h1>
              <p>Vous n'avez pas les permissions pour acceder a cette page.</p>
              <a href="/dashboard" className="btn btn-primary">Retour au tableau de bord</a>
            </div>
          } />
          <Route path="*" element={<Navigate to="/dashboard" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
