import { useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { Search, Menu } from 'lucide-react'
import Sidebar from './Sidebar'

export default function Layout() {
  const [headerSearch, setHeaderSearch] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const navigate = useNavigate()

  // Navigates to AllTasks with search pre-applied as a URL param
  function handleSearchSubmit(e) {
    e.preventDefault()
    if (headerSearch.trim()) {
      navigate(`/tasks?search=${encodeURIComponent(headerSearch.trim())}`)
    }
  }

  return (
    <div className="app-shell">

      {/* Backdrop — closes sidebar when clicking outside on mobile */}
      {sidebarOpen && (
        <div className="sidebar-backdrop" onClick={() => setSidebarOpen(false)} />
      )}

      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="main-area">

        {/* Top header — hamburger (mobile), global search, user info */}
        <header className="main-header">
          <button className="hamburger" onClick={() => setSidebarOpen(true)}>
            <Menu size={20} />
          </button>
          <form className="header-search" onSubmit={handleSearchSubmit}>
            <Search size={16} className="search-icon" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={headerSearch}
              onChange={(e) => setHeaderSearch(e.target.value)}
            />
          </form>
          <div className="header-user">
            <div className="user-avatar">R</div>
            <div className="user-info">
              <div className="user-name">Richie</div>
              <div className="user-role">Caseworker</div>
            </div>
          </div>
        </header>

        {/* Active page renders here */}
        <main className="page-content">
          <Outlet />
        </main>

      </div>
    </div>
  )
}