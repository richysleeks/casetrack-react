import { NavLink, useLocation } from 'react-router-dom'
import { LayoutDashboard, ListChecks } from 'lucide-react'

// Filtered status links — each navigates to /tasks?status=<value>
const statusLinks = [
  { label: 'To Do', status: 'todo', color: 'var(--todo)' },
  { label: 'In Progress', status: 'in_progress', color: 'var(--in-progress)' },
  { label: 'Completed', status: 'done', color: 'var(--done)' },
  { label: 'Overdue', status: 'overdue', color: 'var(--overdue)' },
]

export default function Sidebar() {
  const location = useLocation()

  // NavLink doesn't handle query strings for active state, so we check manually
  function isStatusActive(status) {
    return location.pathname === '/tasks' && location.search === `?status=${status}`
  }

  // Active only when on /tasks with no filter applied
  function isAllTasksActive() {
    return location.pathname === '/tasks' && !location.search
  }

  return (
    <aside className="sidebar">

      {/* Logo */}
      <div className="sidebar-logo">
        <div className="logo-icon">✓</div>
        <span className="logo-text">CaseTrack</span>
      </div>

      <nav className="sidebar-nav">

        {/* Main nav links */}
        <NavLink
          to="/dashboard"
          className={({ isActive }) => 'nav-item' + (isActive ? ' active' : '')}
        >
          <LayoutDashboard size={16} />
          Dashboard
        </NavLink>

        <NavLink
          to="/tasks"
          className={'nav-item' + (isAllTasksActive() ? ' active' : '')}
        >
          <ListChecks size={16} />
          All Tasks
        </NavLink>

        <div className="nav-divider" />

        {/* Status filter links — rendered from statusLinks array */}
        {statusLinks.map(({ label, status, color }) => (
          <NavLink
            key={status}
            to={`/tasks?status=${status}`}
            className={'nav-item' + (isStatusActive(status) ? ' active' : '')}
          >
            <span className="status-dot" style={{ background: color }} />
            {label}
          </NavLink>
        ))}

      </nav>
    </aside>
  )
}