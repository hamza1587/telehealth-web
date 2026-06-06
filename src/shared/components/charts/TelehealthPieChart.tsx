import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts'

interface PieDataItem {
  name: string;
  value: number;
}

interface TelehealthPieChartProps {
  data: PieDataItem[];
  height?: number;
  valueFormatter?: (v: number) => string;
}

const COLORS = ['#1565c0', '#00897b', '#e53935', '#fb8c00', '#8e24aa', '#00acc1', '#43a047', '#6d4c41']

export function TelehealthPieChart({ data, height = 260, valueFormatter }: TelehealthPieChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius="35%"
          outerRadius="65%"
          paddingAngle={2}
          dataKey="value"
        >
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip formatter={valueFormatter ? (v: number) => valueFormatter(v) : undefined} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  )
}
