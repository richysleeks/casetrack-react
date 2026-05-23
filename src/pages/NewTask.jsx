import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { taskService } from '@/services/taskService'

const EMPTY_FORM = { title: '', description: '', status: 'todo', due_date: '' }

export default function NewTask() {
  const navigate = useNavigate()

  // --- State ---
  const [form, setForm] = useState(EMPTY_FORM)
  const [errors, setErrors] = useState({})       // field-level errors from the API
  const [submitting, setSubmitting] = useState(false)

  // Updates the changed field and clears its error
  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    setErrors((prev) => ({ ...prev, [e.target.name]: null }))
  }

  // --- API call ---

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    setErrors({})
    try {
      const payload = {
        title: form.title,
        status: form.status,
        description: form.description || undefined,  // omit empty optional fields
        due_date: form.due_date || undefined,
      }
      const created = await taskService.create(payload)
      navigate(`/tasks/${created.id}`, { replace: true }) // replace history so Back skips the form
    } catch (err) {
      if (err.errors) {
        setErrors(err.errors)                        // map API field errors to the form
      } else {
        setErrors({ general: 'Something went wrong. Please try again.' })
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      <button className="btn-back" onClick={() => navigate(-1)}>
        <ArrowLeft size={16} />
        Back
      </button>

      {/* Create task form */}
      <div className="form-card">
        <h1>New Task</h1>
        <p className="page-subtitle">Fill in the details to create a new task.</p>

        {errors.general && <div className="form-error">{errors.general}</div>}

        <form onSubmit={handleSubmit} className="task-form">

          {/* Required fields */}
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

          {/* Optional fields */}
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
              {submitting ? 'Creating...' : 'Create Task'}
            </button>
          </div>

        </form>
      </div>
    </div>
  )
}