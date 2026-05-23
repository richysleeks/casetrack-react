const API_BASE = 'http://127.0.0.1:8000'

// Shared fetch wrapper — unwraps { message, data } envelope and throws on errors
async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (res.status === 204) return null          // DELETE returns no body
  const json = await res.json()
  if (!res.ok) throw json                      // { message, errors } — caught by components
  return json.data                             // unwrap envelope, return the data directly
}

export const taskService = {
  getAll: (statusFilter = null) => {           // optional ?status= filter sent to backend
    const query = statusFilter ? `?status=${statusFilter}` : ''
    return request(`/tasks/${query}`)
  },
  getStats: () => request('/tasks/stats/'),    // returns { todo, in_progress, done, total, overdue }
  getOne: (id) => request(`/tasks/${id}/`),
  create: (data) => request('/tasks/', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => request(`/tasks/${id}/`, { method: 'PATCH', body: JSON.stringify(data) }),
  remove: (id) => request(`/tasks/${id}/`, { method: 'DELETE' }),
}