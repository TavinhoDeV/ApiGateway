import { useAuth } from '../hooks/useAuth'
import { useStats } from '../hooks/useStats'
import { RequestsChart } from '../components/charts/RequestsChart'
import { StatusChart } from '../components/charts/StatusChart'

const card = (icon: string, label: string, value: string | number, sub: string, accent: string) => (
  <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: '16px 18px', borderTop: `2px solid ${accent}` }}>
    <div style={{ width: 30, height: 30, borderRadius: 8, background: `${accent}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, marginBottom: 10 }}>{icon}</div>
    <div style={{ fontSize: 26, fontWeight: 600, color: 'var(--text-1)', lineHeight: 1 }}>{value}</div>
    <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 4, textTransform: 'uppercase', letterSpacing: '.05em' }}>{label}</div>
    <div style={{ fontSize: 11, color: 'var(--text-4)', marginTop: 2 }}>{sub}</div>
  </div>
)

function timeAgo(date: string) {
  const s = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
  if (s < 60) return `${s}s`; if (s < 3600) return `${Math.floor(s/60)}m`; return `${Math.floor(s/3600)}h`
}

const METHOD_COLORS: Record<string, string> = { GET: '#4ade80', POST: '#818cf8', PUT: '#fbbf24', DELETE: '#f87171', PATCH: '#60a5fa' }
const STATUS_COLORS: Record<string, string> = { '2': '#4ade80', '4': '#fbbf24', '5': '#f87171' }

export function DashboardPage() {
  const { user, logout } = useAuth()
  const { stats, loading, error } = useStats(5000)

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', flexDirection: 'column', gap: 14 }}>
      <div style={{ width: 28, height: 28, border: '2px solid var(--border2)', borderTopColor: 'var(--indigo)', borderRadius: '50%', animation: 'spin .7s linear infinite' }} />
      <p style={{ color: 'var(--text-3)', fontSize: 13 }}>Carregando métricas...</p>
    </div>
  )

  if (error) return <div style={{ padding: 40, color: 'var(--red)', textAlign: 'center' }}>{error}</div>
  if (!stats) return null

  return (
    <div style={{ minHeight: '100vh' }}>
      {/* Topbar */}
      <header style={{ position: 'sticky', top: 0, zIndex: 10, background: 'var(--surface)', borderBottom: '1px solid var(--border)', padding: '0 28px', height: 54, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: '#1e2040', border: '1px solid #2d3370', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>🔀</div>
          <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-2)' }}>API Gateway</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'var(--green)', fontWeight: 600 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--green)', display: 'inline-block', animation: 'blink 2s infinite' }} />LIVE
          </span>
          <span style={{ fontSize: 12, color: 'var(--text-3)' }}>{user?.name}</span>
          <button onClick={logout} style={{ background: 'var(--border)', border: 'none', borderRadius: 6, padding: '5px 12px', color: 'var(--text-2)', fontSize: 12, cursor: 'pointer' }}>Sair</button>
        </div>
      </header>

      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 28px' }}>
        {/* Summary cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
          {card('⚡', 'Total Requests', stats.totalRequests, 'histórico completo', '#818cf8')}
          {card('📅', 'Requests Hoje', stats.requestsToday, 'últimas 24h', '#60a5fa')}
          {card('🚫', 'Rate Limited', stats.rateLimitedToday, 'bloqueados hoje', '#f87171')}
          {card('⏱', 'Tempo Médio', `${stats.avgResponseTimeMs}ms`, 'tempo de resposta', '#fbbf24')}
        </div>

        {/* Charts */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 16, marginBottom: 16 }}>
          <RequestsChart data={stats.requestsByHour} />
          <StatusChart data={stats.statusBreakdown} />
        </div>

        {/* Top paths + Top users */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: '16px 18px' }}>
            <div style={{ fontSize: 11, fontWeight: 500, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 14 }}>Top Endpoints</div>
            {stats.topPaths.map((p, i) => {
              const max = stats.topPaths[0]?.count ?? 1
              return (
                <div key={p.path} style={{ marginBottom: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 12, color: 'var(--text-2)', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: 10, color: 'var(--text-4)', width: 14 }}>#{i+1}</span>{p.path}
                    </span>
                    <span style={{ fontSize: 12, color: 'var(--text-3)' }}>{p.count}</span>
                  </div>
                  <div style={{ height: 4, background: 'var(--border)', borderRadius: 2 }}>
                    <div style={{ height: '100%', width: `${(p.count/max)*100}%`, background: '#818cf855', borderRadius: 2 }} />
                  </div>
                </div>
              )
            })}
          </div>

          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: '16px 18px' }}>
            <div style={{ fontSize: 11, fontWeight: 500, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 14 }}>Top Usuários</div>
            {stats.topUsers.map((u, i) => {
              const max = stats.topUsers[0]?.count ?? 1
              return (
                <div key={u.userId} style={{ marginBottom: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 12, color: 'var(--text-2)', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: 10, color: 'var(--text-4)', width: 14 }}>#{i+1}</span>{u.name}
                    </span>
                    <span style={{ fontSize: 12, color: 'var(--text-3)' }}>{u.count}</span>
                  </div>
                  <div style={{ height: 4, background: 'var(--border)', borderRadius: 2 }}>
                    <div style={{ height: '100%', width: `${(u.count/max)*100}%`, background: '#4ade8055', borderRadius: 2 }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Logs table */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
          <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 11, fontWeight: 500, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.07em' }}>Logs Recentes</span>
            <span style={{ fontSize: 11, color: 'var(--text-4)' }}>Atualiza a cada 5s</span>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#12152a' }}>
                {['Método', 'Path', 'Status', 'Tempo', 'Usuário', 'IP', 'Upstream', 'Quando'].map(h => (
                  <th key={h} style={{ padding: '8px 14px', textAlign: 'left', fontSize: 10, color: 'var(--text-4)', textTransform: 'uppercase', letterSpacing: '.06em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {stats.recentLogs.map((l: any, i: number) => {
                const sc   = String(l.statusCode)
                const scCl = STATUS_COLORS[sc[0]] ?? 'var(--text-3)'
                const mc   = METHOD_COLORS[l.method] ?? 'var(--text-2)'
                return (
                  <tr key={l.id} style={{ borderTop: i > 0 ? '1px solid var(--border)' : 'none', background: l.rateLimited ? '#450a0a11' : 'transparent' }}>
                    <td style={{ padding: '9px 14px' }}>
                      <span style={{ fontSize: 11, fontWeight: 600, color: mc, background: `${mc}22`, padding: '2px 7px', borderRadius: 4 }}>{l.method}</span>
                    </td>
                    <td style={{ padding: '9px 14px', fontSize: 12, color: 'var(--text-2)', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.path}</td>
                    <td style={{ padding: '9px 14px' }}>
                      <span style={{ fontSize: 11, fontWeight: 600, color: scCl, background: `${scCl}22`, padding: '2px 7px', borderRadius: 4 }}>{l.statusCode}</span>
                    </td>
                    <td style={{ padding: '9px 14px', fontSize: 12, color: l.responseTimeMs > 500 ? 'var(--yellow)' : 'var(--text-3)' }}>{l.responseTimeMs}ms</td>
                    <td style={{ padding: '9px 14px', fontSize: 11, color: 'var(--text-3)' }}>{l.userName ?? '—'}</td>
                    <td style={{ padding: '9px 14px', fontSize: 11, color: 'var(--text-4)', fontFamily: 'monospace' }}>{l.ip}</td>
                    <td style={{ padding: '9px 14px', fontSize: 11, color: 'var(--text-4)' }}>{l.upstream ?? '—'}</td>
                    <td style={{ padding: '9px 14px', fontSize: 11, color: 'var(--text-4)' }}>{timeAgo(l.createdAt)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  )
}
