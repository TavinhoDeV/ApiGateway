import type { FastifyRequest, FastifyReply } from 'fastify'

export async function authenticate(req: FastifyRequest, reply: FastifyReply) {
  try {
    await req.jwtVerify()
  } catch {
    reply.status(401).send({ error: 'Unauthorized', message: 'Token inválido ou ausente.' })
  }
}

export async function requireAdmin(req: FastifyRequest, reply: FastifyReply) {
  try {
    await req.jwtVerify()
    const user = req.user as { role: string }
    if (user.role !== 'admin') {
      reply.status(403).send({ error: 'Forbidden', message: 'Acesso restrito a administradores.' })
    }
  } catch {
    reply.status(401).send({ error: 'Unauthorized' })
  }
}
