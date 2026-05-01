import { Card, CardContent, Grid } from '@mui/material'
import { SectionHeader } from '@shared/components/common/SectionHeader.tsx'
import { SurfaceTile } from '@shared/components/common/SurfaceTile.tsx'
import { InfoCard } from '@shared/components/common/InfoCard.tsx'
import { MetricRow } from '@shared/components/common/MetricRow.tsx'

export function ClinicalWorkspace() {
  return (
    <Grid container spacing={3}>
      <Grid size={{ xs: 12, md: 8 }}>
        <Card sx={{ borderRadius: 5 }}>
          <CardContent>
            <SectionHeader eyebrow="Clinical workflow" title="Clinical notes and prescription scaffold" status="Structured capture" statusColor="warning" />
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid size={{ xs: 12, md: 6 }}>
                <SurfaceTile title="Clinical note composer" items={['Reason for visit and history', 'Assessment and plan sections', 'Follow-up instructions', 'Save draft and finalize actions']} />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <SurfaceTile title="Prescription scaffold" items={['Medication, dosage, route, frequency', 'Country-specific rule placeholders', 'Warnings for jurisdiction mismatch', 'PDF generation in MVP']} />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <SurfaceTile title="Patient history side panel" items={['Conditions, allergies, and current medications', 'Previous consultation notes', 'Past prescriptions', 'Access window and authorization markers']} />
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>
      <Grid size={{ xs: 12, md: 4 }}>
        <InfoCard title="Clinical constraints" eyebrow="MVP guardrails">
          <MetricRow label="AI diagnosis" value="Excluded" />
          <MetricRow label="Automated triage" value="Excluded" />
          <MetricRow label="Prescription support" value="Manual scaffold only" />
          <MetricRow label="Clinical output" value="Doctor-authored notes and PDFs" />
        </InfoCard>
      </Grid>
    </Grid>
  )
}
