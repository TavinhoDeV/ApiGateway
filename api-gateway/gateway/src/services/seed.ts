import bcrypt from 'bcryptjs'
import { v4 as uuid } from 'uuid'
import { prisma } from './prisma'

export async function seedDatabase() {
  const count = await prisma.user.count()
  if (count > 0) return

  console.log('🌱 Populando banco com dados iniciais...')

  const users = await Promise.all([
    prisma.user.create({ data: { name: 'Admin', email: 'admin@gateway.com', passwordHash: await bcrypt.hash('admin123', 10), role: 'admin', plan: 'enterprise', apiKey: `gw_${uuid().replace(/-/g, '')}` } }),
    prisma.user.create({ data: { name: 'Usuário Pro', email: 'pro@gateway.com', passwordHash: await bcrypt.hash('pro123', 10), plan: 'pro', apiKey: `gw_${uuid().replace(/-/g, '')}` } }),
    prisma.user.create({ data: { name: 'Usuário Free', email: 'free@gateway.com', passwordHash: await bcrypt.hash('free123', 10), plan: 'free', apiKey: `gw_${uuid().replace(/-/g, '')}` } }),
  ])

  // Seed de 200 logs de exemplo
  const methods   = ['GET', 'POST', 'PUT', 'DELETE']
  const paths     = ['/proxy/posts', '/proxy/jokes', '/auth/login', '/auth/me', '/admin/stats']
  const statuses  = [200, 200, 200, 201, 401, 404, 429, 502]
  const upstreams = ['jsonplaceholder', 'jokes', null, null, null]

  const logs = Array.from({ length: 200 }, (_, i) => ({
    userId:         users[i % users.length].id,
    method:         methods[i % methods.length],
    path:           paths[i % paths.length],
    statusCode:     statuses[i % statuses.length],
    responseTimeMs: Math.floor(50 + Math.random() * 500),
    ip:             `192.168.1.${(i % 255) + 1}`,
    upstream:       upstreams[i % upstreams.length] ?? undefined,
    rateLimited:    statuses[i % statuses.length] === 429,
    createdAt:      new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000),
  }))

  await prisma.requestLog.createMany({ data: logs })
  console.log('✅ Seed concluído: 3 usuários, 200 logs')
  console.log('   admin@gateway.com / admin123')
  console.log('   pro@gateway.com   / pro123')
  console.log('   free@gateway.com  / free123')
}
