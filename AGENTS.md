<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Cursor Cloud specific instructions

### Overview
Taskfolio — a Next.js 16 + Prisma + PostgreSQL todo-list CRUD app. Single service on port 3000 backed by Postgres on port 5433.

### Environment variable gotcha
The VM has injected secrets `DATABASE_URL` and `SHADOW_DATABASE_URL` that point to port **5432**. The docker-compose `db` service publishes Postgres on host port **5433**. You must override the env var before running any Prisma or app command:
```
export DATABASE_URL="postgresql://<user>:<pass>@localhost:5433/todos"
```
Use the same credentials as in `docker-compose.yml`. The `.env` file at the repo root has the correct value, but injected secrets take precedence. Always export explicitly or ensure `.env` is loaded by dotenv before Prisma CLI runs.

### Starting services
1. Start Docker daemon: `sudo dockerd &>/tmp/dockerd.log &` (wait ~3s)
2. Start Postgres: `docker compose up -d db` (wait for healthy)
3. Run migrations: `npm run db:migrate`
4. Dev server: `npm run dev` (port 3000)
5. Optional seed data: `npm run db:seed`

### Commands reference
| Task | Command |
|------|---------|
| Lint | `npm run lint` |
| Test | `npm run test` (runs migrations first, then vitest) |
| Build | `npm run build` |
| Generate Prisma client | `npm run prisma:generate` |
