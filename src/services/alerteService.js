import api from './api'

export const getAll = () => api.get('/api/alertes')
export const getNonLues = () => api.get('/api/alertes/non-lues')
export const marquerLue = (id) => api.put(`/api/alertes/${id}/lu`)
export const generate = (passationId) => api.post(`/api/alertes/generate/${passationId}`)
