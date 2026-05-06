import api from './api'

export const getAll = () => api.get('/api/passations')
export const getById = (id) => api.get(`/api/passations/${id}`)
export const create = (data) => api.post('/api/passations', data)
export const updateStatut = (id, statut) => api.put(`/api/passations/${id}/statut`, { statut })
export const addProjet = (id, data) => api.post(`/api/passations/${id}/projets`, data)
export const getDashboard = () => api.get('/api/passations/stats/dashboard')
export const search = (params) => api.get('/api/passations/search', { params })
export const getRiskScore = (id) => api.get(`/api/passations/${id}/risk-score`)
