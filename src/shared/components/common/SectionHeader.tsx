import { Box, Chip, Stack, Typography } from '@mui/material'

export function SectionHeader({
  eyebrow,
  title,
  status,
  statusColor,
}: {
  eyebrow: string
  title: string
  status: string
  statusColor: 'default' | 'success' | 'warning'
}) {
  return (
    <Stack
      direction={{ xs: 'column', md: 'row' }}
      spacing={2}
      sx={{ justifyContent: 'space-between', alignItems: { md: 'center' } }}
    >
      <Box>
        <Typography variant="overline" color="text.secondary">
          {eyebrow}
        </Typography>
        <Typography variant="h5" sx={{ fontWeight: 800 }}>
          {title}
        </Typography>
      </Box>
      <Chip
        label={status}
        color={statusColor}
        variant={statusColor === 'default' ? 'outlined' : 'filled'}
      />
    </Stack>
  )
}
