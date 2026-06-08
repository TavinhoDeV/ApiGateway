import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'

const STATUS_COLORS: Record<string, string> = {
  '200': '#4ade80', '201': '#60a5fa', '400': '#fbbf24',
  '401': '#fb923c', '404': '#94a3b8', '429': '#f87171', '502': '#e879f9',
}

const Tip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null
  return <div style={{ background: '#1a1d2e', border: '1px solid #2d3148', borderRadius: 8, padding: '8px 12px', fontSize: 12 }}>
    <div style={{ color: STATUS_COLORS[payload[0].name] ?? '#fff', fontWeight: 600 }}>HTTP {payload[0].name}</div>
    <div style={{ color: '#94a3b8' }}>{payload[0].value} requests</div>
  </div>
}

export function StatusChart({ data }: { data: { status: string; count: number }[] }) {
  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: '16px 18px' }}>
      <div style={{ fontSize: 11, fontWeight: 500, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 8 }}>Status HTTP</div>
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie data={data} dataKey="count" nameKey="status" cx="50%" cy="45%" innerRadius={50} outerRadius={75} paddingAngle={3}>
            {data.map(e => <Cell key={e.status} fill={STATUS_COLORS[e.status] ?? '#64748b'} />)}
          </Pie>
          <Tooltip content={<Tip />} />
          <Legend iconType="circle" iconSize={8} formatter={(v) => <span style={{ color: '#94a3b8', fontSize: 11 }}>HTTP {v}</span>} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
