import { useRef } from 'react'
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
  // Refs for roving-tabindex arrow-key navigation (4.8)
  const itemRefs = useRef<Array<HTMLDivElement | null>>([])

  function handleKeyDown(e: React.KeyboardEvent, index: number) {
    const count = workspaceDefinitions.length
    let targetIndex: number | null = null

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      targetIndex = (index + 1) % count
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      targetIndex = (index - 1 + count) % count
    } else if (e.key === 'Home') {
      e.preventDefault()
      targetIndex = 0
    } else if (e.key === 'End') {
      e.preventDefault()
      targetIndex = count - 1
    }

    if (targetIndex !== null) {
      onSelect(workspaceDefinitions[targetIndex].key)
      itemRefs.current[targetIndex]?.focus()
    }
  }

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
            <Typography variant="overline" color="text.secondary" id="workspace-nav-label">
              Workspaces
            </Typography>
            {/*
              4.8 — Roving tabindex: only the active item is in the tab order;
              arrow keys move focus and selection between items.
              aria-labelledby points to the "Workspaces" heading above.
            */}
            <List disablePadding role="menu" aria-labelledby="workspace-nav-label">
              {workspaceDefinitions.map((workspace, index) => {
                const isActive = workspace.key === activeKey
                return (
                  <ListItem key={workspace.key} disablePadding sx={{ mb: 1 }}>
                    <ListItemButton
                      role="menuitem"
                      selected={isActive}
                      // 4.4 — aria-current marks the active workspace for screen readers
                      aria-current={isActive ? 'page' : undefined}
                      onClick={() => onSelect(workspace.key)}
                      onKeyDown={(e) => handleKeyDown(e, index)}
                      // Roving tabindex: only active item is reachable by Tab
                      tabIndex={isActive ? 0 : -1}
                      ref={(el) => { itemRefs.current[index] = el }}
                      sx={{
                        borderRadius: 3,
                        alignItems: 'flex-start',
                        border: '1px solid',
                        borderColor: isActive ? 'primary.main' : 'divider',
                        bgcolor: isActive ? 'rgba(21,101,192,0.08)' : 'transparent',
                      }}
                    >
                      {/* 4.4 — aria-hidden on decorative icon avatar */}
                      <Avatar
                        aria-hidden="true"
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
                )
              })}
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
