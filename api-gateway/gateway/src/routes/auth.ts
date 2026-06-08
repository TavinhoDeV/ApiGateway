import type { FastifyInstance } from 'fastify'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { v4 as uuid } from 'uuid'
import { prisma } from '../services/prisma'

const registerSchema = z.object({
  name:     z.string().min(2),
  email:    z.string().email(),
  password: z.string().min(6),
  plan:     z.enum(['free', 'pro', 'enterprise']).default('free'),
})

const loginSchema = z.object({
  email:    z.string().email(),
  password: z.string(),
})

export async function authRoutes(app: FastifyInstance) {

  // POST /auth/register
  app.post('/auth/register', async (req, reply) => {
    try {
      const data = registerSchema.parse(req.body)
      const exists = await prisma.user.findUnique({ where: { email: data.email } })
      if (exists) return reply.status(409).send({ error: 'E-mail já cadastrado.' })

      const user = await prisma.user.create({
        data: {
          name:         data.name,
          email:        data.email,
          passwordHash: await bcrypt.hash(data.password, 10),
          plan:         data.plan,
          apiKey:       `gw_${uuid().replace(/-/g, '')}`,
        },
      })

      const token = app.jwt.sign({ sub: user.id, email: user.email, role: user.role, plan: user.plan }, { expiresIn: '8h' })
      return reply.status(201).send({ token, apiKey: user.apiKey, user: { id: user.id, name: user.name, email: user.email, plan: user.plan, role: user.role } })
    } catch (err) {
      if (err instanceof z.ZodError) return reply.status(400).send({ error: err.errors })
      throw err
    }
  })

  // POST /auth/login
  app.post('/auth/login', async (req, reply) => {
    try {
      const { email, password } = loginSchema.parse(req.body)
      const user = await prisma.user.findUnique({ where: { email } })
      if (!user || !await bcrypt.compare(password, user.passwordHash))
        return reply.status(401).send({ error: 'Credenciais inválidas.' })
      if (!user.active)
        return reply.status(403).send({ error: 'Conta desativada.' })

      const token = app.jwt.sign({ sub: user.id, email: user.email, role: user.role, plan: user.plan }, { expiresIn: '8h' })
      return reply.send({ token, apiKey: user.apiKey, user: { id: user.id, name: user.name, email: user.email, plan: user.plan, role: user.role } })
    } catch (err) {
      if (err instanceof z.ZodError) return reply.status(400).send({ error: err.errors })
      throw err
    }
  })

  // GET /auth/me
  app.get('/auth/me', { preHandler: [app.authenticate] }, async (req, reply) => {
    const payload = req.user as { sub: string }
    const user = await prisma.user.findUnique({ where: { id: payload.sub }, select: { id: true, name: true, email: true, plan: true, role: true, apiKey: true, createdAt: true } })
    if (!user) return reply.status(404).send({ error: 'Usuário não encontrado.' })
    return reply.send(user)
  })
}
