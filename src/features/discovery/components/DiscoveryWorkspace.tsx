import { Alert, Button, Card, CardContent, Grid, List, Stack, Typography } from '@mui/material'
import { SectionHeader } from '@shared/components/common/SectionHeader.tsx'
import { SurfaceTile } from '@shared/components/common/SurfaceTile.tsx'
import { InfoCard } from '@shared/components/common/InfoCard.tsx'
import { BulletRow } from '@shared/components/common/BulletRow.tsx'
import { Field } from '@shared/components/form/Field.tsx'
import { SelectField } from '@shared/components/form/SelectField.tsx'
import { useDiscoveryWorkspace } from '@features/discovery/hooks/useDiscoveryWorkspace.ts'

export function DiscoveryWorkspace() {
  const {
    patientId,
    searchText,
    specialty,
    language,
    country,
    consultationMode,
    debouncedSearch,
    doctors,
    doctorDetail,
    bookings,
    selectedAvailabilityWindowId,
    selectedWindow,
    requestError,
    pendingAction,
    setPatientId,
    setSearchText,
    setSpecialty,
    setLanguage,
    setCountry,
    setConsultationMode,
    setSelectedAvailabilityWindowId,
    searchDoctors,
    loadDoctorDetail,
    createBooking,
    loadPatientBookings,
  } = useDiscoveryWorkspace()

  return (
    <Grid container spacing={3}>
      <Grid size={{ xs: 12, md: 8 }}>
        {requestError ? <Alert severity="error" sx={{ mb: 3 }}>{requestError}</Alert> : null}
        <Card sx={{ borderRadius: 5 }}>
          <CardContent>
            <SectionHeader eyebrow="Discovery and booking" title="Search specialists and lock scheduled consultation slots" status="Search-first MVP" statusColor="success" />
            <Stack spacing={2} sx={{ mt: 2.5, mb: 1 }}>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Field label="Patient ID" value={patientId} onChange={setPatientId} placeholder="Paste patient account ID" />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Button variant="outlined" onClick={() => void loadPatientBookings()} disabled={pendingAction === 'history'} sx={{ minHeight: 56, width: '100%' }}>
                    {pendingAction === 'history' ? 'Loading bookings...' : 'Load patient bookings'}
                  </Button>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Field label="Search doctors" value={searchText} onChange={setSearchText} placeholder="Search by specialty, doctor, or language" />
                </Grid>
                <Grid size={{ xs: 12, md: 3 }}>
                  <Field label="Specialty" value={specialty} onChange={setSpecialty} placeholder="Cardiology" />
                </Grid>
                <Grid size={{ xs: 12, md: 3 }}>
                  <Field label="Country" value={country} onChange={setCountry} placeholder="DE" />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Field label="Language" value={language} onChange={setLanguage} placeholder="en" />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <SelectField
                    label="Consultation mode"
                    value={consultationMode}
                    onChange={setConsultationMode}
                    options={[
                      { value: 'Video', label: 'Video' },
                      { value: 'Voice', label: 'Voice' },
                    ]}
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ alignItems: { md: 'center' } }}>
                    <Button variant="contained" onClick={() => void searchDoctors()} disabled={pendingAction === 'search'}>
                      {pendingAction === 'search' ? 'Searching doctors...' : 'Search doctors'}
                    </Button>
                    <Typography variant="body2" color="text.secondary">
                      Debounced query ready: {debouncedSearch || 'waiting for input'}
                    </Typography>
                  </Stack>
                </Grid>
              </Grid>
            </Stack>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid size={{ xs: 12, md: 5 }}>
                <SurfaceTile
                  title="Search results"
                  items={doctors.length
                    ? doctors.map((doctor) => `${doctor.displayName} | ${doctor.primarySpecialty} | ${doctor.languages.join(', ') || 'n/a'}`)
                    : ['No verified doctors matched the current search filters.']}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 7 }}>
                <Stack spacing={2}>
                  {doctors.map((doctor) => (
                    <Card key={doctor.id} variant="outlined">
                      <CardContent>
                        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ justifyContent: 'space-between' }}>
                          <Stack spacing={0.5}>
                            <Typography variant="h6">{doctor.displayName}</Typography>
                            <Typography color="text.secondary">
                              {doctor.primarySpecialty} | {doctor.countryCode} | {doctor.languages.join(', ') || 'No language set'}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Next available: {doctor.nextAvailableAt ? new Date(doctor.nextAvailableAt).toLocaleString() : 'No slot'}
                            </Typography>
                          </Stack>
                          <Button variant="contained" onClick={() => void loadDoctorDetail(doctor.id)} disabled={pendingAction === 'detail'}>
                            View and book
                          </Button>
                        </Stack>
                      </CardContent>
                    </Card>
                  ))}
                </Stack>
              </Grid>
              <Grid size={{ xs: 12 }}>
                {doctorDetail ? (
                  <Card variant="outlined">
                    <CardContent>
                      <Stack spacing={2}>
                        <Typography variant="h6">
                          {doctorDetail.displayName} | {doctorDetail.primarySpecialty}
                        </Typography>
                        <Typography color="text.secondary">
                          {doctorDetail.countryCode} | {doctorDetail.languages.join(', ')} | {doctorDetail.currency} {doctorDetail.defaultPricePerSecondMinor}/sec
                        </Typography>
                        <Typography variant="body2">{doctorDetail.biography || 'No biography yet.'}</Typography>
                        <TextFieldSelectAvailability
                          value={selectedAvailabilityWindowId}
                          onChange={setSelectedAvailabilityWindowId}
                          options={doctorDetail.availabilityWindows.map((window) => ({
                            value: window.id,
                            label: `${new Date(window.startsAt).toLocaleString()} to ${new Date(window.endsAt).toLocaleString()} (${window.consultationMode})`,
                          }))}
                        />
                        <Typography variant="body2" color="text.secondary">
                          Reserved session: {selectedWindow ? Math.ceil((new Date(selectedWindow.endsAt).getTime() - new Date(selectedWindow.startsAt).getTime()) / 1000) : 0} seconds
                        </Typography>
                        <Button variant="contained" onClick={() => void createBooking()} disabled={pendingAction === 'booking'}>
                          {pendingAction === 'booking' ? 'Creating booking...' : 'Create scheduled booking'}
                        </Button>
                      </Stack>
                    </CardContent>
                  </Card>
                ) : (
                  <SurfaceTile title="Booking rail" items={['Select a doctor result to open profile detail', 'Choose a verified availability window', 'Create a scheduled booking linked to a patient ID']} />
                )}
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>
      <Grid size={{ xs: 12, md: 4 }}>
        <InfoCard title="Booking principles" eyebrow="MVP constraints">
          <List disablePadding>
            <BulletRow text="Scheduled consultations only in Phase 1" />
            <BulletRow text="Doctor verification must be visible in search" />
            <BulletRow text="Timezone and pricing clarity should be explicit" />
            <BulletRow text="Emergency symptoms should interrupt normal booking" />
          </List>
        </InfoCard>
        <InfoCard title="Patient bookings" eyebrow="History">
          <List disablePadding>
            {bookings.length ? (
              bookings.map((booking) => (
                <BulletRow
                  key={booking.id}
                  text={`${booking.doctorDisplayName} | ${booking.status} | ${booking.scheduledStartsAt ? new Date(booking.scheduledStartsAt).toLocaleString() : 'No time'}`}
                />
              ))
            ) : (
              <BulletRow text="Load patient bookings to see scheduled appointments." />
            )}
          </List>
        </InfoCard>
      </Grid>
    </Grid>
  )
}

function TextFieldSelectAvailability({
  value,
  onChange,
  options,
}: {
  value: string
  onChange: (value: string) => void
  options: Array<{ value: string; label: string }>
}) {
  return (
    <SelectField
      label="Availability window"
      value={value}
      onChange={onChange}
      options={options.length ? options : [{ value: '', label: 'No availability available' }]}
    />
  )
}
