import { Card, CardContent, Grid, LinearProgress, Stack, Typography } from '@mui/material'
import { launchTracks } from '@shared/config/workspaces.tsx'
import { StageCard } from '@features/overview/components/StageCard.tsx'

export function OverviewWorkspace() {
  return (
    <Stack spacing={3}>
      <Grid container spacing={3}>
        {launchTracks.map((track) => (
          <Grid>
            <Card sx={{ borderRadius: 5, height: '100%' }}>
              <CardContent>
                <Stack spacing={1.5}>
                  <Stack direction="row" spacing={1.5} sx={{ justifyContent: 'space-between' }}>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      {track.title}
                    </Typography>
                    <Typography variant="caption">{track.status}</Typography>
                  </Stack>
                  <Typography color="text.secondary">{track.description}</Typography>
                  <Stack direction="row" spacing={1.5} sx={{ justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Design readiness
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      {track.readiness}%
                    </Typography>
                  </Stack>
                  <LinearProgress variant="determinate" value={track.readiness} sx={{ height: 10, borderRadius: 999 }} />
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Card sx={{ borderRadius: 5 }}>
        <CardContent>
          <Stack spacing={2.5}>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              Delivery architecture for the MVP UI
            </Typography>
            <Grid container spacing={2}>
              <Grid>
                <StageCard title="Foundation" points={['Theme, navigation shell, and layout tokens', 'Reusable cards, forms, lists, and status chips', 'Patient flow connected to live API']} />
              </Grid>
              <Grid>
                <StageCard title="Clinical market" points={['Doctor onboarding and verification boards', 'Search, profile cards, and scheduling', 'Live consultation room shell']} />
              </Grid>
              <Grid>
                <StageCard title="Monetization" points={['Wallet states and purchase bundles', 'Per-second timer and charging visibility', 'Payment receipts and disputes']} />
              </Grid>
              <Grid>
                <StageCard title="Operations" points={['Admin work queues and support inbox', 'GDPR intake and audit explorer', 'Compliance dashboards and actions']} />
              </Grid>
            </Grid>
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  )
}
