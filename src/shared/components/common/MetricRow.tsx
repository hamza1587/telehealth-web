import { Box, Typography } from '@mui/material'

export function MetricRow({ label, value }: { label: string; value: string }) {
  return (
    <Box>
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body1" sx={{ fontWeight: 700, wordBreak: 'break-word' }}>
        {value}
      </Typography>
    </Box>
  )
}
