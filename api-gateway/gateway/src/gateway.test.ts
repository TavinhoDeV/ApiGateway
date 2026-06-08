import { RATE_LIMITS } from '../src/types'

// ── Rate Limit Config ─────────────────────────────────────────────

describe('RATE_LIMITS config', () => {
  it('deve ter limites definidos para todos os planos', () => {
    expect(RATE_LIMITS.free).toBeDefined()
    expect(RATE_LIMITS.pro).toBeDefined()
    expect(RATE_LIMITS.enterprise).toBeDefined()
  })

  it('enterprise deve ter limite maior que pro', () => {
    expect(RATE_LIMITS.enterprise.max).toBeGreaterThan(RATE_LIMITS.pro.max)
  })

  it('pro deve ter limite maior que free', () => {
    expect(RATE_LIMITS.pro.max).toBeGreaterThan(RATE_LIMITS.free.max)
  })

  it('todos os planos devem ter windowMs positivo', () => {
    for (const plan of Object.values(RATE_LIMITS)) {
      expect(plan.windowMs).toBeGreaterThan(0)
    }
  })
})

// ── Rate Limit Result Logic ───────────────────────────────────────

describe('RateLimitResult logic', () => {
  function calcRemaining(count: number, max: number): number {
    return Math.max(0, max - count)
  }

  function isAllowed(count: number, max: number): boolean {
    return count <= max
  }

  it('deve permitir request dentro do limite', () => {
    expect(isAllowed(1, 30)).toBe(true)
    expect(isAllowed(30, 30)).toBe(true)
  })

  it('deve bloquear request acima do limite', () => {
    expect(isAllowed(31, 30)).toBe(false)
    expect(isAllowed(100, 30)).toBe(false)
  })

  it('deve calcular remaining corretamente', () => {
    expect(calcRemaining(10, 30)).toBe(20)
    expect(calcRemaining(30, 30)).toBe(0)
    expect(calcRemaining(50, 30)).toBe(0)
  })
})

// ── JWT Payload ───────────────────────────────────────────────────

describe('JwtPayload structure', () => {
  interface JwtPayload {
    sub: string; email: string; role: string; plan: string
  }

  function makePayload(overrides: Partial<JwtPayload> = {}): JwtPayload {
    return { sub: 'user-1', email: 'test@test.com', role: 'user', plan: 'free', ...overrides }
  }

  it('deve ter os campos obrigatórios', () => {
    const p = makePayload()
    expect(p.sub).toBeDefined()
    expect(p.email).toBeDefined()
    expect(p.role).toBeDefined()
    expect(p.plan).toBeDefined()
  })

  it('deve aceitar role admin', () => {
    const p = makePayload({ role: 'admin' })
    expect(p.role).toBe('admin')
  })

  it('deve aceitar plano enterprise', () => {
    const p = makePayload({ plan: 'enterprise' })
    expect(p.plan).toBe('enterprise')
  })
})

// ── Stats groupBy hour ────────────────────────────────────────────

describe('groupByHour', () => {
  function groupByHour(dates: Date[]): Map<string, number> {
    const map = new Map<string, number>()
    for (let i = 23; i >= 0; i--) {
      const h = new Date(Date.now() - i * 60 * 60 * 1000)
      map.set(`${h.getHours().toString().padStart(2, '0')}:00`, 0)
    }
    for (const d of dates) {
      const key = `${d.getHours().toString().padStart(2, '0')}:00`
      if (map.has(key)) map.set(key, (map.get(key) ?? 0) + 1)
    }
    return map
  }

  it('deve ter 24 entradas', () => {
    const map = groupByHour([])
    expect(map.size).toBe(24)
  })

  it('deve contar corretamente', () => {
    const now = new Date()
    const map = groupByHour([now, now, now])
    const key = `${now.getHours().toString().padStart(2, '0')}:00`
    expect(map.get(key)).toBe(3)
  })

  it('deve iniciar com zeros', () => {
    const map = groupByHour([])
    for (const v of map.values()) expect(v).toBe(0)
  })
})

// ── Upstream Services ─────────────────────────────────────────────

describe('UPSTREAM_SERVICES', () => {
  const { UPSTREAM_SERVICES } = require('../src/types')

  it('deve ter pelo menos 2 serviços', () => {
    expect(UPSTREAM_SERVICES.length).toBeGreaterThanOrEqualTo(2)
  })

  it('cada serviço deve ter name, prefix e target', () => {
    for (const s of UPSTREAM_SERVICES) {
      expect(s.name).toBeDefined()
      expect(s.prefix).toMatch(/^\/proxy\//)
      expect(s.target).toMatch(/^https?:\/\//)
    }
  })
})
