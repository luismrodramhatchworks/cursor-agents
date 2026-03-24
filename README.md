# Todo list with Next.js + Postgres + Docker

Task-focused UI backed by Postgres with a full CRUD API and tests.

## Quick start (local)

```bash
cp .env.example .env             # adjust if needed
docker compose up -d db          # start Postgres (published on localhost:5433)
npm install
npm run db:migrate
npm run db:seed                  # optional sample data
npm run dev                      # http://localhost:3000
```

## Tests

```bash
docker compose up -d db
npm run test
```
The test suite uses Vitest to hit the API route handlers and exercises create/read/update/delete against Postgres.

## Docker

Build and run the app + database together:

```bash
docker compose up --build
# then open http://localhost:3000 (Postgres available on localhost:5433)
```

The `app` service waits for the `db` healthcheck and runs `prisma migrate deploy` before starting.

## API reference

- `GET /api/todos` – list todos
- `POST /api/todos` – create todo `{ title, completed? }`
- `GET /api/todos/:id` – fetch single todo
- `PUT /api/todos/:id` – update `{ title?, completed? }`
- `DELETE /api/todos/:id` – remove

All routes return JSON and validate inputs with zod.
