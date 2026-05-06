import api from './api'

export const downloadPdf = async (passationId) => {
  const response = await api.get(`/api/pdf/passation/${passationId}`, { responseType: 'blob' })
  const url = URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }))
  const a = document.createElement('a')
  a.href = url
  a.download = `passation-${passationId}-rapport.pdf`
  a.click()
  URL.revokeObjectURL(url)
}
