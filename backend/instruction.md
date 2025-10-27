# Client Backend Development Guide

**Repository Name**: `credit-jambo-client-api`

---

## Tech Stack

- **Framework**: Express.js (Node.js + TypeScript)
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT + jsonwebtoken
- **Validation**: express-validator
- **Documentation**: Swagger (swagger-ui-express + swagger-jsdoc)
- **Password Hashing**: bcrypt
- **Environment**: dotenv
- **Testing**: Jest + Supertest
- **Queue**: Bull + Redis (for notifications)

---

## Initial Setup

### 1. Create Project
```bash
mkdir credit-jambo-client-api
cd credit-jambo-client-api
npm init -y
```

### 2. Install Dependencies
```bash
# Core dependencies
npm install express cors helmet morgan
npm install dotenv
npm install pg
npm install prisma @prisma/client
npm install jsonwebtoken bcrypt
npm install express-validator
npm install bull redis
npm install swagger-ui-express swagger-jsdoc

# TypeScript dependencies
npm install -D typescript @types/node @types/express
npm install -D @types/cors @types/morgan @types/bcrypt
npm install -D @types/jsonwebtoken @types/swagger-ui-express
npm install -D ts-node nodemon
npm install -D jest @types/jest ts-jest supertest @types/supertest
```

### 3. TypeScript Configuration

**File**: `tsconfig.json`
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "moduleResolution": "node",
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "**/*.spec.ts"]
}
```

### 4. Package.json Scripts

**File**: `package.json` (add these scripts)
```json
{
  "scripts": {
    "dev": "nodemon src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js",
    "prisma:generate": "prisma generate",
    "prisma:migrate": "prisma migrate dev",
    "prisma:studio": "prisma studio",
    "prisma:seed": "ts-node prisma/seed.ts",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:cov": "jest --coverage"
  }
}
```

### 5. Environment Configuration

**File**: `.env`
```env
# Application
NODE_ENV=development
PORT=3000
API_PREFIX=/api

# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/credit_jambo_client?schema=public"

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=your-super-secret-refresh-key
JWT_REFRESH_EXPIRES_IN=7d

# Redis (for queues)
REDIS_HOST=localhost
REDIS_PORT=6379
```

### 6. Initialize Prisma

```bash
npx prisma init
```

### 7. Prisma Schema

**File**: `prisma/schema.prisma`
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id            String   @id @default(uuid())
  email         String   @unique
  password      String
  firstName     String   @map("first_name")
  lastName      String   @map("last_name")
  phoneNumber   String   @unique @map("phone_number")
  role          String   @default("customer")
  status        String   @default("active")
  createdAt     DateTime @default(now()) @map("created_at")
  updatedAt     DateTime @updatedAt @map("updated_at")

  refreshTokens    RefreshToken[]
  savingsAccount   SavingsAccount?
  creditRequests   CreditRequest[]
  notifications    Notification[]

  @@index([email])
  @@index([phoneNumber])
  @@map("users")
}

model RefreshToken {
  id         String    @id @default(uuid())
  userId     String    @map("user_id")
  token      String    @unique
  deviceInfo String?   @map("device_info")
  ipAddress  String?   @map("ip_address")
  expiresAt  DateTime  @map("expires_at")
  revokedAt  DateTime? @map("revoked_at")
  createdAt  DateTime  @default(now()) @map("created_at")

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([token])
  @@map("refresh_tokens")
}

model SavingsAccount {
  id        String   @id @default(uuid())
  userId    String   @unique @map("user_id")
  balance   Decimal  @default(0) @db.Decimal(15, 2)
  currency  String   @default("RWF")
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  user         User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  transactions Transaction[]

  @@index([userId])
  @@map("savings_accounts")
}

model Transaction {
  id               String   @id @default(uuid())
  savingsAccountId String   @map("savings_account_id")
  type             String
  amount           Decimal  @db.Decimal(15, 2)
  balanceBefore    Decimal  @map("balance_before") @db.Decimal(15, 2)
  balanceAfter     Decimal  @map("balance_after") @db.Decimal(15, 2)
  description      String?
  referenceNumber  String   @unique @map("reference_number")
  status           String   @default("completed")
  createdAt        DateTime @default(now()) @map("created_at")

  savingsAccount SavingsAccount @relation(fields: [savingsAccountId], references: [id], onDelete: Cascade)

  @@index([savingsAccountId])
  @@index([createdAt])
  @@index([referenceNumber])
  @@map("transactions")
}

model CreditRequest {
  id              String    @id @default(uuid())
  userId          String    @map("user_id")
  amount          Decimal   @db.Decimal(15, 2)
  purpose         String    @db.Text
  durationMonths  Int       @map("duration_months")
  interestRate    Decimal   @default(5.00) @map("interest_rate") @db.Decimal(5, 2)
  status          String    @default("pending")
  approvedBy      String?   @map("approved_by")
  approvedAt      DateTime? @map("approved_at")
  rejectionReason String?   @map("rejection_reason") @db.Text
  createdAt       DateTime  @default(now()) @map("created_at")
  updatedAt       DateTime  @updatedAt @map("updated_at")

  user       User              @relation(fields: [userId], references: [id], onDelete: Cascade)
  repayments CreditRepayment[]

  @@index([userId])
  @@index([status])
  @@map("credit_requests")
}

model CreditRepayment {
  id              String   @id @default(uuid())
  creditRequestId String   @map("credit_request_id")
  amount          Decimal  @db.Decimal(15, 2)
  referenceNumber String   @unique @map("reference_number")
  paymentDate     DateTime @default(now()) @map("payment_date")
  createdAt       DateTime @default(now()) @map("created_at")

  creditRequest CreditRequest @relation(fields: [creditRequestId], references: [id], onDelete: Cascade)

  @@index([creditRequestId])
  @@index([referenceNumber])
  @@map("credit_repayments")
}

model Notification {
  id        String   @id @default(uuid())
  userId    String   @map("user_id")
  type      String
  title     String
  message   String   @db.Text
  read      Boolean  @default(false)
  sentAt    DateTime @default(now()) @map("sent_at")

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([read])
  @@map("notifications")
}
```

