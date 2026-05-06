import api from './api'

export const getTemplates = () => api.get('/api/checklists')
export const getItems = (templateId) => api.get(`/api/checklists/${templateId}/items`)
export const createTemplate = (data) => api.post('/api/checklists', data)
export const addItem = (templateId, data) => api.post(`/api/checklists/${templateId}/items`, data)
export const deleteTemplate = (id) => api.delete(`/api/checklists/${id}`)
export const deleteItem = (templateId, itemId) => api.delete(`/api/checklists/${templateId}/items/${itemId}`)
