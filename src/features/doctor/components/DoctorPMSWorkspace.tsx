import { useState, useEffect, useCallback } from 'react'
import {
  Box, Tab, Tabs, Typography, Grid, Card, CardContent, Chip, Stack, Button,
  TextField, Dialog, DialogTitle, DialogContent, DialogActions, Alert,
  Table, TableBody, TableCell, TableHead, TableRow, Paper, CircularProgress,
  Divider, IconButton, Tooltip, Avatar, Select, MenuItem, FormControl, InputLabel,
} from '@mui/material'
import {
  CalendarMonth as CalendarIcon,
  NoteAlt as NoteIcon,
  CompareArrows as ReferralIcon,
  AttachMoney as EarningsIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Visibility as ViewIcon,
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
  AccessTime as TimeIcon,
  Star as StarIcon,
} from '@mui/icons-material'
import { apiClient } from '@shared/api/apiClient.ts'
import { useAuth } from '@shared/auth/AuthContext.tsx'

// ---------- types ----------

interface Encounter {
  id: string
  patientName: string
  patientId: string
  date: string
  duration: number
  chief_complaint: string
  subjective: string
  objective: string
  assessment: string
  plan: string
  status: 'draft' | 'signed'
}

interface Referral {
  id: string
  patientName: string
  patientId: string
  toSpecialty: string
  toDoctor?: string
  reason: string
  urgency: 'routine' | 'urgent' | 'emergency'
  status: 'pending' | 'accepted' | 'completed'
  createdAt: string
}

interface EarningsSummary {
  totalEarningsMinor: number
  pendingMinor: number
  paidOutMinor: number
  totalConsultations: number
  avgRating: number
  currency: string
}

interface DoctorStats {
  todayAppointments: number
  weekAppointments: number
  totalPatients: number
  avgConsultMinutes: number
  completionRate: number
  avgRating: number
}

// ---------- helpers ----------

