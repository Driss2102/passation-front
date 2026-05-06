import api from './api'

export const getAll = () => api.get('/api/users')
export const getById = (id) => api.get(`/api/users/${id}`)
export const create = (data) => api.post('/api/users', data)
export const update = (id, data) => api.put(`/api/users/${id}`, data)
export const remove = (id) => api.delete(`/api/users/${id}`)
export const getByRole = (role) => api.get(`/api/users/role/${role}`)
