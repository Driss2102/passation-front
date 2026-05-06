import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import * as alerteService from '../services/alerteService'
import Badge from '../components/Badge'

const FILTERS = ['Toutes', 'Non lues', 'CRITIQUE', 'WARNING', 'INFO']

export default function AlertesPage() {
  const navigate = useNavigate()
  const [alertes, setAlertes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('Toutes')

  const fetchAlertes = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await alerteService.getAll()
      setAlertes(Array.isArray(res.data) ? res.data : [])
    } catch {
      setError('Erreur lors du chargement des alertes')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchAlertes() }, [])

  const handleMarkLue = async (id) => {
    try {
      await alerteService.marquerLue(id)
      setAlertes(prev => prev.map(a => a.id === id ? { ...a, lu: true } : a))
    } catch {
      setError('Erreur lors de la mise a jour')
    }
  }

  const filtered = alertes.filter(a => {
    if (filter === 'Toutes') return true
    if (filter === 'Non lues') return !a.lu
    return (a.niveau || a.severity || '').toUpperCase() === filter.toUpperCase()
  })

  const nonLuesCount = alertes.filter(a => !a.lu).length

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1>
            Alertes
            {nonLuesCount > 0 && (
              <span className="badge badge-danger" style={{ marginLeft: '10px', fontSize: '0.9rem' }}>
                {nonLuesCount} non lue{nonLuesCount > 1 ? 's' : ''}
              </span>
            )}
          </h1>
          <p>{alertes.length} alerte(s) au total</p>
        </div>
      </div>

      {error && <div className="error-container">{error}</div>}

      {/* Filter tabs */}
      <div className="tabs">
        {FILTERS.map(f => (
          <button
            key={f}
            className={`tab-btn ${filter === f ? 'active' : ''}`}
            onClick={() => setFilter(f)}
          >
            {f}
            {f === 'Non lues' && nonLuesCount > 0 && (
              <span className="badge badge-danger" style={{ marginLeft: '6px', fontSize: '0.65rem' }}>
                {nonLuesCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="spinner spinner-lg" />
          <span>Chargement...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="card">
          <p className="text-muted" style={{ textAlign: 'center', padding: '40px' }}>
            Aucune alerte dans cette categorie.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filtered.map((a) => (
            <div
              key={a.id}
              className="card"
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '16px',
                borderLeft: `4px solid ${
                  (a.niveau || a.severity || '').toUpperCase() === 'CRITIQUE' ? 'var(--danger)' :
                  (a.niveau || a.severity || '').toUpperCase() === 'WARNING' ? 'var(--warning)' :
                  'var(--info)'
                }`,
                opacity: a.lu ? 0.7 : 1,
              }}
            >
              <div style={{ paddingTop: '2px' }}>
                <Badge niveau={a.niveau || a.severity}>{a.niveau || a.severity}</Badge>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: a.lu ? 400 : 600, marginBottom: '4px', fontSize: '0.9rem' }}>
                  {a.message}
                </div>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {a.passationId && (
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => navigate(`/passations/${a.passationId}`)}
                      style={{ padding: '2px 8px', fontSize: '0.75rem' }}
                    >
                      Voir passation
                    </button>
                  )}
                  {a.createdAt && (
                    <span>{new Date(a.createdAt).toLocaleString('fr-FR')}</span>
                  )}
                  {!a.lu && <span className="badge badge-info">Nouveau</span>}
                </div>
              </div>
              {!a.lu && (
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => handleMarkLue(a.id)}
                  style={{ flexShrink: 0 }}
                >
                  Marquer lu
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