### 8. Run Migrations

```bash
npx prisma migrate dev --name init
npx prisma generate
```

### 9. Setup Docker (Optional but Recommended)

**File**: `docker-compose.yml`
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: credit_jambo_db
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: credit_jambo_client
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    container_name: credit_jambo_redis
    ports:
      - "6379:6379"

volumes:
  postgres_data:
```

**Start services**:
```bash
docker-compose up -d
```

---

## Project Structure

```
credit-jambo-client-api/
├── src/
│   ├── server.ts                    # Application entry point
│   │
│   ├── config/
│   │   ├── database.ts              # Prisma client instance
│   │   ├── jwt.config.ts            # JWT configuration
│   │   ├── redis.config.ts          # Redis configuration
│   │   └── swagger.config.ts        # Swagger configuration
│   │
│   ├── common/                      # ← COPY THIS TO ADMIN
│   │   ├── middleware/
│   │   │   ├── auth.middleware.ts   # JWT verification
│   │   │   ├── error.middleware.ts  # Global error handler
│   │   │   ├── validation.middleware.ts # Request validation
│   │   │   └── logger.middleware.ts # Request logging
│   │   │
│   │   ├── utils/
│   │   │   ├── hash.util.ts         # Password hashing
│   │   │   ├── jwt.util.ts          # JWT generation/verification
│   │   │   ├── validation.util.ts   # Validation helpers
│   │   │   └── response.util.ts     # Response formatting
│   │   │
│   │   ├── types/
│   │   │   ├── express.d.ts         # Extended Express types
│   │   │   ├── jwt.types.ts         # JWT payload types
│   │   │   └── response.types.ts    # API response types
│   │   │
│   │   └── exceptions/
│   │       ├── AppError.ts          # Base error class
│   │       ├── BadRequestError.ts
│   │       ├── UnauthorizedError.ts
│   │       ├── NotFoundError.ts
│   │       └── ConflictError.ts
│   │
│   ├── modules/
│   │   │
│   │   ├── auth/
│   │   │   ├── auth.controller.ts   # Auth routes
│   │   │   ├── auth.service.ts      # Auth business logic
│   │   │   ├── auth.validation.ts   # Request validation schemas
│   │   │   └── auth.types.ts        # Auth DTOs/types
│   │   │
│   │   ├── users/
│   │   │   ├── users.controller.ts
│   │   │   ├── users.service.ts
│   │   │   ├── users.validation.ts
│   │   │   └── users.types.ts
│   │   │
│   │   ├── savings/
│   │   │   ├── savings.controller.ts
│   │   │   ├── savings.service.ts
│   │   │   ├── savings.validation.ts
│   │   │   └── savings.types.ts
│   │   │
│   │   ├── credit/
│   │   │   ├── credit.controller.ts
│   │   │   ├── credit.service.ts
│   │   │   ├── credit.validation.ts
│   │   │   └── credit.types.ts
│   │   │
│   │   └── notifications/
│   │       ├── notifications.service.ts
│   │       ├── notifications.queue.ts
│   │       └── notifications.types.ts
│   │
│   ├── routes/
│   │   └── index.ts                 # Central route registry
│   │
│   └── tests/
│       ├── unit/
│       │   ├── auth.service.test.ts
│       │   └── savings.service.test.ts
│       └── integration/
│           └── auth.routes.test.ts
│
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
│
├── .env
├── .env.example
├── .gitignore
├── tsconfig.json
├── package.json
├── docker-compose.yml
├── Dockerfile
└── README.md
```

---

## API Endpoints

### Authentication (`/api/auth`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/register` | Register new customer | No |
| POST | `/login` | Customer login | No |
| POST | `/refresh` | Refresh access token | No |
| POST | `/logout` | Logout (revoke refresh token) | Yes |

