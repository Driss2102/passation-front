import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import * as commentaireService from '../services/commentaireService'

export default function CommentairesSection({ passationId }) {
  const { user } = useAuth()
  const [commentaires, setCommentaires] = useState([])
  const [loading, setLoading] = useState(true)
  const [contenu, setContenu] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!passationId) return
    commentaireService.getByPassation(passationId)
      .then((res) => setCommentaires(Array.isArray(res.data) ? res.data : []))
      .catch(() => setError('Erreur chargement commentaires'))
      .finally(() => setLoading(false))
  }, [passationId])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!contenu.trim()) return
    setSubmitting(true)
    const optimistic = {
      id: `temp-${Date.now()}`,
      contenu,
      auteur: { nom: user?.nom || user?.sub || 'Moi', prenom: user?.prenom || '' },
      createdAt: new Date().toISOString(),
    }
    setCommentaires(prev => [optimistic, ...prev])
    setContenu('')
    try {
      const res = await commentaireService.create({ passationId, contenu })
      setCommentaires(prev =>
        prev.map(c => c.id === optimistic.id ? res.data : c)
      )
    } catch {
      setCommentaires(prev => prev.filter(c => c.id !== optimistic.id))
      setContenu(optimistic.contenu)
      setError('Erreur lors de l\'envoi du commentaire')
    } finally {
      setSubmitting(false)
    }
  }

  const getInitials = (auteur) => {
    if (!auteur) return '?'
    const first = (auteur.prenom || '')[0] || ''
    const last = (auteur.nom || '')[0] || ''
    return (first + last).toUpperCase() || '?'
  }

  return (
    <div>
      <h3 style={{ marginBottom: '16px', fontSize: '1rem', fontWeight: 600 }}>
        Commentaires ({commentaires.length})
      </h3>

      {error && <div className="error-container" style={{ marginBottom: '12px' }}>{error}</div>}

      {/* New comment form */}
      <form onSubmit={handleSubmit} style={{ marginBottom: '24px' }}>
        <div className="form-group" style={{ marginBottom: '8px' }}>
          <textarea
            className="form-control"
            placeholder="Ajouter un commentaire..."
            value={contenu}
            onChange={(e) => setContenu(e.target.value)}
            rows={3}
          />
        </div>
        <button
          type="submit"
          className="btn btn-primary btn-sm"
          disabled={submitting || !contenu.trim()}
        >
          {submitting ? 'Envoi...' : 'Publier'}
        </button>
      </form>

      {loading ? (
        <div className="loading-container" style={{ padding: '20px' }}>
          <div className="spinner" />
        </div>
      ) : commentaires.length === 0 ? (
        <p className="text-muted" style={{ textAlign: 'center', padding: '20px' }}>
          Aucun commentaire.
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {commentaires.map((c) => (
            <div key={c.id} style={{
              display: 'flex',
              gap: '12px',
              padding: '12px',
              background: 'var(--bg)',
              borderRadius: 'var(--radius)',
              border: '1px solid var(--border)',
            }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: 'var(--primary)',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.8rem',
                fontWeight: 700,
                flexShrink: 0,
              }}>
                {getInitials(c.auteur)}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>
                    {c.auteur ? `${c.auteur.prenom || ''} ${c.auteur.nom || ''}`.trim() || 'Anonyme' : 'Anonyme'}
                  </span>
                  <span className="text-xs text-muted">
                    {c.createdAt ? new Date(c.createdAt).toLocaleString('fr-FR') : ''}
                  </span>
                </div>
                <p style={{ fontSize: '0.875rem', color: 'var(--text)', margin: 0 }}>{c.contenu}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
