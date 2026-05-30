import { useState } from 'react'
import { Box } from '@mui/material'
import {
  AdminDashboard as AdminDashboardComponent,
} from './components/AdminDashboard.tsx'
import {
  AdminDoctorVerification,
} from './components/AdminDoctorVerification.tsx'

// Mock data for admin dashboard
const mockStats = {
  totalPatients: 1247,
  totalDoctors: 89,
  totalAppointments: 342,
  totalRevenue: 45890,
  pendingVerifications: 12,
  activeSessions: 8,
  unresolvedTickets: 5,
  avgRating: 4.6,
}

const mockActivity = [
  { id: '1', action: 'Patient registered', entity: 'John Doe', timestamp: '2 hours ago', status: 'success' as const },
  { id: '2', action: 'Doctor verification submitted', entity: 'Dr. Sarah Wilson', timestamp: '3 hours ago', status: 'pending' as const },
  { id: '3', action: 'Payment processed', entity: 'Consultation #1234', timestamp: '4 hours ago', status: 'success' as const },
  { id: '4', action: 'Ticket created', entity: 'Billing dispute #567', timestamp: '5 hours ago', status: 'pending' as const },
  { id: '5', action: 'Appointment cancelled', entity: 'Patient #789', timestamp: '6 hours ago', status: 'error' as const },
]

// Mock verification data
const mockDoctors = [
  {
    id: '1',
    doctorName: 'Dr. Sarah Wilson',
    email: 'sarah.wilson@example.com',
    specialty: 'Cardiology',
    countryCode: 'DE',
    education: ['MD from University of Munich', 'Fellowship in Cardiology'],
    verificationStatus: 'Pending' as const,
    submittedAt: '2026-05-01T10:00:00Z',
    documents: [{ name: 'Medical License.pdf', url: '#' }, { name: 'Diploma.pdf', url: '#' }],
  },
  {
    id: '2',
    doctorName: 'Dr. Maria Garcia',
    email: 'maria.garcia@example.com',
    specialty: 'Dermatology',
    countryCode: 'ES',
    education: ['MD from University of Barcelona'],
    verificationStatus: 'Pending' as const,
    submittedAt: '2026-05-02T14:30:00Z',
    documents: [{ name: 'Medical License.pdf', url: '#' }],
  },
]

type TabType = 'dashboard' | 'verifications'

export function AdminWorkspace() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard')

  const tabConfig = [
    { key: 'dashboard' as TabType, label: 'Dashboard' },
    { key: 'verifications' as TabType, label: `Doctor Verifications (${mockDoctors.length})` },
  ]

  const handleVerify = (id: string) => {
    console.log('Verify doctor:', id)
  }

  const handleReject = (id: string) => {
    console.log('Reject doctor:', id)
  }

  return (
    <Box>
      {/* Tab Navigation */}
      <Box sx={{ display: 'flex', gap: 1, mb: 3, borderBottom: 1, borderColor: 'divider', pb: 1 }}>
        {tabConfig.map(tab => (
          <Box
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            sx={{
              px: 3,
              py: 1,
              cursor: 'pointer',
              borderBottom: activeTab === tab.key ? '3px solid' : 'none',
              borderColor: 'primary.main',
              color: activeTab === tab.key ? 'primary.main' : 'text.secondary',
              fontWeight: activeTab === tab.key ? 700 : 400,
              fontSize: 14,
              '&:hover': { color: 'primary.dark' },
              transition: 'all 0.2s',
            }}
          >
            {tab.label}
          </Box>
        ))}
      </Box>

      {activeTab === 'dashboard' && (
        <AdminDashboardComponent
          stats={mockStats}
          recentActivity={mockActivity}
          loading={false}
          error={null}
        />
      )}

      {activeTab === 'verifications' && (
        <AdminDoctorVerification
          doctors={mockDoctors}
          loading={false}
          error={null}
          onVerify={handleVerify}
          onReject={handleReject}
        />
      )}
    </Box>
  )
}