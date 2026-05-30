import {
  Box, Card, CardContent, Typography, Grid, Paper, Stack, CircularProgress, Alert,
  Avatar, List, ListItem, ListItemText, ListItemIcon, Divider,
  Chip, Button, Tooltip,
} from '@mui/material'
import {
  Person as PersonIcon,
  MedicalServices as MedicalIcon,
  CalendarToday as CalendarIcon,
  CheckCircle as CheckIcon,
  School as EducationIcon,
  Language as LanguageIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  Verified as VerifiedIcon,
  Pending as PendingIcon,
  Public as PublicIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material'
import type { DoctorDetail } from '@shared/types/index.ts'

interface DoctorProfileDetailProps {
  doctor: DoctorDetail | null
  loading: boolean
  error: string | null
  onBook: (doctorId: string) => void
}

export function DoctorProfileDetail({
  doctor,
  loading,
  error,
  onBook,
}: DoctorProfileDetailProps) {
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>
  }

  if (!doctor) {
    return <Alert severity="info">Select a doctor to view their profile.</Alert>
  }

  const renderStars = (rating: number) => {
    const stars = []
    for (let i = 1; i <= 5; i++) {
      stars.push(
        i <= Math.round(rating)
          ? <StarIcon key={i} color="warning" fontSize="small" />
          : <StarBorderIcon key={i} color="action" fontSize="small" />
      )
    }
    return stars
  }

  const isAvailable = doctor.marketplaceStatus === 'Available'

  return (
    <Box>
      {/* Header Banner */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 3,
          borderRadius: 4,
          background: 'linear-gradient(135deg, #1565c0 0%, #00897b 100%)',
          color: 'white',
        }}
      >
        <Grid container spacing={3} alignItems="center">
          <Grid item>
            <Avatar
              sx={{
                width: 88, height: 88,
                bgcolor: 'rgba(255,255,255,0.2)',
                border: '3px solid rgba(255,255,255,0.4)',
                fontSize: 40,
                fontWeight: 800,
              }}
            >
              {doctor.displayName.split(' ').map(n => n[0]).join('')}
            </Avatar>
          </Grid>
          <Grid item xs>
            <Stack direction="row" alignItems="center" spacing={1} mb={1}>
              <Typography variant="h5" sx={{ fontWeight: 800 }}>
                Dr. {doctor.displayName}
              </Typography>
              {isAvailable ? (
                <Chip
                  label="Available"
                  size="small"
                  sx={{
                    bgcolor: 'rgba(76,175,80,0.25)',
                    color: '#c8e6c9',
                    fontWeight: 700,
                  }}
                />
              ) : (
                <Chip
                  label="Currently Unavailable"
                  size="small"
                  sx={{
                    bgcolor: 'rgba(255,255,255,0.15)',
                    color: 'rgba(255,255,255,0.7)',
                  }}
                />
              )}
              {doctor.verificationStatus === 'Verified' && (
                <Tooltip title="Verified">
                  <VerifiedIcon sx={{ color: '#81d4fa', fontSize: 20 }} />
                </Tooltip>
              )}
            </Stack>
            <Typography variant="body1" sx={{ opacity: 0.9 }}>
              <MedicalIcon sx={{ mr: 0.5, fontSize: 16, verticalAlign: 'middle' }} />
              {doctor.primarySpecialty}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.75, mt: 0.5 }}>
              <PublicIcon sx={{ mr: 0.5, fontSize: 14, verticalAlign: 'middle' }} />
              {doctor.countryCode}
              <LanguageIcon sx={{ ml: 2, mr: 0.5, fontSize: 14, verticalAlign: 'middle' }} />
              {doctor.education.join(', ')}
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      <Grid container spacing={3}>
        {/* Main Info */}
        <Grid item xs={12} md={8}>
          <Card variant="outlined" sx={{ borderRadius: 4 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>About</Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                {doctor.about || 'No additional information provided.'}
              </Typography>

              <Divider sx={{ my: 2 }} />

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <PersonIcon color="action" fontSize="small" />
                    <Typography variant="body2">
                      <strong>Consultations:</strong> {doctor.totalConsultations}
                    </Typography>
                  </Stack>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <StarIcon color="warning" fontSize="small" />
                    <Typography variant="body2">
                      <strong>Rating:</strong> {renderStars(doctor.rating)} ({doctor.totalReviews})
                    </Typography>
                  </Stack>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <CalendarIcon fontSize="small" color="action" />
                    <Typography variant="body2">
                      <strong>Joined:</strong> {new Date(doctor.createdAt).toLocaleDateString()}
                    </Typography>
                  </Stack>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <PublicIcon fontSize="small" color="action" />
                    <Typography variant="body2">
                      <strong>Country:</strong> {doctor.countryCode}
                    </Typography>
                  </Stack>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Education & Languages */}
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Card variant="outlined" sx={{ borderRadius: 4 }}>
                <CardContent>
                  <Stack direction="row" alignItems="center" spacing={1} mb={2}>
                    <EducationIcon color="primary" />
                    <Typography variant="subtitle1" fontWeight={600}>Education</Typography>
                  </Stack>
                  <List dense>
                    {doctor.education.map((edu, i) => (
                      <ListItem key={i} disablePadding>
                        <ListItemIcon><CheckIcon fontSize="small" color="success" /></ListItemIcon>
                        <ListItemText primary={edu} />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Card variant="outlined" sx={{ borderRadius: 4 }}>
                <CardContent>
                  <Stack direction="row" alignItems="center" spacing={1} mb={2}>
                    <LanguageIcon color="primary" />
                    <Typography variant="subtitle1" fontWeight={600}>Languages</Typography>
                  </Stack>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {doctor.languages.map((lang) => (
                      <Chip key={lang} label={lang} size="small" variant="outlined" />
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} md={4}>
          {/* Price Card */}
          <Card variant="outlined" sx={{ borderRadius: 4, mb: 2 }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="subtitle2" color="text.secondary">Consultation Rate</Typography>
              <Typography variant="h4" color="primary" sx={{ fontWeight: 800, my: 1 }}>
                €{doctor.pricePerSecondMinor.toFixed(2)}<Typography variant="caption">/min</Typography>
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {doctor.currency} per minute
              </Typography>
              {isAvailable ? (
                <Button
                  variant="contained"
                  size="large"
                  fullWidth
                  onClick={() => onBook(doctor.id)}
                  sx={{ borderRadius: 3, py: 1.5, fontWeight: 700 }}
                >
                  Book Consultation
                </Button>
              ) : (
                <Button variant="outlined" disabled fullWidth sx={{ borderRadius: 3 }}>
                  Currently Unavailable
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Verification Status */}
          <Card variant="outlined" sx={{ borderRadius: 4, mb: 2 }}>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Verification Status
              </Typography>
              <Stack direction="row" alignItems="center" spacing={1}>
                {doctor.verificationStatus === 'Verified' ? (
                  <VerifiedIcon color="success" />
                ) : doctor.verificationStatus === 'Rejected' ? (
                  <CancelIcon color="error" />
                ) : (
                  <PendingIcon color="warning" />
                )}
                <Typography variant="body2">
                  {doctor.verificationStatus}
                </Typography>
              </Stack>
            </CardContent>
          </Card>

          {/* Marketplace Status */}
          <Card variant="outlined" sx={{ borderRadius: 4 }}>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Marketplace Status
              </Typography>
              <Chip
                label={doctor.marketplaceStatus}
                color={
                  doctor.marketplaceStatus === 'Available' ? 'success' :
                    doctor.marketplaceStatus === 'Hidden' ? 'default' : 'warning'
                }
                variant="outlined"
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}