import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import * as passationService from '../services/passationService'
import * as timelineService from '../services/timelineService'
import * as checklistService from '../services/checklistService'
import * as alerteService from '../services/alerteService'
import { downloadPdf } from '../services/pdfService'
import Badge from '../components/Badge'
import ProgressBar from '../components/ProgressBar'
import CommentairesSection from './CommentairesSection'

const TABS = ['Projets', 'Timeline', 'Checklist', 'Commentaires', 'Alertes']

function NiveauBadge({ niveau }) {
  return <Badge niveau={niveau}>{niveau}</Badge>
}

export default function PassationDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [passation, setPassation] = useState(null)
  const [timeline, setTimeline] = useState([])
  const [checklist, setChecklist] = useState([])
  const [alertes, setAlertes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('Projets')
  const [pdfLoading, setPdfLoading] = useState(false)

  useEffect(() => {
    if (!id) return
    const fetchAll = async () => {
      setLoading(true)
      setError('')
      try {
        const [pRes, tRes, aRes] = await Promise.all([
          passationService.getById(id),
          timelineService.getByPassation(id).catch(() => ({ data: [] })),
          alerteService.getAll().catch(() => ({ data: [] })),
        ])
        setPassation(pRes.data)
        setTimeline(Array.isArray(tRes.data) ? tRes.data : [])
        const allAlertes = Array.isArray(aRes.data) ? aRes.data : []
        setAlertes(allAlertes.filter(a => String(a.passationId) === String(id)))
        // fetch checklist templates
        checklistService.getTemplates().then(r => {
          setChecklist(Array.isArray(r.data) ? r.data : [])
        }).catch(() => {})
      } catch (err) {
        setError('Erreur lors du chargement de la passation')
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [id])

  const handlePdf = async () => {
    setPdfLoading(true)
    try {
      await downloadPdf(id)
    } catch {
      alert('Erreur lors du telechargement du PDF')
    } finally {
      setPdfLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner spinner-lg" />
        <span>Chargement...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div>
        <div className="error-container">{error}</div>
        <button className="btn btn-secondary" onClick={() => navigate('/passations')}>
          Retour a la liste
        </button>
      </div>
    )
  }

  if (!passation) return null

  const partant = passation.partant || {}
  const remplacant = passation.remplacant || {}
  const manager = passation.managerRh || passation.manager || {}
  const projets = passation.projets || passation.passationProjets || []

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <button className="btn btn-secondary btn-sm" onClick={() => navigate('/passations')} style={{ marginBottom: '8px' }}>
            &larr; Retour
          </button>
          <h1 style={{ fontSize: '1.5rem' }}>
            Passation — {partant.prenom || ''} {partant.nom || passation.nomEmploye || ''}
          </h1>
        </div>
        <button
          className="btn btn-primary"
          onClick={handlePdf}
          disabled={pdfLoading}
        >
          {pdfLoading
            ? <><span className="spinner" style={{ width: '14px', height: '14px', borderWidth: '2px' }} /> Export PDF...</>
            : '&#128196; Exporter PDF'
          }
        </button>
      </div>

      {/* Info card */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
          <div>
            <div className="text-xs text-muted" style={{ marginBottom: '4px' }}>PARTANT</div>
            <div style={{ fontWeight: 600 }}>{partant.prenom || ''} {partant.nom || passation.nomEmploye || '-'}</div>
            <div className="text-sm text-muted">{partant.poste || passation.poste || ''}</div>
          </div>
          <div>
            <div className="text-xs text-muted" style={{ marginBottom: '4px' }}>REMPLACANT</div>
            <div style={{ fontWeight: 600 }}>{remplacant.prenom || ''} {remplacant.nom || '-'}</div>
          </div>
          <div>
            <div className="text-xs text-muted" style={{ marginBottom: '4px' }}>MANAGER RH</div>
            <div style={{ fontWeight: 600 }}>{manager.prenom || ''} {manager.nom || '-'}</div>
          </div>
          <div>
            <div className="text-xs text-muted" style={{ marginBottom: '4px' }}>DATE DEPART</div>
            <div style={{ fontWeight: 600 }}>
              {passation.dateDepart ? new Date(passation.dateDepart).toLocaleDateString('fr-FR') : '-'}
            </div>
          </div>
          <div>
            <div className="text-xs text-muted" style={{ marginBottom: '4px' }}>STATUT</div>
            <Badge niveau={passation.statut}>{passation.statut}</Badge>
          </div>
          <div>
            <div className="text-xs text-muted" style={{ marginBottom: '4px' }}>SCORE RISQUE</div>
            <Badge niveau={passation.scoreRisque} style={{ fontSize: '0.9rem' }}>
              {passation.scoreRisque || '-'}
            </Badge>
          </div>
        </div>

        <div style={{ marginTop: '20px' }}>
          <ProgressBar
            value={passation.pourcentageGlobal || 0}
            label={`Avancement global — ${passation.pourcentageGlobal || 0}%`}
            size="lg"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        {TABS.map(tab => (
          <button
            key={tab}
            className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
            {tab === 'Alertes' && alertes.length > 0 && (
              <span className="badge badge-danger" style={{ marginLeft: '6px', fontSize: '0.65rem' }}>
                {alertes.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Projets tab */}
      {activeTab === 'Projets' && (
        <div>
          {projets.length === 0 ? (
            <div className="card">
              <p className="text-muted" style={{ textAlign: 'center', padding: '20px' }}>
                Aucun projet associe a cette passation.
              </p>
            </div>
          ) : (
            <div className="grid-2" style={{ gap: '16px' }}>
              {projets.map((pp, idx) => {
                const projet = pp.projet || pp
                return (
                  <div key={pp.id || idx} className="card">
                    <div className="card-header">
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '1rem' }}>
                          {projet.nom || projet.nomProjet || `Projet ${idx + 1}`}
                        </div>
                        {projet.description && (
                          <div className="text-sm text-muted">{projet.description}</div>
                        )}
                      </div>
                      <Badge niveau={pp.niveauMaitrise || 'info'}>{pp.niveauMaitrise || 'N/A'}</Badge>
                    </div>
                    <div style={{ marginBottom: '12px' }}>
                      <ProgressBar value={pp.pourcentagePassation || 0} label="% Passation" />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.85rem' }}>
                      {pp.sujets && (
                        <div>
                          <div className="text-xs text-muted" style={{ marginBottom: '4px' }}>SUJETS</div>
                          <div>{pp.sujets}</div>
                        </div>
                      )}
                      {pp.taches && (
                        <div>
                          <div className="text-xs text-muted" style={{ marginBottom: '4px' }}>TACHES</div>
                          <div>{pp.taches}</div>
                        </div>
                      )}
                      {pp.risques && (
                        <div>
                          <div className="text-xs text-muted" style={{ marginBottom: '4px' }}>RISQUES</div>
                          <div>{pp.risques}</div>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Timeline tab */}
      {activeTab === 'Timeline' && (
        <TimelineSection etapes={timeline} />
      )}

      {/* Checklist tab */}
      {activeTab === 'Checklist' && (
        <ChecklistSection templates={checklist} />
      )}

      {/* Commentaires tab */}
      {activeTab === 'Commentaires' && (
        <div className="card">
          <CommentairesSection passationId={id} />
        </div>
      )}

      {/* Alertes tab */}
      {activeTab === 'Alertes' && (
        <div>
          {alertes.length === 0 ? (
            <div className="card">
              <p className="text-muted" style={{ textAlign: 'center', padding: '20px' }}>
                Aucune alerte pour cette passation.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {alertes.map((a) => (
                <div key={a.id} className="card" style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <Badge niveau={a.niveau || a.severity}>{a.niveau || a.severity}</Badge>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 500, marginBottom: '4px' }}>{a.message}</div>
                    <div className="text-xs text-muted">
                      {a.createdAt ? new Date(a.createdAt).toLocaleString('fr-FR') : ''}
                    </div>
                  </div>
                  {!a.lu && <span className="badge badge-info">Nouveau</span>}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function TimelineSection({ etapes }) {
  const today = new Date()

  if (!etapes || etapes.length === 0) {
    return (
      <div className="card">
        <p className="text-muted" style={{ textAlign: 'center', padding: '20px' }}>
          Aucune etape dans la timeline.
        </p>
      </div>
    )
  }

  const getColor = (statut) => {
    if (statut === 'TERMINE') return 'var(--success)'
    if (statut === 'EN_COURS') return 'var(--primary)'
    if (statut === 'REPORTE') return 'var(--danger)'
    return 'var(--secondary)'
  }

  return (
    <div className="card">
      <div style={{ position: 'relative', paddingLeft: '32px' }}>
        <div style={{
          position: 'absolute',
          left: '11px',
          top: 0,
          bottom: 0,
          width: '2px',
          background: 'var(--border)',
        }} />
        {etapes.map((etape, idx) => {
          const isLate =
            etape.datePrevu &&
            new Date(etape.datePrevu) < today &&
            etape.statut !== 'TERMINE'
          return (
            <div key={etape.id || idx} style={{ position: 'relative', marginBottom: '24px' }}>
              <div style={{
                position: 'absolute',
                left: '-32px',
                top: '2px',
                width: '22px',
                height: '22px',
                borderRadius: '50%',
                background: getColor(etape.statut),
                border: '3px solid white',
                boxShadow: '0 0 0 2px var(--border)',
              }} />
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap' }}>
                <div>
                  <div style={{ fontWeight: 600, marginBottom: '2px' }}>{etape.titre}</div>
                  {etape.description && (
                    <div className="text-sm text-muted" style={{ marginBottom: '4px' }}>{etape.description}</div>
                  )}
                  <div className="text-xs text-muted">
                    Prevu: {etape.datePrevu ? new Date(etape.datePrevu).toLocaleDateString('fr-FR') : '-'}
                    {etape.dateReelle && ` | Reel: ${new Date(etape.dateReelle).toLocaleDateString('fr-FR')}`}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                  <Badge niveau={etape.statut === 'TERMINE' ? 'faible' : etape.statut === 'EN_COURS' ? 'info' : etape.statut === 'REPORTE' ? 'critique' : 'secondary'}>
                    {etape.statut}
                  </Badge>
                  {isLate && <span className="badge badge-warning">En retard</span>}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function ChecklistSection({ templates }) {
  const [checked, setChecked] = useState({})
  const [expanded, setExpanded] = useState({})
  const [items, setItems] = useState({})

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

  if (templates.length === 0) {
    return (
      <div className="card">
        <p className="text-muted" style={{ textAlign: 'center', padding: '20px' }}>
          Aucun template de checklist disponible.
        </p>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {templates.map((t) => {
        const templateItems = items[t.id] || []
        const totalChecked = templateItems.filter(item => checked[`${t.id}-${item.id}`]).length
        return (
          <div key={t.id} className="card">
            <button
              style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', padding: 0 }}
              onClick={() => toggleExpand(t.id)}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontWeight: 600 }}>{t.nom}</div>
                  {t.typePoste && <div className="text-sm text-muted">{t.typePoste}</div>}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {expanded[t.id] && templateItems.length > 0 && (
                    <span className="text-sm text-muted">{totalChecked}/{templateItems.length}</span>
                  )}
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {expanded[t.id] ? '▲' : '▼'}
                  </span>
                </div>
              </div>
            </button>
            {expanded[t.id] && (
              <div style={{ marginTop: '12px', borderTop: '1px solid var(--border)', paddingTop: '12px' }}>
                {templateItems.length === 0 ? (
                  <p className="text-muted text-sm">Aucun element.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {templateItems.map((item) => {
                      const key = `${t.id}-${item.id}`
                      return (
                        <label key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                          <input
                            type="checkbox"
                            checked={!!checked[key]}
                            onChange={() => toggleCheck(key)}
                            style={{ width: '16px', height: '16px' }}
                          />
                          <span style={{
                            fontSize: '0.875rem',
                            textDecoration: checked[key] ? 'line-through' : 'none',
                            color: checked[key] ? 'var(--text-muted)' : 'var(--text)',
                          }}>
                            {item.libelle}
                            {item.obligatoire && <span style={{ color: 'var(--danger)', marginLeft: '4px' }}>*</span>}
                          </span>
                        </label>
                      )
                    })}
                  </div>
                )}
                {templateItems.length > 0 && (
                  <div style={{ marginTop: '12px' }}>
                    <ProgressBar
                      value={Math.round((totalChecked / templateItems.length) * 100)}
                      label={`${totalChecked}/${templateItems.length} elements`}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
