import { Box, Card, CardContent, Typography, Button, Alert, CircularProgress } from '@mui/material'
import AccountBalanceWallet from '@mui/icons-material/AccountBalanceWallet'
import AddIcon from '@mui/icons-material/Add'
import type { Wallet } from '@shared/types/billing.ts'

interface WalletCardProps {
  wallet: Wallet | null
  loading: boolean
  error: string | null
  onPurchaseCredits: () => void
}

export function WalletCard({ wallet, loading, error, onPurchaseCredits }: WalletCardProps) {
  if (loading) {
    return (
      <Card variant="outlined">
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
            <CircularProgress />
          </Box>
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

  if (!wallet) {
    return (
      <Alert severity="info">
        Wallet not available. Please complete registration.
      </Alert>
    )
  }

  return (
    <Card variant="outlined">
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <AccountBalanceWallet sx={{ mr: 1, fontSize: 32 }} />
          <Typography variant="h6">Credit Wallet</Typography>
        </Box>

        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Available Balance
          </Typography>
          <Typography variant="h4" color="primary">
            {wallet.balance.toFixed(2)} {wallet.currency}
          </Typography>
        </Box>

        {wallet.reservedBalance > 0 && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Reserved Credits
            </Typography>
            <Typography variant="h6" color="warning.main">
              {wallet.reservedBalance.toFixed(2)} {wallet.currency}
            </Typography>
          </Box>
        )}

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={onPurchaseCredits}
          fullWidth
        >
          Purchase Credits
        </Button>
      </CardContent>
    </Card>
  )
}