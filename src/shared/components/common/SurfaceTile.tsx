import { List, Paper, Stack, Typography } from '@mui/material'
import { BulletRow } from '@shared/components/common/BulletRow.tsx'

export function SurfaceTile({ title, items }: { title: string; items: string[] }) {
  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2.25,
        borderRadius: 4,
        height: '100%',
        background: 'linear-gradient(180deg, rgba(250,252,255,0.98), rgba(244,248,245,0.94))',
      }}
    >
      <Stack spacing={1.5}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
          {title}
        </Typography>
        <List disablePadding>
          {items.map((item) => (
            <BulletRow key={item} text={item} />
          ))}
        </List>
      </Stack>
    </Paper>
  )
}
