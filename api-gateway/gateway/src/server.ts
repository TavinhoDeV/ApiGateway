import 'dotenv/config'
import Fastify from 'fastify'
import fjwt from '@fastify/jwt'
import cors from '@fastify/cors'
import { prisma } from './services/prisma'
import { authRoutes } from './routes/auth'
import { proxyRoutes } from './routes/proxy'
import { adminRoutes } from './routes/admin'
import { seedDatabase } from './services/seed'

const app = Fastify({ logger: { transport: { target: 'pino-pretty', options: { colorize: true } } } })

// Plugins
app.register(cors, { origin: true })
app.register(fjwt, { secret: process.env.JWT_SECRET ?? 'supersecret_change_in_production' })

// Decorator para usar app.authenticate nos hooks
app.decorate('authenticate', async (req: any, reply: any) => {
  try { await req.jwtVerify() }
  catch { reply.status(401).send({ error: 'Unauthorized' }) }
})

// Logging middleware para todas as rotas não-proxy
app.addHook('onResponse', async (req, reply) => {
  if (req.url.startsWith('/proxy/')) return // proxy já loga por conta própria
  const { logRequest } = await import('./services/logger')
  let userId: string | undefined
  try { const u = req.user as any; userId = u?.sub } catch {}
  await logRequest({
    userId, method: req.method, path: req.url,
    statusCode: reply.statusCode,
    responseTimeMs: Math.round(reply.elapsedTime),
    ip: req.ip, userAgent: req.headers['user-agent'],
    rateLimited: false,
  })
})

// Routes
app.register(authRoutes)
app.register(proxyRoutes)
app.register(adminRoutes)

// Start
const PORT = Number(process.env.PORT ?? 3001)

app.listen({ port: PORT, host: '0.0.0.0' }, async (err) => {
  if (err) { app.log.error(err); process.exit(1) }
  await prisma.$connect()
  await seedDatabase()
  app.log.info(`🚀 API Gateway rodando em http://localhost:${PORT}`)
  app.log.info(`📖 Endpoints disponíveis:`)
  app.log.info(`   POST /auth/register`)
  app.log.info(`   POST /auth/login`)
  app.log.info(`   GET  /auth/me`)
  app.log.info(`   GET  /proxy/posts/*`)
  app.log.info(`   GET  /proxy/jokes/*`)
  app.log.info(`   GET  /admin/stats`)
  app.log.info(`   GET  /admin/logs`)
  app.log.info(`   GET  /health`)
})

export default app
