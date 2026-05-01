import { useState } from 'react'
import {
  Box,
  Button,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
  Alert,
  CircularProgress,
} from '@mui/material'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import type { AppointmentForm, TimeSlot } from '@shared/types/appointment.ts'

interface AppointmentBookingProps {
  doctorId: string
  doctorName: string
  pricePerSecond: number
  currency: string
  onBook: (form: AppointmentForm) => Promise<void>
}

export function AppointmentBooking({
  doctorId,
  doctorName,
  pricePerSecond,
  currency,
  onBook,
}: AppointmentBookingProps) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null)
  const [notes, setNotes] = useState('')
  const [booking, setBooking] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Mock available slots - in real app, fetch from API
  const getAvailableSlots = (date: Date): TimeSlot[] => {
    const slots: TimeSlot[] = []
    const startHour = 9
    const endHour = 17

    for (let hour = startHour; hour < endHour; hour++) {
      slots.push({
        start: new Date(date.getFullYear(), date.getMonth(), date.getDate(), hour, 0).toISOString(),
        end: new Date(date.getFullYear(), date.getMonth(), date.getDate(), hour + 1, 0).toISOString(),
        available: Math.random() > 0.3, // Random availability for demo
      })
    }
    return slots
  }

  const handleBook = async () => {
    if (!selectedSlot) {
      setError('Please select a time slot')
      return
    }

    setBooking(true)
    setError(null)

    const form: AppointmentForm = {
      doctorId,
      scheduledStart: selectedSlot.start,
      scheduledEnd: selectedSlot.end,
      notes,
    }

    try {
      await onBook(form)
      setSelectedDate(null)
      setSelectedSlot(null)
      setNotes('')
    } catch {
      setError('Failed to book appointment')
    } finally {
      setBooking(false)
    }
  }

  const availableSlots = selectedDate ? getAvailableSlots(selectedDate) : []

  return (
    <Card variant="outlined">
      <CardContent>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Book Appointment with {doctorName}
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Rate: {pricePerSecond * 60} {currency}/min
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ mb: 2 }}>
          <DatePicker
            label="Select Date"
            value={selectedDate}
            onChange={setSelectedDate}
            minDate={new Date()}
            sx={{ width: '100%' }}
          />
        </Box>

        {selectedDate && (
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Time Slot</InputLabel>
            <Select
              value={selectedSlot?.start || ''}
              onChange={(e) => {
                const slot = availableSlots.find(s => s.start === e.target.value)
                setSelectedSlot(slot || null)
              }}
              label="Time Slot"
            >
              {availableSlots
                .filter(slot => slot.available)
                .map(slot => {
                  const start = new Date(slot.start)
                  const end = new Date(slot.end)
                  return (
                    <MenuItem key={slot.start} value={slot.start}>
                      {start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -{' '}
                      {end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </MenuItem>
                  )
                })}
            </Select>
          </FormControl>
        )}

        <TextField
          fullWidth
          label="Notes (optional)"
          multiline
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Any symptoms or concerns you'd like to discuss..."
          sx={{ mb: 2 }}
        />

        <Button
          variant="contained"
          fullWidth
          onClick={handleBook}
          disabled={!selectedSlot || booking}
        >
          {booking ? <CircularProgress size={24} /> : 'Book Appointment'}
        </Button>
      </CardContent>
    </Card>
  )
}