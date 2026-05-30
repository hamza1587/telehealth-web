import { Box, Card, CardContent, Typography, Chip, Alert } from '@mui/material'
import ArrowUpward from '@mui/icons-material/ArrowUpward'
import ArrowDownward from '@mui/icons-material/ArrowDownward'
import Refresh from '@mui/icons-material/Refresh'
import type { WalletLedgerEntry } from '@shared/types/billing.ts'

interface LedgerHistoryProps {
  entries: WalletLedgerEntry[]
  loading: boolean
  error: string | null
}

export function LedgerHistory({ entries, loading, error }: LedgerHistoryProps) {
  const getEntryIcon = (type: WalletLedgerEntry['type']) => {
    switch (type) {
  case 'credit':
  return <ArrowUpward fontSize="small" />
  case 'debit':
  return <ArrowDownward fontSize="small" />
  case 'refund':
  return <Refresh fontSize="small" />
      default:
        return null
    }
  }

  const getEntryColor = (type: WalletLedgerEntry['type']) => {
    switch (type) {
      case 'credit':
      case 'refund':
        return 'success'
      case 'debit':
        return 'error'
      default:
        return 'default'
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  if (loading) {
    return (
      <Card variant="outlined">
        <CardContent>
          <Typography>Loading transaction history...</Typography>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    )
  }

  if (entries.length === 0) {
    return (
      <Alert severity="info">
        No transactions yet. Purchase credits to get started.
      </Alert>
    )
  }

  return (
    <Card variant="outlined">
      <CardContent>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Transaction History
        </Typography>

        <Box>
          {entries.map(entry => (
            <Box
              key={entry.id}
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                py: 1,
                borderBottom: '1px solid',
                borderColor: 'divider',
                '&:last-child': { borderBottom: 0 },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Chip 
                {...(getEntryIcon(entry.type) ? { icon: getEntryIcon(entry.type) } : {})}
                label={entry.type}
                color={getEntryColor(entry.type)}
                size="small"
              />
                <Typography variant="body2">{entry.description}</Typography>
              </Box>

              <Box sx={{ textAlign: 'right' }}>
                <Typography
                  variant="body2"
                  color={entry.type === 'credit' || entry.type === 'refund' ? 'success.main' : 'error.main'}
                >
                  {entry.type === 'credit' || entry.type === 'refund' ? '+' : '-'}
                  {entry.amount.toFixed(2)} {entry.currency}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {formatDate(entry.createdAt)}
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>
      </CardContent>
    </Card>
  )
}