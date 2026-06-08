# 🔀 API Gateway — Fastify + Redis + JWT + React

API Gateway completo com autenticação JWT, rate limiting por plano, proxy para serviços downstream, logs de acesso e dashboard React em tempo real.

---

## ✨ Funcionalidades

**Gateway (Backend)**
- 🔐 Autenticação JWT (register, login, /me)
- 🚦 Rate limiting por plano (free: 30/min, pro: 200/min, enterprise: 1000/min)
- 🔀 Proxy reverso para serviços externos
- 📝 Log de todos os requests no SQLite
- 🛡️ Headers X-RateLimit-* em todas as respostas
- 🌱 Seed automático com 3 usuários e 200 logs

**Dashboard (Frontend)**
- 📊 Métricas em tempo real (atualiza a cada 5s)
- 📈 Gráfico de requests por hora
- 🍩 Breakdown de status HTTP
- 🏆 Top endpoints e top usuários
- 📋 Tabela de logs com método, status, tempo, IP
- 🔑 Login com JWT persistido no localStorage

---

## 🚀 Tecnologias

| Tecnologia | Uso |
|---|---|
| Fastify | HTTP server ultra-rápido |
| JWT (@fastify/jwt) | Autenticação |
| Redis (ioredis) | Rate limiting distribuído |
| Prisma + SQLite | ORM + logs persistidos |
| Zod | Validação de schema |
| React + Vite | Dashboard SPA |
| Recharts | Gráficos interativos |

---

## ▶️ Como rodar

### 1. Suba o Redis
```bash
docker-compose up -d
```

### 2. Configure o Gateway
```bash
cd gateway
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run dev
```

Gateway rodando em: **http://localhost:3001**

### 3. Suba o Dashboard
```bash
cd dashboard
npm install
npm run dev
```

Dashboard em: **http://localhost:5173**

---

## 🔑 Credenciais padrão

| Email | Senha | Plano | Limite |
|---|---|---|---|
| admin@gateway.com | admin123 | enterprise | 1000 req/min |
| pro@gateway.com | pro123 | pro | 200 req/min |
| free@gateway.com | free123 | free | 30 req/min |

---

## 🔌 Endpoints

| Método | Rota | Auth | Descrição |
|---|---|---|---|
| POST | /auth/register | ❌ | Cadastro |
| POST | /auth/login | ❌ | Login → JWT |
| GET | /auth/me | ✅ | Dados do usuário |
| GET | /proxy/posts/* | — | Proxy → JSONPlaceholder |
| GET | /proxy/jokes/* | — | Proxy → Joke API |
| GET | /admin/stats | ✅ | Métricas do dashboard |
| GET | /admin/logs | ✅ | Logs paginados |
| GET | /admin/users | ✅ | Lista usuários |
| GET | /health | ❌ | Health check |

---

## ✅ Testes
```bash
cd gateway
npm test
```

---

## 🗂️ Estrutura
```
api-gateway/
├── gateway/
│   └── src/
│       ├── routes/     → auth, proxy, admin
│       ├── services/   → prisma, redis, rateLimiter, logger, seed
│       ├── middleware/ → auth, rateLimit
│       └── server.ts
├── dashboard/
│   └── src/
│       ├── pages/      → LoginPage, DashboardPage
│       ├── components/ → charts
│       └── hooks/      → useAuth, useStats
├── prisma/schema.prisma
└── docker-compose.yml
```

---

## 📄 Licença
MIT License
