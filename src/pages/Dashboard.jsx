import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Calendar, RefreshCw, CheckCircle, LayoutList, Clock, Eye, Pencil, Trash2, Plus } from 'lucide-react'
import { taskService } from '@/services/taskService'
import DeleteModal from '@/components/DeleteModal'

// --- Helpers ---

function formatDate(dateStr) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

// Used to apply red styling to overdue due dates in the table
function isOverdue(task) {
  return task.due_date && new Date(task.due_date) < new Date() && task.status !== 'done'
}

// Coloured pill showing the task's current status
function StatusBadge({ status }) {
  const map = { todo: 'To Do', in_progress: 'In Progress', done: 'Completed' }
  return <span className={`badge badge-${status}`}>{map[status] || status}</span>
}

export default function Dashboard() {

  // --- State ---
  const [tasks, setTasks] = useState([])
  const [stats, setStats] = useState({ todo: 0, inProgress: 0, done: 0, total: 0, overdue: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null) // task pending deletion
  const navigate = useNavigate()

  // --- API calls ---

  // Fetch all tasks and stats in parallel on mount
  useEffect(() => {
    Promise.all([taskService.getAll(), taskService.getStats()])
      .then(([taskList, statsData]) => {
        setTasks(taskList)
        setStats({
          todo: statsData.todo,
          inProgress: statsData.in_progress,
          done: statsData.done,
          total: statsData.total,
          overdue: statsData.overdue,
        })
      })
      .catch(() => setError('Failed to load dashboard.'))
      .finally(() => setLoading(false))
  }, [])

  // Show only the 5 most recently created tasks
  const recentTasks = useMemo(
    () => [...tasks].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 5),
    [tasks]
  )

  // Calls DELETE on the backend, then removes the task from local state
  async function handleDeleteConfirm() {
    try {
      await taskService.remove(deleteTarget.id)
      setTasks((prev) => prev.filter((t) => t.id !== deleteTarget.id))
    } catch {
      setError('Failed to delete task.')
    } finally {
      setDeleteTarget(null)
    }
  }

  if (loading) return <div className="page-state">Loading...</div>
  if (error) return <div className="page-state error">{error}</div>

  return (
    <div>

      {/* Page header */}
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p className="page-subtitle">Overview of all your tasks.</p>
        </div>
        <button className="btn-primary" onClick={() => navigate('/tasks/new')}>
          <Plus size={16} />
          Add New Task
        </button>
      </div>

      {/* Stats cards — counts come from GET /tasks/stats/ */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon stat-icon--todo"><Calendar size={20} /></div>
          <div>
            <div className="stat-label">To Do</div>
            <div className="stat-value">{stats.todo}</div>
            <div className="stat-sub">Tasks to be started</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon stat-icon--in-progress"><RefreshCw size={20} /></div>
          <div>
            <div className="stat-label">In Progress</div>
            <div className="stat-value">{stats.inProgress}</div>
            <div className="stat-sub">Tasks in progress</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon stat-icon--done"><CheckCircle size={20} /></div>
          <div>
            <div className="stat-label">Completed</div>
            <div className="stat-value">{stats.done}</div>
            <div className="stat-sub">Tasks completed</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon stat-icon--total"><LayoutList size={20} /></div>
          <div>
            <div className="stat-label">Total</div>
            <div className="stat-value">{stats.total}</div>
            <div className="stat-sub">All tasks</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon stat-icon--overdue"><Clock size={20} /></div>
          <div>
            <div className="stat-label">Overdue</div>
            <div className="stat-value">{stats.overdue}</div>
            <div className="stat-sub">Past due date</div>
          </div>
        </div>
      </div>

      {/* Recent tasks table — last 5 by created date */}
      <div className="section-header">
        <h2>Recent Tasks</h2>
        <button className="btn-link" onClick={() => navigate('/tasks')}>View all</button>
      </div>

      <div className="table-card">
        <table className="task-table">
          <thead>
            <tr>
              <th>Task</th>
              <th>Status</th>
              <th>Due Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {recentTasks.length === 0 ? (
              <tr>
                <td colSpan={4} className="table-empty">No tasks yet.</td>
              </tr>
            ) : (
              recentTasks.map((task) => (
                <tr key={task.id}>
                  <td className="task-cell">
                    {/* Title is clickable — navigates to task detail page */}
                    <div
                      className="task-title"
                      onClick={() => navigate(`/tasks/${task.id}`)}
                    >
                      {task.title}
                    </div>
                    {task.description && (
                      <div className="task-desc">{task.description}</div>
                    )}
                  </td>
                  <td><StatusBadge status={task.status} /></td>
                  <td className={isOverdue(task) ? 'overdue-date' : ''}>
                    {formatDate(task.due_date)}
                  </td>
                  <td>
                    {/* View → detail page | Edit → edit page | Delete → confirmation modal */}
                    <div className="action-btns">
                      <button
                        className="action-btn view"
                        title="View"
                        onClick={() => navigate(`/tasks/${task.id}`)}
                      >
                        <Eye size={15} />
                      </button>
                      <button
                        className="action-btn edit"
                        title="Edit"
                        onClick={() => navigate(`/tasks/${task.id}/edit`)}
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        className="action-btn delete"
                        title="Delete"
                        onClick={() => setDeleteTarget(task)}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Delete confirmation modal — only rendered when a task is targeted */}
      {deleteTarget && (
        <DeleteModal
          task={deleteTarget}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

    </div>
  )
}