# Credit Jambo Client API

Digital Credit & Savings Platform - Customer API

## Tech Stack

- Express.js (Node.js + TypeScript)
- PostgreSQL
- Prisma ORM
- JWT Authentication
- Redis (for queues)
- Bull Queue

## Getting Started

### Prerequisites

- Node.js 18+
- Docker & Docker Compose

### Installation

```bash
npm install
```

### Setup Database

```bash
docker-compose up -d
npx prisma migrate dev
npx prisma generate
```

### Environment Variables

Copy `.env.example` to `.env` and configure.

### Run Development Server

```bash
npm run dev
```


## API Documentation

Swagger docs available at: `http://localhost:3000/api/docs`

