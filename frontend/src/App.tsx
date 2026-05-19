import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Layout } from '@/components/layout/Layout'
import { AhoraMismo } from '@/pages/AhoraMismo'
import { VistaDia } from '@/pages/VistaDia'
import { ReporteMensual } from '@/pages/ReporteMensual'
import { Trabajadores } from '@/pages/Trabajadores'
import { Horarios } from '@/pages/Horarios'
import { Exportar } from '@/pages/Exportar'

const queryClient = new QueryClient()

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<AhoraMismo />} />
            <Route path="/dia" element={<VistaDia />} />
            <Route path="/mes" element={<ReporteMensual />} />
            <Route path="/trabajadores" element={<Trabajadores />} />
            <Route path="/horarios" element={<Horarios />} />
            <Route path="/exportar" element={<Exportar />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
