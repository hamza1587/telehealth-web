import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded'
import { ListItem, Typography } from '@mui/material'

export function BulletRow({ text }: { text: string }) {
  return (
    <ListItem disableGutters sx={{ py: 0.75 }}>
      <CheckCircleRoundedIcon sx={{ mr: 1.25, color: 'success.main', fontSize: 18 }} />
      <Typography variant="body2">{text}</Typography>
    </ListItem>
  )
}
