import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from '@/components/Layout'
import Dashboard from '@/pages/Dashboard'
import AllTasks from '@/pages/AllTasks'
import TaskDetail from '@/pages/TaskDetail'
import NewTask from '@/pages/NewTask'
import EditTask from '@/pages/EditTask'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Layout wraps all pages — provides sidebar, header, and <Outlet> */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="tasks" element={<AllTasks />} />         {/* supports ?status= and ?search= */}
          <Route path="tasks/new" element={<NewTask />} />
          <Route path="tasks/:id" element={<TaskDetail />} />
          <Route path="tasks/:id/edit" element={<EditTask />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}