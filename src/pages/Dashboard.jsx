import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import * as passationService from '../services/passationService'
import Badge from '../components/Badge'
import ProgressBar from '../components/ProgressBar'

const KPI_CONFIG = [
  {
    key: 'totalPassations',
    label: 'Total passations',
    icon: '↔',
    accent: '#4F6EF7',
    iconBg: '#EEF2FF',
  },
  {
    key: 'passationsEnCours',
    label: 'En cours',
    icon: '▶',
    accent: '#06B6D4',
    iconBg: '#CFFAFE',
  },
  {
    key: 'passationsTerminees',
    label: 'Terminées',
    icon: '✓',
    accent: '#10B981',
    iconBg: '#D1FAE5',
  },
  {
    key: 'alertesCritiques',
    label: 'Alertes critiques',
    icon: '!',
    accent: '#EF4444',
    iconBg: '#FEE2E2',
  },
  {
    key: 'alertesNonLues',
    label: 'Alertes non lues',
    icon: '◉',
    accent: '#F59E0B',
    iconBg: '#FEF3C7',
  },
  {
    key: 'pourcentageGlobalMoyen',
    label: 'Progression moyenne',
    icon: '%',
    accent: '#8B5CF6',
    iconBg: '#EDE9FE',
    format: (v) => `${Math.round(v || 0)}%`,
  },
]

function daysUntil(dateStr) {
  if (!dateStr) return null
  const diff = Math.ceil((new Date(dateStr) - new Date()) / 86400000)
  return diff
}

function urgencyClass(days, pct) {
  if (days !== null && days < 20 && pct < 60) return 'urgency-card'
  if (days !== null && days < 40 && pct < 80) return 'urgency-card warning'
  return 'urgency-card ok'
}

const roleLabel = {
  ADMIN: 'Administrateur',
  MANAGER_RH: 'Manager RH',
  EMPLOYE: 'Employé',
  REMPLACANT: 'Remplaçant',
}

function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Bonjour'
  if (h < 18) return 'Bon après-midi'
  return 'Bonsoir'
}

