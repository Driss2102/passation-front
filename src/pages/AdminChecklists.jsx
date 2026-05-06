import { useState, useEffect } from 'react'
import * as checklistService from '../services/checklistService'
import Modal from '../components/Modal'

const EMPTY_TEMPLATE = { nom: '', typePoste: '', description: '' }
const EMPTY_ITEM = { libelle: '', obligatoire: false, ordre: 1 }

export default function AdminChecklists() {
  const [templates, setTemplates] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [expanded, setExpanded] = useState({})
  const [items, setItems] = useState({})
  const [templateModal, setTemplateModal] = useState(false)
  const [templateForm, setTemplateForm] = useState(EMPTY_TEMPLATE)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')
  const [itemForm, setItemForm] = useState({})
  const [addingItem, setAddingItem] = useState({})
  const [deleteConfirmTemplate, setDeleteConfirmTemplate] = useState(null)
  const [deleteConfirmItem, setDeleteConfirmItem] = useState(null)

  const fetchTemplates = async () => {
    setLoading(true)
    try {
      const res = await checklistService.getTemplates()
      setTemplates(Array.isArray(res.data) ? res.data : [])
    } catch {
      setError('Erreur lors du chargement des templates')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchTemplates() }, [])

  const fetchItems = async (templateId) => {
    try {
      const res = await checklistService.getItems(templateId)
      setItems(prev => ({ ...prev, [templateId]: Array.isArray(res.data) ? res.data : [] }))
    } catch {
      setItems(prev => ({ ...prev, [templateId]: [] }))
    }
  }

  const toggleExpand = (id) => {
    const newVal = !expanded[id]
    setExpanded(prev => ({ ...prev, [id]: newVal }))
    if (newVal && !items[id]) fetchItems(id)
  }

  const handleCreateTemplate = async (e) => {
    e.preventDefault()
    setSaving(true)
    setFormError('')
    try {
      await checklistService.createTemplate(templateForm)
      await fetchTemplates()
      setTemplateModal(false)
      setTemplateForm(EMPTY_TEMPLATE)
    } catch (err) {
      const msg = err.response?.data?.message || 'Erreur lors de la creation'
      setFormError(typeof msg === 'string' ? msg : 'Erreur')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteTemplate = async (id) => {
    try {
      await checklistService.deleteTemplate(id)
      setTemplates(prev => prev.filter(t => t.id !== id))
      setDeleteConfirmTemplate(null)
    } catch {
      setError('Erreur lors de la suppression du template')
    }
  }

  const handleAddItem = async (templateId) => {
    const form = itemForm[templateId] || EMPTY_ITEM
    if (!form.libelle) return
    try {
      await checklistService.addItem(templateId, form)
      await fetchItems(templateId)
      setItemForm(prev => ({ ...prev, [templateId]: EMPTY_ITEM }))
      setAddingItem(prev => ({ ...prev, [templateId]: false }))
    } catch {
      setError('Erreur lors de l\'ajout de l\'element')
    }
  }

  const handleDeleteItem = async (templateId, itemId) => {
    try {
      await checklistService.deleteItem(templateId, itemId)
      setItems(prev => ({
        ...prev,
        [templateId]: (prev[templateId] || []).filter(i => i.id !== itemId),
      }))
      setDeleteConfirmItem(null)
    } catch {
      setError('Erreur lors de la suppression de l\'element')
    }
  }

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1>Checklists (Admin)</h1>
          <p>Gestion des templates de checklist</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setTemplateForm(EMPTY_TEMPLATE); setFormError(''); setTemplateModal(true) }}>
          + Nouveau template
        </button>
      </div>

      {error && <div className="error-container">{error}</div>}

      {loading ? (
        <div className="loading-container">
          <div className="spinner spinner-lg" />
        </div>
      ) : templates.length === 0 ? (
        <div className="card">
          <p className="text-muted" style={{ textAlign: 'center', padding: '40px' }}>
            Aucun template. Cliquez sur "Nouveau template" pour commencer.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {templates.map((t) => (
            <div key={t.id} className="card">
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
                <button
                  style={{ flex: 1, background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', padding: 0 }}
                  onClick={() => toggleExpand(t.id)}
                >
                  <div style={{ fontWeight: 600, fontSize: '1rem' }}>{t.nom}</div>
                  {t.typePoste && <div className="text-sm text-muted">Type: {t.typePoste}</div>}
                  {t.description && <div className="text-sm text-muted">{t.description}</div>}
                </button>
                <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                  <button className="btn btn-secondary btn-sm" onClick={() => toggleExpand(t.id)}>
                    {expanded[t.id] ? '▲' : '▼'}
                  </button>
                  {deleteConfirmTemplate === t.id ? (
                    <>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDeleteTemplate(t.id)}>
                        Confirmer
                      </button>
                      <button className="btn btn-secondary btn-sm" onClick={() => setDeleteConfirmTemplate(null)}>
                        Annuler
                      </button>
                    </>
                  ) : (
                    <button className="btn btn-danger btn-sm" onClick={() => setDeleteConfirmTemplate(t.id)}>
                      Supprimer
                    </button>
                  )}
                </div>
              </div>

              {expanded[t.id] && (
                <div style={{ marginTop: '16px', borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <span className="text-sm font-semibold">Elements ({(items[t.id] || []).length})</span>
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => setAddingItem(prev => ({ ...prev, [t.id]: !prev[t.id] }))}
                    >
                      + Ajouter
                    </button>
                  </div>

                  {addingItem[t.id] && (
                    <div style={{
                      background: 'var(--bg)',
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius)',
                      padding: '12px',
                      marginBottom: '12px',
                    }}>
                      <div className="form-row">
                        <div className="form-group" style={{ marginBottom: 0 }}>
                          <label>Libelle <span className="required">*</span></label>
                          <input
                            type="text"
                            className="form-control"
                            value={(itemForm[t.id] || EMPTY_ITEM).libelle}
                            onChange={e => setItemForm(prev => ({ ...prev, [t.id]: { ...(prev[t.id] || EMPTY_ITEM), libelle: e.target.value } }))}
                          />
                        </div>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                          <label>Ordre</label>
                          <input
                            type="number"
                            className="form-control"
                            value={(itemForm[t.id] || EMPTY_ITEM).ordre}
                            onChange={e => setItemForm(prev => ({ ...prev, [t.id]: { ...(prev[t.id] || EMPTY_ITEM), ordre: parseInt(e.target.value) || 1 } }))}
                            min={1}
                          />
                        </div>
                      </div>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem', marginBottom: '10px' }}>
                        <input
                          type="checkbox"
                          checked={(itemForm[t.id] || EMPTY_ITEM).obligatoire}
                          onChange={e => setItemForm(prev => ({ ...prev, [t.id]: { ...(prev[t.id] || EMPTY_ITEM), obligatoire: e.target.checked } }))}
                        />
                        Obligatoire
                      </label>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => handleAddItem(t.id)}
                          disabled={!(itemForm[t.id] || EMPTY_ITEM).libelle}
                        >
                          Ajouter
                        </button>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => setAddingItem(prev => ({ ...prev, [t.id]: false }))}
                        >
                          Annuler
                        </button>
                      </div>
                    </div>
                  )}

                  {(items[t.id] || []).length === 0 ? (
                    <p className="text-muted text-sm">Aucun element. Cliquez sur "Ajouter" pour en creer un.</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {(items[t.id] || [])
                        .sort((a, b) => (a.ordre || 0) - (b.ordre || 0))
                        .map((item) => (
                          <div key={item.id} style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '8px 12px',
                            background: 'var(--bg)',
                            borderRadius: 'var(--radius)',
                            border: '1px solid var(--border)',
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <span className="text-xs text-muted" style={{ minWidth: '24px' }}>#{item.ordre}</span>
                              <span style={{ fontSize: '0.875rem' }}>
                                {item.libelle}
                                {item.obligatoire && <span style={{ color: 'var(--danger)', marginLeft: '4px' }}>*</span>}
                              </span>
                            </div>
                            {deleteConfirmItem === item.id ? (
                              <div style={{ display: 'flex', gap: '6px' }}>
                                <button className="btn btn-danger btn-sm" onClick={() => handleDeleteItem(t.id, item.id)}>
                                  Confirmer
                                </button>
                                <button className="btn btn-secondary btn-sm" onClick={() => setDeleteConfirmItem(null)}>
                                  Non
                                </button>
                              </div>
                            ) : (
                              <button className="btn btn-danger btn-sm" onClick={() => setDeleteConfirmItem(item.id)}>
                                &times;
                              </button>
                            )}
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Template Modal */}
      <Modal
        isOpen={templateModal}
        onClose={() => setTemplateModal(false)}
        title="Nouveau template de checklist"
      >
        {formError && <div className="error-container" style={{ marginBottom: '16px' }}>{formError}</div>}
        <form onSubmit={handleCreateTemplate}>
          <div className="form-group">
            <label>Nom <span className="required">*</span></label>
            <input
              type="text"
              className="form-control"
              value={templateForm.nom}
              onChange={e => setTemplateForm(f => ({ ...f, nom: e.target.value }))}
              required
            />
          </div>
          <div className="form-group">
            <label>Type de poste</label>
            <input
              type="text"
              className="form-control"
              value={templateForm.typePoste}
              onChange={e => setTemplateForm(f => ({ ...f, typePoste: e.target.value }))}
              placeholder="Ex: Developpeur, Manager..."
            />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea
              className="form-control"
              value={templateForm.description}
              onChange={e => setTemplateForm(f => ({ ...f, description: e.target.value }))}
              rows={3}
            />
          </div>
          <div className="modal-footer" style={{ padding: '16px 0 0', border: 'none' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setTemplateModal(false)}>
              Annuler
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Enregistrement...' : 'Creer'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
