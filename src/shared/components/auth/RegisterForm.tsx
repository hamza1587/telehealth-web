import { useState } from 'react'
import { useAuth } from '@shared/auth/AuthContext.tsx'
import {
  Box,
  Button,
  TextField,
  Typography,
  Alert,
  Link,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stepper,
  Step,
  StepLabel,
  FormControlLabel,
  Checkbox,
  InputAdornment,
  IconButton,
  Divider,
  Stack,
} from '@mui/material'
import {
  Visibility,
  VisibilityOff,
  Email as EmailIcon,
  Lock as LockIcon,
  Person as PersonIcon,
  Phone as PhoneIcon
} from '@mui/icons-material'
import type { UserType } from '@shared/types/auth.ts'

interface RegisterFormProps {
  onSuccess?: () => void
  onLoginClick?: () => void
}

const steps = ['Account Type', 'Personal Info', 'Security']

export function RegisterForm({ onSuccess, onLoginClick }: RegisterFormProps) {
  const { register, isLoading, error, clearError } = useAuth()
  
  const [activeStep, setActiveStep] = useState(0)
  
  // Step 1: Account Type
  const [userType, setUserType] = useState<UserType>('Patient')
  
  // Step 2: Personal Info
  const [email, setEmail] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [countryCode, setCountryCode] = useState('DE')
  const [preferredLanguage] = useState('en')
  
  // Step 3: Security
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [agreeToTerms, setAgreeToTerms] = useState(false)
  const [agreeToPrivacy, setAgreeToPrivacy] = useState(false)
  
  const [stepError, setStepError] = useState<string | null>(null)

  const validateStep = (step: number): boolean => {
    setStepError(null)
    
    switch (step) {
      case 0:
        if (!userType) {
          setStepError('Please select an account type')
          return false
        }
        return true
        
      case 1:
        if (!email || !firstName || !lastName) {
          setStepError('Please fill in all required fields')
          return false
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          setStepError('Please enter a valid email address')
          return false
        }
        return true
        
      case 2:
        if (password.length < 12) {
          setStepError('Password must be at least 12 characters long')
          return false
        }
        if (password !== confirmPassword) {
          setStepError('Passwords do not match')
          return false
        }
        if (!agreeToTerms || !agreeToPrivacy) {
          setStepError('You must agree to the terms and privacy policy')
          return false
        }
        return true
        
      default:
        return false
    }
  }

  const handleNext = () => {
    if (validateStep(activeStep)) {
      if (activeStep === steps.length - 1) {
        handleSubmit()
      } else {
        setActiveStep((prev) => prev + 1)
      }
    }
  }

  const handleBack = () => {
    setActiveStep((prev) => prev - 1)
    setStepError(null)
  }

  const handleSubmit = async () => {
    clearError()
    setStepError(null)

    const result = await register({
      email,
      password,
      userType,
      firstName,
      lastName,
      phoneNumber: phoneNumber || undefined,
      countryCode,
      preferredLanguage,
    })

    if (result.success) {
      onSuccess?.()
    }
  }

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <FormControl fullWidth required>
            <InputLabel>I am a...</InputLabel>
            <Select
              value={userType}
              onChange={(e) => setUserType(e.target.value as UserType)}
              label="I am a..."
            >
              <MenuItem value="Patient">Patient - I want to consult with doctors</MenuItem>
              <MenuItem value="Doctor">Doctor - I want to provide consultations</MenuItem>
            </Select>
          </FormControl>
        )
        
      case 1:
        return (
          <Stack spacing={2}>
            <TextField
              label="Email Address"
              type="email"
              required
              fullWidth
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon color="action" />
                    </InputAdornment>
                  ),
                },
              }}
            />
            <TextField
              label="First Name"
              required
              fullWidth
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon color="action" />
                    </InputAdornment>
                  ),
                },
              }}
            />
            <TextField
              label="Last Name"
              required
              fullWidth
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon color="action" />
                    </InputAdornment>
                  ),
                },
              }}
            />
            <TextField
              label="Phone Number (optional)"
              fullWidth
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <PhoneIcon color="action" />
                    </InputAdornment>
                  ),
                },
              }}
            />
            <FormControl fullWidth>
              <InputLabel>Country</InputLabel>
              <Select
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value)}
                label="Country"
              >
                <MenuItem value="DE">Germany</MenuItem>
                <MenuItem value="FR">France</MenuItem>
                <MenuItem value="IT">Italy</MenuItem>
                <MenuItem value="ES">Spain</MenuItem>
                <MenuItem value="NL">Netherlands</MenuItem>
                <MenuItem value="BE">Belgium</MenuItem>
                <MenuItem value="AT">Austria</MenuItem>
                <MenuItem value="CH">Switzerland</MenuItem>
                <MenuItem value="GB">United Kingdom</MenuItem>
                <MenuItem value="PL">Poland</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        )
        
      case 2:
        return (
          <Stack spacing={2}>
            <TextField
              label="Password"
              type={showPassword ? 'text' : 'password'}
              required
              fullWidth
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              helperText="Must be at least 12 characters with uppercase, lowercase, number, and special character"
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />
            <TextField
              label="Confirm Password"
              type={showPassword ? 'text' : 'password'}
              required
              fullWidth
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon color="action" />
                    </InputAdornment>
                  ),
                },
              }}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={agreeToTerms}
                  onChange={(e) => setAgreeToTerms(e.target.checked)}
                />
              }
              label={
                <Typography variant="body2">
                  I agree to the{' '}
                  <Link href="#" target="_blank">Terms of Service</Link>
                </Typography>
              }
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={agreeToPrivacy}
                  onChange={(e) => setAgreeToPrivacy(e.target.checked)}
                />
              }
              label={
                <Typography variant="body2">
                  I agree to the{' '}
                  <Link href="#" target="_blank">Privacy Policy</Link>
                </Typography>
              }
            />
          </Stack>
        )
        
      default:
        return null
    }
  }

  return (
    <Box sx={{ width: '100%' }}>
      <Stack spacing={3}>
        <Typography variant="h5" align="center" sx={{ fontWeight: 'bold' }}>
          Create Account
        </Typography>

        {(error || stepError) && (
          <Alert severity="error" onClose={() => { clearError(); setStepError(null) }}>
            {error || stepError}
          </Alert>
        )}

        <Stepper activeStep={activeStep} alternativeLabel>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <Box sx={{ mt: 2, mb: 2 }}>
          {renderStepContent()}
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button
            variant="outlined"
            onClick={handleBack}
            disabled={activeStep === 0 || isLoading}
          >
            Back
          </Button>
          <Button
            variant="contained"
            onClick={handleNext}
            disabled={isLoading}
          >
            {activeStep === steps.length - 1 
              ? (isLoading ? 'Creating Account...' : 'Create Account')
              : 'Next'
            }
          </Button>
        </Box>

        <Divider>or</Divider>

        <Typography variant="body2" align="center">
          Already have an account?{' '}
          <Link
            component="button"
            type="button"
            onClick={onLoginClick}
          >
            Sign in
          </Link>
        </Typography>
      </Stack>
    </Box>
  )
}
