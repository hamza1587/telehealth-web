import { useState, useEffect, useRef } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
} from '@mui/material'
import { FiberManualRecord } from '@mui/icons-material'
import { apiBaseUrl } from '@shared/config/patient.ts'
import { TelehealthLineChart } from '@shared/components/charts'

const ANALYTICS_BASE = `${apiBaseUrl}/platform/analytics`
const REFRESH_MS = 5_000
const HISTORY_LENGTH = 30

interface LiveSummary {
  totalPatients: number;
  totalDoctors: number;
  activeConsultations: number;
  totalRevenueCents: number;
  totalAppointments: number;
  completedAppointments: number;
}

interface ActiveAlert {
  ruleId: string;
  ruleName: string;
  metricName: string;
  currentValue: number;
  threshold: number;
  condition: string;
  triggeredAt: string;
}

interface HistoryPoint {
  tick: number;
  activeConsultations: number;
  totalPatients: number;
}

export function RealTimeMonitor() {
  const [summary, setSummary] = useState<LiveSummary | null>(null)
  const [alerts, setAlerts] = useState<ActiveAlert[]>([])
  const [history, setHistory] = useState<HistoryPoint[]>([])
  const [connected, setConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const tickRef = useRef(0)

  useEffect(() => {
    let cancelled = false

    async function poll() {
      try {
        const [sumRes, alertRes] = await Promise.all([
          fetch(`${ANALYTICS_BASE}/summary`),
          fetch(`${ANALYTICS_BASE}/alerts/active`),
        ])
        if (!sumRes.ok) throw new Error(`HTTP ${sumRes.status}`)

        const [sumData, alertData]: [LiveSummary, ActiveAlert[]] = await Promise.all([
          sumRes.json(),
          alertRes.ok ? alertRes.json() : Promise.resolve([]),
        ])

        if (cancelled) return

        const tick = ++tickRef.current
        setSummary(sumData)
        setAlerts(alertData)
        setConnected(true)
        setError(null)
        setHistory(prev => {
          const next = [...prev, {
            tick,
            activeConsultations: sumData.activeConsultations,
            totalPatients: sumData.totalPatients,
          }]
          return next.slice(-HISTORY_LENGTH)
        })
      } catch (e) {
        if (cancelled) return
        setConnected(false)
        setError(e instanceof Error ? e.message : 'Connection error')
      }
    }

    poll()
    const id = setInterval(poll, REFRESH_MS)
    return () => { cancelled = true; clearInterval(id) }
  }, [])

  const historyChartData = history.map(h => ({
    tick: String(h.tick),
    active: h.activeConsultations,
  }))

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Typography variant="h5" fontWeight="bold">Real-Time Monitor</Typography>
        <Chip
          icon={<FiberManualRecord sx={{ fontSize: '10px !important' }} />}
          label={connected ? 'Live' : 'Offline'}
          color={connected ? 'success' : 'error'}
          size="small"
        />
        <Typography variant="caption" color="text.secondary">updates every 5 s</Typography>
      </Box>

      {error && !connected && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <CircularProgress size={14} />
          <Typography variant="body2" color="text.secondary">Reconnecting… ({error})</Typography>
        </Box>
      )}

      {/* Live KPIs */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { label: 'Active Consultations', value: summary?.activeConsultations ?? '—', highlight: true },
          { label: 'Total Patients', value: summary?.totalPatients?.toLocaleString() ?? '—', highlight: false },
          { label: 'Doctors Online', value: summary?.totalDoctors ?? '—', highlight: false },
          { label: 'Completion Rate', value: summary && summary.totalAppointments > 0
              ? `${Math.round((summary.completedAppointments / summary.totalAppointments) * 100)}%`
              : '—', highlight: false },
        ].map(item => (
          <Grid item xs={6} sm={3} key={item.label}>
            <Card sx={{ borderLeft: item.highlight ? '4px solid #1565c0' : undefined }}>
              <CardContent sx={{ py: '12px !important' }}>
                <Typography variant="caption" color="text.secondary" display="block">{item.label}</Typography>
                <Typography variant="h4" fontWeight="bold" color={item.highlight ? 'primary.main' : 'text.primary'}>
                  {summary === null ? <CircularProgress size={20} /> : item.value}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Active consultations sparkline */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>
                Active Consultations — last {HISTORY_LENGTH} ticks
              </Typography>
              {historyChartData.length < 2 ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress size={24} />
                </Box>
              ) : (
                <TelehealthLineChart
                  data={historyChartData}
                  xKey="tick"
                  series={[{ key: 'active', label: 'Active', color: '#1565c0' }]}
                  height={200}
                />
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Active alerts */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Typography variant="subtitle1" fontWeight="bold">Active Alerts</Typography>
                {alerts.length > 0 && (
                  <Chip label={alerts.length} color="error" size="small" />
                )}
              </Box>
              <Divider sx={{ mb: 1 }} />
              {alerts.length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
                  No active alerts
                </Typography>
              ) : (
                <List dense disablePadding>
                  {alerts.map(a => (
                    <ListItem key={a.ruleId} disablePadding sx={{ py: 0.5 }}>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <FiberManualRecord sx={{ fontSize: 8, color: 'error.main' }} />
                            <Typography variant="body2" fontWeight={500}>{a.ruleName}</Typography>
                          </Box>
                        }
                        secondary={
                          <Typography variant="caption" color="text.secondary">
                            {a.metricName}: {a.currentValue.toFixed(1)} {a.condition} {a.threshold}
                          </Typography>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}
