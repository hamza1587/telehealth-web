import { Alert, Button, Card, CardContent, FormControlLabel, Grid, List, Stack, Switch } from '@mui/material'
import { SectionHeader } from '@shared/components/common/SectionHeader.tsx'
import { SurfaceTile } from '@shared/components/common/SurfaceTile.tsx'
import { InfoCard } from '@shared/components/common/InfoCard.tsx'
import { MetricRow } from '@shared/components/common/MetricRow.tsx'
import { BulletRow } from '@shared/components/common/BulletRow.tsx'
import { Field } from '@shared/components/form/Field.tsx'
import { SelectField } from '@shared/components/form/SelectField.tsx'
import { doctorConsultationModeOptions, doctorVerificationOptions } from '@features/doctor/config.ts'
import { useDoctorWorkspace } from '@features/doctor/hooks/useDoctorWorkspace.ts'

export function DoctorWorkspace({
  workspace,
}: {
  workspace: ReturnType<typeof useDoctorWorkspace>
}) {
  const {
    doctor,
    doctorForm,
    availabilityForm,
    verificationForm,
    requestError,
    pendingAction,
    setDoctorForm,
    setAvailabilityForm,
    setVerificationForm,
    submitDoctorProfile,
    addAvailabilityWindow,
    updateVerification,
  } = workspace

  return (
    <Grid container spacing={3}>
      <Grid size={{ xs: 12, md: 7 }}>
        <Stack spacing={3}>
          {requestError ? <Alert severity="error">{requestError}</Alert> : null}

          <Card sx={{ borderRadius: 5 }}>
            <CardContent>
              <SectionHeader
                eyebrow="Doctor onboarding"
                title="Manual verification and practice readiness"
                status={doctor?.verificationStatus ?? 'Draft'}
                statusColor={doctor?.verificationStatus === 'Verified' ? 'success' : 'warning'}
              />
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Field label="Display name" value={doctorForm.displayName} onChange={(value) => setDoctorForm((current) => ({ ...current, displayName: value }))} />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Field label="Legal name" value={doctorForm.legalName} onChange={(value) => setDoctorForm((current) => ({ ...current, legalName: value }))} />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Field label="Email" type="email" value={doctorForm.email} onChange={(value) => setDoctorForm((current) => ({ ...current, email: value }))} />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Field label="Phone number" value={doctorForm.phoneNumber} onChange={(value) => setDoctorForm((current) => ({ ...current, phoneNumber: value }))} />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <Field label="Country" value={doctorForm.countryCode} onChange={(value) => setDoctorForm((current) => ({ ...current, countryCode: value.toUpperCase() }))} />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <Field label="Practice country" value={doctorForm.countryOfPractice} onChange={(value) => setDoctorForm((current) => ({ ...current, countryOfPractice: value.toUpperCase() }))} />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <Field label="Primary specialty" value={doctorForm.primarySpecialty} onChange={(value) => setDoctorForm((current) => ({ ...current, primarySpecialty: value }))} />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Field label="License number" value={doctorForm.licenseNumber} onChange={(value) => setDoctorForm((current) => ({ ...current, licenseNumber: value }))} />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Field label="Licensing authority" value={doctorForm.licensingAuthority} onChange={(value) => setDoctorForm((current) => ({ ...current, licensingAuthority: value }))} />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Field label="Qualifications" value={doctorForm.qualifications} onChange={(value) => setDoctorForm((current) => ({ ...current, qualifications: value }))} multiline minRows={3} />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Field label="Biography" value={doctorForm.biography} onChange={(value) => setDoctorForm((current) => ({ ...current, biography: value }))} multiline minRows={3} />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <Field label="Years of experience" type="number" value={doctorForm.yearsOfExperience} onChange={(value) => setDoctorForm((current) => ({ ...current, yearsOfExperience: value }))} />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <Field label="Price per second" type="number" value={doctorForm.defaultPricePerSecondMinor} onChange={(value) => setDoctorForm((current) => ({ ...current, defaultPricePerSecondMinor: value }))} />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <Field label="Currency" value={doctorForm.currency} onChange={(value) => setDoctorForm((current) => ({ ...current, currency: value.toUpperCase() }))} />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Field label="Insurance provider" value={doctorForm.insuranceProvider} onChange={(value) => setDoctorForm((current) => ({ ...current, insuranceProvider: value }))} />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Field label="Insurance policy number" value={doctorForm.insurancePolicyNumber} onChange={(value) => setDoctorForm((current) => ({ ...current, insurancePolicyNumber: value }))} />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Field label="License expiry date" type="date" value={doctorForm.licenseExpiryDate} onChange={(value) => setDoctorForm((current) => ({ ...current, licenseExpiryDate: value }))} shrink />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Field label="Languages (comma separated)" value={doctorForm.languagesText} onChange={(value) => setDoctorForm((current) => ({ ...current, languagesText: value }))} />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Button variant="contained" onClick={() => void submitDoctorProfile()} disabled={pendingAction === 'profile'}>
                    {pendingAction === 'profile' ? 'Saving doctor profile...' : doctor ? 'Update doctor profile' : 'Submit doctor onboarding'}
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          <Card sx={{ borderRadius: 5 }}>
            <CardContent>
              <SectionHeader
                eyebrow="Verification workflow"
                title="Manual review and status management"
                status={doctor?.marketplaceStatus ?? 'Hidden'}
                statusColor={doctor?.verificationStatus === 'Verified' ? 'success' : 'warning'}
              />
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid size={{ xs: 12, md: 4 }}>
                  <SelectField label="Verification status" value={verificationForm.verificationStatus} onChange={(value) => setVerificationForm((current) => ({ ...current, verificationStatus: value }))} options={doctorVerificationOptions} />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <Field label="Reviewer ID" value={verificationForm.reviewerId} onChange={(value) => setVerificationForm((current) => ({ ...current, reviewerId: value }))} />
                </Grid>
                <Grid size={{ xs: 12, md: 12 }}>
                  <Field label="Review notes" value={verificationForm.reviewNotes} onChange={(value) => setVerificationForm((current) => ({ ...current, reviewNotes: value }))} multiline minRows={3} />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Button variant="outlined" onClick={() => void updateVerification()} disabled={!doctor || pendingAction === 'verification'}>
                    {pendingAction === 'verification' ? 'Updating verification...' : 'Update verification status'}
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Stack>
      </Grid>
      <Grid size={{ xs: 12, md: 5 }}>
        <Stack spacing={3}>
          <InfoCard title="Availability management" eyebrow="Scheduling surface">
            <Grid container spacing={2}>
              <Grid size={{ xs: 12 }}>
                <Field label="Starts at" type="datetime-local" value={availabilityForm.startsAt} onChange={(value) => setAvailabilityForm((current) => ({ ...current, startsAt: value }))} shrink />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Field label="Ends at" type="datetime-local" value={availabilityForm.endsAt} onChange={(value) => setAvailabilityForm((current) => ({ ...current, endsAt: value }))} shrink />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <SelectField label="Consultation mode" value={availabilityForm.consultationMode} onChange={(value) => setAvailabilityForm((current) => ({ ...current, consultationMode: value }))} options={doctorConsultationModeOptions} />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <FormControlLabel
                  control={<Switch checked={availabilityForm.isInstantEnabled} onChange={(event) => setAvailabilityForm((current) => ({ ...current, isInstantEnabled: event.target.checked }))} />}
                  label="Instant consult enabled"
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Button variant="contained" onClick={() => void addAvailabilityWindow()} disabled={!doctor || pendingAction === 'availability'}>
                  {pendingAction === 'availability' ? 'Saving availability...' : 'Add availability window'}
                </Button>
              </Grid>
            </Grid>
          </InfoCard>
          <InfoCard title="Doctor profile snapshot" eyebrow="Live state">
            <MetricRow label="Doctor ID" value={doctor?.id ?? 'Pending profile creation'} />
            <MetricRow label="Verification" value={doctor?.verificationStatus ?? 'Draft'} />
            <MetricRow label="Marketplace" value={doctor?.marketplaceStatus ?? 'Hidden'} />
            <MetricRow label="Availability windows" value={String(doctor?.availabilityWindows.length ?? 0)} />
          </InfoCard>
          <InfoCard title="Saved availability" eyebrow="Current windows">
            {doctor?.availabilityWindows.length ? (
              <List disablePadding>
                {doctor.availabilityWindows.map((window) => (
                  <BulletRow
                    key={window.id}
                    text={`${new Date(window.startsAt).toLocaleString()} to ${new Date(window.endsAt).toLocaleString()} (${window.consultationMode})`}
                  />
                ))}
              </List>
            ) : (
              <SurfaceTile title="No windows yet" items={['Create the doctor profile first', 'Then add scheduled availability slots', 'Instant consult remains hidden for MVP']} />
            )}
          </InfoCard>
          <InfoCard title="Doctor workspace next" eyebrow="Operational follow-up">
            <List disablePadding>
              <BulletRow text="Document upload and attachment viewer" />
              <BulletRow text="Reviewer assignment and escalation rules" />
              <BulletRow text="Calendar grid and blocked time management" />
            </List>
          </InfoCard>
        </Stack>
      </Grid>
    </Grid>
  )
}
