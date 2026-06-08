import type { FastifyInstance } from 'fastify'
import { getStats } from '../services/logger'
import { prisma } from '../services/prisma'

export async function adminRoutes(app: FastifyInstance) {

  // GET /admin/stats — dashboard metrics
  app.get('/admin/stats', { preHandler: [app.authenticate] }, async (req, reply) => {
    const stats = await getStats()
    return reply.send(stats)
  })

  // GET /admin/logs — request logs with pagination
  app.get('/admin/logs', { preHandler: [app.authenticate] }, async (req, reply) => {
    const { page = '1', limit = '20', status, path } = req.query as Record<string, string>
    const skip = (Number(page) - 1) * Number(limit)

    const where: Record<string, unknown> = {}
    if (status) where.statusCode = Number(status)
    if (path) where.path = { contains: path }

    const [logs, total] = await Promise.all([
      prisma.requestLog.findMany({
        where,
        include: { user: { select: { name: true } } },
        orderBy: { createdAt: 'desc' },
        skip, take: Number(limit),
      }),
      prisma.requestLog.count({ where }),
    ])

    return reply.send({
      data:  logs.map(l => ({ ...l, userName: l.user?.name, createdAt: l.createdAt.toISOString() })),
      total, page: Number(page), limit: Number(limit),
      pages: Math.ceil(total / Number(limit)),
    })
  })

  // GET /admin/users — list users
  app.get('/admin/users', { preHandler: [app.authenticate] }, async (_req, reply) => {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, plan: true, role: true, active: true, apiKey: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    })
    return reply.send(users.map(u => ({ ...u, createdAt: u.createdAt.toISOString() })))
  })

  // GET /health
  app.get('/health', async (_req, reply) => {
    return reply.send({ status: 'ok', timestamp: new Date().toISOString(), uptime: process.uptime() })
  })
}
