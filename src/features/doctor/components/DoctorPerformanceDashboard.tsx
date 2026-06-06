import { useState, useEffect, useCallback } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Avatar,
  List,
  ListItem,
  ListItemText,
  Divider,
  Chip,
  CircularProgress,
  Alert,
  Button,
} from '@mui/material'
import { Refresh, Star } from '@mui/icons-material'
import { apiBaseUrl } from '@shared/config/patient.ts'
import { TelehealthBarChart, TelehealthAreaChart } from '@shared/components/charts'

const PLATFORM_BASE = `${apiBaseUrl}/platform`

interface DoctorProfile {
  id: string;
  userId: string;
  profileData: {
    firstName?: string;
    lastName?: string;
    specialty?: string;
    licenseNumber?: string;
    yearsExperience?: number;
    rating?: number;
  };
  createdAt: string;
}

interface Appointment {
  id: string;
  doctorId: string;
  patientId: string;
  status: string;
  scheduledAt: string;
  durationMinutes: number;
  feeCents: number;
}

interface EarningsPoint {
  month: string;
  earnedCents: number;
  consultations: number;
}

interface DoctorPerformanceDashboardProps {
  doctorId: string;
}

function fmtCurrency(cents: number) {
  return `€${(cents / 100).toLocaleString('en-IE', { maximumFractionDigits: 0 })}`
}

export function DoctorPerformanceDashboard({ doctorId }: DoctorPerformanceDashboardProps) {
  const [profile, setProfile] = useState<DoctorProfile | null>(null)
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [profileRes, aptsRes] = await Promise.all([
        fetch(`${PLATFORM_BASE}/doctors/${doctorId}`),
        fetch(`${PLATFORM_BASE}/appointments?doctorId=${doctorId}&limit=200`),
      ])
      if (!profileRes.ok) throw new Error('Could not load doctor profile')

      const [profileData, aptsData] = await Promise.all([
        profileRes.json(),
        aptsRes.ok ? aptsRes.json() : Promise.resolve([]),
      ])

      setProfile(profileData)
      setAppointments(Array.isArray(aptsData) ? aptsData : [])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Load failed')
    } finally {
      setLoading(false)
    }
  }, [doctorId])

  useEffect(() => { load() }, [load])

  const completed = appointments.filter(a => a.status === 'completed')
  const totalEarned = completed.reduce((s, a) => s + (a.feeCents ?? 0), 0)
  const avgDuration = completed.length > 0
    ? Math.round(completed.reduce((s, a) => s + (a.durationMinutes ?? 0), 0) / completed.length)
    : 0

  // Build per-month earnings for chart
  const monthMap: Record<string, EarningsPoint> = {}
  completed.forEach(a => {
    const m = a.scheduledAt?.slice(0, 7) ?? '?'
    if (!monthMap[m]) monthMap[m] = { month: m, earnedCents: 0, consultations: 0 }
    monthMap[m].earnedCents += a.feeCents ?? 0
    monthMap[m].consultations += 1
  })
  const earningsChart = Object.values(monthMap)
    .sort((a, b) => a.month.localeCompare(b.month))
    .map(p => ({ month: p.month, earned: Math.round(p.earnedCents / 100), consultations: p.consultations }))

  // Status breakdown
  const statusCount: Record<string, number> = {}
  appointments.forEach(a => { statusCount[a.status] = (statusCount[a.status] ?? 0) + 1 })
  const statusBarData = Object.entries(statusCount).map(([status, count]) => ({ status, count }))

  const recentApts = [...appointments]
    .sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime())
    .slice(0, 8)

  const statusColor = (s: string): 'default' | 'success' | 'warning' | 'error' => {
    if (s === 'completed') return 'success'
    if (s === 'cancelled') return 'error'
    if (s === 'pending_payment' || s === 'scheduled') return 'warning'
    return 'default'
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return <Alert severity="error" action={<Button size="small" onClick={load}>Retry</Button>}>{error}</Alert>
  }

  const { firstName = '', lastName = '', specialty = 'General Practice', rating } = profile?.profileData ?? {}
  const fullName = [firstName, lastName].filter(Boolean).join(' ') || 'Doctor'

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <Avatar sx={{ width: 56, height: 56, bgcolor: 'primary.main', fontSize: 22 }}>
          {firstName?.[0]}{lastName?.[0]}
        </Avatar>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h5" fontWeight="bold">Dr. {fullName}</Typography>
          <Typography variant="body2" color="text.secondary">{specialty}</Typography>
          {rating != null && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Star sx={{ fontSize: 14, color: '#fb8c00' }} />
              <Typography variant="caption">{rating.toFixed(1)} / 5.0</Typography>
            </Box>
          )}
        </Box>
        <Button startIcon={<Refresh />} onClick={load} variant="outlined" size="small">Refresh</Button>
      </Box>

      {/* KPI strip */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { label: 'Total Consultations', value: appointments.length },
          { label: 'Completed', value: completed.length },
          { label: 'Total Earned', value: fmtCurrency(totalEarned) },
          { label: 'Avg Duration', value: `${avgDuration} min` },
        ].map(k => (
          <Grid item xs={6} sm={3} key={k.label}>
            <Card>
              <CardContent sx={{ py: '12px !important' }}>
                <Typography variant="caption" color="text.secondary" display="block">{k.label}</Typography>
                <Typography variant="h5" fontWeight="bold">{k.value}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* Monthly earnings */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>Monthly Earnings & Consultations</Typography>
              {earningsChart.length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ py: 3, textAlign: 'center' }}>No data yet</Typography>
              ) : (
                <TelehealthAreaChart
                  data={earningsChart}
                  xKey="month"
                  series={[{ key: 'earned', label: 'Earned (€)', color: '#2e7d32' }]}
                  yTickFormatter={v => `€${v}`}
                />
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Status bar */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>Appointment Status</Typography>
              {statusBarData.length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ py: 3, textAlign: 'center' }}>No data yet</Typography>
              ) : (
                <TelehealthBarChart
                  data={statusBarData}
                  xKey="status"
                  series={[{ key: 'count', label: 'Count' }]}
                  colorByCategory
                  height={200}
                />
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Recent appointments */}
      <Card>
        <CardContent>
          <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>Recent Appointments</Typography>
          <Divider sx={{ mb: 1 }} />
          {recentApts.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>No appointments found</Typography>
          ) : (
            <List dense disablePadding>
              {recentApts.map(a => (
                <ListItem key={a.id} disablePadding sx={{ py: 0.5 }}>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2">{new Date(a.scheduledAt).toLocaleString()}</Typography>
                        <Chip label={a.status.replace(/_/g, ' ')} size="small" color={statusColor(a.status)} />
                      </Box>
                    }
                    secondary={`Duration: ${a.durationMinutes ?? '?'} min · Fee: ${fmtCurrency(a.feeCents ?? 0)}`}
                  />
                </ListItem>
              ))}
            </List>
          )}
        </CardContent>
      </Card>
    </Box>
  )
}
