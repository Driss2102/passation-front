import api from './api'

export const getByPassation = (passationId) => api.get(`/api/passations/${passationId}/commentaires`)
export const create = (passationId, data) => api.post(`/api/passations/${passationId}/commentaires`, data)
export const deleteCommentaire = (id) => api.delete(`/api/commentaires/${id}`)