### User Profile (`/api/users`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/profile` | Get current user profile | Yes |
| PUT | `/profile` | Update profile | Yes |
| PATCH | `/password` | Change password | Yes |

### Savings (`/api/savings`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/account` | Get savings account details | Yes |
| POST | `/deposit` | Deposit money | Yes |
| POST | `/withdraw` | Withdraw money | Yes |
| GET | `/transactions` | Get transaction history (paginated) | Yes |
| GET | `/balance` | Get current balance | Yes |

### Credit (`/api/credit`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/request` | Request a loan | Yes |
| GET | `/requests` | Get user's credit requests | Yes |
| GET | `/requests/:id` | Get specific credit request | Yes |
| POST | `/repay/:id` | Make a repayment | Yes |
| GET | `/repayments/:id` | Get repayment history | Yes |

---

## Module Implementation Order

### 1. Common Module (Foundation)
Build all shared utilities first:
- Middleware (auth, error, validation, logger)
- Utils (hash, jwt, validation, response)
- Types (express extensions, JWT payload, response types)
- Exceptions (custom error classes)

### 2. Auth Module
- Register endpoint (validation, service, controller)
- Login endpoint
- JWT generation logic
- Refresh token logic
- Logout endpoint

### 3. Users Module
- User service
- Profile endpoints (get, update)
- Password change endpoint

### 4. Savings Module
- Deposit endpoint
- Withdraw endpoint
- Balance inquiry
- Transaction history (with pagination)

### 5. Credit Module
- Request credit endpoint
- View requests endpoint
- Repayment endpoint
- Repayment history

### 6. Notifications Module
- Notification service
- Bull queue setup
- Email notification logic (can be mocked)

---

## Core Files Examples

### Server Entry Point

**File**: `src/server.ts`
```typescript
import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger.config';
import routes from './routes';
import { errorMiddleware } from './common/middleware/error.middleware';

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Swagger documentation
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routes
app.use(process.env.API_PREFIX || '/api', routes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling middleware (must be last)
app.use(errorMiddleware);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Swagger docs: http://localhost:${PORT}/api/docs`);
});

export default app;
```

### Database Configuration

**File**: `src/config/database.ts`
```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

export default prisma;
```

### JWT Utility

**File**: `src/common/utils/jwt.util.ts`
```typescript
import jwt from 'jsonwebtoken';
import { UnauthorizedError } from '../exceptions/UnauthorizedError';

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
}

export const generateAccessToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, process.env.JWT_SECRET!, {
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
  });
};

export const generateRefreshToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET!, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  });
};

export const verifyAccessToken = (token: string): JwtPayload => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
  } catch (error) {
    throw new UnauthorizedError('Invalid or expired token');
  }
};

