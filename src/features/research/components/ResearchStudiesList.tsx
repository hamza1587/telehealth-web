import { Avatar, Box, Card, CardContent, Typography, Grid, Button, Chip,
Stack, Divider, CircularProgress, Alert,
} from '@mui/material'
import { Science, Person, CalendarToday, CheckCircle } from '@mui/icons-material'
import type { ResearchStudy, ResearchEnrollmentForm } from '@shared/types/index.ts'

interface StudiesListProps {
  studies: ResearchStudy[]
  loading: boolean
  error: string | null
  onEnroll: (studyId: string, form: ResearchEnrollmentForm) => Promise<boolean>
  onWithdraw: (studyId: string) => Promise<boolean>
}

export function ResearchStudiesList({
  studies,
  loading,
  error,
  onEnroll,
  onWithdraw,
}: StudiesListProps) {
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

  if (studies.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 6 }}>
        <Science sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
        <Typography variant="h6" color="text.secondary">
          No research studies available
        </Typography>
        <Typography variant="body2" color="text.disabled">
          Check back later for new studies.
        </Typography>
      </Box>
    )
  }

  return (
    <Grid container spacing={3}>
      {studies.map((study) => (
        <Grid item xs={12} md={6} key={study.id}>
          <Card variant="outlined" sx={{ borderRadius: 4, height: '100%' }}>
            <CardContent>
              <Stack direction="row" alignItems="flex-start" justifyContent="space-between" mb={2}>
                <Stack direction="row" alignItems="center" spacing={1.5}>
                  <Avatar sx={{ bgcolor: 'primary.main', width: 44, height: 44 }}>
                    <Science />
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle1" fontWeight={700} sx={{ maxWidth: 200 }}>
                      {study.title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {study.organization}
                    </Typography>
                  </Box>
                </Stack>
                <Chip
                  label={study.status}
                  color={
                    study.status === 'recruiting' ? 'primary' :
                    study.status === 'active' ? 'success' :
                    study.status === 'completed' ? 'default' : 'warning'
                  }
                  size="small"
                  variant="outlined"
                />
              </Stack>

              <Typography variant="body2" color="text.secondary" paragraph>
                {study.description.length > 150
                  ? study.description.substring(0, 150) + '...'
                  : study.description}
              </Typography>

              <Divider sx={{ my: 1.5 }} />

              <Grid container spacing={1}>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    <CalendarToday sx={{ fontSize: 12, mr: 0.5, verticalAlign: 'middle' }} />
                    {new Date(study.startDate).toLocaleDateString()} – {new Date(study.endDate).toLocaleDateString()}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    <Person sx={{ fontSize: 12, mr: 0.5, verticalAlign: 'middle' }} />
                    {study.eligibilityCriteria}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    <Public sx={{ fontSize: 12, mr: 0.5, verticalAlign: 'middle' }} />
                    {study.dataTypes.length} data types
                  </Typography>
                </Grid>
                {study.compensation && (
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">
                      💰 {study.compensation}
                    </Typography>
                  </Grid>
                )}
              </Grid>

              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                {!study.isEnrolled ? (
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => {
                      const form: ResearchEnrollmentForm = {
                        studyId: study.id,
                        consentGiven: true,
                        dataSharingPreferences: study.dataTypes,
                        demographicData: {
                          ageRange: '',
                          gender: '',
                          countryCode: '',
                          conditions: [],
                        },
                      }
                      onEnroll(study.id, form)
                    }}
                    sx={{ borderRadius: 2 }}
                  >
                    Enroll
                  </Button>
                ) : (
                  <Button
                    variant="outlined"
                    color="error"
                    size="small"
                    onClick={() => onWithdraw(study.id)}
                    startIcon={        <Cancel fontSize="small" />}
                    sx={{ borderRadius: 2 }}
                  >
                    Withdraw
                  </Button>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  )
}