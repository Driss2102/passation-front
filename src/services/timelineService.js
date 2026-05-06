import api from './api'

export const getByPassation = (passationId) => api.get(`/api/timeline/passation/${passationId}`)
export const addEtape = (data) => api.post('/api/timeline', data)
export const updateStatut = (id, statut) => api.put(`/api/timeline/${id}/statut`, { statut })