export const verifyRefreshToken = (token: string): JwtPayload => {
  try {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET!) as JwtPayload;
  } catch (error) {
    throw new UnauthorizedError('Invalid or expired refresh token');
  }
};
```

### Auth Middleware

**File**: `src/common/middleware/auth.middleware.ts`
```typescript
import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt.util';
import { UnauthorizedError } from '../exceptions/UnauthorizedError';

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('No token provided');
    }

    const token = authHeader.split(' ')[1];
    const payload = verifyAccessToken(token);

    req.user = payload;
    next();
  } catch (error) {
    next(error);
  }
};
```

### Error Middleware

**File**: `src/common/middleware/error.middleware.ts`
```typescript
import { Request, Response, NextFunction } from 'express';
import { AppError } from '../exceptions/AppError';

export const errorMiddleware = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
  }

  console.error('Unhandled error:', err);

  res.status(500).json({
    success: false,
    message: 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { 
      error: err.message,
      stack: err.stack 
    }),
  });
};
```

### Base Error Class

**File**: `src/common/exceptions/AppError.ts`
```typescript
export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}
```

### Auth Service Example

**File**: `src/modules/auth/auth.service.ts`
```typescript
import bcrypt from 'bcrypt';
import prisma from '../../config/database';
import { generateAccessToken, generateRefreshToken } from '../../common/utils/jwt.util';
import { ConflictError } from '../../common/exceptions/ConflictError';
import { UnauthorizedError } from '../../common/exceptions/UnauthorizedError';
import { RegisterDto, LoginDto, AuthResponse } from './auth.types';

export class AuthService {
  async register(data: RegisterDto): Promise<AuthResponse> {
    // Check if user exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: data.email },
          { phoneNumber: data.phoneNumber }
        ]
      }
    });

    if (existingUser) {
      throw new ConflictError('User with this email or phone already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        firstName: data.firstName,
        lastName: data.lastName,
        phoneNumber: data.phoneNumber,
        role: 'customer',
        status: 'active'
      }
    });

    // Generate tokens
    return this.generateTokens(user);
  }

  async login(data: LoginDto): Promise<AuthResponse> {
    const user = await prisma.user.findUnique({
      where: { email: data.email }
    });

    if (!user) {
      throw new UnauthorizedError('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(data.password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedError('Invalid credentials');
    }

    if (user.status !== 'active') {
      throw new UnauthorizedError('Account is not active');
    }

    return this.generateTokens(user);
  }

  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    const tokenRecord = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true }
    });

    if (!tokenRecord || tokenRecord.revokedAt || new Date() > tokenRecord.expiresAt) {
      throw new UnauthorizedError('Invalid refresh token');
    }

    return this.generateTokens(tokenRecord.user);
  }

  private async generateTokens(user: any): Promise<AuthResponse> {
    const payload = { sub: user.id, email: user.email, role: user.role };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    // Save refresh token
    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        token: refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
      }
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
      }
    };
  }
}
```

### Auth Controller Example

**File**: `src/modules/auth/auth.controller.ts`
```typescript
import { Router, Request, Response, NextFunction } from 'express';
import { body } from 'express-validator';
import { AuthService } from './auth.service';
import { validationMiddleware } from '../../common/middleware/validation.middleware';

const router = Router();
const authService = new AuthService();

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     tags: [Authentication]
 *     summary: Register new customer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - firstName
 *               - lastName
 *               - phoneNumber
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               phoneNumber:
 *                 type: string
 */
router.post(
  '/register',
  [
    body('email').isEmail().withMessage('Invalid email'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    body('firstName').notEmpty().withMessage('First name is required'),
    body('lastName').notEmpty().withMessage('Last name is required'),
    body('phoneNumber').notEmpty().withMessage('Phone number is required'),
  ],
  validationMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await authService.register(req.body);
      res.status(201).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     tags: [Authentication]
 *     summary: Customer login
 */
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Invalid email'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  validationMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await authService.login(req.body);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
```

---

## Testing Setup

### Jest Configuration

**File**: `jest.config.js`
```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.types.ts',
    '!src/**/*.d.ts',
    '!src/server.ts',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
};
```

### Unit Test Example

**File**: `src/modules/auth/auth.service.test.ts`
```typescript
import { AuthService } from './auth.service';
import prisma from '../../config/database';
import bcrypt from 'bcrypt';

jest.mock('../../config/database');
jest.mock('bcrypt');

describe('AuthService', () => {
  let authService: AuthService;

  beforeEach(() => {
    authService = new AuthService();
  });

  describe('register', () => {
    it('should register a new user', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        phoneNumber: '+250788123456',
        role: 'customer',
        status: 'active',
      };

      (prisma.user.findFirst as jest.Mock).mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');
      (prisma.user.create as jest.Mock).mockResolvedValue(mockUser);

      const result = await authService.register({
        email: 'test@example.com',
        password: 'Password123!',
        firstName: 'Test',
        lastName: 'User',
        phoneNumber: '+250788123456',
      });

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result.user.email).toBe('test@example.com');
    });
  });
});
```

---

## CI/CD Setup (GitHub Actions)

**File**: `.github/workflows/ci.yml`
```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:15-alpine
        env:
          POSTGRES_USER: postgres
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: test_db
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

      redis:
        image: redis:7-alpine
        ports:
          - 6379:6379

    steps:
      - uses: actions/checkout@v3

      - name: Build
        run: npm run build

  build-docker:
    runs-on: ubuntu-latest
    needs: test
    if: github.ref == 'refs/heads/main'

    steps:
      - uses: actions/checkout@v3

      - name: Build Docker image
        run: docker build -t credit-jambo-client-api .
