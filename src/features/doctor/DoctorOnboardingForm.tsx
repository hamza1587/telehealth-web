import { useState } from 'react'
import type { SelectChangeEvent } from '@mui/material'
import {
  Box,
  Button,
  Stepper,
  Step,
  StepLabel,
  TextField,
  Typography,
  Alert,
  Card,
  CardContent,
  Grid,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  OutlinedInput,
} from '@mui/material'
import { UploadFile as UploadIcon } from '@mui/icons-material'
import { apiBaseUrl } from '@shared/config/patient.ts'

const SPECIALTIES = [
  'Cardiology',
  'Dermatology',
  'Endocrinology',
  'Family Medicine',
  'Gastroenterology',
  'General Practice',
  'Internal Medicine',
  'Mental Health',
  'Neurology',
  'Obstetrics',
  'Oncology',
  'Ophthalmology',
  'Orthopedics',
  'Pediatrics',
  'Psychiatry',
  'Pulmonology',
  'Rheumatology',
  'Urology',
]

const LANGUAGES = [
  'English',
  'Spanish',
  'French',
  'German',
  'Italian',
  'Portuguese',
  'Dutch',
  'Polish',
  'Romanian',
  'Greek',
]

const STEPS = [
  'Personal Information',
  'Professional Details',
  'Documents Upload',
  'Review & Submit',
]

