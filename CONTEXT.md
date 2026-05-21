# Technical Context & Backend Architecture: ReviewPulse SaaS

## 📌 Project Overview

**ReviewPulse SaaS** is a specialized B2B E-Commerce Customer Review Flaw Intelligence platform. It extracts product complaints (battery degradation, fragile packaging, shipping delays, build quality issues) from buyer reviews across **Shopee, Tokopedia, Amazon, and Lazada**. It automatically computes aspect-level CSAT ratings (1.00 - 5.00) and provides actionable AI fix recommendations for e-commerce sellers and warehouse ERP systems via REST API.

---

## 🏗️ Tech Stack Specifications

* **Backend Engine**: Express.js (Node.js v20+) running on port `8000`.
* **Database**: Dual-mode data layer:
  - **Supabase PostgreSQL** via connection pool (`pg.Pool`) when `DATABASE_URL` is set.
  - **Resilient In-Memory Store** fallback for offline execution, testing, and zero-config demonstration.
* **Authentication**: Dual Auth Layer:
  1. **JWT (JSON Web Token)** for Dashboard user authentication (`Authorization: Bearer <token>`).
  2. **Secret API Key** for Developer REST API integrations (`X-API-KEY: rp_live_...`).
* **NLP & Sentiment Analysis**: Custom VADER-based Sentiment Analyzer + E-Commerce Lexicon Flaw Extractor (`services/aiAnalyzer.js`).
* **Scraper Service**: Real-time review fetcher & dynamic ingestion generator (`services/reviewFetcher.js`).
* **Frontend Application**: Next.js 16 App Router on port `3000` with Tailwind CSS & Light/Dark Mode.

---

## 🗄️ Supabase PostgreSQL Database Schema (`schema.sql`)

```sql
-- Schema Definition for ReviewPulse SaaS

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    company_name VARCHAR(255),
    role VARCHAR(50) DEFAULT 'seller',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS api_keys (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    key VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    key_prefix VARCHAR(10) NOT NULL,
    usage_limit INT DEFAULT 1000,
    usage_count INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_used TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS product_analyses (
    id SERIAL PRIMARY KEY,
    keyword VARCHAR(255) NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    platform VARCHAR(50) NOT NULL,
    total_reviews INT NOT NULL,
    positive_count INT DEFAULT 0,
    negative_count INT DEFAULT 0,
    neutral_count INT DEFAULT 0,
    average_csat NUMERIC(3,2) DEFAULT 0.00,
    flaws_detected JSONB NOT NULL DEFAULT '[]'::jsonb,
    feature_csat JSONB NOT NULL DEFAULT '{}'::jsonb,
    ai_action_items JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS usage_logs (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    api_key_id INT REFERENCES api_keys(id) ON DELETE CASCADE,
    endpoint VARCHAR(255) NOT NULL,
    method VARCHAR(10) NOT NULL,
    response_time NUMERIC(10,4),
    status_code INT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

---

## 🔌 API Endpoint Reference

### 1. Authentication Routes (`/api/v1/auth`)
* `POST /api/v1/auth/register`: Register new merchant account (`email, password, fullName, companyName`).
* `POST /api/v1/auth/login`: Authenticate merchant and return JWT token.

### 2. Developer Key Routes (`/api/v1/user/api-keys`)
* `POST /api/v1/user/api-keys`: Generate new secret API key (`rp_...`) [JWT Bearer Auth].
* `GET /api/v1/user/api-keys`: List merchant API keys and quota usage [JWT Bearer Auth].
* `DELETE /api/v1/user/api-keys/:keyId`: Revoke developer API key [JWT Bearer Auth].

### 3. Review Analytics Routes (`/api/v1/review`)
* `POST /api/v1/review/analyze`: Extract product complaints and calculate aspect CSAT ratings. Requires `X-API-KEY` header.
* `GET /api/v1/review/history`: Fetch historic scanned product analyses and flaw benchmarks.

---

## 💡 Backend Clean Code Directives

1. **Zero Over-commenting**: Write clear, self-documenting function names.
2. **Error Log Extraction**: Always inspect full, un-truncated error logs before diagnosing issues.
3. **Resilient Data Layer**: Keep database queries parameterized to prevent SQL injections.
