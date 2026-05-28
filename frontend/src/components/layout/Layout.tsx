import { Outlet, useLocation } from 'react-router-dom'
import { Sidebar } from './Sidebar'

export function Layout() {
  const { pathname } = useLocation()

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <div key={pathname} className="animate-slide-up min-h-full">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
