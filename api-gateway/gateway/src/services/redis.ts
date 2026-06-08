import Redis from 'ioredis'

let redis: Redis | null = null

export function getRedis(): Redis {
  if (!redis) {
    redis = new Redis({
      host: process.env.REDIS_HOST ?? 'localhost',
      port: Number(process.env.REDIS_PORT ?? 6379),
      lazyConnect: true,
      retryStrategy: (times) => Math.min(times * 100, 3000),
    })
    redis.on('error', (err) => console.error('[Redis]', err.message))
    redis.on('connect', () => console.log('[Redis] Conectado'))
  }
  return redis
}

export async function getRateLimitKey(key: string): Promise<number> {
  const r = getRedis()
  const count = await r.get(`rl:${key}`)
  return count ? parseInt(count) : 0
}

export async function incrementRateLimit(key: string, windowMs: number): Promise<number> {
  const r = getRedis()
  const multi = r.multi()
  multi.incr(`rl:${key}`)
  multi.pexpire(`rl:${key}`, windowMs)
  const results = await multi.exec()
  return (results?.[0]?.[1] as number) ?? 1
}

export async function getRateLimitTTL(key: string): Promise<number> {
  const r = getRedis()
  return r.pttl(`rl:${key}`)
}
