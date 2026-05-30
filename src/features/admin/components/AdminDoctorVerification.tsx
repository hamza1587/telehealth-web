import {
  Box, Typography, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, Chip, Avatar, Stack,
  CircularProgress, Alert, Badge, IconButton,
} from '@mui/material'
import {
  Verified, Pending, Visibility,
  Error as ErrorIcon, CheckCircle as CheckIcon,
  Public as PublicIcon,
} from '@mui/icons-material'

interface DoctorVerification {
  id: string
  doctorName: string
  email: string
  specialty: string
  countryCode: string
  education: string[]
  verificationStatus: 'Pending' | 'Verified' | 'Rejected'
  submittedAt: string
  documents: { name: string; url: string }[]
}

interface AdminDoctorsProps {
  doctors: DoctorVerification[]
  loading: boolean
  error: string | null
  onVerify: (doctorId: string) => void
  onReject: (doctorId: string) => void
}

export function AdminDoctorVerification({
  doctors,
  loading,
  error,
  onVerify,
  onReject,
}: AdminDoctorsProps) {
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

  if (doctors.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 6 }}>
        <PublicIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
        <Typography variant="h6" color="text.secondary">
          No pending verifications
        </Typography>
        <Typography variant="body2" color="text.disabled">
          Doctor verification requests will appear here.
        </Typography>
      </Box>
    )
  }

  return (
    <TableContainer component={Paper} variant="outlined">
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Doctor</TableCell>
            <TableCell>Specialty</TableCell>
            <TableCell>Country</TableCell>
            <TableCell>Documents</TableCell>
            <TableCell>Submitted</TableCell>
            <TableCell>Status</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {doctors.map((doc) => (
            <TableRow key={doc.id} hover>
              <TableCell>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Avatar sx={{ bgcolor: 'primary.light', width: 32, height: 32 }}>
                    {doc.doctorName[0]}
                  </Avatar>
                  <Box>
                    <Typography variant="body2" fontWeight={600}>{doc.doctorName}</Typography>
                    <Typography variant="caption" color="text.secondary">{doc.email}</Typography>
                  </Box>
                </Stack>
              </TableCell>
              <TableCell>{doc.specialty}</TableCell>
              <TableCell>{doc.countryCode}</TableCell>
              <TableCell>
                <Badge badgeContent={doc.documents.length} color="primary" max={99}>
                  <PublicIcon />
                </Badge>
              </TableCell>
              <TableCell>
                {new Date(doc.submittedAt).toLocaleDateString()}
              </TableCell>
              <TableCell>
                <Chip
                  icon={doc.verificationStatus === 'Verified' ? <Verified fontSize="small" /> :
                    doc.verificationStatus === 'Rejected' ? <ErrorIcon fontSize="small" /> :
                      <Pending fontSize="small" />}
                  label={doc.verificationStatus}
                  color={
                    doc.verificationStatus === 'Verified' ? 'success' :
                      doc.verificationStatus === 'Rejected' ? 'error' : 'warning'
                  }
                  size="small"
                  variant="outlined"
                />
              </TableCell>
              <TableCell align="right">
                <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                  <IconButton size="small" color="success" onClick={() => onVerify(doc.id)}>
                    <CheckIcon />
                  </IconButton>
                  <IconButton size="small" color="error" onClick={() => onReject(doc.id)}>
                    <ErrorIcon />
                  </IconButton>
                  <IconButton size="small">
                    <Visibility />
                  </IconButton>
                </Stack>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}