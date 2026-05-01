import { Avatar, Card, CardContent, Chip, List, ListItem, ListItemButton, ListItemText, Paper, Stack, Typography } from '@mui/material'
import { InfoCard } from '@shared/components/common/InfoCard.tsx'
import { MetricRow } from '@shared/components/common/MetricRow.tsx'
import { workspaceDefinitions } from '@shared/config/workspaces.tsx'
import type { WorkspaceKey } from '@shared/types/workspace.ts'

export function Sidebar({
  activeKey,
  onSelect,
  statusMessage,
}: {
  activeKey: WorkspaceKey
  onSelect: (key: WorkspaceKey) => void
  statusMessage: string
}) {
  return (
    <Stack spacing={3}>
      <Paper
        elevation={0}
        sx={{
          p: 3,
          borderRadius: 6,
          border: '1px solid',
          borderColor: 'divider',
          background:
            'linear-gradient(160deg, rgba(10,61,145,0.98), rgba(16,34,53,0.96) 55%, rgba(0,137,123,0.9))',
          color: 'common.white',
        }}
      >
        <Stack spacing={2}>
          <Chip
            label="EU Teleconsultation MVP"
            sx={{
              alignSelf: 'flex-start',
              bgcolor: 'rgba(255,255,255,0.14)',
              color: 'common.white',
              fontWeight: 700,
            }}
          />
          <Typography variant="h4" sx={{ fontWeight: 800 }}>
            Phase 1 product surfaces are now mapped into one UI system.
          </Typography>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.78)' }}>
            Sidebar-based workspace architecture is ready for patient, doctor, booking, consultation, billing, clinical, and operations modules.
          </Typography>
        </Stack>
      </Paper>

      <Card sx={{ borderRadius: 5 }}>
        <CardContent>
          <Stack spacing={1.5}>
            <Typography variant="overline" color="text.secondary">
              Workspaces
            </Typography>
            <List disablePadding>
              {workspaceDefinitions.map((workspace) => (
                <ListItem key={workspace.key} disablePadding sx={{ mb: 1 }}>
                  <ListItemButton
                    selected={workspace.key === activeKey}
                    onClick={() => onSelect(workspace.key)}
                    sx={{
                      borderRadius: 3,
                      alignItems: 'flex-start',
                      border: '1px solid',
                      borderColor: workspace.key === activeKey ? 'primary.main' : 'divider',
                      bgcolor: workspace.key === activeKey ? 'rgba(21,101,192,0.08)' : 'transparent',
                    }}
                  >
                    <Avatar
                      sx={{
                        mr: 1.5,
                        bgcolor: workspace.accent,
                        width: 40,
                        height: 40,
                      }}
                    >
                      {workspace.icon}
                    </Avatar>
                    <ListItemText primary={workspace.label} secondary={workspace.subtitle} />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Stack>
        </CardContent>
      </Card>

      <InfoCard title="Platform signal" eyebrow="Current status">
        <Stack spacing={1.5}>
          <MetricRow label="UI foundation" value="MUI design system" />
          <MetricRow label="Feature structure" value="Split by app/shared/features" />
          <MetricRow label="Languages" value="Provider-based setup" />
          <MetricRow label="System note" value={statusMessage} />
        </Stack>
      </InfoCard>
    </Stack>
  )
}
