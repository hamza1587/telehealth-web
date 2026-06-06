import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts'
import { useTheme } from '@mui/material'

interface AreaSeries {
  key: string;
  label: string;
  color?: string;
}

interface TelehealthAreaChartProps {
  data: Record<string, string | number>[];
  xKey: string;
  series: AreaSeries[];
  height?: number;
  yTickFormatter?: (v: number) => string;
}

export function TelehealthAreaChart({
  data,
  xKey,
  series,
  height = 260,
  yTickFormatter,
}: TelehealthAreaChartProps) {
  const theme = useTheme()
  const defaultColors = [theme.palette.primary.main, theme.palette.secondary.main]

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
        <defs>
          {series.map((s, i) => {
            const color = s.color ?? defaultColors[i % defaultColors.length]
            return (
              <linearGradient key={s.key} id={`grad-${s.key}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                <stop offset="95%" stopColor={color} stopOpacity={0.02} />
              </linearGradient>
            )
          })}
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
        <XAxis dataKey={xKey} tick={{ fontSize: 11 }} />
        <YAxis tick={{ fontSize: 11 }} tickFormatter={yTickFormatter} width={48} />
        <Tooltip formatter={yTickFormatter ? (v: number) => yTickFormatter(v) : undefined} />
        <Legend />
        {series.map((s, i) => {
          const color = s.color ?? defaultColors[i % defaultColors.length]
          return (
            <Area
              key={s.key}
              type="monotone"
              dataKey={s.key}
              name={s.label}
              stroke={color}
              strokeWidth={2}
              fill={`url(#grad-${s.key})`}
              dot={false}
            />
          )
        })}
      </AreaChart>
    </ResponsiveContainer>
  )
}
