# Acquisitions API 🚀

A secure, Dockerized Node.js + Express REST API for user management and acquisitions workflows.

[![Node.js](https://img.shields.io/badge/Node.js-v20-green?logo=node.js&logoColor=white)](https://nodejs.org)
[![Express](https://img.shields.io/badge/Express-5.x-blue?logo=express&logoColor=white)](https://expressjs.com)
[![Drizzle ORM](https://img.shields.io/badge/Drizzle%20ORM-0.45-orange)](https://orm.drizzle.team)
[![Docker](https://img.shields.io/badge/Docker-ready-blue?logo=docker&logoColor=white)](https://www.docker.com)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](/LICENSE)

## Overview

**Acquisitions** is a modern, production-ready Node.js REST API built with Express.js and Drizzle ORM. It includes secure authentication (JWT + cookies), role-based access control (guest/user/admin), rate limiting, bot protection, and full Docker support — both for development (with Neon Local ephemeral branches) and production.

Ideal as a secure boilerplate for:
- Role-based APIs
- Dockerized Node.js services
- Neon Postgres + Drizzle ORM projects
- APIs with strong security (Arcjet)

## ✨ Features

- 🔐 JWT authentication with secure cookies
- 👤 Full user management (sign-up, sign-in, list, get by ID, update, delete)
- 🛡️ Role-based authorization (admin/user/guest)
- ⚡ Rate limiting per role (Arcjet sliding window)
- 🤖 Bot detection & Shield protection (Arcjet)
- 🐳 Docker + Docker Compose (separate dev & prod configs)
- 🌱 Neon Local for isolated dev database branches
- 🗄️ Schema migrations with Drizzle Kit
- 📝 Zod validation, Winston logging, Helmet security
- 🔄 Hot reload in development

## 🛠 Tech Stack

| Category            | Technology                              |
|---------------------|-----------------------------------------|
| Runtime             | Node.js 20                              |
| Framework           | Express.js                              |
| Database            | PostgreSQL (Neon serverless)            |
| ORM                 | Drizzle ORM + @neondatabase/serverless  |
| Auth                | JWT, bcrypt, cookie-parser              |
| Validation          | Zod                                     |
| Security            | Arcjet (rate limit, bot detection, shield), Helmet |
| Logging             | Winston                                 |
| Containerization    | Docker, Docker Compose                  |
| Dev DB              | Neon Local (ephemeral branches)         |

## 📋 Prerequisites

- Node.js ≥ 20
- Docker & Docker Compose
- Git
- (Production) Neon Postgres account + project

## 🚀 Quick Start – Development

### 1. Clone the repository

```bash
git clone https://github.com/Obomhese-Raphael/acqusitions.git
cd acqusitions
```

### 2. Copy and configure environment file

```bash
cp .env.development.example .env.development
```

→ Fill in your Neon API key, project ID, branch ID, etc.

### 3. Start everything with one command

```bash
npm run dev:docker
```

This will:
- Start Neon Local proxy
- Apply migrations automatically
- Run the app with hot reload

### 4. Test the API

- **Health check:** http://localhost:3000/health
- **Sign up:** POST http://localhost:3000/api/auth/sign-up
- **Get users:** GET http://localhost:3000/api/users (after login)

## 🏭 Production Deployment

### 1. Prepare production environment file

```bash
cp .env.production.example .env.production
```

### 2. Start production container

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

### 3. (Optional) Apply migrations manually

```bash
docker compose -f docker-compose.prod.yml exec app npm run db:migrate
```

### 4. Access the API

Access the API at http://localhost:3000 (or your domain)

## 📜 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Run locally without Docker (node --watch) |
| `npm run dev:docker` | Full dev env with Neon Local + hot reload |
| `npm run prod:docker` | Start production container |
| `npm run db:generate` | Generate new Drizzle migrations |
| `npm run db:migrate` | Apply pending migrations |
| `npm run db:studio` | Open Drizzle Studio (DB browser) |
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Auto-fix lint issues |
| `npm run format` | Run Prettier |

## 🔐 Security & Auth Flow

1. **Sign-up** → POST `/api/auth/sign-up` → creates user + sets JWT cookie
2. **Sign-in** → POST `/api/auth/sign-in` → verifies credentials → sets JWT cookie
3. **Optional auth** → attaches `req.user` if token exists (doesn't block)
4. **Required auth** → returns 401 if no/invalid token
5. **Rate limiting** → guest: 5/min, user: 10/min, admin: 20/min
6. **Bot protection** → Arcjet blocks automated requests (configurable allow-list for dev tools)

## 🌐 API Endpoints (Overview)

| Method | Endpoint | Description | Auth required? |
|--------|----------|-------------|----------------|
| POST | `/api/auth/sign-up` | Register new user | No |
| POST | `/api/auth/sign-in` | Login & get JWT cookie | No |
| GET | `/api/users` | List all users | Yes (admin) |
| GET | `/api/users/:id` | Get user by ID | Yes (self/admin) |
| PUT | `/api/users/:id` | Update user | Yes (self/admin) |
| DELETE | `/api/users/:id` | Delete user | Yes (self/admin) |
| GET | `/health` | Health check | No |

## 🤝 Contributing

Contributions are welcome!

1. Fork the repo
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Please ensure linting passes and follow the existing code style.

## 📄 License

This project is licensed under the ISC License — see the [LICENSE](LICENSE) file for details.

## 📬 Author & Contact

**Raphael Obomhese**

- GitHub: [@Obomhese-Raphael](https://github.com/Obomhese-Raphael)
- Location: Lagos, Nigeria