export default function Dashboard() {
  const { user }    = useAuth()
  const navigate    = useNavigate()
  const [stats, setStats]         = useState(null)
  const [passations, setPassations] = useState([])
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState('')

  useEffect(() => {
    const fetch = async () => {
      setLoading(true)
      try {
        const [sRes, pRes] = await Promise.all([
          passationService.getDashboard().catch(() => ({ data: {} })),
          passationService.getAll().catch(() => ({ data: [] })),
        ])
        setStats(sRes.data || {})
        setPassations(Array.isArray(pRes.data) ? pRes.data : [])
      } catch {
        setError('Erreur lors du chargement du tableau de bord')
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [])

  const role = user?.role || ''
  const prenom = user?.prenom || user?.nom || 'vous'
  const activePassations = passations.filter(p => p.statut === 'EN_COURS' || p.statut === 'PLANIFIEE')

  let myPassations = []
  if (role === 'EMPLOYE')
    myPassations = passations.filter(p => p.partantEmail === user?.email || p.partant?.email === user?.email)
  else if (role === 'REMPLACANT')
    myPassations = passations.filter(p => p.remplacantEmail === user?.email || p.remplacant?.email === user?.email)

  if (loading) return (
    <div className="loading-container">
      <div className="spinner spinner-lg" />
      <span>Chargement du tableau de bord…</span>
    </div>
  )

  return (
    <div>

      {/* ── Greeting ─────────────────────────────── */}
      <div style={{
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        marginBottom: '28px',
        flexWrap: 'wrap',
        gap: '12px',
      }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: '4px' }}>
            {greeting()}, {prenom} 👋
          </h1>
          <p style={{ color: 'var(--text-sub)', fontSize: '0.875rem' }}>
            {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            &nbsp;·&nbsp;{roleLabel[role] || role}
          </p>
        </div>
        {(role === 'MANAGER_RH' || role === 'ADMIN') && (
          <button className="btn btn-primary" onClick={() => navigate('/passations')}>
            + Nouvelle passation
          </button>
        )}
      </div>

      {error && <div className="error-container">{error}</div>}

      {/* ── KPI Cards (Manager / Admin) ───────────── */}
      {(role === 'MANAGER_RH' || role === 'ADMIN') && (
        <>
          <div className="grid-4 mb-24" style={{ marginBottom: '24px' }}>
            {KPI_CONFIG.map((k) => {
              const raw = stats?.[k.key] ?? (
                k.key === 'totalPassations' ? passations.length :
                k.key === 'passationsEnCours' ? passations.filter(p => p.statut === 'EN_COURS').length :
                k.key === 'passationsTerminees' ? passations.filter(p => p.statut === 'TERMINEE').length :
                0
              )
              const display = k.format ? k.format(raw) : raw

              return (
                <div
                  key={k.key}
                  className="kpi-card"
                  style={{ '--kpi-accent': k.accent, '--kpi-icon-bg': k.iconBg }}
                >
                  <div className="kpi-card-top">
                    <div className="kpi-icon-wrap" style={{ background: k.iconBg, color: k.accent, fontWeight: 700 }}>
                      {k.icon}
                    </div>
                  </div>
                  <div className="kpi-label">{k.label}</div>
                  <div className="kpi-value" style={{ color: k.accent }}>{display}</div>
                </div>
              )
            })}
          </div>

          {/* ── Passations critiques (urgency cards) ── */}
          {activePassations.some(p => daysUntil(p.dateDepart) !== null && daysUntil(p.dateDepart) < 20) && (
            <div style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <span style={{ color: 'var(--danger)', fontWeight: 600, fontSize: '0.8125rem' }}>🚨 Passations urgentes</span>
              </div>
              <div className="grid-3" style={{ gap: '12px' }}>
                {activePassations
                  .filter(p => {
                    const d = daysUntil(p.dateDepart)
                    return d !== null && d < 20
                  })
                  .slice(0, 3)
                  .map(p => {
                    const days = daysUntil(p.dateDepart)
                    const pct  = p.pourcentageGlobal || 0
                    return (
                      <div
                        key={p.id}
                        className={`card ${urgencyClass(days, pct)}`}
                        style={{ cursor: 'pointer', padding: '16px 18px' }}
                        onClick={() => navigate(`/passations/${p.id}`)}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                          <div>
                            <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text)' }}>
                              {p.partant?.prenom || p.partant?.nom || p.partantNom || '—'} → {p.remplacant?.prenom || p.remplacant?.nom || p.remplacantNom || '—'}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                              {p.partant?.poste || p.departement || ''}
                            </div>
                          </div>
                          <span style={{
                            background: days < 10 ? 'var(--danger-light)' : 'var(--warning-light)',
                            color: days < 10 ? '#B91C1C' : '#92400E',
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            padding: '3px 8px',
                            borderRadius: '99px',
                          }}>J-{days}</span>
                        </div>
                        <ProgressBar value={pct} label={`${Math.round(pct)}%`} />
                      </div>
                    )
                  })}
              </div>
            </div>
          )}

          {/* ── Table passations actives ────────────── */}
          <div className="card">
            <div className="card-header">
              <div>
                <div className="card-title">Passations actives</div>
                <div className="card-subtitle">{activePassations.length} en cours ou planifiées</div>
              </div>
              <button className="btn btn-secondary btn-sm" onClick={() => navigate('/passations')}>
                Voir toutes →
              </button>
            </div>

            {activePassations.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">📭</div>
                <p>Aucune passation active pour le moment.</p>
              </div>
            ) : (
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Employé partant</th>
                      <th>Remplaçant</th>
                      <th>Statut</th>
                      <th>Départ</th>
                      <th>Progression</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {activePassations.slice(0, 8).map((p) => {
                      const days = daysUntil(p.dateDepart)
                      return (
                        <tr key={p.id}>
                          <td>
                            <div style={{ fontWeight: 500 }}>
                              {p.partant?.prenom || ''} {p.partant?.nom || p.partantNom || '-'}
                            </div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                              {p.partant?.poste || ''}
                            </div>
                          </td>
                          <td>
                            <div style={{ fontWeight: 500 }}>
                              {p.remplacant?.prenom || ''} {p.remplacant?.nom || p.remplacantNom || '-'}
                            </div>
                          </td>
                          <td><Badge niveau={p.statut}>{p.statut}</Badge></td>
                          <td>
                            <div style={{ fontSize: '0.8125rem' }}>
                              {p.dateDepart ? new Date(p.dateDepart).toLocaleDateString('fr-FR') : '-'}
                            </div>
                            {days !== null && (
                              <div style={{
                                fontSize: '0.7rem',
                                color: days < 15 ? 'var(--danger)' : days < 30 ? 'var(--warning)' : 'var(--text-muted)',
                                fontWeight: days < 15 ? 700 : 400,
                              }}>J-{days}</div>
                            )}
                          </td>
                          <td style={{ minWidth: '130px' }}>
                            <ProgressBar value={p.pourcentageGlobal || 0} label={`${Math.round(p.pourcentageGlobal || 0)}%`} />
                          </td>
                          <td>
                            <button
                              className="btn btn-ghost btn-sm"
                              onClick={() => navigate(`/passations/${p.id}`)}
                            >
                              Voir →
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {/* ── EMPLOYE view ─────────────────────────── */}
      {role === 'EMPLOYE' && (
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Mes passations</div>
              <div className="card-subtitle">Suivi de vos transitions en cours</div>
            </div>
          </div>
          {myPassations.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📭</div>
              <p>Aucune passation en cours.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {myPassations.map((p) => {
                const days = daysUntil(p.dateDepart)
                const pct  = p.pourcentageGlobal || 0
                return (
                  <div
                    key={p.id}
                    className={`card ${urgencyClass(days, pct)}`}
                    style={{ cursor: 'pointer' }}
                    onClick={() => navigate(`/passations/${p.id}`)}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                      <div>
                        <div style={{ fontWeight: 600 }}>
                          Remplaçant : {p.remplacant?.prenom || ''} {p.remplacant?.nom || p.remplacantNom || '-'}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                          Départ : {p.dateDepart ? new Date(p.dateDepart).toLocaleDateString('fr-FR') : '-'}
                          {days !== null && <span style={{ marginLeft: '8px', fontWeight: 600, color: days < 20 ? 'var(--danger)' : 'inherit' }}>· J-{days}</span>}
                        </div>
                      </div>
                      <Badge niveau={p.statut}>{p.statut}</Badge>
                    </div>
                    <ProgressBar value={pct} label={`Progression : ${Math.round(pct)}%`} size="lg" />
                    <div style={{ textAlign: 'right', marginTop: '10px' }}>
                      <span style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 500 }}>Voir le détail →</span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* ── REMPLACANT view ──────────────────────── */}
      {role === 'REMPLACANT' && (
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Ce que je reprends</div>
              <div className="card-subtitle">Vos passations assignées</div>
            </div>
          </div>
          {myPassations.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📭</div>
              <p>Aucune passation assignée pour le moment.</p>
            </div>
          ) : (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Employé partant</th>
                    <th>Statut</th>
                    <th>Date de départ</th>
                    <th>Progression</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {myPassations.map((p) => {
                    const days = daysUntil(p.dateDepart)
                    return (
                      <tr key={p.id}>
                        <td>
                          <div style={{ fontWeight: 500 }}>
                            {p.partant?.prenom || ''} {p.partant?.nom || p.partantNom || '-'}
                          </div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                            {p.partant?.poste || ''}
                          </div>
                        </td>
                        <td><Badge niveau={p.statut}>{p.statut}</Badge></td>
                        <td>
                          {p.dateDepart ? new Date(p.dateDepart).toLocaleDateString('fr-FR') : '-'}
                          {days !== null && (
                            <span style={{ marginLeft: '6px', fontSize: '0.72rem', color: days < 20 ? 'var(--danger)' : 'var(--text-muted)', fontWeight: 600 }}>
                              J-{days}
                            </span>
                          )}
                        </td>
                        <td style={{ minWidth: '130px' }}>
                          <ProgressBar value={p.pourcentageGlobal || 0} label={`${Math.round(p.pourcentageGlobal || 0)}%`} />
                        </td>
                        <td>
                          <button className="btn btn-ghost btn-sm" onClick={() => navigate(`/passations/${p.id}`)}>
                            Voir →
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
