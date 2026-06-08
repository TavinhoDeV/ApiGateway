import { useState, FormEvent } from 'react'
import { useAuth } from '../hooks/useAuth'

export function LoginPage() {
  const { login } = useAuth()
  const [email, setEmail] = useState('admin@gateway.com')
  const [password, setPassword] = useState('admin123')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault(); setError(''); setLoading(true)
    try { await login(email, password) }
    catch (err: any) { setError(err.message) }
    finally { setLoading(false) }
  }

  const s: Record<string, any> = {
    wrap: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' },
    box: { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '32px 36px', width: 380 },
    logo: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28 },
    logoIcon: { width: 32, height: 32, borderRadius: 8, background: '#1e2040', border: '1px solid #2d3370', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 },
    title: { fontSize: 18, fontWeight: 600, color: 'var(--text-1)' },
    label: { display: 'block', fontSize: 11, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 6 },
    input: { width: '100%', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 7, padding: '10px 12px', color: 'var(--text-1)', fontSize: 13, outline: 'none', marginBottom: 14 },
    btn: { width: '100%', background: 'var(--indigo)', border: 'none', borderRadius: 7, padding: '11px', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', marginTop: 4 },
    hint: { marginTop: 16, fontSize: 11, color: 'var(--text-4)', textAlign: 'center' as const },
    err: { background: '#450a0a22', border: '1px solid #f8717133', borderRadius: 6, padding: '8px 12px', color: 'var(--red)', fontSize: 12, marginBottom: 14 },
  }

  return (
    <div style={s.wrap}>
      <div style={s.box}>
        <div style={s.logo}>
          <div style={s.logoIcon}>🔀</div>
          <span style={s.title}>API Gateway</span>
        </div>
        <form onSubmit={handleSubmit}>
          {error && <div style={s.err}>{error}</div>}
          <label style={s.label}>E-mail</label>
          <input style={s.input} type="email" value={email} onChange={e => setEmail(e.target.value)} required />
          <label style={s.label}>Senha</label>
          <input style={s.input} type="password" value={password} onChange={e => setPassword(e.target.value)} required />
          <button style={s.btn} disabled={loading}>{loading ? 'Entrando...' : 'Entrar'}</button>
        </form>
        <p style={s.hint}>admin@gateway.com / admin123</p>
      </div>
    </div>
  )
}
