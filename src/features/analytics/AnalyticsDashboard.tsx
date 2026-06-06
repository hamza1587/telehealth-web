import { useState, useEffect, useCallback } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Alert,
  Divider,
} from '@mui/material'
import {
  People,
  MedicalServices,
  VideoCall,
  AttachMoney,
  Refresh,
} from '@mui/icons-material'
import { apiBaseUrl } from '@shared/config/patient.ts'
import {
  TelehealthLineChart,
  TelehealthBarChart,
  TelehealthPieChart,
  TelehealthAreaChart,
} from '@shared/components/charts'

const ANALYTICS_BASE = `${apiBaseUrl}/platform/analytics`

interface Summary {
  totalPatients: number;
  totalDoctors: number;
  totalAppointments: number;
  completedAppointments: number;
  activeConsultations: number;
  totalRevenueCents: number;
}

interface DailyDataPoint {
  day: string;
  count: number;
}

interface DailyRevenuePoint {
  day: string;
  totalCents: number;
}

interface StatusBreakdown {
  status: string;
  count: number;
}

interface SpecialtyBreakdown {
  specialty: string;
  count: number;
}

interface ForecastPoint {
  day: string;
  predicted: number;
  lower: number;
  upper: number;
}

interface DailyData {
  consultations: DailyDataPoint[];
  patients: DailyDataPoint[];
}

function fmtCurrency(cents: number) {
  return `€${(cents / 100).toLocaleString('en-IE', { maximumFractionDigits: 0 })}`
}

function fmtDay(iso: string) {
  return iso.slice(5) // MM-DD
}

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  sub?: string;
}
function StatCard({ label, value, icon, sub }: StatCardProps) {
  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
          <Box sx={{ p: 0.75, borderRadius: 1, bgcolor: 'primary.light', color: 'primary.contrastText', display: 'flex' }}>
            {icon}
          </Box>
          <Typography variant="body2" color="text.secondary">{label}</Typography>
        </Box>
        <Typography variant="h4" fontWeight="bold">{value}</Typography>
        {sub && <Typography variant="caption" color="text.secondary">{sub}</Typography>}
      </CardContent>
    </Card>
  )
}

