import {
  Box, Card, CardContent, Typography, Paper, Grid,
  CircularProgress, Alert, Stack, Chip, Avatar,
} from '@mui/material'
import {
  Person as PersonIcon,
  MedicalServices,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  Verified as VerifiedIcon,
  Public as PublicIcon,
  CalendarToday,
} from '@mui/icons-material'
import { useState } from 'react'
import { useDoctorProfiles } from './hooks/useDoctorProfiles.ts'
import { DoctorProfileDetail } from './components/DoctorProfileDetail.tsx'

interface Props {
  onBookDoctor: (doctorId: string) => void
}

export function DiscoveryWorkspace({ onBookDoctor }: Props) {
  const [selectedDoctor, setSelectedDoctor] = useState<string | null>(null)
  const [specialty, setSpecialty] = useState<string>('')

  const { doctors, selectedDoctor: doctorDetail, loading, error, searchDoctors, fetchDoctorDetail } =
    useDoctorProfiles()

  const handleSelectDoctor = async (id: string) => {
    setSelectedDoctor(id)
    await fetchDoctorDetail(id)
  }

  if (selectedDoctor && doctorDetail) {
    return (
      <DoctorProfileDetail
        doctor={doctorDetail}
        loading={loading}
        error={error || undefined}
        onBook={onBookDoctor}
      />
    )
  }

  const specialities = [
    'Cardiology', 'Dermatology', 'Mental Health', 'Pediatrics',
    'General Practice', 'Orthopedics', 'Neurology', 'Gastroenterology',
    'Endocrinology', 'Pulmonology', 'Oncology', 'Rheumatology',
  ]

  const doctorSpecialties: Record<string, string> = {
    'dr-smith': 'Cardiology',
    'dr-johnson': 'Dermatology',
    'dr-williams': 'Mental Health',
    'dr-brown': 'Pediatrics',
    'dr-davis': 'General Practice',
    'dr-miller': 'Orthopedics',
    'dr-wilson': 'Neurology',
    'dr-taylor': 'Gastroenterology',
    'dr-anderson': 'Endocrinology',
    'dr-thomas': 'Pulmonology',
  }

  return (
    <Box>
      {/* Search Header */}
      <Card variant="outlined" sx={{ borderRadius: 4, mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Find a Specialist
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Browse verified doctors and book consultations
          </Typography>

          {/* Speciality Filters */}
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Chip
              label="All Specialties"
              color={specialty === '' ? 'primary' : 'default'}
              variant={specialty === '' ? 'filled' : 'outlined'}
              onClick={() => { setSpecialty(''); searchDoctors('', '') }}
              clickable
              size="small"
            />
            {specialities.map((spec) => (
              <Chip
                key={spec}
                label={spec}
                color={specialty === spec ? 'primary' : 'default'}
                variant={specialty === spec ? 'filled' : 'outlined'}
                onClick={() => { setSpecialty(spec); searchDoctors(spec, '') }}
                clickable
                size="small"
              />
            ))}
          </Stack>
        </CardContent>
      </Card>

      {/* Doctor Grid */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : (
        <Grid container spacing={2}>
          {doctors.map((doctor) => (
            <Grid item xs={12} sm={6} md={4} key={doctor.id}>
              <Card
                variant="outlined"
                sx={{
                  borderRadius: 4,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  '&:hover': { boxShadow: 4, transform: 'translateY(-2px)' },
                }}
                onClick={() => handleSelectDoctor(doctor.id)}
              >
                <CardContent>
                  <Stack direction="row" spacing={1.5} alignItems="flex-start">
                    <Avatar
                      sx={{
                        bgcolor: 'primary.light',
                        color: 'primary.dark',
                        width: 48,
                        height: 48,
                        fontWeight: 700,
                        fontSize: 18,
                      }}
                    >
                      {doctor.displayName.split(' ').map(n => n[0]).join('')}
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Stack direction="row" alignItems="center" spacing={0.5}>
                        <Typography variant="subtitle1" fontWeight={700}>
                          Dr. {doctor.displayName}
                        </Typography>
                        {doctor.verificationStatus === 'Verified' && (
                          <VerifiedIcon fontSize="small" color="success" />
                        )}
                      </Stack>
                      <Typography variant="body2" color="text.secondary">
                        <MedicalServices fontSize="small" sx={{ mr: 0.5, verticalAlign: 'middle' }} />
                        {doctor.primarySpecialty}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        <PublicIcon fontSize="small" sx={{ mr: 0.3, verticalAlign: 'middle' }} />
                        {doctor.countryCode}
                      </Typography>
                    </Box>
                  </Stack>

                  <Stack direction="row" spacing={2} mt={2} alignItems="center">
                    <Typography variant="body2" fontWeight={600} color="primary">
                      €{doctor.pricePerSecondMinor.toFixed(2)}/min
                    </Typography>
                    {/* Star rating - approximate */}
                    <Stack direction="row" spacing={0.25}>
                      {[1, 2, 3, 4, 5].map(i => (
                        i <= 4 ? <StarIcon key={i} fontSize="small" color="warning" /> : <StarBorderIcon key={i} fontSize="small" color="action" />
                      ))}
                    </Stack>
                    <Typography variant="caption" color="text.secondary">(4.5)</Typography>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}

          {doctors.length === 0 && (
            <Grid item xs={12}>
              <Paper variant="outlined" sx={{ p: 6, textAlign: 'center', borderRadius: 4 }}>
                <PersonIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No doctors found
                </Typography>
                <Typography variant="body2" color="text.disabled">
                  Try a different specialty or check back later.
                </Typography>
              </Paper>
            </Grid>
          )}
        </Grid>
      )}
    </Box>
  )
}