import { List, Paper, Stack, Typography } from '@mui/material'
import { BulletRow } from '@shared/components/common/BulletRow.tsx'

export function StageCard({ title, points }: { title: string; points: string[] }) {
  return (
    <Paper variant="outlined" sx={{ p: 2.25, borderRadius: 4, height: '100%' }}>
      <Stack spacing={1.5}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
          {title}
        </Typography>
        <List disablePadding>
          {points.map((point) => (
            <BulletRow key={point} text={point} />
          ))}
        </List>
      </Stack>
    </Paper>
  )
}
