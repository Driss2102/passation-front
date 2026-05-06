import { useState, useEffect } from 'react'
import * as userService from '../services/userService'
import Modal from '../components/Modal'
import Badge from '../components/Badge'

const ROLES = ['EMPLOYE', 'REMPLACANT', 'MANAGER_RH', 'ADMIN']
const EMPTY_FORM = { nom: '', prenom: '', email: '', password: '', role: 'EMPLOYE', departement: '', poste: '' }

export default function AdminUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filterRole, setFilterRole] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editUser, setEditUser] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  const fetchUsers = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await userService.getAll()
      setUsers(Array.isArray(res.data) ? res.data : [])
    } catch {
      setError('Erreur lors du chargement des utilisateurs')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchUsers() }, [])

  const openCreate = () => {
    setEditUser(null)
    setForm(EMPTY_FORM)
    setFormError('')
    setModalOpen(true)
  }

  const openEdit = (u) => {
    setEditUser(u)
    setForm({
      nom: u.nom || '',
      prenom: u.prenom || '',
      email: u.email || '',
      password: '',
      role: u.role || 'EMPLOYE',
      departement: u.departement || '',
      poste: u.poste || '',
    })
    setFormError('')
    setModalOpen(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    setFormError('')
    try {
      if (editUser) {
        const data = { ...form }
        if (!data.password) delete data.password
        await userService.update(editUser.id, data)
      } else {
        await userService.create(form)
      }
      await fetchUsers()
      setModalOpen(false)
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data || err.message || 'Erreur'
      setFormError(typeof msg === 'string' ? msg : 'Erreur lors de l\'enregistrement')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    try {
      await userService.remove(id)
      setUsers(prev => prev.filter(u => u.id !== id))
      setDeleteConfirm(null)
    } catch {
      setError('Erreur lors de la suppression')
    }
  }

  const filtered = users.filter(u => !filterRole || u.role === filterRole)

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1>Gestion des utilisateurs</h1>
          <p>{users.length} utilisateur(s)</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>
          + Nouvel utilisateur
        </button>
      </div>

      {error && <div className="error-container">{error}</div>}

      <div className="filter-bar">
        <select
          className="form-control"
          value={filterRole}
          onChange={e => setFilterRole(e.target.value)}
          style={{ width: 'auto', minWidth: '200px' }}
        >
          <option value="">Tous les roles</option>
          {ROLES.map(r => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
        {filterRole && (
          <button className="btn btn-secondary btn-sm" onClick={() => setFilterRole('')}>
            Effacer
          </button>
        )}
      </div>

      <div className="card" style={{ padding: 0 }}>
        {loading ? (
          <div className="loading-container">
            <div className="spinner spinner-lg" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="loading-container">
            <p className="text-muted">Aucun utilisateur trouve.</p>
          </div>
        ) : (
          <div className="table-container" style={{ border: 'none' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Nom</th>
                  <th>Prenom</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Departement</th>
                  <th>Poste</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => (
                  <tr key={u.id}>
                    <td style={{ fontWeight: 500 }}>{u.nom}</td>
                    <td>{u.prenom}</td>
                    <td className="text-muted">{u.email}</td>
                    <td><Badge niveau="primary">{u.role}</Badge></td>
                    <td>{u.departement || '-'}</td>
                    <td>{u.poste || '-'}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button className="btn btn-secondary btn-sm" onClick={() => openEdit(u)}>
                          Modifier
                        </button>
                        {deleteConfirm === u.id ? (
                          <>
                            <button className="btn btn-danger btn-sm" onClick={() => handleDelete(u.id)}>
                              Confirmer
                            </button>
                            <button className="btn btn-secondary btn-sm" onClick={() => setDeleteConfirm(null)}>
                              Annuler
                            </button>
                          </>
                        ) : (
                          <button className="btn btn-danger btn-sm" onClick={() => setDeleteConfirm(u.id)}>
                            Supprimer
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editUser ? 'Modifier l\'utilisateur' : 'Nouvel utilisateur'}
        size="lg"
      >
        {formError && <div className="error-container" style={{ marginBottom: '16px' }}>{formError}</div>}
        <form onSubmit={handleSave}>
          <div className="form-row">
            <div className="form-group">
              <label>Nom <span className="required">*</span></label>
              <input
                type="text"
                className="form-control"
                value={form.nom}
                onChange={e => setForm(f => ({ ...f, nom: e.target.value }))}
                required
              />
            </div>
            <div className="form-group">
              <label>Prenom <span className="required">*</span></label>
              <input
                type="text"
                className="form-control"
                value={form.prenom}
                onChange={e => setForm(f => ({ ...f, prenom: e.target.value }))}
                required
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Email <span className="required">*</span></label>
              <input
                type="email"
                className="form-control"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                required
              />
            </div>
            <div className="form-group">
              <label>Mot de passe {editUser ? '' : <span className="required">*</span>}</label>
              <input
                type="password"
                className="form-control"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                required={!editUser}
                placeholder={editUser ? 'Laisser vide pour ne pas changer' : ''}
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Role <span className="required">*</span></label>
              <select
                className="form-control"
                value={form.role}
                onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
                required
              >
                {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Departement</label>
              <input
                type="text"
                className="form-control"
                value={form.departement}
                onChange={e => setForm(f => ({ ...f, departement: e.target.value }))}
              />
            </div>
          </div>
          <div className="form-group">
            <label>Poste</label>
            <input
              type="text"
              className="form-control"
              value={form.poste}
              onChange={e => setForm(f => ({ ...f, poste: e.target.value }))}
            />
          </div>
          <div className="modal-footer" style={{ padding: '16px 0 0', border: 'none' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>
              Annuler
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Enregistrement...' : (editUser ? 'Mettre a jour' : 'Creer')}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
