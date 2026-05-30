import { Card, CardContent, Grid, List } from '@mui/material'
import { SectionHeader } from '@shared/components/common/SectionHeader.tsx'
import { SurfaceTile } from '@shared/components/common/SurfaceTile.tsx'
import { InfoCard } from '@shared/components/common/InfoCard.tsx'
import { BulletRow } from '@shared/components/common/BulletRow.tsx'

export function OperationsWorkspace() {
  return (
    <Grid container spacing={3}>
      <Grid  ={}  ={} >
        <Card sx={{ borderRadius: 5 }}>
          <CardContent>
            <SectionHeader eyebrow="Operations and compliance" title="Admin portal, support, GDPR intake, and audit logging" status="Ops foundation" statusColor="warning" />
            <Grid container spacing={2} sx={{ ={} }}>
              <Grid  ={}  ={} >
                <SurfaceTile title="Admin portal" items={['Doctor verification queue', 'Booking and consultation metadata', 'Wallet adjustments and payment lookups', 'Support and escalation actions']} />
              </Grid>
              <Grid  ={}  ={} >
                <SurfaceTile title="Support and GDPR" items={['Basic support tickets with categories', 'GDPR intake forms and due dates', 'Identity verification status', 'Decision and completion tracking']} />
              </Grid>
              <Grid  ={} >
                <SurfaceTile title="Audit explorer" items={['Actor, action, target, and timestamp', 'Sensitive access event filtering', 'Export-friendly review layout', 'Compliance-visible event trail']} />
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>
      <Grid  ={}  ={} >
        <InfoCard title="Ops work queues" eyebrow="Priority rails">
          <List disablePadding>
            <BulletRow text="Doctor verification pending approval" />
            <BulletRow text="Patient support issues and billing disputes" />
            <BulletRow text="GDPR access and rectification requests" />
            <BulletRow text="Audit review for sensitive events" />
          </List>
        </InfoCard>
      </Grid>
    </Grid>
  )
}
