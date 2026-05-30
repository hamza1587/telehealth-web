import { useState, useEffect } from 'react'
import type { SelectChangeEvent } from '@mui/material'
import {
  Box,
  Card,
  CardContent,
  Chip,
  FormControl,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Pagination,
  Rating,
  Select,
  TextField,
  Typography,
  Avatar,
  Button,
  Alert,
  CircularProgress,
} from '@mui/material'
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Videocam as VideoIcon,
  Verified as VerifiedIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material'
import { apiBaseUrl } from '@shared/config/patient.ts'

interface Doctor {
  id: string
  displayName: string
  primarySpecialty: string
  specialties: string[]
  languages: string[]
  countryCode: string
  yearsOfExperience: number
  pricePerSecond: number
  currency: string
  rating: number
  reviewCount: number
  isAvailableNow: boolean
  isInstantAvailable: boolean
  nextAvailableSlot: string | null
  photoUrl: string | null
  isVerified: boolean
}

const SPECIALTIES = [
  'All',
  'Cardiology',
  'Dermatology',
  'Family Medicine',
  'General Practice',
  'Internal Medicine',
  'Mental Health',
  'Pediatrics',
]

const LANGUAGES = ['All', 'English', 'Spanish', 'French', 'German', 'Italian']

export function DoctorSearch() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSpecialty, setSelectedSpecialty] = useState('All')
  const [selectedLanguage, setSelectedLanguage] = useState('All')
  const [maxPrice, setMaxPrice] = useState<number | ''>('')
  const [showFilters, setShowFilters] = useState(false)
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch doctors from API
  useEffect(() => {
    const fetchDoctors = async () => {
      setLoading(true)
      setError(null)
      try {
        const query = new URLSearchParams()
        if (searchQuery) query.set('q', searchQuery)
        if (selectedSpecialty !== 'All') query.set('specialty', selectedSpecialty)
        if (selectedLanguage !== 'All') query.set('language', selectedLanguage)

        const response = await fetch(`${apiBaseUrl}/platform/discovery/doctors?${query.toString()}`)
        if (!response.ok) {
          throw new Error('Failed to fetch doctors')
        }
        const data = await response.json()
        setDoctors(data.doctors || [])
      } catch (err) {
        console.error('[API Error] Doctor search failed:', {
          error: err instanceof Error ? err.message : String(err),
          timestamp: new Date().toISOString()
        })
        setError(err instanceof Error ? err.message : 'Failed to load doctors')
      } finally {
        setLoading(false)
      }
    }

    fetchDoctors()
  }, [searchQuery, selectedSpecialty, selectedLanguage])

  const handleSpecialtyChange = (event: SelectChangeEvent) => {
    setSelectedSpecialty(event.target.value)
  }

  const handleLanguageChange = (event: SelectChangeEvent) => {
    setSelectedLanguage(event.target.value)
  }

  const formatPrice = (pricePerSecond: number, currency: string) => {
    const pricePerMinute = pricePerSecond * 60
    return `${currency} ${pricePerMinute.toFixed(2)}/min`
  }

  const filteredDoctors = doctors.filter(doctor => {
    const matchesSearch = searchQuery === '' ||
      doctor.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doctor.primarySpecialty.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesSpecialty = selectedSpecialty === 'All' ||
      doctor.primarySpecialty === selectedSpecialty ||
      doctor.specialties.includes(selectedSpecialty)

    const matchesLanguage = selectedLanguage === 'All' ||
      doctor.languages.includes(selectedLanguage)

    const matchesPrice = maxPrice === '' || doctor.pricePerSecond * 60 <= Number(maxPrice)

    return matchesSearch && matchesSpecialty && matchesLanguage && matchesPrice
  })

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold' }}>
        Find a Specialist
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
          <CircularProgress />
        </Box>
      )}

      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent>
          <TextField
            fullWidth
            placeholder="Search by name or specialty..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowFilters(!showFilters)}>
                      <FilterIcon />
                    </IconButton>
                  </InputAdornment>
                )
              }
            }}
          />

          {showFilters && (
            <Grid container spacing={2}>
              <Grid>
                <FormControl fullWidth>
                  <InputLabel>Specialty</InputLabel>
                  <Select
                    value={selectedSpecialty}
                    onChange={handleSpecialtyChange}
                    label="Specialty"
                  >
                    {SPECIALTIES.map(s => (
                      <MenuItem key={s} value={s}>{s}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid>
                <FormControl fullWidth>
                  <InputLabel>Language</InputLabel>
                  <Select
                    value={selectedLanguage}
                    onChange={handleLanguageChange}
                    label="Language"
                  >
                    {LANGUAGES.map(l => (
                      <MenuItem key={l} value={l}>{l}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid>
                <TextField
                  fullWidth
                  type="number"
                  label="Max Price per Minute (EUR)"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value === '' ? '' : Number(e.target.value))}
                />
              </Grid>
            </Grid>
          )}
        </CardContent>
      </Card>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        {filteredDoctors.length} doctors found
      </Typography>

      <Grid container spacing={3}>
        {filteredDoctors.map(doctor => (
          <Grid>
            <Card variant="outlined" sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flex: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                  <Avatar
                    sx={{ width: 64, height: 64, mr: 2 }}
                    src={doctor.photoUrl || undefined}
                  >
                    {doctor.displayName.charAt(0)}
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="h6" sx={{ fontWeight: 500 }}>
                        {doctor.displayName}
                      </Typography>
                      {doctor.isVerified && (
                        <VerifiedIcon color="primary" fontSize="small" />
                      )}
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {doctor.primarySpecialty}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                      <Rating
                        value={doctor.rating}
                        precision={0.1}
                        size="small"
                        readOnly
                      />
                      <Typography variant="caption" sx={{ ml: 1 }}>
                        {doctor.rating} ({doctor.reviewCount} reviews)
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Languages: {doctor.languages.join(', ')}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {doctor.yearsOfExperience} years experience • {doctor.countryCode}
                  </Typography>
                </Box>

                <Box sx={{ mb: 2 }}>
                  {doctor.specialties.slice(0, 3).map(specialty => (
                    <Chip
                      key={specialty}
                      label={specialty}
                      size="small"
                      sx={{ mr: 0.5, mb: 0.5 }}
                    />
                  ))}
                </Box>

                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                  {doctor.isAvailableNow && (
                    <Chip
                      label="Available Now"
                      color="success"
                      size="small"
                      icon={<VideoIcon />}
                    />
                  )}
                  {doctor.isInstantAvailable && (
                    <Chip
                      label="Instant"
                      color="primary"
                      size="small"
                    />
                  )}
                </Box>

                {doctor.nextAvailableSlot && !doctor.isAvailableNow && (
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <ScheduleIcon fontSize="small" color="action" sx={{ mr: 1 }} />
                    <Typography variant="body2" color="text.secondary">
                      Next available: {new Date(doctor.nextAvailableSlot).toLocaleDateString()}
                    </Typography>
                  </Box>
                )}
              </CardContent>
              <Box sx={{ p: 2, pt: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6" color="primary" sx={{ fontWeight: 'bold' }}>
                  {formatPrice(doctor.pricePerSecond, doctor.currency)}
                </Typography>
                <Button
                  variant="contained"
                  disabled={!doctor.isAvailableNow && !doctor.nextAvailableSlot}
                >
                  {doctor.isAvailableNow ? 'Book Now' : 'Schedule'}
                </Button>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>

      {filteredDoctors.length > 0 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Pagination count={10} color="primary" />
        </Box>
      )}
    </Box>
  )
}