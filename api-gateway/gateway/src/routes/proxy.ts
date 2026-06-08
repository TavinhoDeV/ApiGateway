import type { FastifyInstance } from 'fastify'
import { checkRateLimit } from '../services/rateLimiter'
import { logRequest } from '../services/logger'
import { UPSTREAM_SERVICES } from '../types'
import type { JwtPayload } from '../types'

export async function proxyRoutes(app: FastifyInstance) {
  for (const service of UPSTREAM_SERVICES) {
    app.all(`${service.prefix}/*`, async (req, reply) => {
      const start = Date.now()
      const ip    = req.ip
      let user: JwtPayload | undefined

      try { await req.jwtVerify(); user = req.user as JwtPayload } catch {}

      // Rate limit check
      const rl = await checkRateLimit(ip, user)
      reply.header('X-RateLimit-Limit',     rl.limit)
      reply.header('X-RateLimit-Remaining', rl.remaining)
      reply.header('X-RateLimit-Reset',     Math.ceil(rl.resetMs / 1000))

      if (!rl.allowed) {
        await logRequest({
          userId: user?.sub, method: req.method, path: req.url,
          statusCode: 429, responseTimeMs: Date.now() - start,
          ip, userAgent: req.headers['user-agent'], upstream: service.name,
          rateLimited: true,
        })
        return reply.status(429).send({
          error: 'Too Many Requests',
          message: `Limite de ${rl.limit} req/min atingido.`,
          retryAfter: Math.ceil(rl.resetMs / 1000),
        })
      }

      // Proxy para upstream
      try {
        const upstreamPath = req.url.replace(service.prefix, '')
        const upstreamUrl  = `${service.target}${upstreamPath || '/'}`

        const response = await fetch(upstreamUrl, {
          method:  req.method,
          headers: { 'Content-Type': 'application/json', 'User-Agent': 'API-Gateway/1.0' },
          body:    ['GET', 'HEAD'].includes(req.method) ? undefined : JSON.stringify(req.body),
        })

        const data        = await response.json()
        const responseTime = Date.now() - start

        await logRequest({
          userId: user?.sub, method: req.method, path: req.url,
          statusCode: response.status, responseTimeMs: responseTime,
          ip, userAgent: req.headers['user-agent'], upstream: service.name,
          rateLimited: false,
        })

        reply.header('X-Gateway-Upstream',      service.name)
        reply.header('X-Gateway-Response-Time', `${responseTime}ms`)
        return reply.status(response.status).send(data)
      } catch (err) {
        const responseTime = Date.now() - start
        await logRequest({
          userId: user?.sub, method: req.method, path: req.url,
          statusCode: 502, responseTimeMs: responseTime,
          ip, userAgent: req.headers['user-agent'], upstream: service.name,
          rateLimited: false,
        })
        return reply.status(502).send({ error: 'Bad Gateway', message: 'Upstream indisponível.' })
      }
    })
  }
}
