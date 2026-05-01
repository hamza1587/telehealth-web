import { useState } from 'react'
import {
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Switch,
  Typography,
} from '@mui/material'
import {
  ChevronRight as ChevronRightIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material'

interface AvailabilitySlot {
  id: string
  dayOfWeek: number
  startTime: string
  endTime: string
  isInstantEnabled: boolean
  mode: 'video' | 'phone' | 'text'
}

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

export function DoctorAvailabilityCalendar() {
  const [slots, setSlots] = useState<AvailabilitySlot[]>([
    { id: '1', dayOfWeek: 1, startTime: '09:00', endTime: '17:00', isInstantEnabled: true, mode: 'video' },
    { id: '2', dayOfWeek: 2, startTime: '09:00', endTime: '17:00', isInstantEnabled: true, mode: 'video' },
    { id: '3', dayOfWeek: 3, startTime: '09:00', endTime: '12:00', isInstantEnabled: false, mode: 'phone' },
  ])
  const [openDialog, setOpenDialog] = useState(false)
  const [editingSlot, setEditingSlot] = useState<AvailabilitySlot | null>(null)
  const [formData, setFormData] = useState<Partial<AvailabilitySlot>>({
    dayOfWeek: 1,
    startTime: '09:00',
    endTime: '17:00',
    isInstantEnabled: false,
    mode: 'video',
  })

  const handleOpenDialog = (slot?: AvailabilitySlot) => {
    if (slot) {
      setEditingSlot(slot)
      setFormData(slot)
    } else {
      setEditingSlot(null)
      setFormData({
        dayOfWeek: 1,
        startTime: '09:00',
        endTime: '17:00',
        isInstantEnabled: false,
        mode: 'video',
      })
    }
    setOpenDialog(true)
  }

  const handleCloseDialog = () => {
    setOpenDialog(false)
    setEditingSlot(null)
  }

  const handleSaveSlot = () => {
    if (editingSlot) {
      setSlots(prev =>
        prev.map(s => (s.id === editingSlot.id ? { ...s, ...formData } as AvailabilitySlot : s))
      )
    } else {
      setSlots(prev => [
        ...prev,
        { id: Date.now().toString(), ...formData } as AvailabilitySlot,
      ])
    }
    handleCloseDialog()
  }

  const handleDeleteSlot = (id: string) => {
    setSlots(prev => prev.filter(s => s.id !== id))
  }

  const getSlotsForDay = (dayIndex: number) => {
    return slots
      .filter(s => s.dayOfWeek === dayIndex)
      .sort((a, b) => a.startTime.localeCompare(b.startTime))
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
          Weekly Availability
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add Slot
        </Button>
      </Box>

      <Grid container spacing={2}>
        {DAYS.map((day, index) => {
          const daySlots = getSlotsForDay(index)
          return (
            <Grid size={{ xs: 12, md: 6, lg: 4 }} key={day}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    {day}
                  </Typography>
                  {daySlots.length === 0 ? (
                    <Typography color="text.secondary" variant="body2">
                      No availability set
                    </Typography>
                  ) : (
                    daySlots.map(slot => (
                      <Paper
                        key={slot.id}
                        variant="outlined"
                        sx={{
                          p: 2,
                          mb: 1,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}
                      >
                        <Box>
                          <Typography variant="body1" sx={{ fontWeight: 500 }}>
                            {slot.startTime} - {slot.endTime}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {slot.mode === 'video' ? 'Video' : slot.mode === 'phone' ? 'Phone' : 'Chat'}
                            {slot.isInstantEnabled && ' • Instant Available'}
                          </Typography>
                        </Box>
                        <Box>
                          <IconButton
                            size="small"
                            onClick={() => handleOpenDialog(slot)}
                          >
                            <ChevronRightIcon />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDeleteSlot(slot.id)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      </Paper>
                    ))
                  )}
                </CardContent>
              </Card>
            </Grid>
          )
        })}
      </Grid>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingSlot ? 'Edit Availability Slot' : 'Add Availability Slot'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid size={{ xs: 12 }}>
              <FormControl fullWidth>
                <InputLabel>Day of Week</InputLabel>
                <Select
                  value={formData.dayOfWeek}
                  onChange={(e) =>
                    setFormData(prev => ({ ...prev, dayOfWeek: e.target.value as number }))
                  }
                  label="Day of Week"
                >
                  {DAYS.map((day, index) => (
                    <MenuItem key={day} value={index}>{day}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth>
                <InputLabel>Start Time</InputLabel>
                <Select
                  value={formData.startTime}
                  onChange={(e) =>
                    setFormData(prev => ({ ...prev, startTime: e.target.value as string }))
                  }
                  label="Start Time"
                >
                  {Array.from({ length: 24 }, (_, i) => i).map(hour => (
                    <MenuItem key={hour} value={`${hour.toString().padStart(2, '0')}:00`}>
                      {`${hour.toString().padStart(2, '0')}:00`}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth>
                <InputLabel>End Time</InputLabel>
                <Select
                  value={formData.endTime}
                  onChange={(e) =>
                    setFormData(prev => ({ ...prev, endTime: e.target.value as string }))
                  }
                  label="End Time"
                >
                  {Array.from({ length: 24 }, (_, i) => i).map(hour => (
                    <MenuItem key={hour} value={`${hour.toString().padStart(2, '0')}:00`}>
                      {`${hour.toString().padStart(2, '0')}:00`}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <FormControl fullWidth>
                <InputLabel>Consultation Mode</InputLabel>
                <Select
                  value={formData.mode}
                  onChange={(e) =>
                    setFormData(prev => ({ ...prev, mode: e.target.value as 'video' | 'phone' | 'text' }))
                  }
                  label="Consultation Mode"
                >
                  <MenuItem value="video">Video</MenuItem>
                  <MenuItem value="phone">Phone</MenuItem>
                  <MenuItem value="text">Text Chat</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Switch
                  checked={formData.isInstantEnabled}
                  onChange={(e) =>
                    setFormData(prev => ({ ...prev, isInstantEnabled: e.target.checked }))
                  }
                />
                <Typography>Enable Instant Consultation</Typography>
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveSlot}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
