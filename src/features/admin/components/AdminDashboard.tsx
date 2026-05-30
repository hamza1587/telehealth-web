import {
  Box, Card, CardContent, Typography, Grid, Stack,
  CircularProgress, Alert, Divider, List, ListItem, ListItemText,
  ListItemAvatar, Avatar, Chip,
} from '@mui/material'
import {
  Assignment, TrendingUp, People,
  CheckCircle, Pending, Error as ErrorIcon,
  MonetizationOn, AccessTime,
} from '@mui/icons-material'

interface AdminDashboardProps {
  stats: {
    totalPatients: number
    totalDoctors: number
    totalAppointments: number
    totalRevenue: number
    pendingVerifications: number
    activeSessions: number
    unresolvedTickets: number
    avgRating: number
  }
  recentActivity: Array<{
    id: string
    action: string
    entity: string
    timestamp: string
    status: 'success' | 'pending' | 'error'
  }>
  loading: boolean
  error: string | null
}

export function AdminDashboard({
  stats,
  recentActivity,
  loading,
  error,
}: AdminDashboardProps) {
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>
  }

  const statCards = [
    { label: 'Total Patients', value: stats.totalPatients, icon: <People />, color: '#1565c0' },
    { label: 'Registered Doctors', value: stats.totalDoctors, icon: <Assignment />, color: '#7b1fa2' },
    { label: 'Appointments Today', value: stats.totalAppointments, icon: <AccessTime />, color: '#00695c' },
    { label: 'Revenue (Monthly)', value: `€${stats.totalRevenue.toLocaleString()}`, icon: <MonetizationOn />, color: '#ef6c00' },
    { label: 'Pending Verifications', value: stats.pendingVerifications, icon: <Pending />, color: '#f57c00' },
    { label: 'Active Sessions', value: stats.activeSessions, icon: <CheckCircle />, color: '#2e7d32' },
    { label: 'Unresolved Tickets', value: stats.unresolvedTickets, icon: <ErrorIcon />, color: '#c62828' },
    { label: 'Avg Rating', value: `${stats.avgRating}/5.0`, icon: <TrendingUp />, color: '#00838f' },
  ]

  const statusColors: Record<string, string> = {
    success: '#2e7d32',
    pending: '#f57c00',
    error: '#c62828',
  }

  return (
    <Box>
      {/* Stat Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {statCards.map((stat, i) => (
          <Grid size={{ xs: 12, sm: 6, md: 3 }} key={i}>
            <Card variant="outlined" sx={{ borderRadius: 4 }}>
              <CardContent>
                <Stack direction="row" spacing={2}>
                  <Avatar
                    sx={{
                      bgcolor: `${stat.color}15`,
                      color: stat.color,
                      width: 48,
                      height: 48,
                    }}
                  >
                    {stat.icon}
                  </Avatar>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 800, lineHeight: 1.2 }}>
                      {stat.value}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {stat.label}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        {/* Recent Activity */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Card variant="outlined" sx={{ borderRadius: 4 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Activity
              </Typography>
              <List dense>
                {recentActivity.map((activity) => (
                  <Box key={activity.id}>
                    <ListItem>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: statusColors[activity.status] + '20', color: statusColors[activity.status] }}>
                          {activity.status === 'success' ? <CheckCircle fontSize="small" /> :
                           activity.status === 'pending' ? <Pending fontSize="small" /> :
                           <ErrorIcon fontSize="small" />}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={activity.action}
                        secondary={
                          <Stack direction="row" spacing={1}>
                            <Typography variant="caption">{activity.entity}</Typography>
                            <Typography variant="caption" color="text.secondary">·</Typography>
                            <Typography variant="caption" color="text.secondary">
                              {activity.timestamp}
                            </Typography>
                          </Stack>
                        }
                      />
                    </ListItem>
                    <Divider variant="inset" component="li" />
                  </Box>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Quick Stats */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card variant="outlined" sx={{ borderRadius: 4, mb: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>System Status</Typography>
              <Stack spacing={2}>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">API Gateway</Typography>
                  <Chip label="Operational" size="small" color="success" variant="outlined" />
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">Database</Typography>
                  <Chip label="Healthy" size="small" color="success" variant="outlined" />
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">Redis Cache</Typography>
                  <Chip label="Connected" size="small" color="success" variant="outlined" />
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">Medplum FHIR</Typography>
                  <Chip label="Connected" size="small" color="success" variant="outlined" />
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">Video Service</Typography>
                  <Chip label="Configured" size="small" color="info" variant="outlined" />
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">Stripe Payment</Typography>
                  <Chip label="Connected" size="small" color="success" variant="outlined" />
                </Stack>
              </Stack>
            </CardContent>
          </Card>

          <Card variant="outlined" sx={{ borderRadius: 4 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Quick Links</Typography>
              <Stack spacing={1}>
                {[
                  'Patient Accounts',
                  'Doctor Management',
                  'Billing Overview',
                  'Support Tickets',
                  'Audit Logs',
                ].map(link => (
                  <Typography
                    key={link}
                    variant="body2"
                    color="primary"
                    sx={{ cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
                  >
                    → {link}
                  </Typography>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}
