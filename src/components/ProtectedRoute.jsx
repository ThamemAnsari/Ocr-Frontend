import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Loader2 } from 'lucide-react'

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)'
      }}>
        <div style={{ textAlign: 'center', color: 'white' }}>
          <Loader2 size={48} className="spinning" style={{ marginBottom: 16 }} />
          <p style={{ fontSize: 18, fontWeight: 600 }}>Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return children
}