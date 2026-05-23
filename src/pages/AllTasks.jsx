import { useState, useEffect, useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Calendar, RefreshCw, CheckCircle, LayoutList, Clock, Eye, Pencil, Trash2, Plus, Search, X } from 'lucide-react'
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

export default function AllTasks() {

  // --- State ---
  const [tasks, setTasks] = useState([])
  const [stats, setStats] = useState({ todo: 0, inProgress: 0, done: 0, total: 0, overdue: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null) // task pending deletion
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()

  // Derived from URL — not stored in state so sidebar nav always stays in sync
  const statusFilter = searchParams.get('status') || 'all'
  const [search, setSearch] = useState(searchParams.get('search') || '')
  const [sortBy, setSortBy] = useState('newest')

  // --- API calls ---

  // Re-fetch stats from backend whenever the task list changes (after create/delete)
  useEffect(() => {
    taskService.getStats()
      .then((data) => setStats({
        todo: data.todo,
        inProgress: data.in_progress,
        done: data.done,
        total: data.total,
        overdue: data.overdue,
      }))
      .catch(() => {})
  }, [tasks])

  // Fetch tasks from backend — re-runs when statusFilter changes (sidebar nav or dropdown)
  useEffect(() => {
    setLoading(true)
    const backendFilter = statusFilter !== 'all' ? statusFilter : null
    taskService
      .getAll(backendFilter)
      .then(setTasks)
      .catch(() => setError('Failed to load tasks.'))
      .finally(() => setLoading(false))
  }, [statusFilter])

  // --- Client-side filtering & sorting ---

  // Status filtering is handled by the backend; only search and sort happen here
  const filteredTasks = useMemo(() => {
    let result = tasks

    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          (t.description && t.description.toLowerCase().includes(q))
      )
    }

    if (sortBy === 'newest') {
      result = [...result].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    } else if (sortBy === 'oldest') {
      result = [...result].sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
    } else if (sortBy === 'due_date') {
      result = [...result].sort((a, b) => {
        if (!a.due_date) return 1
        if (!b.due_date) return -1
        return new Date(a.due_date) - new Date(b.due_date)
      })
    }

    return result
  }, [tasks, statusFilter, search, sortBy])

  // Resets search, sort, and clears URL params
  function clearFilters() {
    setSearch('')
    setSortBy('newest')
    setSearchParams({}, { replace: true })
  }

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

  // Show "Clear Filters" button only when something is active
  const hasFilters = search || statusFilter !== 'all' || sortBy !== 'newest'

  if (loading) return <div className="page-state">Loading tasks...</div>
  if (error) return <div className="page-state error">{error}</div>

  return (
    <div>

      {/* Page header */}
      <div className="page-header">
        <div>
          <h1>All Tasks</h1>
          <p className="page-subtitle">Manage and track all your tasks in one place.</p>
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

      {/* Filter bar — status updates URL (triggers backend re-fetch); search/sort are client-side */}
      <div className="filter-bar">
        <div className="filter-search">
          <Search size={15} />
          <input
            type="text"
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => {
            const val = e.target.value
            const params = {}
            if (val !== 'all') params.status = val
            if (search) params.search = search
            setSearchParams(params, { replace: true }) // updates URL → triggers backend fetch
          }}
        >
          <option value="all">All Status</option>
          <option value="todo">To Do</option>
          <option value="in_progress">In Progress</option>
          <option value="done">Completed</option>
          <option value="overdue">Overdue</option>
        </select>
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="newest">Sort by: Newest</option>
          <option value="oldest">Sort by: Oldest</option>
          <option value="due_date">Sort by: Due Date</option>
        </select>
        {hasFilters && (
          <button className="btn-clear" onClick={clearFilters}>
            <X size={14} />
            Clear Filters
          </button>
        )}
      </div>

      {/* Task table */}
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
            {filteredTasks.length === 0 ? (
              <tr>
                <td colSpan={4} className="table-empty">No tasks found.</td>
              </tr>
            ) : (
              filteredTasks.map((task) => (
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