import api from './api'

export const getByPassation = (passationId) => api.get(`/api/passations/${passationId}/timeline`)
export const addEtape = (passationId, data) => api.post(`/api/passations/${passationId}/timeline`, data)
export const updateEtape = (id, data) => api.put(`/api/timeline/${id}`, data)
export const deleteEtape = (id) => api.delete(`/api/timeline/${id}`)
