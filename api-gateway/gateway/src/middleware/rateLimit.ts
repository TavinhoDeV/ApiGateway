import type { FastifyRequest, FastifyReply } from 'fastify'
import { checkRateLimit } from '../services/rateLimiter'
import type { JwtPayload } from '../types'

export async function rateLimitMiddleware(req: FastifyRequest, reply: FastifyReply) {
  const ip   = req.ip
  let user: JwtPayload | undefined

  try {
    await req.jwtVerify()
    user = req.user as JwtPayload
  } catch {
    // request sem token — usa IP
  }

  const result = await checkRateLimit(ip, user)

  reply.header('X-RateLimit-Limit',     result.limit)
  reply.header('X-RateLimit-Remaining', result.remaining)
  reply.header('X-RateLimit-Reset',     Math.ceil(result.resetMs / 1000))

  if (!result.allowed) {
    reply.status(429).send({
      error:   'Too Many Requests',
      message: `Limite de ${result.limit} req/min atingido. Tente novamente em ${Math.ceil(result.resetMs / 1000)}s.`,
      retryAfter: Math.ceil(result.resetMs / 1000),
    })
  }
}
