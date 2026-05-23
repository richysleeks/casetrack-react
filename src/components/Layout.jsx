import { useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { Search } from 'lucide-react'
import Sidebar from './Sidebar'

export default function Layout() {
  const [headerSearch, setHeaderSearch] = useState('')
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
      <Sidebar />
      <div className="main-area">

        {/* Top header — global search and user info */}
        <header className="main-header">
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
            <div>
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