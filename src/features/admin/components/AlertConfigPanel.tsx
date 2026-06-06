import { useState, useEffect, useCallback } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Alert,
  CircularProgress,
  Chip,
} from '@mui/material'
import { Add, Edit, Delete, Refresh } from '@mui/icons-material'
import { apiBaseUrl } from '@shared/config/patient.ts'

const ALERTS_BASE = `${apiBaseUrl}/platform/analytics/alerts`

type Condition = 'gt' | 'lt' | 'gte' | 'lte'

interface AlertRule {
  id: string;
  name: string;
  metricName: string;
  condition: Condition;
  threshold: number;
  enabled: boolean;
}

type AlertRuleInput = Omit<AlertRule, 'id'>

const CONDITION_LABELS: Record<Condition, string> = {
  gt: '> greater than',
  lt: '< less than',
  gte: '>= at least',
  lte: '<= at most',
}

const EMPTY_FORM: AlertRuleInput = {
  name: '',
  metricName: '',
  condition: 'gt',
  threshold: 0,
  enabled: true,
}

export function AlertConfigPanel() {
  const [rules, setRules] = useState<AlertRule[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<AlertRuleInput>(EMPTY_FORM)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${ALERTS_BASE}/rules`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      setRules(await res.json())
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load rules')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  function openCreate() {
    setForm(EMPTY_FORM)
    setEditingId(null)
    setDialogOpen(true)
  }

  function openEdit(rule: AlertRule) {
    setForm({ name: rule.name, metricName: rule.metricName, condition: rule.condition, threshold: rule.threshold, enabled: rule.enabled })
    setEditingId(rule.id)
    setDialogOpen(true)
  }

  async function handleSave() {
    if (!form.name || !form.metricName) return
    setSaving(true)
    setError(null)
    try {
      if (editingId) {
        const res = await fetch(`${ALERTS_BASE}/rules/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const updated: AlertRule = await res.json()
        setRules(prev => prev.map(r => r.id === editingId ? updated : r))
      } else {
        const res = await fetch(`${ALERTS_BASE}/rules`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const created: AlertRule = await res.json()
        setRules(prev => [...prev, created])
      }
      setDialogOpen(false)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    setSaving(true)
    setError(null)
    try {
      const res = await fetch(`${ALERTS_BASE}/rules/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      setRules(prev => prev.filter(r => r.id !== id))
      setDeleteId(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Delete failed')
    } finally {
      setSaving(false)
    }
  }

  async function toggleEnabled(rule: AlertRule) {
    try {
      const res = await fetch(`${ALERTS_BASE}/rules/${rule.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...rule, enabled: !rule.enabled }),
      })
      if (!res.ok) return
      const updated: AlertRule = await res.json()
      setRules(prev => prev.map(r => r.id === rule.id ? updated : r))
    } catch {
      // silent — non-critical toggle
    }
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h5" fontWeight="bold">Alert Rules</Typography>
          <Typography variant="body2" color="text.secondary">Configure threshold-based metric alerts</Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button startIcon={<Refresh />} onClick={load} variant="outlined" size="small">Refresh</Button>
          <Button startIcon={<Add />} onClick={openCreate} variant="contained" size="small">Add Rule</Button>
        </Box>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>{error}</Alert>}

      <Card>
        {loading ? (
          <CardContent sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress />
          </CardContent>
        ) : rules.length === 0 ? (
          <CardContent>
            <Typography variant="body2" color="text.secondary" textAlign="center" py={4}>
              No alert rules configured. Click "Add Rule" to create one.
            </Typography>
          </CardContent>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Metric</TableCell>
                  <TableCell>Condition</TableCell>
                  <TableCell>Threshold</TableCell>
                  <TableCell>Enabled</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rules.map(rule => (
                  <TableRow key={rule.id} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight={500}>{rule.name}</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip label={rule.metricName} size="small" variant="outlined" />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{CONDITION_LABELS[rule.condition]}</Typography>
                    </TableCell>
                    <TableCell>{rule.threshold}</TableCell>
                    <TableCell>
                      <Switch
                        checked={rule.enabled}
                        size="small"
                        onChange={() => toggleEnabled(rule)}
                        color="primary"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton size="small" onClick={() => openEdit(rule)} title="Edit">
                        <Edit fontSize="small" />
                      </IconButton>
                      <IconButton size="small" color="error" onClick={() => setDeleteId(rule.id)} title="Delete">
                        <Delete fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Card>

      {/* Create / Edit dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>{editingId ? 'Edit Alert Rule' : 'New Alert Rule'}</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '16px !important' }}>
          <TextField
            label="Rule Name"
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            size="small"
            fullWidth
          />
          <TextField
            label="Metric Name"
            value={form.metricName}
            onChange={e => setForm(f => ({ ...f, metricName: e.target.value }))}
            size="small"
            fullWidth
            helperText="e.g. activeConsultations, errorRate, queueLength"
          />
          <FormControl size="small" fullWidth>
            <InputLabel>Condition</InputLabel>
            <Select
              value={form.condition}
              label="Condition"
              onChange={e => setForm(f => ({ ...f, condition: e.target.value as Condition }))}
            >
              {Object.entries(CONDITION_LABELS).map(([k, v]) => (
                <MenuItem key={k} value={k}>{v}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label="Threshold"
            type="number"
            value={form.threshold}
            onChange={e => setForm(f => ({ ...f, threshold: Number(e.target.value) }))}
            size="small"
            fullWidth
          />
          <FormControlLabel
            control={
              <Switch
                checked={form.enabled}
                onChange={e => setForm(f => ({ ...f, enabled: e.target.checked }))}
                color="primary"
              />
            }
            label="Enabled"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={saving || !form.name || !form.metricName}
          >
            {saving ? <CircularProgress size={16} /> : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete confirm */}
      <Dialog open={deleteId !== null} onClose={() => setDeleteId(null)} maxWidth="xs">
        <DialogTitle>Delete Alert Rule</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this rule? This cannot be undone.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteId(null)}>Cancel</Button>
          <Button
            color="error"
            variant="contained"
            onClick={() => deleteId && handleDelete(deleteId)}
            disabled={saving}
          >
            {saving ? <CircularProgress size={16} /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
