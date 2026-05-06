import { useState, useEffect } from 'react'
import * as checklistService from '../services/checklistService'
import ProgressBar from '../components/ProgressBar'

export default function ChecklistPage() {
  const [templates, setTemplates] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [expanded, setExpanded] = useState({})
  const [items, setItems] = useState({})
  const [checked, setChecked] = useState({})

  useEffect(() => {
    checklistService.getTemplates()
      .then((res) => setTemplates(Array.isArray(res.data) ? res.data : []))
      .catch(() => setError('Erreur lors du chargement des checklists'))
      .finally(() => setLoading(false))
  }, [])

  const toggleExpand = async (templateId) => {
    setExpanded(prev => ({ ...prev, [templateId]: !prev[templateId] }))
    if (!items[templateId]) {
      try {
        const res = await checklistService.getItems(templateId)
        setItems(prev => ({ ...prev, [templateId]: Array.isArray(res.data) ? res.data : [] }))
      } catch {
        setItems(prev => ({ ...prev, [templateId]: [] }))
      }
    }
  }

  const toggleCheck = (key) => {
    setChecked(prev => ({ ...prev, [key]: !prev[key] }))
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner spinner-lg" />
        <span>Chargement...</span>
      </div>
    )
  }

  const allItems = Object.values(items).flat()
  const totalItems = allItems.length
  const totalChecked = Object.values(checked).filter(Boolean).length

  return (
    <div>
      <div className="page-header">
        <h1>Checklists</h1>
        <p>Suivi des elements de passation</p>
      </div>

      {error && <div className="error-container">{error}</div>}

      {totalItems > 0 && (
        <div className="card" style={{ marginBottom: '24px' }}>
          <div className="card-header">
            <span className="card-title">Progression globale</span>
            <span className="text-muted text-sm">{totalChecked}/{totalItems} elements</span>
          </div>
          <ProgressBar value={Math.round((totalChecked / totalItems) * 100)} label="" size="lg" />
        </div>
      )}

      {templates.length === 0 ? (
        <div className="card">
          <p className="text-muted" style={{ textAlign: 'center', padding: '40px' }}>
            Aucun template de checklist disponible.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {templates.map((t) => {
            const templateItems = items[t.id] || []
            const checkedCount = templateItems.filter(item => checked[`${t.id}-${item.id}`]).length
            return (
              <div key={t.id} className="card">
                <button
                  style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', padding: 0 }}
                  onClick={() => toggleExpand(t.id)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '1rem' }}>{t.nom}</div>
                      <div className="text-sm text-muted">{t.typePoste || t.description || ''}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {expanded[t.id] && templateItems.length > 0 && (
                        <span className="badge badge-secondary">{checkedCount}/{templateItems.length}</span>
                      )}
                      <span className="text-muted">{expanded[t.id] ? '▲' : '▼'}</span>
                    </div>
                  </div>
                </button>

                {expanded[t.id] && (
                  <div style={{ marginTop: '16px', borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
                    {templateItems.length === 0 ? (
                      <p className="text-muted text-sm">Aucun element dans ce template.</p>
                    ) : (
                      <>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
                          {templateItems
                            .sort((a, b) => (a.ordre || 0) - (b.ordre || 0))
                            .map((item) => {
                              const key = `${t.id}-${item.id}`
                              return (
                                <label key={item.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', cursor: 'pointer' }}>
                                  <input
                                    type="checkbox"
                                    checked={!!checked[key]}
                                    onChange={() => toggleCheck(key)}
                                    style={{ width: '16px', height: '16px', marginTop: '2px', flexShrink: 0 }}
                                  />
                                  <div>
                                    <span style={{
                                      fontSize: '0.875rem',
                                      textDecoration: checked[key] ? 'line-through' : 'none',
                                      color: checked[key] ? 'var(--text-muted)' : 'var(--text)',
                                    }}>
                                      {item.libelle}
                                      {item.obligatoire && (
                                        <span style={{ color: 'var(--danger)', marginLeft: '4px' }} title="Obligatoire">*</span>
                                      )}
                                    </span>
                                  </div>
                                </label>
                              )
                            })}
                        </div>
                        <ProgressBar
                          value={templateItems.length > 0 ? Math.round((checkedCount / templateItems.length) * 100) : 0}
                          label={`${checkedCount}/${templateItems.length} completes`}
                        />
                      </>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
