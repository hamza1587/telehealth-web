import { useState, useCallback } from 'react'
import {
  Alert,
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  CircularProgress,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import LocalPharmacyIcon from '@mui/icons-material/LocalPharmacy'
import { apiBaseUrl } from '@shared/config/patient.ts'

interface Pharmacy {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  acceptsEPrescriptions: boolean;
  isOnline: boolean;
}

interface PharmacyLookupProps {
  countryCode?: string;
  onSelect?: (pharmacy: Pharmacy) => void;
}

export function PharmacyLookup({ countryCode = 'DE', onSelect }: PharmacyLookupProps) {
  const [city, setCity] = useState('')
  const [country, setCountry] = useState(countryCode)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pharmacies, setPharmacies] = useState<Pharmacy[] | null>(null)
  const [selected, setSelected] = useState<Pharmacy | null>(null)

  const handleSearch = useCallback(async () => {
    if (!city.trim()) return
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({ countryCode: country, city })
      const res = await fetch(`${apiBaseUrl}/gateway/pharmacies/nearby?${params}`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      setPharmacies(await res.json() as Pharmacy[])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed')
    } finally {
      setLoading(false)
    }
  }, [city, country])

  const handleSelect = useCallback((pharmacy: Pharmacy) => {
    setSelected(pharmacy)
    onSelect?.(pharmacy)
  }, [onSelect])

  return (
    <Box>
      <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
        <TextField
          label="Country"
          value={country}
          onChange={e => setCountry(e.target.value.toUpperCase())}
          size="small"
          sx={{ width: 80 }}
          inputProps={{ maxLength: 2 }}
        />
        <TextField
          label="City"
          value={city}
          onChange={e => setCity(e.target.value)}
          size="small"
          sx={{ flex: 1 }}
          onKeyDown={e => { if (e.key === 'Enter') void handleSearch() }}
        />
        <Button
          variant="contained"
          onClick={() => void handleSearch()}
          disabled={loading || !city.trim()}
          startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <LocalPharmacyIcon />}
        >
          Search
        </Button>
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 1 }}>{error}</Alert>}

      {selected && (
        <Alert severity="success" sx={{ mb: 1 }}>
          Selected: <strong>{selected.name}</strong> — {selected.address}, {selected.city}
        </Alert>
      )}

      {pharmacies !== null && pharmacies.length === 0 && (
        <Typography variant="body2" color="text.secondary">No pharmacies found in {city}.</Typography>
      )}

      {pharmacies !== null && pharmacies.length > 0 && (
        <Stack spacing={1}>
          {pharmacies.map(pharmacy => (
            <Card
              key={pharmacy.id}
              variant="outlined"
              sx={{ borderColor: selected?.id === pharmacy.id ? 'primary.main' : 'divider' }}
            >
              <CardActionArea onClick={() => handleSelect(pharmacy)}>
                <CardContent sx={{ py: 1.5 }}>
                  <Stack direction="row" alignItems="flex-start" justifyContent="space-between">
                    <Box>
                      <Typography variant="body2" fontWeight={600}>{pharmacy.name}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {pharmacy.address}, {pharmacy.city} {pharmacy.zip}
                      </Typography>
                      {pharmacy.phone && (
                        <Typography variant="caption" display="block" color="text.secondary">
                          {pharmacy.phone}
                        </Typography>
                      )}
                    </Box>
                    <Stack direction="row" spacing={0.5} flexShrink={0} ml={1}>
                      {pharmacy.acceptsEPrescriptions && (
                        <Chip label="e-Rx" size="small" color="success" />
                      )}
                      {pharmacy.isOnline && (
                        <Chip label="Online" size="small" color="primary" />
                      )}
                    </Stack>
                  </Stack>
                </CardContent>
              </CardActionArea>
            </Card>
          ))}
        </Stack>
      )}
    </Box>
  )
}
