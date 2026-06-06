import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
} from 'recharts'
import { useTheme } from '@mui/material'

interface BarSeries {
  key: string;
  label: string;
  color?: string;
}

interface TelehealthBarChartProps {
  data: Record<string, string | number>[];
  xKey: string;
  series: BarSeries[];
  height?: number;
  yTickFormatter?: (v: number) => string;
  colorByCategory?: boolean;
}

const CATEGORY_COLORS = ['#1565c0', '#00897b', '#e53935', '#fb8c00', '#8e24aa', '#00acc1', '#43a047']

export function TelehealthBarChart({
  data,
  xKey,
  series,
  height = 260,
  yTickFormatter,
  colorByCategory = false,
}: TelehealthBarChartProps) {
  const theme = useTheme()
  const defaultColors = [theme.palette.primary.main, theme.palette.secondary.main]

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
        <XAxis dataKey={xKey} tick={{ fontSize: 11 }} />
        <YAxis tick={{ fontSize: 11 }} tickFormatter={yTickFormatter} width={48} />
        <Tooltip formatter={yTickFormatter ? (v: number) => yTickFormatter(v) : undefined} />
        {!colorByCategory && <Legend />}
        {series.map((s, i) => (
          <Bar key={s.key} dataKey={s.key} name={s.label} fill={s.color ?? defaultColors[i % defaultColors.length]} radius={[3, 3, 0, 0]}>
            {colorByCategory
              ? data.map((_, idx) => <Cell key={idx} fill={CATEGORY_COLORS[idx % CATEGORY_COLORS.length]} />)
              : null}
          </Bar>
        ))}
      </BarChart>
    </ResponsiveContainer>
  )
}