function minorToCurrency(minor: number, currency = 'EUR') {
  return new Intl.NumberFormat('en-EU', { style: 'currency', currency }).format(minor / 100)
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

// ---------- sub-panels ----------

function OverviewPanel({ stats }: { stats: DoctorStats | null }) {
  if (!stats) return <CircularProgress />

  const cards = [
    { label: "Today's appointments", value: stats.todayAppointments, icon: <CalendarIcon color="primary" /> },
    { label: 'This week', value: stats.weekAppointments, icon: <TimeIcon color="secondary" /> },
    { label: 'Total patients', value: stats.totalPatients, icon: <PeopleIcon color="success" /> },
    { label: 'Avg consultation', value: `${stats.avgConsultMinutes} min`, icon: <TrendingUpIcon color="info" /> },
    { label: 'Completion rate', value: `${stats.completionRate}%`, icon: <TrendingUpIcon color="warning" /> },
    { label: 'Avg rating', value: stats.avgRating.toFixed(1), icon: <StarIcon color="warning" /> },
  ]

  return (
    <Grid container spacing={2}>
      {cards.map(c => (
        <Grid key={c.label} size={{ xs: 12, sm: 6, md: 4 }}>
          <Card variant="outlined">
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={1} mb={0.5}>
                {c.icon}
                <Typography variant="body2" color="text.secondary">{c.label}</Typography>
              </Stack>
              <Typography variant="h4" fontWeight="bold">{c.value}</Typography>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  )
}

function EncountersPanel() {
  const [encounters, setEncounters] = useState<Encounter[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selected, setSelected] = useState<Encounter | null>(null)
  const [form, setForm] = useState<Partial<Encounter>>({})
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    apiClient.get<Encounter[]>('/platform/pms/encounters')
      .then(setEncounters)
      .catch(() => setEncounters([]))
      .finally(() => setLoading(false))
  }, [])

  const openNew = () => {
    setSelected(null)
    setForm({ subjective: '', objective: '', assessment: '', plan: '', status: 'draft' })
    setDialogOpen(true)
  }

  const openEdit = (e: Encounter) => {
    setSelected(e)
    setForm(e)
    setDialogOpen(true)
  }

  const save = async () => {
    setSaving(true)
    setError(null)
    try {
      if (selected) {
        const updated = await apiClient.put<Encounter>(`/platform/pms/encounters/${selected.id}`, form)
        setEncounters(prev => prev.map(e => e.id === updated.id ? updated : e))
      } else {
        const created = await apiClient.post<Encounter>('/platform/pms/encounters', form)
        setEncounters(prev => [created, ...prev])
      }
      setDialogOpen(false)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <CircularProgress />

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">Clinical encounters</Typography>
        <Button startIcon={<AddIcon />} variant="contained" size="small" onClick={openNew}>
          New encounter
        </Button>
      </Stack>

      {encounters.length === 0 ? (
        <Alert severity="info">No encounters recorded yet.</Alert>
      ) : (
        <Paper variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Patient</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Chief complaint</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {encounters.map(e => (
                <TableRow key={e.id} hover>
                  <TableCell>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Avatar sx={{ width: 28, height: 28, fontSize: 12 }}>
                        {e.patientName[0]}
                      </Avatar>
                      <Typography variant="body2">{e.patientName}</Typography>
                    </Stack>
                  </TableCell>
                  <TableCell>{formatDate(e.date)}</TableCell>
                  <TableCell>{e.chief_complaint || '—'}</TableCell>
                  <TableCell>
                    <Chip
                      label={e.status}
                      size="small"
                      color={e.status === 'signed' ? 'success' : 'default'}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Edit">
                      <IconButton size="small" onClick={() => openEdit(e)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      )}

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>{selected ? 'Edit encounter' : 'New encounter'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            {error && <Alert severity="error">{error}</Alert>}
            <TextField
              label="Chief complaint"
              fullWidth
              value={form.chief_complaint ?? ''}
              onChange={e => setForm(f => ({ ...f, chief_complaint: e.target.value }))}
            />
            <Typography variant="subtitle2" fontWeight="bold">SOAP Notes</Typography>
            <TextField
              label="Subjective — patient's description"
              fullWidth
              multiline
              rows={3}
              value={form.subjective ?? ''}
              onChange={e => setForm(f => ({ ...f, subjective: e.target.value }))}
            />
            <TextField
              label="Objective — clinical findings"
              fullWidth
              multiline
              rows={3}
              value={form.objective ?? ''}
              onChange={e => setForm(f => ({ ...f, objective: e.target.value }))}
            />
            <TextField
              label="Assessment — diagnosis / differential"
              fullWidth
              multiline
              rows={3}
              value={form.assessment ?? ''}
              onChange={e => setForm(f => ({ ...f, assessment: e.target.value }))}
            />
            <TextField
              label="Plan — treatment / follow-up"
              fullWidth
              multiline
              rows={3}
              value={form.plan ?? ''}
              onChange={e => setForm(f => ({ ...f, plan: e.target.value }))}
            />
            <FormControl size="small">
              <InputLabel>Status</InputLabel>
              <Select
                label="Status"
                value={form.status ?? 'draft'}
                onChange={e => setForm(f => ({ ...f, status: e.target.value as Encounter['status'] }))}
              >
                <MenuItem value="draft">Draft</MenuItem>
                <MenuItem value="signed">Signed</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={save} disabled={saving}>
            {saving ? 'Saving…' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

function ReferralsPanel() {
  const [referrals, setReferrals] = useState<Referral[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [form, setForm] = useState<Partial<Referral>>({ urgency: 'routine', status: 'pending' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    apiClient.get<Referral[]>('/platform/pms/referrals')
      .then(setReferrals)
      .catch(() => setReferrals([]))
      .finally(() => setLoading(false))
  }, [])

  const save = async () => {
    setSaving(true)
    setError(null)
    try {
      const created = await apiClient.post<Referral>('/platform/pms/referrals', form)
      setReferrals(prev => [created, ...prev])
      setDialogOpen(false)
      setForm({ urgency: 'routine', status: 'pending' })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create referral.')
    } finally {
      setSaving(false)
    }
  }

  const urgencyColor = (u: Referral['urgency']) =>
    u === 'emergency' ? 'error' : u === 'urgent' ? 'warning' : 'default'

  if (loading) return <CircularProgress />

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">Specialist referrals</Typography>
        <Button startIcon={<AddIcon />} variant="contained" size="small" onClick={() => setDialogOpen(true)}>
          New referral
        </Button>
      </Stack>

      {referrals.length === 0 ? (
        <Alert severity="info">No referrals created yet.</Alert>
      ) : (
        <Paper variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Patient</TableCell>
                <TableCell>Specialty</TableCell>
                <TableCell>Reason</TableCell>
                <TableCell>Urgency</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Date</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {referrals.map(r => (
                <TableRow key={r.id} hover>
                  <TableCell>{r.patientName}</TableCell>
                  <TableCell>{r.toSpecialty}</TableCell>
                  <TableCell>{r.reason}</TableCell>
                  <TableCell>
                    <Chip label={r.urgency} size="small" color={urgencyColor(r.urgency)} />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={r.status}
                      size="small"
                      color={r.status === 'completed' ? 'success' : r.status === 'accepted' ? 'info' : 'default'}
                    />
                  </TableCell>
                  <TableCell>{formatDate(r.createdAt)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      )}

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>New referral</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            {error && <Alert severity="error">{error}</Alert>}
            <TextField
              label="Patient ID"
              fullWidth
              value={form.patientId ?? ''}
              onChange={e => setForm(f => ({ ...f, patientId: e.target.value }))}
            />
            <TextField
              label="To specialty"
              fullWidth
              value={form.toSpecialty ?? ''}
              onChange={e => setForm(f => ({ ...f, toSpecialty: e.target.value }))}
              placeholder="e.g. Cardiology"
            />
            <TextField
              label="Referring to doctor (optional)"
              fullWidth
              value={form.toDoctor ?? ''}
              onChange={e => setForm(f => ({ ...f, toDoctor: e.target.value }))}
            />
            <TextField
              label="Reason for referral"
              fullWidth
              multiline
              rows={3}
              value={form.reason ?? ''}
              onChange={e => setForm(f => ({ ...f, reason: e.target.value }))}
            />
            <FormControl size="small" fullWidth>
              <InputLabel>Urgency</InputLabel>
              <Select
                label="Urgency"
                value={form.urgency ?? 'routine'}
                onChange={e => setForm(f => ({ ...f, urgency: e.target.value as Referral['urgency'] }))}
              >
                <MenuItem value="routine">Routine</MenuItem>
                <MenuItem value="urgent">Urgent</MenuItem>
                <MenuItem value="emergency">Emergency</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={save}
            disabled={saving || !form.patientId || !form.toSpecialty || !form.reason}
          >
            {saving ? 'Saving…' : 'Create referral'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

function EarningsPanel() {
  const [summary, setSummary] = useState<EarningsSummary | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    apiClient.get<EarningsSummary>('/platform/payouts/earnings')
      .then(setSummary)
      .catch(() => setSummary(null))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <CircularProgress />
  if (!summary) return <Alert severity="error">Failed to load earnings.</Alert>

  const cur = summary.currency

  return (
    <Stack spacing={3}>
      <Grid container spacing={2}>
        {[
          { label: 'Total earned', value: minorToCurrency(summary.totalEarningsMinor, cur), color: 'success.main' },
          { label: 'Pending payout', value: minorToCurrency(summary.pendingMinor, cur), color: 'warning.main' },
          { label: 'Total paid out', value: minorToCurrency(summary.paidOutMinor, cur), color: 'info.main' },
          { label: 'Consultations', value: summary.totalConsultations, color: 'text.primary' },
          { label: 'Avg rating', value: `${summary.avgRating.toFixed(1)} / 5`, color: 'text.primary' },
        ].map(item => (
          <Grid key={item.label} size={{ xs: 12, sm: 6, md: 4 }}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="body2" color="text.secondary">{item.label}</Typography>
                <Typography variant="h5" fontWeight="bold" color={item.color} mt={0.5}>
                  {item.value}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Divider />

      <PayoutDashboardInline />
    </Stack>
  )
}

function PayoutDashboardInline() {
  const [stripeStatus, setStripeStatus] = useState<'unknown' | 'not_connected' | 'pending' | 'active'>('unknown')
  const [onboarding, setOnboarding] = useState(false)
  const [withdrawing, setWithdrawing] = useState(false)
  const [withdrawAmount, setWithdrawAmount] = useState('')

  useEffect(() => {
    apiClient.get<{ status: typeof stripeStatus }>('/platform/payouts/connect/status')
      .then(r => setStripeStatus(r.status))
      .catch(() => setStripeStatus('not_connected'))
  }, [])

  const handleOnboard = async () => {
    setOnboarding(true)
    try {
      const { url } = await apiClient.post<{ url: string }>('/platform/payouts/connect/onboard', {})
      window.open(url, '_blank', 'noopener,noreferrer')
    } finally {
      setOnboarding(false)
    }
  }

  const handleWithdraw = async () => {
    const amountMinor = Math.round(parseFloat(withdrawAmount) * 100)
    if (!amountMinor || amountMinor <= 0) return
    setWithdrawing(true)
    try {
      await apiClient.post('/platform/payouts/withdraw', { amountMinor })
      setWithdrawAmount('')
    } finally {
      setWithdrawing(false)
    }
  }

  return (
    <Box>
      <Typography variant="h6" mb={2}>Payouts</Typography>

      {stripeStatus === 'not_connected' && (
        <Alert
          severity="warning"
          action={
            <Button size="small" onClick={handleOnboard} disabled={onboarding}>
              {onboarding ? 'Redirecting…' : 'Connect Stripe'}
            </Button>
          }
        >
          Connect your Stripe account to receive payouts.
        </Alert>
      )}

      {stripeStatus === 'pending' && (
        <Alert severity="info">
          Your Stripe account is under review. Payouts will be available once approved.
        </Alert>
      )}

      {stripeStatus === 'active' && (
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="flex-start">
          <Chip label="Stripe connected" color="success" />
          <TextField
            label="Amount (EUR)"
            size="small"
            type="number"
            value={withdrawAmount}
            onChange={e => setWithdrawAmount(e.target.value)}
            inputProps={{ min: 1, step: 0.01 }}
          />
          <Button
            variant="contained"
            onClick={handleWithdraw}
            disabled={withdrawing || !withdrawAmount}
          >
            {withdrawing ? 'Processing…' : 'Request withdrawal'}
          </Button>
        </Stack>
      )}
    </Box>
  )
}

// ---------- main component ----------

const TABS = [
  { label: 'Overview', icon: <TrendingUpIcon /> },
  { label: 'Schedule', icon: <CalendarIcon /> },
  { label: 'Encounters', icon: <NoteIcon /> },
  { label: 'Referrals', icon: <ReferralIcon /> },
  { label: 'Earnings', icon: <EarningsIcon /> },
]

export function DoctorPMSWorkspace() {
  const [tab, setTab] = useState(0)
  const [stats, setStats] = useState<DoctorStats | null>(null)

  useEffect(() => {
    apiClient.get<DoctorStats>('/platform/pms/stats')
      .then(setStats)
      .catch(() => setStats(null))
  }, [])

  return (
    <Box>
      <Typography variant="h5" fontWeight="bold" mb={1}>Practice Management</Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>
        Manage your schedule, clinical notes, referrals, and earnings.
      </Typography>

      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        variant="scrollable"
        scrollButtons="auto"
        sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}
      >
        {TABS.map(t => (
          <Tab key={t.label} label={t.label} icon={t.icon} iconPosition="start" />
        ))}
      </Tabs>

      {tab === 0 && <OverviewPanel stats={stats} />}
      {tab === 1 && (
        <Alert severity="info">
          Full calendar view coming soon. Use the Appointments workspace for scheduling.
        </Alert>
      )}
      {tab === 2 && <EncountersPanel />}
      {tab === 3 && <ReferralsPanel />}
      {tab === 4 && <EarningsPanel />}
    </Box>
  )
}
