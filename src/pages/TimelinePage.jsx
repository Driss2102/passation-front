import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import * as timelineService from '../services/timelineService'
import * as passationService from '../services/passationService'
import Badge from '../components/Badge'

const STATUT_COLORS = {
  A_FAIRE: 'var(--secondary)',
  EN_COURS: 'var(--primary)',
  TERMINE: 'var(--success)',
  REPORTE: 'var(--danger)',
}

export default function TimelinePage() {
  const { user } = useAuth()
  const [passations, setPassations] = useState([])
  const [selectedPassation, setSelectedPassation] = useState('')
  const [etapes, setEtapes] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ titre: '', description: '', datePrevu: '', statut: 'A_FAIRE' })
  const [saving, setSaving] = useState(false)

  const role = user?.role || ''
  const canAdd = role === 'MANAGER_RH' || role === 'ADMIN'

  useEffect(() => {
    passationService.getAll()
      .then(res => {
        const data = Array.isArray(res.data) ? res.data : []
        setPassations(data)
        if (data.length > 0) setSelectedPassation(data[0].id)
      })
      .catch(() => setError('Erreur chargement passations'))
  }, [])

  useEffect(() => {
    if (!selectedPassation) return
    setLoading(true)
    setError('')
    timelineService.getByPassation(selectedPassation)
      .then(res => setEtapes(Array.isArray(res.data) ? res.data : []))
      .catch(() => setError('Erreur lors du chargement de la timeline'))
      .finally(() => setLoading(false))
  }, [selectedPassation])

  const handleAddEtape = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await timelineService.addEtape(selectedPassation, form)
      const res = await timelineService.getByPassation(selectedPassation)
      setEtapes(Array.isArray(res.data) ? res.data : [])
      setForm({ titre: '', description: '', datePrevu: '', statut: 'A_FAIRE' })
      setShowForm(false)
    } catch {
      setError('Erreur lors de l\'ajout de l\'etape')
    } finally {
      setSaving(false)
    }
  }

  const today = new Date()

  return (
    <div>
      <div className="page-header">
        <h1>Timeline</h1>
        <p>Suivi chronologique des etapes de passation</p>
      </div>

      {error && <div className="error-container">{error}</div>}

      <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap' }}>
        <select
          className="form-control"
          value={selectedPassation}
          onChange={(e) => setSelectedPassation(e.target.value)}
          style={{ maxWidth: '360px' }}
        >
          {passations.map(p => (
            <option key={p.id} value={p.id}>
              {p.employePartant?.prenom || ''} {p.employePartant?.nom || `Passation ${p.id}`}
            </option>
          ))}
        </select>
        {canAdd && (
          <button className="btn btn-primary btn-sm" onClick={() => setShowForm(!showForm)}>
            + Ajouter une etape
          </button>
        )}
      </div>

      {showForm && canAdd && (
        <div className="card" style={{ marginBottom: '24px' }}>
          <h3 style={{ marginBottom: '16px', fontSize: '1rem', fontWeight: 600 }}>Nouvelle etape</h3>
          <form onSubmit={handleAddEtape}>
            <div className="form-row">
              <div className="form-group">
                <label>Titre <span className="required">*</span></label>
                <input
                  type="text"
                  className="form-control"
                  value={form.titre}
                  onChange={e => setForm(f => ({ ...f, titre: e.target.value }))}
                  required
                />
              </div>
              <div className="form-group">
                <label>Statut</label>
                <select
                  className="form-control"
                  value={form.statut}
                  onChange={e => setForm(f => ({ ...f, statut: e.target.value }))}
                >
                  <option value="A_FAIRE">A faire</option>
                  <option value="EN_COURS">En cours</option>
                  <option value="TERMINE">Termine</option>
                  <option value="REPORTE">Reporte</option>
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Description</label>
                <textarea
                  className="form-control"
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  rows={2}
                />
              </div>
              <div className="form-group">
                <label>Date prevue</label>
                <input
                  type="date"
                  className="form-control"
                  value={form.datePrevu}
                  onChange={e => setForm(f => ({ ...f, datePrevu: e.target.value }))}
                />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button type="submit" className="btn btn-primary btn-sm" disabled={saving}>
                {saving ? 'Enregistrement...' : 'Enregistrer'}
              </button>
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowForm(false)}>
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="loading-container">
          <div className="spinner spinner-lg" />
          <span>Chargement...</span>
        </div>
      ) : etapes.length === 0 ? (
        <div className="card">
          <p className="text-muted" style={{ textAlign: 'center', padding: '40px' }}>
            Aucune etape dans la timeline pour cette passation.
          </p>
        </div>
      ) : (
        <div className="card">
          <div style={{ position: 'relative', paddingLeft: '40px' }}>
            <div style={{
              position: 'absolute',
              left: '15px',
              top: '12px',
              bottom: '12px',
              width: '2px',
              background: 'var(--border)',
            }} />
            {etapes.map((etape, idx) => {
              const isLate =
                etape.datePrevu &&
                new Date(etape.datePrevu) < today &&
                etape.statut !== 'TERMINE'
              const dotColor = STATUT_COLORS[etape.statut] || 'var(--secondary)'
              return (
                <div key={etape.id || idx} style={{ position: 'relative', marginBottom: '28px' }}>
                  <div style={{
                    position: 'absolute',
                    left: '-40px',
                    top: '4px',
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    background: dotColor,
                    border: '3px solid white',
                    boxShadow: '0 0 0 2px ' + dotColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    {etape.statut === 'TERMINE' && (
                      <span style={{ color: 'white', fontSize: '0.6rem', fontWeight: 700 }}>✓</span>
                    )}
                  </div>
                  <div style={{
                    background: 'var(--bg)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius)',
                    padding: '12px 16px',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
                      <div>
                        <div style={{ fontWeight: 600, marginBottom: '4px' }}>{etape.titre}</div>
                        {etape.description && (
                          <div className="text-sm text-muted" style={{ marginBottom: '6px' }}>{etape.description}</div>
                        )}
                        <div className="text-xs text-muted">
                          {etape.datePrevu && `Prevu: ${new Date(etape.datePrevu).toLocaleDateString('fr-FR')}`}
                          {etape.dateReelle && ` | Reel: ${new Date(etape.dateReelle).toLocaleDateString('fr-FR')}`}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                        <Badge
                          niveau={
                            etape.statut === 'TERMINE' ? 'faible' :
                            etape.statut === 'EN_COURS' ? 'info' :
                            etape.statut === 'REPORTE' ? 'critique' : 'secondary'
                          }
                        >
                          {etape.statut}
                        </Badge>
                        {isLate && <span className="badge badge-warning">En retard</span>}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
