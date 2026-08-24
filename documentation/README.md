# ReviewPulse SaaS

A REST API that turns raw e-commerce buyer reviews into structured defect data. Send a product keyword, get back which aspect of the product people are complaining about, a CSAT score per aspect, and a ranked list of fixes — gated by an API key, the same pattern as OpenRouter or a weather API.

**Live**
- API: `https://046-paw-tubes.vercel.app/api/v1`
- Dashboard: `https://046-paw-tubes-gjac.vercel.app`
- API docs: `https://046-paw-tubes-gjac.vercel.app/docs`

---

## Overview

A seller (or any developer building on top of the seller's data) registers an account, generates an API key from the dashboard, and calls one endpoint — `POST /review/analyze` — with a product keyword and platform. The API samples relevant reviews, runs sentiment and aspect-flaw extraction on them, and returns a structured breakdown: complaint categories, per-aspect satisfaction scores, and prioritized action items. Results are cached per keyword for 24 hours, so repeated lookups don't re-run the pipeline.

The project exists to demonstrate a complete SaaS data-API pattern for a web-service practicum: authenticated user accounts, key-based third-party access, a relational schema with real foreign keys, and a processing pipeline that does more than CRUD.

---

## Architecture

```
                    ┌─────────────────────┐
                    │   GitHub Repo        │
                    │   (1 repo, monorepo) │
                    └──────────┬───────────┘
                               │
                 ┌─────────────┴─────────────┐
                 ▼                             ▼
      ┌─────────────────────┐      ┌─────────────────────┐
      │  Vercel Project #1   │      │  Vercel Project #2   │
      │  Root: /frontend      │      │  Root: /backend      │
      │  Next.js 15 (App     │      │  Express.js REST API  │
      │  Router)              │      │                       │
      └──────────┬───────────┘      └──────────┬───────────┘
                 │  fetch (X-API-KEY /            │
                 │  Authorization: Bearer)         │
                 └─────────────►◄───────────────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │  Supabase PostgreSQL  │
                    │  (Sequelize ORM)      │
                    └─────────────────────┘
```

One GitHub repository, two independent Vercel projects (Root Directory set per project), one shared Postgres database on Supabase. Frontend never talks to the database directly — every read/write goes through the Express API.

---

## Tech stack

| Layer | Choice |
|---|---|
| Backend runtime | Node.js + Express.js |
| ORM | Sequelize 6 |
| Database | PostgreSQL via Supabase |
| Auth (dashboard) | JWT (`jsonwebtoken`), password hashing via `bcryptjs` |
| Auth (data API) | Static API key (`X-API-KEY` header) |
| Sentiment engine | `vader-sentiment` + a hand-built Indonesian aspect lexicon |
| Frontend | Next.js 15 (App Router), Tailwind CSS |
| Deployment | Vercel (2 projects from 1 repo), auto-deploy on push to `main` |

---

## User roles

| Role | How they authenticate | What they can do |
|---|---|---|
| **Seller** (dashboard user) | JWT, `Authorization: Bearer <token>` | Register, log in, generate/list/revoke their own API keys, browse analysis history and API docs in the browser |
| **API Consumer** (external client) | API key, `X-API-KEY` header | Call `POST /review/analyze` and `GET /review/history` — no login session, no dashboard access |

These two credentials are deliberately not interchangeable: a JWT never authorizes `/review/analyze`, and an API key never authorizes the key-management routes. See `documentation/usecase/`.

---

## API endpoints

Base URL: `https://046-paw-tubes.vercel.app/api/v1` (plus `GET /health` at the domain root, outside the `/api/v1` prefix).

### Public endpoints (no credentials required)

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/health` | Liveness check — confirms the backend is up and the DB connection succeeded |
| `POST` | `/auth/register` | Create a seller account (`email`, `password`, `fullName`, `companyName`) |
| `POST` | `/auth/login` | Exchange credentials for a JWT |
| `GET` | `/review/history` | List past product analyses |

### Protected endpoints

| Method | Path | Auth required | Purpose |
|---|---|---|---|
| `POST` | `/user/api-keys` | JWT Bearer | Generate a new API key. The full key is returned **only in this response** — never again |
| `GET` | `/user/api-keys` | JWT Bearer | List the caller's own keys (prefix + quota only, never the full key) |
| `DELETE` | `/user/api-keys/:keyId` | JWT Bearer | Revoke a key immediately |
| `POST` | `/review/analyze` | `X-API-KEY` | The core data endpoint — analyze reviews for a `keyword` + `platform` |

Full request/response examples: `https://046-paw-tubes-gjac.vercel.app/docs`.

---

## What this API provides

`POST /review/analyze` doesn't just return raw text — it groups every review into:

- **Sentiment class** — positive / neutral / negative, from VADER compound score
- **Complaint aspect** — battery, packaging, shipping, quality (lexicon-matched against the review text)
- **Severity per aspect** — low / medium / high, from complaint frequency
- **CSAT per aspect** (1.00–5.00) and an overall average CSAT for the product
- **Ranked fix recommendations** — one actionable suggestion per aspect with a medium/high severity complaint
- **Platform tag** — shopee / tokopedia / lazada / amazon / tiktokshop / blibli, as supplied in the request

That grouped structure — not the raw review list — is what a client is actually paying an API call for.

---

## System flow: registration to first successful call

1. **Register** — `POST /auth/register`. Password is hashed with bcrypt before it touches the database; the response includes a JWT immediately, so no separate login step is needed right after signup.
2. **Generate an API key** — `POST /user/api-keys` with the JWT as a Bearer token. This is the only response that ever contains the full `rp_...` secret.
3. **Call the data endpoint** — `POST /review/analyze` with the key as `X-API-KEY`. The JWT is no longer involved from here on; this call could come from a server that never sees the seller's password.
4. **Cache check** — the backend checks `product_analyses` for a row matching the keyword created in the last 24 hours.
   - **Hit:** the cached row is returned as-is (`cached: true`), no reprocessing.
   - **Miss:** reviews are sampled from the seed dataset, run through the sentiment + aspect-flaw pipeline, scored, and the result is written as a new row (`cached: false`).
5. **Every call is logged** to `usage_logs` regardless of cache outcome, against both the calling user and the specific key used.
6. **History** — `GET /review/history` returns past analyses; the dashboard's "Scraped History" page renders this.

Full step-by-step branching: `documentation/activity/activity.puml` (rendered: `documentation/activity/png/activity.png`).

---

## Models used

### Data models (Sequelize ORM, `backend/models/`)

| Model | Table | Key relationships |
|---|---|---|
| `User` | `users` | Has many `ApiKey`, has many `UsageLog` |
| `ApiKey` | `api_keys` | Belongs to `User`, has many `UsageLog` |
| `ProductAnalysis` | `product_analyses` | Standalone — keyed by `keyword`, not by user (shared cache) |
| `UsageLog` | `usage_logs` | Belongs to `User`, belongs to `ApiKey` |

Full column list and relationships: `documentation/erd/erd.puml` (rendered: `documentation/erd/png/erd.png`).

### Sentiment / NLP model

Not a trained ML model — a deterministic pipeline (`backend/services/aiAnalyzer.js`):

1. **VADER** (`vader-sentiment`) scores each review's compound polarity → positive / neutral / negative.
2. A hand-written **Indonesian keyword lexicon** matches review text against four complaint aspects (battery, packaging, shipping, quality).
3. Aspect CSAT is derived from the general CSAT minus a penalty scaled by complaint count and severity.
4. A static recommendation template is selected per aspect + severity combination.

The review text itself is sampled from a 565-review pool sourced from a public HuggingFace dataset of real Indonesian e-commerce reviews (`backend/data/reviewSeed.json`), deterministically selected by hashing the request keyword — not scraped live per request.

---

## Diagrams

| Diagram | Format | Source | Rendered PNG |
|---|---|---|---|
| Entity Relationship Diagram | PlantUML | `documentation/erd/erd.puml` | `documentation/erd/png/erd.png` |
| Use Case Diagram | PlantUML | `documentation/usecase/usecase.puml` | `documentation/usecase/png/usecase.png` |
| Activity Diagram / User Flow | PlantUML | `documentation/activity/activity.puml` | `documentation/activity/png/activity.png` |

Regenerate any diagram after editing its `.puml` source:

```bash
java -jar plantuml.jar -tpng documentation/erd/erd.puml -o png
java -jar plantuml.jar -tpng documentation/usecase/usecase.puml -o png
java -jar plantuml.jar -tpng documentation/activity/activity.puml -o png
```

(`plantuml.jar` — download from [plantuml.com](https://plantuml.com/download), requires a Java runtime.)

---

## Local development

```bash
# Backend
cd backend
npm install
cp .env.example .env   # fill in DATABASE_URL, JWT_SECRET
npm run dev             # http://localhost:8000

# Frontend
cd frontend
npm install
npm run dev              # http://localhost:3000
```

## Deployment

Two Vercel projects from this one repository — Root Directory `backend` for the API, Root Directory `frontend` for the dashboard. Push to `main` auto-deploys both. Required environment variables: `DATABASE_URL`, `JWT_SECRET`, `NODE_ENV=production` (backend); `NEXT_PUBLIC_API_URL` (frontend, pointing at the backend's production URL).
