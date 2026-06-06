import { useState } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Alert,
  CircularProgress,
  Stack,
} from '@mui/material'
import { Download, Print } from '@mui/icons-material'
import { apiBaseUrl } from '@shared/config/patient.ts'

const ANALYTICS_BASE = `${apiBaseUrl}/platform/analytics`

type ReportType = 'summary' | 'daily' | 'revenue' | 'status-breakdown' | 'specialty-breakdown'
type ExportFormat = 'csv' | 'print'

const REPORT_OPTIONS: { value: ReportType; label: string; endpoint: string }[] = [
  { value: 'summary', label: 'Platform Summary', endpoint: '/summary' },
  { value: 'daily', label: 'Daily Consultations & Patients', endpoint: '/daily?days=30' },
  { value: 'revenue', label: 'Daily Revenue (30 days)', endpoint: '/revenue?days=30' },
  { value: 'status-breakdown', label: 'Appointment Status Breakdown', endpoint: '/status-breakdown' },
  { value: 'specialty-breakdown', label: 'Specialty Breakdown', endpoint: '/specialty-breakdown' },
]

function flattenToRows(data: unknown): string[][] {
  if (!data || typeof data !== 'object') return [[String(data)]]

  if (Array.isArray(data)) {
    if (data.length === 0) return [['(no data)']]
    const headers = Object.keys(data[0] as Record<string, unknown>)
    const rows = data.map(row =>
      headers.map(h => {
        const v = (row as Record<string, unknown>)[h]
        return v == null ? '' : String(v)
      })
    )
    return [headers, ...rows]
  }

  // Object (summary)
  const entries = Object.entries(data as Record<string, unknown>)
  return [['Metric', 'Value'], ...entries.map(([k, v]) => [k, v == null ? '' : String(v)])]
}

function rowsToCsv(rows: string[][]): string {
  return rows
    .map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(','))
    .join('\n')
}

function rowsToHtmlTable(title: string, rows: string[][]): string {
  if (rows.length === 0) return ''
  const [headers, ...body] = rows
  const ths = headers.map(h => `<th style="padding:6px 12px;background:#1565c0;color:#fff;text-align:left">${h}</th>`).join('')
  const trs = body
    .map((r, i) => {
      const bg = i % 2 === 0 ? '#f5f5f5' : '#fff'
      const tds = r.map(cell => `<td style="padding:6px 12px;border-bottom:1px solid #e0e0e0">${cell}</td>`).join('')
      return `<tr style="background:${bg}">${tds}</tr>`
    })
    .join('')
  return `<h2 style="font-family:sans-serif;color:#1565c0;margin:24px 0 8px">${title}</h2>
<table style="border-collapse:collapse;width:100%;font-family:sans-serif;font-size:13px">
  <thead><tr>${ths}</tr></thead>
  <tbody>${trs}</tbody>
</table>`
}

export function ReportExporter() {
  const [reportType, setReportType] = useState<ReportType>('summary')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function fetchData(): Promise<{ rows: string[][]; label: string }> {
    const opt = REPORT_OPTIONS.find(r => r.value === reportType)!
    const res = await fetch(`${ANALYTICS_BASE}${opt.endpoint}`)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = await res.json()
    return { rows: flattenToRows(data), label: opt.label }
  }

  async function exportCsv() {
    setLoading(true)
    setError(null)
    try {
      const { rows, label } = await fetchData()
      const csv = rowsToCsv(rows)
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${label.replace(/\s+/g, '_').toLowerCase()}_${new Date().toISOString().slice(0, 10)}.csv`
      a.click()
      URL.revokeObjectURL(url)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Export failed')
    } finally {
      setLoading(false)
    }
  }

  async function printPdf() {
    setLoading(true)
    setError(null)
    try {
      const { rows, label } = await fetchData()
      const table = rowsToHtmlTable(label, rows)
      const win = window.open('', '_blank')
      if (!win) throw new Error('Popup blocked')
      win.document.write(`<!DOCTYPE html><html><head>
        <title>${label}</title>
        <style>@media print { body { margin: 20px } }</style>
      </head><body>
        <h1 style="font-family:sans-serif;color:#333">EU Teleconsultation Platform — Analytics Report</h1>
        <p style="font-family:sans-serif;color:#777;font-size:12px">Generated: ${new Date().toLocaleString()}</p>
        ${table}
      </body></html>`)
      win.document.close()
      win.focus()
      setTimeout(() => { win.print(); win.close() }, 400)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Print failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" fontWeight="bold" sx={{ mb: 1 }}>Report Exporter</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Export analytics data as CSV or print-to-PDF.
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>{error}</Alert>}

      <Card sx={{ maxWidth: 540 }}>
        <CardContent>
          <FormControl fullWidth size="small" sx={{ mb: 3 }}>
            <InputLabel>Report Type</InputLabel>
            <Select
              value={reportType}
              label="Report Type"
              onChange={e => setReportType(e.target.value as ReportType)}
            >
              {REPORT_OPTIONS.map(o => (
                <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <Divider sx={{ mb: 2 }} />

          <Stack direction="row" spacing={2}>
            <Button
              variant="contained"
              startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <Download />}
              onClick={exportCsv}
              disabled={loading}
              fullWidth
            >
              Export CSV
            </Button>
            <Button
              variant="outlined"
              startIcon={loading ? <CircularProgress size={16} /> : <Print />}
              onClick={printPdf}
              disabled={loading}
              fullWidth
            >
              Print / PDF
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  )
}
