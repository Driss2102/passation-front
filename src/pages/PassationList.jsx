import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import * as passationService from '../services/passationService'
import Badge from '../components/Badge'
import ProgressBar from '../components/ProgressBar'

const STATUTS = ['', 'PLANIFIEE', 'EN_COURS', 'TERMINEE', 'ANNULEE']
const RISQUES = ['', 'FAIBLE', 'MODERE', 'CRITIQUE']

export default function PassationList() {
  const navigate = useNavigate()
  const [passations, setPassations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [statut, setStatut] = useState('')
  const [departement, setDepartement] = useState('')
  const [scoreRisque, setScoreRisque] = useState('')

  const fetchPassations = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const params = {}
      if (search) params.nomEmploye = search
      if (statut) params.statut = statut
      if (departement) params.departement = departement
      if (scoreRisque) params.scoreRisque = scoreRisque

      const hasFilters = Object.keys(params).length > 0
      let res
      if (hasFilters) {
        res = await passationService.search(params)
      } else {
        res = await passationService.getAll()
      }
      setPassations(Array.isArray(res.data) ? res.data : [])
    } catch {
      setError('Erreur lors du chargement des passations')
    } finally {
      setLoading(false)
    }
  }, [search, statut, departement, scoreRisque])

  useEffect(() => {
    const timer = setTimeout(fetchPassations, 300)
    return () => clearTimeout(timer)
  }, [fetchPassations])

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1>Passations</h1>
          <p>{passations.length} passation(s) trouvee(s)</p>
        </div>
      </div>

      {/* Filter bar */}
      <div className="filter-bar">
        <div className="search-input-wrapper">
          <span className="search-icon">&#128269;</span>
          <input
            type="text"
            className="form-control"
            placeholder="Rechercher par employe..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="form-control"
          value={statut}
          onChange={(e) => setStatut(e.target.value)}
          style={{ width: 'auto', minWidth: '160px' }}
        >
          <option value="">Tous les statuts</option>
          {STATUTS.filter(Boolean).map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <input
          type="text"
          className="form-control"
          placeholder="Departement..."
          value={departement}
          onChange={(e) => setDepartement(e.target.value)}
          style={{ minWidth: '160px' }}
        />
        <select
          className="form-control"
          value={scoreRisque}
          onChange={(e) => setScoreRisque(e.target.value)}
          style={{ width: 'auto', minWidth: '160px' }}
        >
          <option value="">Tous les risques</option>
          {RISQUES.filter(Boolean).map(r => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
        {(search || statut || departement || scoreRisque) && (
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => { setSearch(''); setStatut(''); setDepartement(''); setScoreRisque('') }}
          >
            Effacer
          </button>
        )}
      </div>

      {error && <div className="error-container">{error}</div>}

      <div className="card" style={{ padding: 0 }}>
        {loading ? (
          <div className="loading-container">
            <div className="spinner spinner-lg" />
            <span>Chargement...</span>
          </div>
        ) : passations.length === 0 ? (
          <div className="loading-container">
            <span style={{ fontSize: '2rem' }}>&#128196;</span>
            <p className="text-muted">Aucune passation trouvee</p>
          </div>
        ) : (
          <div className="table-container" style={{ border: 'none', borderRadius: 'var(--radius)' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Employe (Partant)</th>
                  <th>Remplacant</th>
                  <th>Statut</th>
                  <th>Date depart</th>
                  <th>% Global</th>
                  <th>Score Risque</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {passations.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <div style={{ fontWeight: 500 }}>
                        {p.partant?.prenom && p.partant?.nom
                          ? `${p.partant.prenom} ${p.partant.nom}`
                          : p.partant?.nom || p.nomEmploye || p.partantNom || '-'}
                      </div>
                      {p.departement && (
                        <div className="text-muted text-xs">{p.departement}</div>
                      )}
                    </td>
                    <td>
                      {p.remplacant?.prenom && p.remplacant?.nom
                        ? `${p.remplacant.prenom} ${p.remplacant.nom}`
                        : p.remplacant?.nom || p.remplacantNom || '-'}
                    </td>
                    <td><Badge niveau={p.statut}>{p.statut}</Badge></td>
                    <td>
                      {p.dateDepart
                        ? new Date(p.dateDepart).toLocaleDateString('fr-FR')
                        : '-'}
                    </td>
                    <td style={{ minWidth: '120px' }}>
                      <ProgressBar value={p.pourcentageGlobal || 0} label="" />
                      <span className="text-xs text-muted">{p.pourcentageGlobal || 0}%</span>
                    </td>
                    <td>
                      <Badge niveau={p.scoreRisque}>{p.scoreRisque || '-'}</Badge>
                    </td>
                    <td>
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => navigate(`/passations/${p.id}`)}
                      >
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
    </div>
  )
}