```

---

## Dockerfile

**File**: `Dockerfile`
```dockerfile
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci
RUN npx prisma generate

COPY . .
RUN npm run build

FROM node:18-alpine AS production

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci --only=production
RUN npx prisma generate

COPY --from=builder /app/dist ./dist

EXPOSE 3000

CMD ["node", "dist/server.js"]
```

**File**: `.dockerignore`
```
node_modules
dist
.env
.git
.gitignore
README.md
npm-debug.log
coverage
.vscode
```

---

## Swagger Configuration

**File**: `src/config/swagger.config.ts`
```typescript
import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Credit Jambo Client API',
      version: '1.0.0',
      description: 'Digital Credit & Savings Platform - Customer API',
      contact: {
        name: 'Credit Jambo Ltd',
        email: 'hello@creditjambo.com',
        url: 'https://www.creditjambo.com',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./src/modules/**/*.controller.ts', './src/routes/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
```

---

## Validation Middleware

**File**: `src/common/middleware/validation.middleware.ts`
```typescript
import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { BadRequestError } from '../exceptions/BadRequestError';

export const validationMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(err => ({
      field: err.type === 'field' ? err.path : 'unknown',
      message: err.msg,
    }));

    throw new BadRequestError(
      'Validation failed',
      errorMessages
    );
  }

  next();
};
```

---

## Response Utility

**File**: `src/common/utils/response.util.ts`
```typescript
export const successResponse = <T>(data: T, message?: string) => ({
  success: true,
  message: message || 'Operation successful',
  data,
});

export const paginatedResponse = <T>(
  data: T[],
  page: number,
  limit: number,
  total: number
) => ({
  success: true,
  data,
  pagination: {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  },
});
```

---

## Custom Exceptions

**File**: `src/common/exceptions/BadRequestError.ts`
```typescript
import { AppError } from './AppError';

export class BadRequestError extends AppError {
  constructor(message: string = 'Bad request', public errors?: any[]) {
    super(message, 400);
  }
}
```

**File**: `src/common/exceptions/UnauthorizedError.ts`
```typescript
import { AppError } from './AppError';

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized') {
    super(message, 401);
  }
}
```

**File**: `src/common/exceptions/NotFoundError.ts`
```typescript
import { AppError } from './AppError';

export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found') {
    super(message, 404);
  }
}
```

**File**: `src/common/exceptions/ConflictError.ts`
```typescript
import { AppError } from './AppError';

export class ConflictError extends AppError {
  constructor(message: string = 'Resource already exists') {
    super(message, 409);
  }
}
```

---

## Express Type Extensions

**File**: `src/common/types/express.d.ts`
```typescript
import { JwtPayload } from '../utils/jwt.util';

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}
```

---

## Routes Registry

**File**: `src/routes/index.ts`
```typescript
import { Router } from 'express';
import authRoutes from '../modules/auth/auth.controller';
import usersRoutes from '../modules/users/users.controller';
import savingsRoutes from '../modules/savings/savings.controller';
import creditRoutes from '../modules/credit/credit.controller';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', usersRoutes);
router.use('/savings', savingsRoutes);
router.use('/credit', creditRoutes);

