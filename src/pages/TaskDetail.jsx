import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Pencil, Trash2 } from 'lucide-react'
import { taskService } from '@/services/taskService'
import DeleteModal from '@/components/DeleteModal'

// --- Helpers ---

// Longer format used for detail view (includes time)
function formatDate(dateStr) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// Coloured pill showing the task's current status
function StatusBadge({ status }) {
  const map = { todo: 'To Do', in_progress: 'In Progress', done: 'Completed' }
  return <span className={`badge badge-${status}`}>{map[status] || status}</span>
}

export default function TaskDetail() {
  const { id } = useParams()   // task ID from the URL
  const navigate = useNavigate()

  // --- State ---
  const [task, setTask] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showDelete, setShowDelete] = useState(false)

  // --- API call ---

  // Fetch the single task by ID on mount
  useEffect(() => {
    taskService
      .getOne(id)
      .then(setTask)
      .catch(() => setError('Task not found.'))
      .finally(() => setLoading(false))
  }, [id])

  // Calls DELETE on the backend, then navigates back to the task list
  async function handleDeleteConfirm() {
    try {
      await taskService.remove(id)
      navigate('/tasks')
    } catch {
      setError('Failed to delete task.')
      setShowDelete(false)
    }
  }

  if (loading) return <div className="page-state">Loading...</div>
  if (error) return <div className="page-state error">{error}</div>

  return (
    <div>
      <button className="btn-back" onClick={() => navigate(-1)}>
        <ArrowLeft size={16} />
        Back
      </button>

      {/* Task detail card */}
      <div className="detail-card">
        <div className="detail-header">
          <h1>{task.title}</h1>

          {/* Edit navigates to edit page; Delete opens the confirmation modal */}
          <div className="detail-actions">
            <button className="btn-secondary" onClick={() => navigate(`/tasks/${id}/edit`)}>
              <Pencil size={15} />
              Edit
            </button>
            <button className="btn-danger" onClick={() => setShowDelete(true)}>
              <Trash2 size={15} />
              Delete
            </button>
          </div>
        </div>

        {/* Task fields */}
        <div className="detail-fields">
          <div className="detail-field">
            <label>Status</label>
            <StatusBadge status={task.status} />
          </div>
          <div className="detail-field">
            <label>Due Date</label>
            <span>{formatDate(task.due_date)}</span>
          </div>
          <div className="detail-field">
            <label>Created</label>
            <span>{formatDate(task.created_at)}</span>
          </div>
          {task.description && (
            <div className="detail-field full-width">
              <label>Description</label>
              <p className="detail-description">{task.description}</p>
            </div>
          )}
        </div>
      </div>

      {/* Delete confirmation modal */}
      {showDelete && (
        <DeleteModal
          task={task}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setShowDelete(false)}
        />
      )}
    </div>
  )
}