export const AnalyticsDashboard: React.FC = () => {
  const [summary, setSummary] = useState<Summary | null>(null)
  const [daily, setDaily] = useState<DailyData | null>(null)
  const [revenue, setRevenue] = useState<DailyRevenuePoint[]>([])
  const [statusBreakdown, setStatusBreakdown] = useState<StatusBreakdown[]>([])
  const [specialtyBreakdown, setSpecialtyBreakdown] = useState<SpecialtyBreakdown[]>([])
  const [forecast, setForecast] = useState<ForecastPoint[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [days, setDays] = useState(30)
  const [horizon, setHorizon] = useState(7)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [summaryRes, dailyRes, revenueRes, statusRes, specialtyRes, forecastRes] = await Promise.all([
        fetch(`${ANALYTICS_BASE}/summary`),
        fetch(`${ANALYTICS_BASE}/daily?days=${days}`),
        fetch(`${ANALYTICS_BASE}/revenue?days=${days}`),
        fetch(`${ANALYTICS_BASE}/status-breakdown`),
        fetch(`${ANALYTICS_BASE}/specialty-breakdown`),
        fetch(`${ANALYTICS_BASE}/demand-forecast?horizon=${horizon}`),
      ])

      if (!summaryRes.ok) throw new Error('Failed to load summary')

      const [summaryData, dailyData, revenueData, statusData, specialtyData, forecastData] = await Promise.all([
        summaryRes.json(),
        dailyRes.json(),
        revenueRes.json(),
        statusRes.json(),
        specialtyRes.json(),
        forecastRes.json(),
      ])

      setSummary(summaryData)
      setDaily(dailyData)
      setRevenue(revenueData)
      setStatusBreakdown(statusData)
      setSpecialtyBreakdown(specialtyData)
      setForecast(forecastData)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load analytics')
    } finally {
      setLoading(false)
    }
  }, [days, horizon])

  useEffect(() => { load() }, [load])

  const consultationChartData = (daily?.consultations ?? []).map(d => ({
    day: fmtDay(d.day),
    consultations: d.count,
    patients: daily?.patients.find(p => p.day === d.day)?.count ?? 0,
  }))

  const revenueChartData = revenue.map(r => ({
    day: fmtDay(r.day),
    revenue: Math.round(r.totalCents / 100),
  }))

  const forecastChartData = forecast.map(f => ({
    day: fmtDay(f.day),
    predicted: Math.round(f.predicted),
    lower: Math.round(f.lower),
    upper: Math.round(f.upper),
  }))

  const statusPieData = statusBreakdown.map(s => ({
    name: s.status.replace(/_/g, ' '),
    value: s.count,
  }))

  const specialtyBarData = specialtyBreakdown.map(s => ({
    specialty: s.specialty || 'General',
    count: s.count,
  }))

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold">Analytics Dashboard</Typography>
          <Typography variant="body2" color="text.secondary">Platform-wide insights with differential privacy</Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          <FormControl size="small" sx={{ minWidth: 110 }}>
            <InputLabel>Period</InputLabel>
            <Select value={days} label="Period" onChange={e => setDays(Number(e.target.value))}>
              <MenuItem value={7}>7 days</MenuItem>
              <MenuItem value={14}>14 days</MenuItem>
              <MenuItem value={30}>30 days</MenuItem>
              <MenuItem value={90}>90 days</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Forecast</InputLabel>
            <Select value={horizon} label="Forecast" onChange={e => setHorizon(Number(e.target.value))}>
              <MenuItem value={7}>7-day ahead</MenuItem>
              <MenuItem value={14}>14-day ahead</MenuItem>
            </Select>
          </FormControl>
          <Button variant="outlined" startIcon={<Refresh />} onClick={load}>Refresh</Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>{error}</Alert>
      )}

      {/* KPI cards */}
      {summary && (
        <Grid container spacing={2} sx={{ mb: 4 }}>
          <Grid item xs={6} sm={4} md={2}>
            <StatCard label="Total Patients" value={summary.totalPatients.toLocaleString()} icon={<People fontSize="small" />} />
          </Grid>
          <Grid item xs={6} sm={4} md={2}>
            <StatCard label="Doctors" value={summary.totalDoctors.toLocaleString()} icon={<MedicalServices fontSize="small" />} />
          </Grid>
          <Grid item xs={6} sm={4} md={2}>
            <StatCard label="Appointments" value={summary.totalAppointments.toLocaleString()} icon={<VideoCall fontSize="small" />} sub={`${summary.completedAppointments} completed`} />
          </Grid>
          <Grid item xs={6} sm={4} md={2}>
            <StatCard label="Live Consultations" value={summary.activeConsultations} icon={<VideoCall fontSize="small" />} />
          </Grid>
          <Grid item xs={6} sm={4} md={2}>
            <StatCard label="Total Revenue" value={fmtCurrency(summary.totalRevenueCents)} icon={<AttachMoney fontSize="small" />} />
          </Grid>
          <Grid item xs={6} sm={4} md={2}>
            <StatCard
              label="Completion Rate"
              value={summary.totalAppointments > 0
                ? `${Math.round((summary.completedAppointments / summary.totalAppointments) * 100)}%`
                : '—'}
              icon={<MedicalServices fontSize="small" />}
            />
          </Grid>
        </Grid>
      )}

      {/* Daily consultations + patients */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>
                Daily Consultations & New Patients
              </Typography>
              <TelehealthLineChart
                data={consultationChartData}
                xKey="day"
                series={[
                  { key: 'consultations', label: 'Consultations', color: '#1565c0' },
                  { key: 'patients', label: 'New Patients', color: '#00897b' },
                ]}
              />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>
                Appointment Status
              </Typography>
              <TelehealthPieChart data={statusPieData} />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Revenue + specialty */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>
                Daily Revenue (€)
              </Typography>
              <TelehealthAreaChart
                data={revenueChartData}
                xKey="day"
                series={[{ key: 'revenue', label: 'Revenue', color: '#2e7d32' }]}
                yTickFormatter={v => `€${(v / 1000).toFixed(0)}k`}
              />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>
                Consultations by Specialty
              </Typography>
              <TelehealthBarChart
                data={specialtyBarData}
                xKey="specialty"
                series={[{ key: 'count', label: 'Consultations' }]}
                colorByCategory
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Demand forecast */}
      {forecast.length > 0 && (
        <Card>
          <CardContent>
            <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 0.5 }}>
              Demand Forecast — next {horizon} days
            </Typography>
            <Typography variant="caption" color="text.secondary" component="p" sx={{ mb: 2 }}>
              Holt double-exponential smoothing · 80% prediction interval shown as lower/upper bounds
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <TelehealthLineChart
              data={forecastChartData}
              xKey="day"
              series={[
                { key: 'predicted', label: 'Predicted', color: '#1565c0' },
                { key: 'lower', label: 'Lower 80%', color: '#90a4ae' },
                { key: 'upper', label: 'Upper 80%', color: '#90a4ae' },
              ]}
            />
          </CardContent>
        </Card>
      )}
    </Box>
  )
}