export default router;
```

---

## Savings Service Example

**File**: `src/modules/savings/savings.service.ts`
```typescript
import prisma from '../../config/database';
import { BadRequestError } from '../../common/exceptions/BadRequestError';
import { DepositDto, WithdrawDto } from './savings.types';

export class SavingsService {
  async getOrCreateAccount(userId: string) {
    let account = await prisma.savingsAccount.findUnique({
      where: { userId }
    });

    if (!account) {
      account = await prisma.savingsAccount.create({
        data: {
          userId,
          balance: 0,
          currency: 'RWF'
        }
      });
    }

    return account;
  }

  async deposit(userId: string, data: DepositDto) {
    const account = await this.getOrCreateAccount(userId);
    
    const balanceBefore = Number(account.balance);
    const balanceAfter = balanceBefore + data.amount;

    const [updatedAccount, transaction] = await prisma.$transaction([
      prisma.savingsAccount.update({
        where: { id: account.id },
        data: { balance: balanceAfter }
      }),
      prisma.transaction.create({
        data: {
          savingsAccountId: account.id,
          type: 'deposit',
          amount: data.amount,
          balanceBefore,
          balanceAfter,
          description: data.description,
          referenceNumber: this.generateReference(),
          status: 'completed'
        }
      })
    ]);

    return transaction;
  }

  async withdraw(userId: string, data: WithdrawDto) {
    const account = await this.getOrCreateAccount(userId);
    
    const balanceBefore = Number(account.balance);

    if (balanceBefore < data.amount) {
      throw new BadRequestError('Insufficient balance');
    }

    const balanceAfter = balanceBefore - data.amount;

    const [updatedAccount, transaction] = await prisma.$transaction([
      prisma.savingsAccount.update({
        where: { id: account.id },
        data: { balance: balanceAfter }
      }),
      prisma.transaction.create({
        data: {
          savingsAccountId: account.id,
          type: 'withdrawal',
          amount: data.amount,
          balanceBefore,
          balanceAfter,
          description: data.description,
          referenceNumber: this.generateReference(),
          status: 'completed'
        }
      })
    ]);

    return transaction;
  }

  async getBalance(userId: string) {
    const account = await this.getOrCreateAccount(userId);
    return {
      balance: Number(account.balance),
      currency: account.currency
    };
  }

  async getTransactions(userId: string, page: number = 1, limit: number = 10) {
    const account = await this.getOrCreateAccount(userId);

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where: { savingsAccountId: account.id },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.transaction.count({
        where: { savingsAccountId: account.id }
      })
    ]);

    return { transactions, total, page, limit };
  }

  private generateReference(): string {
    return `TXN${Date.now()}${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
  }
}
```

---

## Credit Service Example

**File**: `src/modules/credit/credit.service.ts`
```typescript
import prisma from '../../config/database';
import { NotFoundError } from '../../common/exceptions/NotFoundError';
import { BadRequestError } from '../../common/exceptions/BadRequestError';
import { RequestCreditDto, RepayCreditDto } from './credit.types';

export class CreditService {
  async requestCredit(userId: string, data: RequestCreditDto) {
    const creditRequest = await prisma.creditRequest.create({
      data: {
        userId,
        amount: data.amount,
        purpose: data.purpose,
        durationMonths: data.durationMonths,
        interestRate: 5.0,
        status: 'pending'
      }
    });

    return creditRequest;
  }

  async getUserCreditRequests(userId: string) {
    return prisma.creditRequest.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });
  }

  async getCreditRequestById(userId: string, requestId: string) {
    const creditRequest = await prisma.creditRequest.findFirst({
      where: {
        id: requestId,
        userId
      },
      include: {
        repayments: true
      }
    });

    if (!creditRequest) {
      throw new NotFoundError('Credit request not found');
    }

    return creditRequest;
  }

  async repayCredit(userId: string, requestId: string, data: RepayCreditDto) {
    const creditRequest = await prisma.creditRequest.findFirst({
      where: {
        id: requestId,
        userId,
        status: { in: ['approved', 'disbursed'] }
      }
    });

    if (!creditRequest) {
      throw new NotFoundError('Credit request not found or not eligible for repayment');
    }

    const repayment = await prisma.creditRepayment.create({
      data: {
        creditRequestId: requestId,
        amount: data.amount,
        referenceNumber: this.generateReference(),
        paymentDate: new Date()
      }
    });

    // Calculate total repaid
    const totalRepaid = await prisma.creditRepayment.aggregate({
      where: { creditRequestId: requestId },
      _sum: { amount: true }
    });

    const totalRepaidAmount = Number(totalRepaid._sum.amount || 0);
    const totalDue = Number(creditRequest.amount) * (1 + Number(creditRequest.interestRate) / 100);

    // Update status if fully repaid
    if (totalRepaidAmount >= totalDue) {
      await prisma.creditRequest.update({
        where: { id: requestId },
        data: { status: 'repaid' }
      });
    }

    return repayment;
  }

  async getRepaymentHistory(userId: string, requestId: string) {
    const creditRequest = await prisma.creditRequest.findFirst({
      where: {
        id: requestId,
        userId
      }
    });

    if (!creditRequest) {
      throw new NotFoundError('Credit request not found');
    }

    return prisma.creditRepayment.findMany({
      where: { creditRequestId: requestId },
      orderBy: { paymentDate: 'desc' }
    });
  }

  private generateReference(): string {
    return `REP${Date.now()}${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
  }
}
```

---

## Seed Data Script

**File**: `prisma/seed.ts`
```typescript
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');

  // Create test customer
  const hashedPassword = await bcrypt.hash('Password123!', 10);

  const customer = await prisma.user.upsert({
    where: { email: 'customer@test.com' },
    update: {},
    create: {
      email: 'customer@test.com',
      password: hashedPassword,
      firstName: 'John',
      lastName: 'Doe',
      phoneNumber: '+250788123456',
      role: 'customer',
      status: 'active'
    }
  });

  console.log('Created customer:', customer);

  // Create admin user
  const admin = await prisma.user.upsert({
    where: { email: 'admin@test.com' },
    update: {},
    create: {
      email: 'admin@test.com',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      phoneNumber: '+250788654321',
      role: 'admin',
      status: 'active'
    }
  });

  console.log('Created admin:', admin);

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

