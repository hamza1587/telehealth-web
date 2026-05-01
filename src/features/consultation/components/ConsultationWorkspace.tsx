import { Card, CardContent, Grid } from '@mui/material'
import { SectionHeader } from '@shared/components/common/SectionHeader.tsx'
import { SurfaceTile } from '@shared/components/common/SurfaceTile.tsx'
import { InfoCard } from '@shared/components/common/InfoCard.tsx'
import { MetricRow } from '@shared/components/common/MetricRow.tsx'

export function ConsultationWorkspace() {
  return (
    <Grid container spacing={3}>
      <Grid size={{ xs: 12, md: 7 }}>
        <Card sx={{ borderRadius: 5 }}>
          <CardContent>
            <SectionHeader eyebrow="Consultation flow" title="Voice and video room experience" status="Room shell" statusColor="success" />
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid size={{ xs: 12, md: 6 }}>
                <SurfaceTile title="Pre-call state" items={['Camera and microphone check', 'Patient identity recap', 'Consent and no-recording notice', 'Join room CTA']} />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <SurfaceTile title="Live room" items={['Doctor and patient panels', 'Call timer and connection health', 'Muted/video-off indicators', 'Escalation and end session controls']} />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <SurfaceTile title="Post-call handoff" items={['Route into notes and prescription scaffold', 'Billing finalization and summary', 'Patient follow-up instructions', 'Audit event emission']} />
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>
      <Grid size={{ xs: 12, md: 5 }}>
        <InfoCard title="Session controls" eyebrow="Trust and safety">
          <MetricRow label="Recording" value="Disabled in MVP" />
          <MetricRow label="Mode" value="Voice and video only" />
          <MetricRow label="Billing trigger" value="Per-second session meter" />
          <MetricRow label="Clinical handoff" value="Notes and prescription panel" />
        </InfoCard>
      </Grid>
    </Grid>
  )
}
