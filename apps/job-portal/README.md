# job-portal

Next.js (App Router) hiring portal. Candidate/employer auth, candidate
profiles, job postings, and candidate–job matching.

## Local dev

```bash
cp .env.example .env       # then fill in AUTH_SECRET
pnpm install
pnpm --filter @blackbox/db migrate:dev   # requires Postgres with pgvector — see docker-compose.yml
pnpm dev                    # Next.js app on :3000
pnpm --filter job-portal worker   # separate process: the matching worker
```

The matching worker is a standalone process, not part of `next dev` —
job postings and profile edits enqueue a BullMQ job (Redis-backed) and
return immediately; the worker is what actually scores and writes
`Match` rows. Both `pnpm dev` and the worker need Postgres + Redis up
(`docker compose up postgres redis` from the repo root, or local
installs matching `.env`).

## Tests

```bash
pnpm --filter job-portal test              # this app's unit tests
pnpm --filter @blackbox/matching-engine test   # the core scoring logic
```
