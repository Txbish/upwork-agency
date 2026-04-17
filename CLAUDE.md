# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Agency Operations Platform (AOP) — internal tool for a freelance agency that bids on Upwork. Manages the full lifecycle: **Bid > Interview > Meeting > Deal > Project > Delivery > QA**. Multi-tenant via Organizations.

## Tech Stack

| Layer           | Tech                                                        | Notes                                                   |
| --------------- | ----------------------------------------------------------- | ------------------------------------------------------- |
| Backend         | NestJS 10 + Bun                                             | Port 3001, global prefix `api/`, Swagger at `/api/docs` |
| ORM             | Prisma 7                                                    | Uses `@prisma/adapter-pg` (Postgres adapter)            |
| Database        | PostgreSQL (AlwaysData hosted)                              | Live DB, not Docker                                     |
| Auth            | JWT (15min access) + UUID refresh tokens (7-day, DB-stored) |
| Frontend        | Next.js 14 (App Router) + TypeScript                        | Port 3000                                               |
| State           | TanStack Query v5                                           | 5min stale, retry 1, no refetch on window focus         |
| UI              | shadcn/ui (Radix) + Tailwind CSS v3 + Framer Motion         |
| Package Manager | Bun (monorepo)                                              |
| Formatting      | treefmt + Prettier                                          | 100 char width, single quotes, trailing commas          |
| Git hooks       | lefthook                                                    | Pre-commit: treefmt + backend tsc + frontend tsc        |

## Common Commands

```bash
# Development
bun run dev:backend          # NestJS watch mode (port 3001)
bun run dev:frontend         # Next.js dev (port 3000)

# Build
bun run build:backend        # nest build
bun run build:frontend       # next build

# Database (run from backend/)
cd backend
bun run db:generate          # prisma generate
bun run db:migrate           # prisma migrate dev
bun run db:seed              # bun run prisma/seed.ts
bun run db:studio            # prisma studio GUI

# Formatting & Linting
bun run lint                 # lint both frontend + backend
bun run format               # treefmt (auto-fix)
bun run format:check         # treefmt --fail-on-change

# Tests (from backend/)
cd backend
bun run test                 # jest unit tests
bun run test:e2e             # jest --config ./test/jest-e2e.json
bun run test:e2e -- --testPathPattern=auth   # run single e2e suite
```

## Architecture

### Backend (`backend/src/`)

NestJS modular monolith. All routes prefixed with `/api/`. Global guards: `JwtAuthGuard` + `RolesGuard` applied to every route by default.

- **`common/decorators/`** — `@Public()` skips auth, `@CurrentUser()` injects JWT payload, `@Roles('admin')` restricts access
- **`common/guards/`** — `JwtAuthGuard` (reads Bearer token, sets `req.user`), `RolesGuard` (checks role metadata)
- **`common/interfaces/jwt-payload.interface.ts`** — `{ sub, email, role, teamId?, organizationId? }`
- **`prisma/prisma.service.ts`** — PrismaClient with `@prisma/adapter-pg` pooled connections
- **`modules/`** — Feature modules: `identity` (auth + users), `organizations`, `projects`, `niches`, `video`, `meetings`, `tasks`, `qa`, `events`, `experiments`, `analytics`

The **Project** model is the core entity. It tracks the full pipeline via `ProjectStage` enum:
`DISCOVERED → SCRIPT_REVIEW → UNDER_REVIEW → ASSIGNED → BID_SUBMITTED → VIEWED → MESSAGED → INTERVIEW → WON → IN_PROGRESS → COMPLETED (or LOST/CANCELLED)`

### Frontend (`frontend/src/`)

Next.js App Router with route groups: `(auth)` for login, `(dashboard)` for all protected pages.

- **`lib/api.ts`** — Axios instance with Bearer interceptor and queued 401 refresh flow (prevents thundering herd during token expiry)
- **`lib/auth.ts`** — localStorage helpers: `aop_token`, `aop_refresh_token`, `aop_active_org`
- **`components/auth-provider.tsx`** — Auth context: user state, login/logout, org switching
- **`hooks/`** — One hook file per domain (e.g., `use-projects.ts`, `use-meetings.ts`). Each exports TanStack Query hooks for CRUD operations.
- **`types/index.ts`** — All TypeScript enums + interfaces mirroring the Prisma schema

### Auth Flow

1. Login returns access + refresh tokens; stored in localStorage
2. Axios request interceptor attaches Bearer token
3. On 401: queues pending requests, refreshes token, retries queue
4. Org switching issues new tokens with `organizationId` in JWT payload

### Multi-tenancy

Organizations scope all data. JWT payload includes `organizationId`. Backend filters queries by org. Frontend stores active org in `aop_active_org` localStorage key.

## Database

Schema at `backend/prisma/schema.prisma`. Key models: `User`, `Organization`, `UserOrganization`, `Project` (core pipeline entity), `Niche`, `Meeting`, `Task`, `QAReview`, `Event`, `Experiment`.

All tables use UUID primary keys and snake_case column mapping via `@@map`.

## Seed Data

Run `cd backend && bun run db:seed`. Creates roles (admin, bidder, closer, developer, qa, script_writer, leadership), teams, users, niches, and 34 demo projects across 3 organizations. All user passwords: `password123`. Admin: `admin@aop.local`.

## Pre-commit Hooks (lefthook)

Runs in parallel on every commit:

1. `treefmt --fail-on-change` — formatting check
2. `bunx tsc --noEmit` in `backend/` — TypeScript check
3. `bunx tsc --noEmit` in `frontend/` — TypeScript check

## Key Patterns

- Backend pagination returns flat `{ data, total, page, limit, totalPages }` shape
- Frontend types define `PaginatedResponse<T>` with nested `meta` — verify shape matches when adding new paginated endpoints
- New backend modules: create module + controller + service + DTOs in `modules/`, register in `app.module.ts`
- New frontend pages: add to `app/(dashboard)/`, create hooks in `hooks/`, add nav item in `components/layout/sidebar.tsx` with role filtering
- API base URL configured via `NEXT_PUBLIC_API_URL` env var (default `http://localhost:3001/api`)
