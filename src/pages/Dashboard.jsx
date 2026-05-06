import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import * as passationService from '../services/passationService'
import Badge from '../components/Badge'
import ProgressBar from '../components/ProgressBar'

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState(null)
  const [passations, setPassations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const [statsRes, passRes] = await Promise.all([
          passationService.getDashboard().catch(() => ({ data: {} })),
          passationService.getAll().catch(() => ({ data: [] })),
        ])
        setStats(statsRes.data || {})
        setPassations(Array.isArray(passRes.data) ? passRes.data : [])
      } catch (err) {
        setError('Erreur lors du chargement du tableau de bord')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const role = user?.role || ''

  const kpis = [
    { label: 'Total Passations', value: stats?.totalPassations ?? passations.length, icon: '&#128196;' },
    { label: 'En cours', value: stats?.passationsEnCours ?? passations.filter(p => p.statut === 'EN_COURS').length, icon: '&#9654;', color: 'var(--info)' },
    { label: 'Terminees', value: stats?.passationsTerminees ?? passations.filter(p => p.statut === 'TERMINEE').length, icon: '&#10003;', color: 'var(--success)' },
    { label: 'Alertes critiques', value: stats?.alertesCritiques ?? 0, icon: '&#9888;', color: 'var(--danger)' },
    { label: 'Alertes non lues', value: stats?.alertesNonLues ?? 0, icon: '&#128276;', color: 'var(--warning)' },
    { label: '% Global moyen', value: `${stats?.pourcentageGlobalMoyen ?? 0}%`, icon: '&#128202;', color: 'var(--primary)' },
  ]

  const activePassations = passations.filter(p => p.statut === 'EN_COURS' || p.statut === 'PLANIFIEE')

  let myPassations = []
  if (role === 'EMPLOYE') {
    myPassations = passations.filter(p =>
      p.partantEmail === user?.email || p.partant?.email === user?.email ||
      p.partantId === user?.sub
    )
  } else if (role === 'REMPLACANT') {
    myPassations = passations.filter(p =>
      p.remplacantEmail === user?.email || p.remplacant?.email === user?.email ||
      p.remplacantId === user?.sub
    )
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner spinner-lg" />
        <span>Chargement...</span>
      </div>
    )
  }

  return (
    <div>
      <div className="page-header">
        <h1>Tableau de bord</h1>
        <p>Bienvenue, {user?.prenom || user?.nom || 'Utilisateur'} &mdash; {role}</p>
      </div>

      {error && <div className="error-container">{error}</div>}

      {/* KPI Cards */}
      {(role === 'MANAGER_RH' || role === 'ADMIN') && (
        <div className="grid-4 mb-24" style={{ marginBottom: '24px' }}>
          {kpis.map((kpi) => (
            <div key={kpi.label} className="kpi-card">
              <span className="kpi-icon" dangerouslySetInnerHTML={{ __html: kpi.icon }} />
              <span className="kpi-label">{kpi.label}</span>
              <span className="kpi-value" style={kpi.color ? { color: kpi.color } : {}}>
                {kpi.value}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* EMPLOYE section */}
      {role === 'EMPLOYE' && (
        <div className="card mb-24" style={{ marginBottom: '24px' }}>
          <div className="card-header">
            <h2 className="card-title">Mes passations en cours</h2>
          </div>
          {myPassations.length === 0 ? (
            <p className="text-muted">Aucune passation en cours.</p>
          ) : (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Remplacant</th>
                    <th>Statut</th>
                    <th>Date depart</th>
                    <th>Progression</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {myPassations.map((p) => (
                    <tr key={p.id}>
                      <td>{p.remplacant?.nom || p.remplacantNom || '-'}</td>
                      <td><Badge niveau={p.statut}>{p.statut}</Badge></td>
                      <td>{p.dateDepart ? new Date(p.dateDepart).toLocaleDateString('fr-FR') : '-'}</td>
                      <td style={{ minWidth: '120px' }}>
                        <ProgressBar value={p.pourcentageGlobal || 0} label="" />
                      </td>
                      <td>
                        <button className="btn btn-primary btn-sm" onClick={() => navigate(`/passations/${p.id}`)}>
                          Voir
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* REMPLACANT section */}
      {role === 'REMPLACANT' && (
        <div className="card mb-24" style={{ marginBottom: '24px' }}>
          <div className="card-header">
            <h2 className="card-title">Ce que je reprends</h2>
          </div>
          {myPassations.length === 0 ? (
            <p className="text-muted">Aucune passation assignee.</p>
          ) : (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Partant</th>
                    <th>Statut</th>
                    <th>Date depart</th>
                    <th>Progression</th>
                    <th>Risque</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {myPassations.map((p) => (
                    <tr key={p.id}>
                      <td>{p.partant?.nom || p.partantNom || '-'}</td>
                      <td><Badge niveau={p.statut}>{p.statut}</Badge></td>
                      <td>{p.dateDepart ? new Date(p.dateDepart).toLocaleDateString('fr-FR') : '-'}</td>
                      <td style={{ minWidth: '120px' }}>
                        <ProgressBar value={p.pourcentageGlobal || 0} label="" />
                      </td>
                      <td><Badge niveau={p.scoreRisque}>{p.scoreRisque}</Badge></td>
                      <td>
                        <button className="btn btn-primary btn-sm" onClick={() => navigate(`/passations/${p.id}`)}>
                          Voir
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* MANAGER_RH / ADMIN: active passations */}
      {(role === 'MANAGER_RH' || role === 'ADMIN') && (
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Passations actives</h2>
            <button className="btn btn-primary btn-sm" onClick={() => navigate('/passations')}>
              Voir toutes
            </button>
          </div>
          {activePassations.length === 0 ? (
            <p className="text-muted">Aucune passation active.</p>
          ) : (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Employe</th>
                    <th>Remplacant</th>
                    <th>Statut</th>
                    <th>Date depart</th>
                    <th>Progression</th>
                    <th>Risque</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {activePassations.slice(0, 10).map((p) => (
                    <tr key={p.id}>
                      <td>{p.partant?.nom || p.partantNom || p.nomEmploye || '-'}</td>
                      <td>{p.remplacant?.nom || p.remplacantNom || '-'}</td>
                      <td><Badge niveau={p.statut}>{p.statut}</Badge></td>
                      <td>{p.dateDepart ? new Date(p.dateDepart).toLocaleDateString('fr-FR') : '-'}</td>
                      <td style={{ minWidth: '120px' }}>
                        <ProgressBar value={p.pourcentageGlobal || 0} label="" />
                      </td>
                      <td><Badge niveau={p.scoreRisque}>{p.scoreRisque || '-'}</Badge></td>
                      <td>
                        <button className="btn btn-primary btn-sm" onClick={() => navigate(`/passations/${p.id}`)}>
                          Voir
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
