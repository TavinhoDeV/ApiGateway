import { AuthProvider, useAuth } from './hooks/useAuth'
import { LoginPage } from './pages/LoginPage'
import { DashboardPage } from './pages/DashboardPage'

function Inner() {
  const { token } = useAuth()
  return token ? <DashboardPage /> : <LoginPage />
}

export default function App() {
  return <AuthProvider><Inner /></AuthProvider>
}
