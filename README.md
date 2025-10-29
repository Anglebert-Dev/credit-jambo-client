# Credit Jambo – Digital Credit & Savings Platform (Monorepo)

A full‑stack fintech application showcasing modular, secure, and scalable architecture. This monorepo contains two apps:

- backend/ – Node.js + TypeScript API (Express, Prisma, PostgreSQL, Redis, BullMQ)
- client/ – React + TypeScript SPA (Vite, Tailwind, Zustand, Axios, React Router)

## Monorepo Structure

```
credit-jambo-client/
├── backend/
│   ├── src/
│   │   ├── common/                # exceptions, middleware, utils, types
│   │   ├── config/                # jwt, redis, swagger
│   │   ├── modules/
│   │   │   ├── auth/
│   │   │   ├── users/
│   │   │   ├── savings/
│   │   │   ├── credit/
│   │   │   └── notifications/
│   │   ├── routes/                # index.ts route registry
│   │   ├── __tests__/             # jest tests (e.g., savings.service.test.ts)
│   │   └── main.ts                # app entry
│   ├── prisma/                    # schema.prisma + migrations
│   ├── package.json
│   ├── tsconfig.json
│   ├── jest.config.js
│   └── nodemon.json
│
└── client/
    ├── src/
    │   ├── common/
    │   │   ├── components/        # Button, Input, Card, Modal, Loader, ErrorBoundary
    │   │   ├── hooks/             # useAuth, useToast
    │   │   ├── types/             # auth.types, api.types, user.types
    │   │   └── utils/             # storage.util, format.util, validation.util
    │   ├── config/                # api.config, routes.config
    │   ├── layouts/               # AuthLayout, DashboardLayout
    │   ├── pages/
    │   │   ├── auth/              # LoginPage, RegisterPage
    │   │   ├── dashboard/         # DashboardPage
    │   │   ├── savings/           # SavingsPage, DepositPage, WithdrawPage
    │   │   ├── credit/            # CreditPage, RequestPage, RepayPage
    │   │   ├── profile/           # ProfilePage
    │   │   └── notifications/     # NotificationsPage
    │   ├── routes/                # AppRoutes, PrivateRoute
    │   ├── services/              # api + feature services
    │   ├── store/                 # authStore, uiStore
    │   ├── App.tsx
    │   └── main.tsx
    ├── index.html
    ├── package.json
    └── vite.config.ts
```

## Tech Stack

- Backend: Node.js, TypeScript, Express, Prisma (PostgreSQL), ioredis (Redis), BullMQ, JWT, Helmet, CORS, Swagger (OpenAPI), Jest + Supertest
- Frontend: React, TypeScript, Vite, Tailwind CSS, Zustand, Axios, React Router

## Key Features

- Authentication with access/refresh tokens, role-ready middleware
- Users: profile get/update, change password
- Savings: create/update/delete, deposit, withdraw, balance, transactions (paginated), freeze/unfreeze
- Credit: request, list, repay, repayment history (paginated)
- Notifications: in‑app queue (mock email), list + mark as read, unread badge
- Repository pattern; centralized error handling and custom exceptions
- Swagger API docs; unit tests for business flows

## What You Can Do (App Capabilities)

### Client (Customer)
- Register and login with JWT (auto refresh, session-aware)
- View and update profile; change password
- Create a savings account (select currency), view balance and transaction history
- Deposit and withdraw funds; account freeze/unfreeze; delete account
- Request credit with amount, purpose, and duration; see request status and details
- Make repayments; see repayment history; UI hides repayment when fully repaid
- Receive in‑app notifications; see unread badge; open notifications page and mark read


## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- Redis 6+

### Backend
```
cd backend
cp .env.example .env    # adjust env vars
npm install
npm run prisma:generate
npm run prisma:migrate  # or: npx prisma migrate dev
npm run dev             # http://localhost:5000
```
Swagger: http://localhost:5000/api/docs

Minimal .env
```
PORT=5000
API_PREFIX=/api
DATABASE_URL=postgresql://user:password@localhost:5432/credit_jambo
REDIS_URL=redis://localhost:6379
JWT_SECRET=supersecret
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=superrefreshsecret
JWT_REFRESH_EXPIRES_IN=7d
```

### Frontend
```
cd client
npm install
npm run dev             # http://localhost:5173
```
Optional client .env
```
VITE_API_BASE_URL=http://localhost:5000/api
VITE_API_TIMEOUT=30000
```

## Scripts
Backend: `dev`, `build`, `start`, `prisma:migrate`, `test`

Frontend: `dev`, `build`

## Testing
- Backend unit tests (Jest). Tests live in `backend/src/__tests__/` (e.g., `savings.service.test.ts`).
- Run:
```
cd backend && npm test
```

## License
MIT © Credit Jambo Ltd
