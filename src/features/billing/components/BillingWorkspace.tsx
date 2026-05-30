import { Card, CardContent, Grid, List } from '@mui/material'
import { SectionHeader } from '@shared/components/common/SectionHeader.tsx'
import { SurfaceTile } from '@shared/components/common/SurfaceTile.tsx'
import { InfoCard } from '@shared/components/common/InfoCard.tsx'
import { BulletRow } from '@shared/components/common/BulletRow.tsx'

export function BillingWorkspace() {
  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={8}>
        <Card sx={{ borderRadius: 5 }}>
          <CardContent>
            <SectionHeader eyebrow="Billing and payments" title="Credit wallet, purchase bundles, and per-second charging" status="MVP monetization" statusColor="success" />
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <SurfaceTile title="Wallet card" items={['Available minutes and reserved balance', 'Top-up CTA with hosted checkout', 'Insufficient balance warnings', 'Transaction state visibility']} />
              </Grid>
              <Grid item xs={12} md={4}>
                <SurfaceTile title="Credit purchase" items={['Predefined bundles', 'Currency and price display', 'Payment provider handoff', 'Receipt and status callback']} />
              </Grid>
              <Grid item xs={12} md={4}>
                <SurfaceTile title="Per-second billing" items={['Live room consumption meter', 'Session-end finalization', 'Wallet ledger entry generation', 'Dispute-friendly statement view']} />
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} md={4}>
        <InfoCard title="Billing visibility" eyebrow="User confidence">
          <List disablePadding>
            <BulletRow text="Show credits before booking and before joining room" />
            <BulletRow text="Explain how per-second charging works" />
            <BulletRow text="Provide a simple ledger and payment history" />
            <BulletRow text="Keep refunds/disputes lightweight in Phase 1" />
          </List>
        </InfoCard>
      </Grid>
    </Grid>
  )
}