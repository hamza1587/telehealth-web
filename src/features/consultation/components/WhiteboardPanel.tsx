import { useRef, useEffect, useState, useCallback } from 'react'
import {
  Box, Stack, IconButton, Tooltip, Slider, Select, MenuItem,
  Typography, Divider, Paper,
} from '@mui/material'
import {
  Brush as BrushIcon,
  RadioButtonUnchecked as CircleIcon,
  CropSquare as RectIcon,
  HorizontalRule as LineIcon,
  DeleteOutline as ClearIcon,
  Undo as UndoIcon,
  Download as DownloadIcon,
} from '@mui/icons-material'

type Tool = 'pen' | 'line' | 'rect' | 'circle' | 'eraser'

interface WhiteboardPanelProps {
  roomName?: string
  height?: number
}

const COLORS = ['#000000', '#ef4444', '#3b82f6', '#22c55e', '#f59e0b', '#8b5cf6', '#ffffff']

export function WhiteboardPanel({ height = 500 }: WhiteboardPanelProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const overlayRef = useRef<HTMLCanvasElement>(null)
  const historyRef = useRef<ImageData[]>([])

  const [tool, setTool] = useState<Tool>('pen')
  const [color, setColor] = useState('#000000')
  const [lineWidth, setLineWidth] = useState(3)
  const [drawing, setDrawing] = useState(false)
  const startRef = useRef<{ x: number; y: number } | null>(null)

  const getCtx = () => canvasRef.current?.getContext('2d') ?? null
  const getOverlay = () => overlayRef.current?.getContext('2d') ?? null

  const getPos = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current!
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height

    if ('touches' in e) {
      const t = e.touches[0]
      return {
        x: (t.clientX - rect.left) * scaleX,
        y: (t.clientY - rect.top) * scaleY,
      }
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    }
  }

  const saveSnapshot = useCallback(() => {
    const ctx = getCtx()
    if (!ctx || !canvasRef.current) return
    historyRef.current.push(ctx.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height))
    if (historyRef.current.length > 50) historyRef.current.shift()
  }, [])

  const undo = useCallback(() => {
    const ctx = getCtx()
    if (!ctx || historyRef.current.length === 0) return
    const snapshot = historyRef.current.pop()!
    ctx.putImageData(snapshot, 0, 0)
  }, [])

  const clear = useCallback(() => {
    const ctx = getCtx()
    if (!ctx || !canvasRef.current) return
    saveSnapshot()
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height)
  }, [saveSnapshot])

  // Init canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  }, [])

  const applyCtxStyle = (ctx: CanvasRenderingContext2D) => {
    ctx.strokeStyle = tool === 'eraser' ? '#ffffff' : color
    ctx.lineWidth = tool === 'eraser' ? lineWidth * 4 : lineWidth
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
  }

  const onPointerDown = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault()
    const pos = getPos(e)
    setDrawing(true)
    startRef.current = pos

    if (tool === 'pen' || tool === 'eraser') {
      const ctx = getCtx()!
      saveSnapshot()
      applyCtxStyle(ctx)
      ctx.beginPath()
      ctx.moveTo(pos.x, pos.y)
    }
  }

  const onPointerMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!drawing) return
    e.preventDefault()
    const pos = getPos(e)

    if (tool === 'pen' || tool === 'eraser') {
      const ctx = getCtx()!
      applyCtxStyle(ctx)
      ctx.lineTo(pos.x, pos.y)
      ctx.stroke()
    } else {
      // Shape preview on overlay
      const ov = getOverlay()!
      const canvas = overlayRef.current!
      ov.clearRect(0, 0, canvas.width, canvas.height)
      const start = startRef.current!
      applyCtxStyle(ov)
      ov.beginPath()
      if (tool === 'line') {
        ov.moveTo(start.x, start.y)
        ov.lineTo(pos.x, pos.y)
      } else if (tool === 'rect') {
        ov.strokeRect(start.x, start.y, pos.x - start.x, pos.y - start.y)
      } else if (tool === 'circle') {
        const rx = (pos.x - start.x) / 2
        const ry = (pos.y - start.y) / 2
        ov.ellipse(start.x + rx, start.y + ry, Math.abs(rx), Math.abs(ry), 0, 0, 2 * Math.PI)
      }
      ov.stroke()
    }
  }

  const onPointerUp = (e: React.MouseEvent | React.TouchEvent) => {
    if (!drawing) return
    setDrawing(false)
    const pos = getPos(e)

    if (tool !== 'pen' && tool !== 'eraser') {
      const ctx = getCtx()!
      const ov = getOverlay()!
      const start = startRef.current!
      applyCtxStyle(ctx)
      ctx.beginPath()
      if (tool === 'line') {
        ctx.moveTo(start.x, start.y)
        ctx.lineTo(pos.x, pos.y)
      } else if (tool === 'rect') {
        ctx.strokeRect(start.x, start.y, pos.x - start.x, pos.y - start.y)
      } else if (tool === 'circle') {
        const rx = (pos.x - start.x) / 2
        const ry = (pos.y - start.y) / 2
        ctx.ellipse(start.x + rx, start.y + ry, Math.abs(rx), Math.abs(ry), 0, 0, 2 * Math.PI)
      }
      ctx.stroke()
      ov.clearRect(0, 0, overlayRef.current!.width, overlayRef.current!.height)
    }
  }

  const download = () => {
    const canvas = canvasRef.current!
    const link = document.createElement('a')
    link.download = 'whiteboard.png'
    link.href = canvas.toDataURL('image/png')
    link.click()
  }

  const tools: Array<{ key: Tool; icon: React.ReactNode; label: string }> = [
    { key: 'pen', icon: <BrushIcon fontSize="small" />, label: 'Pen' },
    { key: 'line', icon: <LineIcon fontSize="small" />, label: 'Line' },
    { key: 'rect', icon: <RectIcon fontSize="small" />, label: 'Rectangle' },
    { key: 'circle', icon: <CircleIcon fontSize="small" />, label: 'Ellipse' },
    { key: 'eraser', icon: '⌫', label: 'Eraser' },
  ]

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Toolbar */}
      <Paper variant="outlined" sx={{ px: 1.5, py: 1 }}>
        <Stack direction="row" spacing={0.5} alignItems="center" flexWrap="wrap" useFlexGap>
          {tools.map(t => (
            <Tooltip key={t.key} title={t.label}>
              <IconButton
                size="small"
                onClick={() => setTool(t.key)}
                sx={{
                  bgcolor: tool === t.key ? 'primary.main' : 'transparent',
                  color: tool === t.key ? 'white' : 'text.primary',
                  borderRadius: 1,
                }}
              >
                {t.icon}
              </IconButton>
            </Tooltip>
          ))}

          <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

          {COLORS.map(c => (
            <Box
              key={c}
              onClick={() => setColor(c)}
              sx={{
                width: 22, height: 22, borderRadius: '50%',
                bgcolor: c,
                border: color === c ? '2px solid' : '2px solid transparent',
                borderColor: color === c ? 'primary.main' : 'transparent',
                outline: c === '#ffffff' ? '1px solid #ddd' : 'none',
                cursor: 'pointer',
                flexShrink: 0,
              }}
            />
          ))}

          <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

          <Box sx={{ width: 80 }}>
            <Slider
              size="small"
              min={1}
              max={20}
              value={lineWidth}
              onChange={(_, v) => setLineWidth(v as number)}
            />
          </Box>

          <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

          <Tooltip title="Undo">
            <IconButton size="small" onClick={undo}><UndoIcon fontSize="small" /></IconButton>
          </Tooltip>
          <Tooltip title="Clear">
            <IconButton size="small" onClick={clear} color="error"><ClearIcon fontSize="small" /></IconButton>
          </Tooltip>
          <Tooltip title="Download">
            <IconButton size="small" onClick={download}><DownloadIcon fontSize="small" /></IconButton>
          </Tooltip>
        </Stack>
      </Paper>

      {/* Canvas */}
      <Box sx={{ position: 'relative', flexGrow: 1, cursor: tool === 'eraser' ? 'cell' : 'crosshair' }}>
        <canvas
          ref={canvasRef}
          width={1280}
          height={720}
          style={{ width: '100%', height: '100%', display: 'block', touchAction: 'none' }}
          onMouseDown={onPointerDown}
          onMouseMove={onPointerMove}
          onMouseUp={onPointerUp}
          onMouseLeave={onPointerUp}
          onTouchStart={onPointerDown}
          onTouchMove={onPointerMove}
          onTouchEnd={onPointerUp}
        />
        <canvas
          ref={overlayRef}
          width={1280}
          height={720}
          style={{
            position: 'absolute', inset: 0, width: '100%', height: '100%',
            pointerEvents: 'none', touchAction: 'none',
          }}
        />
      </Box>
    </Box>
  )
}
