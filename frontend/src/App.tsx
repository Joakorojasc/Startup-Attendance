import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider, useAuth } from '@/lib/AuthContext'
import { Layout } from '@/components/layout/Layout'
import { Login } from '@/pages/Login'
import { AhoraMismo } from '@/pages/AhoraMismo'
import { VistaDia } from '@/pages/VistaDia'
import { ReporteMensual } from '@/pages/ReporteMensual'
import { Trabajadores } from '@/pages/Trabajadores'
import { Horarios } from '@/pages/Horarios'
import { Exportar } from '@/pages/Exportar'
import { Soporte } from '@/pages/Soporte'
import { Equipo } from '@/pages/Equipo'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      retry: 1,
      retryDelay: 1000,
    },
  },
})

function ProtectedRoutes() {
  const { session, loading, authConfigured, role } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-base flex items-center justify-center">
        <span className="text-sm text-text-muted">Cargando...</span>
      </div>
    )
  }

  if (authConfigured && !session) return <Navigate to="/login" replace />

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<AhoraMismo />} />
        <Route path="/dia" element={<VistaDia />} />
        <Route path="/mes" element={<ReporteMensual />} />
        <Route path="/trabajadores" element={role !== 'viewer' ? <Trabajadores /> : <Navigate to="/" replace />} />
        <Route path="/horarios" element={role !== 'viewer' ? <Horarios /> : <Navigate to="/" replace />} />
        <Route path="/exportar" element={<Exportar />} />
        <Route path="/soporte" element={<Soporte />} />
        <Route path="/equipo" element={role === 'owner' ? <Equipo /> : <Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginGuard />} />
            <Route path="/*" element={<ProtectedRoutes />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  )
}

function LoginGuard() {
  const { session, loading, authConfigured } = useAuth()
  if (loading) return null
  if (!authConfigured || session) return <Navigate to="/" replace />
  return <Login />
}
