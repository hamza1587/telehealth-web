import { useState } from 'react'
import {
Box, Card, CardContent, Typography, Button,
Stack, CircularProgress, Alert, Grid,
Avatar, Chip, Divider,
} from '@mui/material'
import {
 Science as ScienceIcon,
 Person as PersonIcon,
 CheckCircle as CheckIcon,
 CalendarToday,
 Public,
} from '@mui/icons-material'
import type { ResearchStudy, ResearchEnrollmentForm as EnrollmentForm } from '@shared/types/index.ts'

interface ResearchStudyDetailProps {
  study: ResearchStudy | null
  loading: boolean
  error: string | null
  onEnroll: (form: EnrollmentForm) => Promise<boolean>
  onWithdraw: () => Promise<boolean>
  isEnrolled: boolean
}

export function ResearchStudyDetail({
  study,
  loading,
  error,
  onEnroll,
  onWithdraw,
  isEnrolled,
}: ResearchStudyDetailProps) {
  const [form, setForm] = useState<EnrollmentForm>({
    studyId: study?.id || '',
    consentGiven: true,
    dataSharingPreferences: [],
    demographicData: {
      ageRange: '',
      gender: '',
      countryCode: '',
      conditions: [],
    },
  })
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState('')

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

  if (!study) {
    return <Alert severity="info">Select a study from the list.</Alert>
  }

  const handleEnroll = async () => {
    setSubmitting(true)
    setSuccess('')
    const result = await onEnroll({
      ...form,
      studyId: study.id,
      dataSharingPreferences: study.dataTypes,
    })
    if (result) {
      setSuccess('Successfully enrolled in the study!')
    }
    setSubmitting(false)
  }

  const handleWithdraw = async () => {
    setSubmitting(true)
    const result = await onWithdraw()
    if (result) {
      setSuccess('Successfully withdrawn from the study.')
    }
    setSubmitting(false)
  }

  const statusColors: Record<string, string> = {
    recruiting: 'primary',
    active: 'success',
    completed: 'default',
    cancelled: 'error',
  }

  return (
    <Box>
      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      {/* Study Header */}
      <Card variant="outlined" sx={{ borderRadius: 4, mb: 3 }}>
        <CardContent>
          <Stack direction="row" alignItems="center" spacing={2} mb={2}>
            <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56 }}>
              <ScienceIcon fontSize="large" />
            </Avatar>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 800 }}>
                {study.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {study.organization}
              </Typography>
            </Box>
            <Chip
              label={study.status}
              color={statusColors[study.status] as any}
              variant="outlined"
              size="small"
            />
          </Stack>

          <Typography variant="body1" paragraph>
            {study.description}
          </Typography>

          <Divider sx={{ my: 2 }} />

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Stack direction="row" spacing={1} alignItems="center">
                <CalendarToday fontSize="small" color="action" />
                <Typography variant="body2" color="text.secondary">
                  {new Date(study.startDate).toLocaleDateString()} – {new Date(study.endDate).toLocaleDateString()}
                </Typography>
              </Stack>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Stack direction="row" spacing={1} alignItems="center">
                <Public fontSize="small" color="action" />
                <Typography variant="body2" color="text.secondary">
                  {study.dataTypes.length} data categories
                </Typography>
              </Stack>
            </Grid>
            <Grid item xs={12}>
              <Stack direction="row" spacing={1} alignItems="center">
                <PersonIcon fontSize="small" color="action" />
                <Typography variant="body2" color="text.secondary">
                  Eligibility: {study.eligibilityCriteria}
                </Typography>
              </Stack>
            </Grid>
            {study.compensation && (
              <Grid item xs={12}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  💰 Compensation: {study.compensation}
                </Typography>
              </Grid>
            )}
          </Grid>
        </CardContent>
      </Card>

      {/* Data Sharing Consent */}
      {!isEnrolled ? (
        <Card variant="outlined" sx={{ borderRadius: 4, mb: 2 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Enrollment & Consent
            </Typography>
            <Typography variant="body2" gutterBottom>
              By enrolling, you agree to share the following data categories:
            </Typography>
            <Box sx={{ my: 2 }}>
              {study.dataTypes.map((type) => (
                <Chip
                  key={type}
                  label={type.replace(/_/g, ' ')}
                  size="small"
                  sx={{ mr: 1, mb: 1 }}
                  variant="outlined"
                />
              ))}
            </Box>
            <Button
              variant="contained"
              color="primary"
              size="large"
              fullWidth
              onClick={handleEnroll}
              disabled={submitting || !form.consentGiven}
              startIcon={<CheckIcon />}
              sx={{ borderRadius: 3, py: 1.5, fontWeight: 700 }}
            >
              {submitting ? 'Enrolling...' : 'I Consent & Enroll'}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card variant="outlined" sx={{ borderRadius: 4, mb: 2 }}>
          <CardContent sx={{ textAlign: 'center' }}>
            <CheckIcon fontSize="large" color="success" sx={{ mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              You Are Enrolled
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Your data is being shared according to the study protocol. You can withdraw at any time.
            </Typography>
            <Button
              variant="outlined"
              color="error"
              onClick={handleWithdraw}
              disabled={submitting}
              sx={{ borderRadius: 3, mt: 1 }}
            >
              Withdraw from Study
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Consent Form Link */}
      <Card variant="outlined" sx={{ borderRadius: 4 }}>
        <CardContent>
          <Typography variant="subtitle1" fontWeight={600}>
            <Public sx={{ mr: 1, fontSize: 18 }} />
            Consent Form
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Full consent form and study protocol available at:
          </Typography>
          <Button
            variant="outlined"
            component="a"
            href={study.consentFormUrl}
            target="_blank"
            rel="noopener"
            sx={{ mt: 1, borderRadius: 3 }}
          >
            View Consent Form
          </Button>
        </CardContent>
      </Card>
    </Box>
  )
}