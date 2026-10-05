import { Navigate, Outlet, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import Topbar from './Topbar'
import { useAdminAuth } from '../../context/AdminAuthContext'

export default function AdminLayout() {
  const { isAuthenticated } = useAdminAuth()
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace state={{ from: location }} />
  }

  return (
    <div className="min-h-screen bg-[#f3f1e9] text-[#24312b]">
      <Sidebar />

      <div className="lg:pl-[290px] min-h-screen">
        <Topbar />

        <main className="px-4 sm:px-6 lg:px-8 xl:px-10 py-6 lg:py-8 max-w-[1700px]">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
