import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './AuthContext.tsx'
import { CircularProgress, Box } from '@mui/material'
import type { UserType } from '@shared/types/auth.ts'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredUserType?: UserType
  requiredRole?: string
  fallback?: React.ReactNode
}

export function ProtectedRoute({ 
  children, 
  requiredUserType,
  requiredRole,
  fallback 
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth()
  const location = useLocation()

  // Show loading spinner while checking auth state
  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
        }}
      >
        <CircularProgress />
      </Box>
    )
  }

  // Not authenticated - redirect to login
  if (!isAuthenticated) {
    // Store the attempted URL for redirect after login
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Check user type requirement
  if (requiredUserType && user?.userType !== requiredUserType) {
    if (fallback) {
      return <>{fallback}</>
    }
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <h1>Access Denied</h1>
        <p>You don't have permission to access this page.</p>
      </Box>
    )
  }

  // Check role requirement
  if (requiredRole && !user?.roles.includes(requiredRole)) {
    if (fallback) {
      return <>{fallback}</>
    }
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <h1>Access Denied</h1>
        <p>You don't have the required role to access this page.</p>
      </Box>
    )
  }

  // All checks passed - render the protected content
  return <>{children}</>
}

// Convenience wrappers for common use cases
export function PatientRoute({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute requiredUserType="Patient">
      {children}
    </ProtectedRoute>
  )
}

export function DoctorRoute({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute requiredUserType="Doctor">
      {children}
    </ProtectedRoute>
  )
}

export function AdminRoute({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute requiredUserType="Admin">
      {children}
    </ProtectedRoute>
  )
}
