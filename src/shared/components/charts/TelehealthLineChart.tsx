import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts'
import { useTheme } from '@mui/material'

interface LineSeries {
  key: string;
  label: string;
  color?: string;
}

interface TelehealthLineChartProps {
  data: Record<string, string | number>[];
  xKey: string;
  series: LineSeries[];
  height?: number;
  yTickFormatter?: (v: number) => string;
}

export function TelehealthLineChart({
  data,
  xKey,
  series,
  height = 260,
  yTickFormatter,
}: TelehealthLineChartProps) {
  const theme = useTheme()
  const defaultColors = [theme.palette.primary.main, theme.palette.secondary.main, '#e53935', '#fb8c00']

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
        <XAxis dataKey={xKey} tick={{ fontSize: 11 }} />
        <YAxis tick={{ fontSize: 11 }} tickFormatter={yTickFormatter} width={48} />
        <Tooltip formatter={yTickFormatter ? (v: number) => yTickFormatter(v) : undefined} />
        <Legend />
        {series.map((s, i) => (
          <Line
            key={s.key}
            type="monotone"
            dataKey={s.key}
            name={s.label}
            stroke={s.color ?? defaultColors[i % defaultColors.length]}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  )
}
