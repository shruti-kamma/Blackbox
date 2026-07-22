# Blackbox

An accessibility-focused platform for persons with disabilities (PwDs), spanning:

1. **`apps/job-portal`** — a hiring portal for PwDs, built accessibility-first.
2. **`apps/rankings`** — a public ranking of companies and universities by how
   accessible and inclusive they are.
3. **`apps/ngo-site`** — an NGO site (deferred, not actively developed yet).

A set of agent services automate the data behind these products:

- **`services/crawler`** — crawls company/university public pages for accessibility signals.
- **`services/matching-agent`** — LLM-assisted job-candidate matching.
- **`services/scoring-agent`** — generates accessibility/inclusion scores from crawl findings.

## Stack

- **Apps**: Next.js (TypeScript) + Tailwind CSS v4 + Radix UI primitives
- **Agents**: Python (FastAPI)
- **Database**: PostgreSQL (+ pgvector for embeddings), via Prisma from the Node side
- **Queue / cache**: Redis
- **Monorepo tooling**: pnpm workspaces + Turborepo

## Repo layout

```
/apps
  /job-portal      Next.js — job/hiring portal
  /rankings        Next.js — accessibility rankings
  /ngo-site        deferred
/services
  /crawler         Python/FastAPI
  /matching-agent  Python/FastAPI
  /scoring-agent   Python/FastAPI
/packages
  /ui              shared accessible component library
  /db              Prisma schema + client, shared across apps
  /matching-engine rule-based candidate-job scoring, used by job-portal's worker
  /config          shared eslint/tsconfig/tailwind config
```

## Getting started

### Node apps

```
pnpm install
cp packages/db/.env.example packages/db/.env   # then fill in DATABASE_URL
pnpm --filter @blackbox/db generate
pnpm dev
```

job-portal's candidate-job matching runs as a separate worker process — see
[`apps/job-portal/README.md`](apps/job-portal/README.md).

### Infra + agent services

```
docker compose up postgres redis
```

Each service under `/services` also runs standalone for local dev — see its README.
Copy each service's `.env.example` to `.env` before running `docker compose up` for
that service (docker-compose reads `.env`, not `.env.example`).
