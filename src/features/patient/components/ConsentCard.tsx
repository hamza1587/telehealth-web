import type { PropsWithChildren } from 'react'
import { Paper, Stack, Typography } from '@mui/material'

export function ConsentCard({ title, children }: PropsWithChildren<{ title: string }>) {
  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2.25,
        borderRadius: 4,
        height: '100%',
        background: 'linear-gradient(180deg, rgba(248,250,252,0.96), rgba(242,247,244,0.94))',
      }}
    >
      <Stack spacing={1.25}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
          {title}
        </Typography>
        {children}
      </Stack>
    </Paper>
  )
}