**Add to package.json**:
```json
{
  "prisma": {
    "seed": "ts-node prisma/seed.ts"
  }
}
```

**Run seed**:
```bash
npm run prisma:seed
```

---

## .gitignore

**File**: `.gitignore`
```
# Dependencies
node_modules/

# Build output
dist/

# Environment variables
.env
.env.local

# Logs
*.log
npm-debug.log*

# Testing
coverage/

# IDE
.vscode/
.idea/

# OS
.DS_Store
Thumbs.db

# Prisma
prisma/migrations/*_migration.sql
```

---

## Admin Backend Repo Name

**Repository Name**: `credit-jambo-admin-api`

---

## What to Copy to Admin Backend

When you start the admin backend, copy these folders/files:

```
src/
├── config/              ✅ COPY ALL
│   ├── database.ts
│   ├── jwt.config.ts
│   ├── redis.config.ts
│   └── swagger.config.ts
│
├── common/              ✅ COPY ALL
│   ├── middleware/
│   ├── utils/
│   ├── types/
│   └── exceptions/
│
prisma/
├── schema.prisma        ✅ COPY (entities only, modify later)
│
.env.example             ✅ COPY
tsconfig.json            ✅ COPY
docker-compose.yml       ✅ COPY
Dockerfile               ✅ COPY
```

**Admin-specific changes**:
- Modify auth to admin-only login (no registration)
- Add user management endpoints
- Add credit approval endpoints
- Add analytics endpoints

---

## Quick Start Commands

```bash
# Install dependencies
npm install

# Setup database
docker-compose up -d
npx prisma migrate dev
npx prisma generate
npm run prisma:seed

# Run development
npm run dev

# Run tests
npm test

# Build for production
npm run build
npm start
```

---

## Environment Variables Checklist

```env
NODE_ENV=development
PORT=3000
API_PREFIX=/api

DATABASE_URL=postgresql://postgres:postgres@localhost:5432/credit_jambo_client

JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=your-super-secret-refresh-key
JWT_REFRESH_EXPIRES_IN=7d

REDIS_HOST=localhost
REDIS_PORT=6379
``` Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Generate Prisma Client
        run: npx prisma generate

      - name: Run migrations
        run: npx prisma migrate deploy
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test_db

      - name: Run tests
        run: npm run test:cov
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test_db
          JWT_SECRET: test-secret
          JWT_REFRESH_SECRET: test-refresh-secret

      - name: