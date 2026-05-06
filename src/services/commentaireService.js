import api from './api'

export const getByPassation = (passationId) => api.get(`/api/commentaires/passation/${passationId}`)
export const create = (data) => api.post('/api/commentaires', data)
