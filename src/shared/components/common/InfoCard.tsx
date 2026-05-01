import type { PropsWithChildren } from 'react'
import { Box, Card, CardContent, Stack, Typography } from '@mui/material'

export function InfoCard({
  eyebrow,
  title,
  children,
}: PropsWithChildren<{ eyebrow: string; title: string }>) {
  return (
    <Card sx={{ borderRadius: 5 }}>
      <CardContent>
        <Stack spacing={2}>
          <Box>
            <Typography variant="overline" color="text.secondary">
              {eyebrow}
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              {title}
            </Typography>
          </Box>
          {children}
        </Stack>
      </CardContent>
    </Card>
  )
}