export function DoctorOnboardingForm() {
  const [activeStep, setActiveStep] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    legalName: '',
    email: '',
    phoneNumber: '',
    countryOfPractice: '',
    primarySpecialty: '',
    otherSpecialties: [] as string[],
    languages: [] as string[],
    qualifications: '',
    yearsOfExperience: 0,
    biography: '',
    licenseNumber: '',
    licensingAuthority: '',
    licenseExpiryDate: '',
    insuranceProvider: '',
    insurancePolicyNumber: '',
  })

  const handleNext = () => {
    setActiveStep(prev => prev + 1)
  }

  const handleBack = () => {
    setActiveStep(prev => prev - 1)
  }

  const handleChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [field]: event.target.value }))
  }

  // Fixed: Proper type handler for Select components
  const handleSelectChange = (field: string) => (event: SelectChangeEvent<string>) => {
    setFormData(prev => ({ ...prev, [field]: event.target.value }))
  }

  const handleMultiSelect = (field: string) => (event: SelectChangeEvent<string[]>) => {
    setFormData(prev => ({ ...prev, [field]: event.target.value as string[] }))
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    setError(null)

    try {
      const response = await fetch(`${apiBaseUrl}/platform/doctors/onboarding`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        throw new Error(errorData.error || 'Failed to submit application')
      }

      setSubmitted(true)
    } catch (err) {
      console.error('[API Error] Doctor onboarding failed:', {
        error: err instanceof Error ? err.message : String(err),
        timestamp: new Date().toISOString()
      })
      setError(err instanceof Error ? err.message : 'Failed to submit application')
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <Alert severity="success" sx={{ m: 2 }}>
        <Typography variant="h6">Application Submitted Successfully!</Typography>
        <Typography>
          Your application has been received and is under review. You will be notified
          via email once the verification process is complete. This typically takes 3-5 business days.
        </Typography>
      </Alert>
    )
  }

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid  ={}  ={} >
              <TextField
                fullWidth
                label="Legal Name"
                value={formData.legalName}
                onChange={handleChange('legalName')}
                required
              />
            </Grid>
            <Grid  ={}  ={} >
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={formData.email}
                onChange={handleChange('email')}
                required
              />
            </Grid>
            <Grid  ={}  ={} >
              <TextField
                fullWidth
                label="Phone Number"
                value={formData.phoneNumber}
                onChange={handleChange('phoneNumber')}
                required
              />
            </Grid>
            <Grid  ={}  ={} >
              <TextField
                fullWidth
                label="Country of Practice"
                value={formData.countryOfPractice}
                onChange={handleChange('countryOfPractice')}
                required
              />
            </Grid>
          </Grid>
        )
      case 1:
        return (
          <Grid container spacing={3}>
            <Grid  ={}  ={} >
              <FormControl fullWidth required>
                <InputLabel>Primary Specialty</InputLabel>
                <Select
                  value={formData.primarySpecialty}
                  onChange={handleSelectChange('primarySpecialty')}
                  label="Primary Specialty"
                >
                  {SPECIALTIES.map(s => (
                    <MenuItem key={s} value={s}>{s}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid  ={}  ={} >
              <FormControl fullWidth>
                <InputLabel>Other Specialties</InputLabel>
                <Select
                  multiple
                  value={formData.otherSpecialties}
                  onChange={handleMultiSelect('otherSpecialties')}
                  input={<OutlinedInput label="Other Specialties" />}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {(selected as string[]).map((value) => (
                        <Chip key={value} label={value} size="small" />
                      ))}
                    </Box>
                  )}
                >
                  {SPECIALTIES.filter(s => s !== formData.primarySpecialty).map(s => (
                    <MenuItem key={s} value={s}>{s}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid  ={} >
              <FormControl fullWidth required>
                <InputLabel>Languages</InputLabel>
                <Select
                  multiple
                  value={formData.languages}
                  onChange={handleMultiSelect('languages')}
                  input={<OutlinedInput label="Languages" />}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {(selected as string[]).map((value) => (
                        <Chip key={value} label={value} size="small" />
                      ))}
                    </Box>
                  )}
                >
                  {LANGUAGES.map(l => (
                    <MenuItem key={l} value={l}>{l}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid  ={} >
              <TextField
                fullWidth
                multiline
                rows={2}
                label="Qualifications"
                value={formData.qualifications}
                onChange={handleChange('qualifications')}
                required
                placeholder="MD, Board Certification, etc."
              />
            </Grid>
            <Grid  ={}  ={} >
              <TextField
                fullWidth
                type="number"
                label="Years of Experience"
                value={formData.yearsOfExperience}
                onChange={handleChange('yearsOfExperience')}
                required
                slotProps={{ htmlInput: { min: 0, max: 70 } }}
              />
            </Grid>
            <Grid  ={} >
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Professional Biography"
                value={formData.biography}
                onChange={handleChange('biography')}
                required
                placeholder="Brief description of your professional background..."
              />
            </Grid>
          </Grid>
        )
      case 2:
        return (
          <Grid container spacing={3}>
            <Grid  ={}  ={} >
              <TextField
                fullWidth
                label="Medical License Number"
                value={formData.licenseNumber}
                onChange={handleChange('licenseNumber')}
                required
              />
            </Grid>
            <Grid  ={}  ={} >
              <TextField
                fullWidth
                label="Licensing Authority"
                value={formData.licensingAuthority}
                onChange={handleChange('licensingAuthority')}
                required
              />
            </Grid>
            <Grid  ={}  ={} >
              <TextField
                fullWidth
                type="date"
                label="License Expiry Date"
                value={formData.licenseExpiryDate}
                onChange={handleChange('licenseExpiryDate')}
                required
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </Grid>
            <Grid  ={}  ={} >
              <TextField
                fullWidth
                label="Malpractice Insurance Provider"
                value={formData.insuranceProvider}
                onChange={handleChange('insuranceProvider')}
                required
              />
            </Grid>
            <Grid  ={}  ={} >
              <TextField
                fullWidth
                label="Insurance Policy Number"
                value={formData.insurancePolicyNumber}
                onChange={handleChange('insurancePolicyNumber')}
                required
              />
            </Grid>
            <Grid  ={} >
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Required Documents
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Please upload the following documents:
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Button variant="outlined" startIcon={<UploadIcon />} component="label">
                      Upload Medical License
                      <input type="file" hidden accept=".pdf,.jpg,.png" />
                    </Button>
                    <Button variant="outlined" startIcon={<UploadIcon />} component="label">
                      Upload Board Certification
                      <input type="file" hidden accept=".pdf,.jpg,.png" />
                    </Button>
                    <Button variant="outlined" startIcon={<UploadIcon />} component="label">
                      Upload Photo ID
                      <input type="file" hidden accept=".pdf,.jpg,.png" />
                    </Button>
                    <Button variant="outlined" startIcon={<UploadIcon />} component="label">
                      Upload Malpractice Insurance Certificate
                      <input type="file" hidden accept=".pdf" />
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )
      case 3:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Review Your Application
            </Typography>
            <Alert severity="info" sx={{ mb: 2 }}>
              Please review all information before submitting. You cannot edit your application once submitted.
            </Alert>
            <Grid container spacing={2}>
              <Grid  ={}  ={} >
                <Typography variant="subtitle2" color="text.secondary">Legal Name</Typography>
                <Typography>{formData.legalName || '-'}</Typography>
              </Grid>
              <Grid  ={}  ={} >
                <Typography variant="subtitle2" color="text.secondary">Email</Typography>
                <Typography>{formData.email || '-'}</Typography>
              </Grid>
              <Grid  ={}  ={} >
                <Typography variant="subtitle2" color="text.secondary">Primary Specialty</Typography>
                <Typography>{formData.primarySpecialty || '-'}</Typography>
              </Grid>
              <Grid  ={}  ={} >
                <Typography variant="subtitle2" color="text.secondary">Years of Experience</Typography>
                <Typography>{formData.yearsOfExperience || '-'}</Typography>
              </Grid>
              <Grid  ={} >
                <Typography variant="subtitle2" color="text.secondary">License Number</Typography>
                <Typography>{formData.licenseNumber || '-'}</Typography>
              </Grid>
              <Grid  ={} >
                <Typography variant="subtitle2" color="text.secondary">Biography</Typography>
                <Typography>{formData.biography || '-'}</Typography>
              </Grid>
            </Grid>
          </Box>
        )
      default:
        return null
    }
  }

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold' }}>
        Doctor Onboarding
      </Typography>

      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {STEPS.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <Card>
        <CardContent sx={{ p: 3 }}>
          {renderStepContent(activeStep)}
        </CardContent>
      </Card>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
        <Button
          variant="outlined"
          disabled={activeStep === 0}
          onClick={handleBack}
        >
          Back
        </Button>
        {activeStep === STEPS.length - 1 ? (
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? 'Submitting...' : 'Submit Application'}
          </Button>
        ) : (
          <Button
            variant="contained"
            onClick={handleNext}
          >
            Next
          </Button>
        )}
      </Box>
    </Box>
  )
}
