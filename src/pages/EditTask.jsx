import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { taskService } from '@/services/taskService'

// The API returns full ISO-8601; datetime-local input needs YYYY-MM-DDTHH:MM
function toDatetimeLocal(isoStr) {
  if (!isoStr) return ''
  return isoStr.slice(0, 16)
}

export default function EditTask() {
  const { id } = useParams()   // task ID from the URL
  const navigate = useNavigate()

  // --- State ---
  const [form, setForm] = useState(null)
  const [errors, setErrors] = useState({})       // field-level errors from the API
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  // --- API call (fetch) ---

  // Fetch the existing task and pre-populate the form
  useEffect(() => {
    taskService
      .getOne(id)
      .then((task) => {
        setForm({
          title: task.title,
          description: task.description || '',
          status: task.status,
          due_date: toDatetimeLocal(task.due_date),  // convert for the input
        })
      })
      .catch(() => setErrors({ general: 'Failed to load task.' }))
      .finally(() => setLoading(false))
  }, [id])

  // Updates the changed field and clears its error
  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    setErrors((prev) => ({ ...prev, [e.target.name]: null }))
  }

  // --- API call (save) ---

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    setErrors({})
    try {
      const payload = {
        title: form.title,
        status: form.status,
        description: form.description || null,  // send null to clear the field
        due_date: form.due_date || null,
      }
      await taskService.update(id, payload)
      navigate(`/tasks/${id}`, { replace: true }) // replace history so Back skips the edit page
    } catch (err) {
      if (err.errors) {
        setErrors(err.errors)                   // map API field errors to the form
      } else {
        setErrors({ general: 'Something went wrong. Please try again.' })
      }
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <div className="page-state">Loading...</div>
  if (!form) return <div className="page-state error">{errors.general}</div>

  return (
    <div>
      <button className="btn-back" onClick={() => navigate(-1)}>
        <ArrowLeft size={16} />
        Back
      </button>

      {/* Edit task form — pre-populated from the fetched task */}
      <div className="form-card">
        <h1>Edit Task</h1>
        <p className="page-subtitle">Update the task details below.</p>

        {errors.general && <div className="form-error">{errors.general}</div>}

        <form onSubmit={handleSubmit} className="task-form">

          <div className="form-field">
            <label htmlFor="title">Title <span className="required">*</span></label>
            <input
              id="title"
              name="title"
              type="text"
              value={form.title}
              onChange={handleChange}
              placeholder="Enter task title"
              required
            />
            {errors.title && <span className="field-error">{errors.title[0]}</span>}
          </div>

          <div className="form-field">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Optional description"
              rows={4}
            />
          </div>

          <div className="form-row">
            <div className="form-field">
              <label htmlFor="status">Status <span className="required">*</span></label>
              <select id="status" name="status" value={form.status} onChange={handleChange}>
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="done">Completed</option>
              </select>
              {errors.status && <span className="field-error">{errors.status[0]}</span>}
            </div>

            <div className="form-field">
              <label htmlFor="due_date">Due Date</label>
              <input
                id="due_date"
                name="due_date"
                type="datetime-local"
                value={form.due_date}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={() => navigate(-1)}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>

        </form>
      </div>
    </div>
  )
}