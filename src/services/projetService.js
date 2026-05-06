import api from './api'

export const getAll = () => api.get('/api/projets')
export const create = (data) => api.post('/api/projets', data)
export const update = (id, data) => api.put(`/api/projets/${id}`, data)
