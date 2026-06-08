import { prisma } from './prisma'

interface LogInput {
  userId?:        string
  method:         string
  path:           string
  statusCode:     number
  responseTimeMs: number
  ip:             string
  userAgent?:     string
  upstream?:      string
  rateLimited:    boolean
}

export async function logRequest(data: LogInput): Promise<void> {
  try {
    await prisma.requestLog.create({ data })
  } catch (err) {
    console.error('[Logger] Erro ao salvar log:', err)
  }
}

export async function getStats() {
  const now       = new Date()
  const startDay  = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const last24h   = new Date(now.getTime() - 24 * 60 * 60 * 1000)

  const [
    totalRequests,
    requestsToday,
    rateLimitedToday,
    avgResponse,
    topPaths,
    topUsers,
    statusBreakdown,
    recentLogs,
    byHour,
  ] = await Promise.all([
    prisma.requestLog.count(),
    prisma.requestLog.count({ where: { createdAt: { gte: startDay } } }),
    prisma.requestLog.count({ where: { rateLimited: true, createdAt: { gte: startDay } } }),
    prisma.requestLog.aggregate({ _avg: { responseTimeMs: true } }),
    prisma.requestLog.groupBy({
      by: ['path'], _count: { path: true },
      orderBy: { _count: { path: 'desc' } }, take: 5,
    }),
    prisma.requestLog.groupBy({
      by: ['userId'], where: { userId: { not: null } },
      _count: { userId: true },
      orderBy: { _count: { userId: 'desc' } }, take: 5,
    }),
    prisma.requestLog.groupBy({
      by: ['statusCode'], _count: { statusCode: true },
      orderBy: { _count: { statusCode: 'desc' } },
    }),
    prisma.requestLog.findMany({
      include: { user: { select: { name: true } } },
      orderBy: { createdAt: 'desc' }, take: 20,
    }),
    prisma.requestLog.findMany({
      where: { createdAt: { gte: last24h } },
      select: { createdAt: true },
    }),
  ])

  // Agrupa por hora
  const hourMap = new Map<string, number>()
  for (let i = 23; i >= 0; i--) {
    const h = new Date(now.getTime() - i * 60 * 60 * 1000)
    hourMap.set(`${h.getHours().toString().padStart(2, '0')}:00`, 0)
  }
  for (const e of byHour) {
    const key = `${new Date(e.createdAt).getHours().toString().padStart(2, '0')}:00`
    hourMap.set(key, (hourMap.get(key) ?? 0) + 1)
  }

  // Busca nomes dos top users
  const userIds = topUsers.map(u => u.userId!).filter(Boolean)
  const users   = await prisma.user.findMany({ where: { id: { in: userIds } }, select: { id: true, name: true } })
  const userMap = new Map(users.map(u => [u.id, u.name]))

  return {
    totalRequests,
    requestsToday,
    rateLimitedToday,
    avgResponseTimeMs: Math.round(avgResponse._avg.responseTimeMs ?? 0),
    topPaths:       topPaths.map(p => ({ path: p.path, count: p._count.path })),
    topUsers:       topUsers.map(u => ({ userId: u.userId!, name: userMap.get(u.userId!) ?? 'Unknown', count: u._count.userId })),
    statusBreakdown: statusBreakdown.map(s => ({ status: String(s.statusCode), count: s._count.statusCode })),
    requestsByHour:  Array.from(hourMap.entries()).map(([hour, count]) => ({ hour, count })),
    recentLogs:      recentLogs.map(l => ({
      ...l,
      userName:  l.user?.name,
      createdAt: l.createdAt.toISOString(),
    })),
  }
}
