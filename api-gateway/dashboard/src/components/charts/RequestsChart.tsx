import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const Tip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return <div style={{ background: '#1a1d2e', border: '1px solid #2d3148', borderRadius: 8, padding: '8px 12px', fontSize: 12 }}>
    <div style={{ color: '#94a3b8', marginBottom: 4 }}>{label}</div>
    <div style={{ color: '#818cf8', fontWeight: 600 }}>{payload[0].value} requests</div>
  </div>
}

export function RequestsChart({ data }: { data: { hour: string; count: number }[] }) {
  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: '16px 18px' }}>
      <div style={{ fontSize: 11, fontWeight: 500, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 14 }}>Requests por hora (24h)</div>
      <ResponsiveContainer width="100%" height={180}>
        <AreaChart data={data} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
          <defs>
            <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#818cf8" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#818cf8" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e2130" />
          <XAxis dataKey="hour" tick={{ fontSize: 10, fill: '#475569' }} tickLine={false} axisLine={false} interval={3} />
          <YAxis tick={{ fontSize: 10, fill: '#475569' }} tickLine={false} axisLine={false} />
          <Tooltip content={<Tip />} />
          <Area type="monotone" dataKey="count" stroke="#818cf8" strokeWidth={2} fill="url(#g1)" dot={false} activeDot={{ r: 4, fill: '#818cf8' }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
