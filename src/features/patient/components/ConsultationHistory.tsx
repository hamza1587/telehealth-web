import { useState, useEffect, useCallback } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  Divider,
  Chip,
  CircularProgress,
  Alert,
  Button,
  TextField,
  InputAdornment,
  Pagination,
} from '@mui/material'
import { Search, Refresh } from '@mui/icons-material'
import { apiBaseUrl } from '@shared/config/patient.ts'

const PLATFORM_BASE = `${apiBaseUrl}/platform`
const PAGE_SIZE = 10

interface Appointment {
  id: string;
  doctorId: string;
  patientId: string;
  status: string;
  scheduledAt: string;
  durationMinutes: number;
  feeCents: number;
  notes?: string;
}

interface ConsultationHistoryProps {
  patientId: string;
}

const STATUS_COLOR: Record<string, 'default' | 'success' | 'warning' | 'error' | 'info'> = {
  completed: 'success',
  cancelled: 'error',
  scheduled: 'info',
  pending_payment: 'warning',
  in_progress: 'info',
}

function fmtCurrency(cents: number) {
  return `€${(cents / 100).toLocaleString('en-IE', { maximumFractionDigits: 2 })}`
}

export function ConsultationHistory({ patientId }: ConsultationHistoryProps) {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${PLATFORM_BASE}/appointments?patientId=${patientId}&limit=500`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      setAppointments(Array.isArray(data) ? data : [])
      setPage(1)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load history')
    } finally {
      setLoading(false)
    }
  }, [patientId])

  useEffect(() => { load() }, [load])

  const filtered = appointments
    .filter(a => {
      if (!search) return true
      const q = search.toLowerCase()
      return (
        a.status.toLowerCase().includes(q) ||
        new Date(a.scheduledAt).toLocaleDateString().includes(q)
      )
    })
    .sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime())

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const completedCount = appointments.filter(a => a.status === 'completed').length
  const totalSpent = appointments
    .filter(a => a.status === 'completed')
    .reduce((s, a) => s + (a.feeCents ?? 0), 0)

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h5" fontWeight="bold">Consultation History</Typography>
          <Typography variant="body2" color="text.secondary">
            {completedCount} completed · {fmtCurrency(totalSpent)} total spent
          </Typography>
        </Box>
        <Button startIcon={<Refresh />} onClick={load} variant="outlined" size="small">Refresh</Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>{error}</Alert>
      )}

      <TextField
        fullWidth
        size="small"
        placeholder="Search by status or date…"
        value={search}
        onChange={e => { setSearch(e.target.value); setPage(1) }}
        sx={{ mb: 2 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Search fontSize="small" />
            </InputAdornment>
          ),
        }}
      />

      <Card>
        {paged.length === 0 ? (
          <CardContent>
            <Typography variant="body2" color="text.secondary" textAlign="center" py={3}>
              {search ? 'No results match your search.' : 'No consultations found.'}
            </Typography>
          </CardContent>
        ) : (
          <List disablePadding>
            {paged.map((a, idx) => (
              <Box key={a.id}>
                <ListItem sx={{ py: 1.5, px: 2, alignItems: 'flex-start' }}>
                  <Box sx={{ flex: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5, flexWrap: 'wrap' }}>
                      <Typography variant="body1" fontWeight={500}>
                        {new Date(a.scheduledAt).toLocaleString()}
                      </Typography>
                      <Chip
                        label={a.status.replace(/_/g, ' ')}
                        size="small"
                        color={STATUS_COLOR[a.status] ?? 'default'}
                      />
                    </Box>
                    <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                      <Typography variant="body2" color="text.secondary">
                        Duration: {a.durationMinutes ?? '—'} min
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Fee: {fmtCurrency(a.feeCents ?? 0)}
                      </Typography>
                    </Box>
                    {a.notes && (
                      <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                        {a.notes}
                      </Typography>
                    )}
                  </Box>
                </ListItem>
                {idx < paged.length - 1 && <Divider />}
              </Box>
            ))}
          </List>
        )}
      </Card>

      {totalPages > 1 && (
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
          <Pagination count={totalPages} page={page} onChange={(_, p) => setPage(p)} color="primary" />
        </Box>
      )}
    </Box>
  )
}
