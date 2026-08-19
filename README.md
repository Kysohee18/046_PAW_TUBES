# 🛍️ ReviewPulse SaaS — E-Commerce Review & Flaw Intelligence Platform

[![Next.js 16](https://img.shields.io/badge/Frontend-Next.js%2016%20(App%20Router)-black?style=flat&logo=next.js)](https://nextjs.org/)
[![Express.js](https://img.shields.io/badge/Backend-Express.js%20v4.21-green?style=flat&logo=express)](https://expressjs.com/)
[![PostgreSQL](https://img.shields.io/badge/Database-Supabase%20PostgreSQL-3ECF8E?style=flat&logo=supabase)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind%20CSS-38B2AC?style=flat&logo=tailwind-css)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

**ReviewPulse** adalah platform SaaS *B2B E-Commerce Customer Review Flaw Intelligence* yang dirancang untuk membantu seller online di **Shopee, Tokopedia, Lazada, dan Amazon** mengekstrak keluhan pembeli secara otomatis. Dengan memanfaatkan analisis sentimen VADER dan kamus aspek produk, ReviewPulse mengkategorikan bottleneck kualitas (baterai, kemasan, pengiriman, dan material), menghitung skor kepuasan CSAT (1.00 - 5.00), dan menyediakan rekomendasi perbaikan berbasis AI melalui Dashboard interaktif maupun **REST API** berkecepatan tinggi.

---

## 📌 Daftar Isi

1. [Arsitektur Sistem](#-arsitektur-sistem)
2. [Fitur Utama](#-fitur-utama)
3. [Teknologi yang Digunakan (Tech Stack)](#-teknologi-yang-digunakan-tech-stack)
4. [Struktur Direktori Proyek](#-struktur-direktori-proyek)
5. [Panduan Instalasi & Menjalankan Sistem](#-panduan-instalasi--menjalankan-sistem)
6. [Konfigurasi Environment Variables (`.env`)](#-konfigurasi-environment-variables-env)
7. [Skema Database Supabase PostgreSQL](#-skema-database-supabase-postgresql)
8. [Dokumentasi Lengkap REST API v1.0](#-dokumentasi-lengkap-rest-api-v10)
9. [Panduan Pengujian (Testing)](#-panduan-pengujian-testing)
10. [Panduan Deployment (Vercel & Supabase)](#-panduan-deployment-vercel--supabase)

---

## 🏗️ Arsitektur Sistem

```mermaid
graph TD
    subgraph "Frontend — Next.js 16 (Port 3000)"
        LP["Landing Page (/)"]
        AUTH_PAGE["Auth (/login, /register)"]
        DASH["Flaw Dashboard (/dashboard)"]
        HIST_PAGE["Scraped History (/dashboard/history)"]
        KEY_PAGE["Developer Tokens (/dashboard/api-keys)"]
        DOCS_PAGE["Interactive REST Docs (/docs)"]
    end

    subgraph "Backend — Express.js REST API (Port 8000)"
        RATE_LIMIT["Express Rate Limiter (200 req/15m)"]
        AUTH_MW["Dual Auth Middleware (JWT & X-API-KEY)"]
        AUTH_CTRL["Auth Controller (Register & Login)"]
        KEY_CTRL["API Key Controller (CRUD & Quota)"]
        REV_CTRL["Review Controller (Analyze & History)"]
    end

    subgraph "Processing & Ingestion Engine"
        INGEST["Review Ingestion Gateway (Shopee, Tokopedia, Amazon)"]
        VADER["VADER Sentiment Compound Scorer"]
        FLAW_EXT["Aspect Flaw Lexicon Matcher (Battery, Packaging, Shipping, Quality)"]
    end

    subgraph "Data Storage Layer"
        DB_POOL["Dual-Mode Data Adapter (database.js)"]
        SUPABASE[("Supabase PostgreSQL")]
        MEMORY_STORE[("In-Memory Mock Fallback")]
    end

    LP --> AUTH_PAGE
    AUTH_PAGE -->|"JWT Token"| DASH
    DASH -->|"Axios + X-API-KEY"| RATE_LIMIT
    HIST_PAGE -->|"Axios + Bearer"| RATE_LIMIT
    KEY_PAGE -->|"Axios + Bearer"| RATE_LIMIT
    
    RATE_LIMIT --> AUTH_MW
    AUTH_MW --> AUTH_CTRL
    AUTH_MW --> KEY_CTRL
    AUTH_MW --> REV_CTRL
    
    REV_CTRL --> INGEST
    INGEST --> VADER
    VADER --> FLAW_EXT
    FLAW_EXT --> REV_CTRL
    
    AUTH_CTRL --> DB_POOL
    KEY_CTRL --> DB_POOL
    REV_CTRL --> DB_POOL
    
    DB_POOL --> SUPABASE
    DB_POOL -.->|"Fallback saat offline"| MEMORY_STORE
```

---

## ✨ Fitur Utama

* 🔍 **Aspect Flaw Data Matrix**: Mengelompokkan komplain ulasan pembeli ke dalam 4 aspek kritikal (*Battery, Packaging, Shipping, Quality*) beserta tingkat keparahan (*High, Medium, Low*) dan dampak penalti skor CSAT.
* 📊 **Feature CSAT Breakdown**: Mengukur skor kepuasan pelanggan secara granular per dimensi produk (1.00 s/d 5.00) dengan visualisasi progress bar responsif.
* 🤖 **AI Action Items Generator**: Menghasilkan rekomendasi perbaikan operasional dan instruksi Quality Control (QC) otomatis berdasarkan aspek cacat yang paling banyak dikeluhkan.
* ⚡ **24-Hour Analysis Cache**: Menyimpan hasil analisis selama 24 jam untuk menghemat biaya panggilan scraping dan memberikan respons sub-100ms.
* 🔑 **Developer Tokens & Quota Management**: Merchant dapat membuat, menyalin, memonitor kuota berjalan (*Usage vs Limit*), serta mencabut kunci `X-API-KEY` untuk integrasi ke sistem gudang / ERP.
* 📥 **Scraped History & CSV Export**: Riwayat produk yang telah dianalisis tersimpan rapi, dapat dicari berdasarkan keyword/platform, dan dapat diekspor menjadi file CSV dengan 1 klik.
* 🌓 **Dual Theme (Light & Dark Mode)**: Antarmuka modern dengan transisi tema halus menggunakan `next-themes` dan Tailwind CSS.
* 🛡️ **Dual-Layer Authentication**: Proteksi ganda menggunakan JWT Token untuk Merchant Dashboard dan `X-API-KEY` untuk akses REST API.

---

## 💻 Teknologi yang Digunakan (Tech Stack)

### Frontend
* **Framework**: Next.js 16.0+ (App Router)
* **Bahasa**: TypeScript / React 19
* **Styling**: Tailwind CSS v4 + `@tailwindcss/postcss`
* **Icons**: `lucide-react`
* **HTTP Client**: Axios dengan request interceptor otomatis
* **Theming**: `next-themes` (Class-based dual mode)

### Backend
* **Runtime**: Node.js v20+ (CommonJS)
* **Framework**: Express.js v4.21+
* **Security & Auth**: `bcryptjs` (password hashing), `jsonwebtoken` (JWT), `cors`, `express-rate-limit`
* **NLP & Sentimen**: `vader-sentiment` (Compound Polarity Analyzer)
* **Database Driver**: `pg` (PostgreSQL Connection Pool)
* **Data Resiliency**: Dual-mode database layer (Supabase PostgreSQL + In-Memory Fallback)

---

## 📁 Struktur Direktori Proyek

```
reviewpulse-saas/
├── backend/
│   ├── config/
│   │   └── database.js            # Dual-mode PostgreSQL & in-memory adapter
│   ├── controllers/
│   │   ├── apiKeyController.js    # Pengelolaan kunci X-API-KEY
│   │   ├── authController.js      # Registrasi & Login JWT
│   │   └── reviewController.js    # Analisis sentimen, flaw, & riwayat
│   ├── middleware/
│   │   └── authMiddleware.js      # Verifikasi JWT Bearer & X-API-KEY quota
│   ├── routes/
│   │   └── api.js                 # Definisi rute REST API v1.0
│   ├── services/
│   │   ├── aiAnalyzer.js          # Engine VADER sentiment & flaw extraction
│   │   └── reviewFetcher.js       # Ingestion gateway ulasan e-commerce
│   ├── .env.example               # Template environment variables backend
│   ├── .env                       # File konfigurasi lokal aktif
│   ├── package.json               # Dependensi & script backend
│   ├── schema.sql                 # Skema DDL PostgreSQL Supabase
│   ├── server.js                  # Entry point Express.js & Rate Limiter
│   └── vercel.json                # Konfigurasi deployment serverless Vercel
├── frontend/
│   ├── app/
│   │   ├── dashboard/
│   │   │   ├── api-keys/page.tsx  # Halaman manajemen developer token
│   │   │   ├── history/page.tsx   # Halaman riwayat analisis & export CSV
│   │   │   ├── layout.tsx         # Dashboard sidebar & Auth Guard
│   │   │   └── page.tsx           # Halaman utama Flaw Intelligence
│   │   ├── docs/page.tsx          # Dokumentasi resmi REST API interaktif
│   │   ├── login/page.tsx         # Form login merchant
│   │   ├── register/page.tsx      # Form pendaftaran akun toko
│   │   ├── globals.css            # Styling global & animasi marquee
│   │   ├── layout.tsx             # Root layout & ThemeProvider
│   │   └── page.tsx               # Landing page & pricing table
│   ├── components/
│   │   ├── ThemeProvider.tsx      # Provider next-themes
│   │   └── ThemeToggle.tsx        # Tombol ganti Light/Dark Mode
│   ├── lib/
│   │   └── api.ts                 # Axios instance dengan Bearer interceptor
│   ├── public/
│   │   └── logos/                 # Logo vector resmi e-commerce (SVG)
│   │       ├── amazon.svg
│   │       ├── blibli.svg
│   │       ├── lazada.svg
│   │       ├── shopee.svg
│   │       ├── shopify.svg
│   │       ├── tiktokshop.svg
│   │       └── tokopedia.svg
│   ├── package.json               # Dependensi & script frontend Next.js
│   └── tsconfig.json              # Konfigurasi TypeScript
├── AGENT.md                       # Panduan operasional agen AI
├── CLAUDE.md                      # Petunjuk sistem & standar clean code
├── CONTEXT.md                     # Konteks arsitektur teknis master
├── README.md                      # Dokumentasi komprehensif proyek
└── TESTING.md                     # Panduan pengujian automated & manual
```

---

## 🚀 Panduan Instalasi & Menjalankan Sistem

### Prasyarat
* **Node.js**: Versi 20.x atau lebih baru ([Download Node.js](https://nodejs.org/))
* **npm**: Versi 10.x atau lebih baru

### 1. Clone & Masuk ke Direktori Proyek
```bash
git clone <repository-url>
cd reviewpulse-saas
```

### 2. Setup & Jalankan Backend (Port 8000)
Buka terminal pertama:
```bash
cd backend
npm install
node server.js
```
> Backend akan berjalan di `http://localhost:8000`. Cek endpoint health: `http://localhost:8000/health`.

### 3. Setup & Jalankan Frontend (Port 3000)
Buka terminal kedua:
```bash
cd frontend
npm install
npm run dev
```
> Frontend akan berjalan di `http://localhost:3000`. Buka di browser Anda.

---

## ⚙️ Konfigurasi Environment Variables (`.env`)

File konfigurasi backend terletak di `backend/.env`:

```env
# Port server backend Express.js
PORT=8000

# Mode aplikasi: development | production
NODE_ENV=development

# Rahasia tanda tangan JSON Web Token
JWT_SECRET=reviewpulse_super_secret_jwt_key_2026

# (Opsional) Connection string Supabase PostgreSQL Pooler
# Jika tidak diisi, backend otomatis menggunakan in-memory database fallback yang aman
DATABASE_URL=postgres://postgres.[YOUR-REF]:[YOUR-PASSWORD]@aws-0-[YOUR-REGION].pooler.supabase.com:6543/postgres
```

---

## 🗄️ Skema Database Supabase PostgreSQL

Jika menggunakan Supabase, buka **SQL Editor** di Dashboard Supabase dan jalankan skema berikut (`backend/schema.sql`):

```sql
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

## 🔌 Dokumentasi Lengkap REST API v1.0

### Base URL: `http://localhost:8000/api/v1`

### 1. Autentikasi (`/auth`)

#### `POST /auth/register` — Daftar Akun Seller Baru
* **Request Body**:
  ```json
  {
    "email": "seller@store.com",
    "password": "password123",
    "fullName": "Budi Santoso",
    "companyName": "TechStore Official"
  }
  ```
* **Response `201 Created`**:
  ```json
  {
    "status": "success",
    "message": "User registered successfully",
    "token": "eyJhbGciOiJIUzI1NiIsIn...",
    "user": { "id": 2, "email": "seller@store.com", "full_name": "Budi Santoso", "role": "seller" }
  }
  ```

#### `POST /auth/login` — Masuk ke Akun
* **Request Body**:
  ```json
  {
    "email": "seller@store.com",
    "password": "password123"
  }
  ```
* **Response `200 OK`**:
  ```json
  {
    "status": "success",
    "message": "Login successful",
    "token": "eyJhbGciOiJIUzI1NiIsIn...",
    "user": { "id": 2, "email": "seller@store.com", "full_name": "Budi Santoso" }
  }
  ```

---

### 2. Developer Tokens (`/user/api-keys`)
> Semua endpoint ini membutuhkan header `Authorization: Bearer <JWT_TOKEN>`.

#### `POST /user/api-keys` — Buat Kunci API Baru
* **Request Body**: `{"name": "Shopee Sync Key"}`
* **Response `201 Created`**:
  ```json
  {
    "status": "success",
    "message": "API Key generated successfully",
    "apiKey": {
      "id": 2,
      "name": "Shopee Sync Key",
      "key": "rp_03da91264470a20094770dc29e1c37650591817ddb7a9768",
      "key_prefix": "rp_03da9",
      "usage_limit": 1000,
      "usage_count": 0,
      "is_active": true
    }
  }
  ```

#### `GET /user/api-keys` — Daftar Kunci API Pengguna
* **Response `200 OK`**: Mengembalikan array seluruh kunci API beserta statistik kuota.

#### `DELETE /user/api-keys/:keyId` — Cabut Kunci API
* **Response `200 OK`**: `{"status": "success", "message": "API Key revoked successfully"}`

---

### 3. Flaw Intelligence & Review Analytics (`/review`)

#### `POST /review/analyze` — Ekstrak Keluhan & CSAT Produk
* **Header Wajib**: `X-API-KEY: rp_...`
* **Request Body**:
  ```json
  {
    "keyword": "TWS Wireless Earbuds",
    "platform": "shopee"
  }
  ```
* **Response `200 OK`**:
  ```json
  {
    "status": "success",
    "cached": false,
    "data": {
      "id": 2,
      "keyword": "tws wireless earbuds",
      "product_name": "TWS Wireless Earbuds",
      "platform": "shopee",
      "total_reviews": 12,
      "positive_count": 5,
      "negative_count": 4,
      "neutral_count": 3,
      "average_csat": 3.33,
      "flaws_detected": [
        { "aspect": "battery", "count": 3, "severity": "high", "impact": "-0.60 pts", "note": "Baterai cepat panas pas charging." },
        { "aspect": "packaging", "count": 2, "severity": "medium", "impact": "-0.40 pts", "note": "Kemasan kardus luar penyok." },
        { "aspect": "shipping", "count": 2, "severity": "low", "impact": "-0.40 pts", "note": "Pengiriman agak lambat." },
        { "aspect": "quality", "count": 1, "severity": "low", "impact": "-0.20 pts", "note": "Bahan plastik agak tipis." }
      ],
      "feature_csat": {
        "battery": 3.00,
        "packaging": 2.50,
        "shipping": 4.00,
        "quality": 3.67
      },
      "ai_action_items": [
        { "aspect": "battery", "recommendation": "Gunakan cell baterai berkapasitas lebih besar dan tambahkan instruksi pengisian daya yang aman." },
        { "aspect": "packaging", "recommendation": "Tambahkan kardus luar ganda dan bubble wrap minimal 3 lapis untuk melindungi produk." }
      ]
    }
  }
  ```

#### `GET /review/history` — Riwayat Seluruh Analisis Produk
* **Response `200 OK`**: Mengembalikan riwayat seluruh produk yang pernah dianalisis dan tersimpan di database/cache.

---

## 🧪 Panduan Pengujian (Testing)

Dokumentasi pengujian terperinci tersedia di file **[`TESTING.md`](TESTING.md)**:
* **Automated Script**: Menjalankan 9 skenario pengujian end-to-end dengan PowerShell/cURL.
* **Manual Testing Checklist**: 10 langkah verifikasi fungsi halaman web melalui browser.
* **Data Sources Explanation**: Penjelasan lengkap pipeline integrasi data Shopee, Tokopedia, dan Amazon.

---

## ☁️ Panduan Deployment Monorepo (Vercel & Supabase)

ReviewPulse SaaS menggunakan struktur **Monorepo (1 Repository GitHub ➔ 2 Project Vercel)**. Anda **tidak perlu memisahkan repository GitHub**.

### 1. Setup Database di Supabase Cloud (PostgreSQL)
1. Buat project baru di [supabase.com](https://supabase.com/).
2. Masuk ke menu **SQL Editor**, salin seluruh isi file `backend/schema.sql`, lalu klik **Run**.
3. Masuk ke **Project Settings ➔ Database ➔ Connection string (Transaction Pooler - Port 6543)** dan salin `DATABASE_URL`.

### 2. Deploy Project 1: Backend Express.js di Vercel
1. Buka [vercel.com/dashboard](https://vercel.com/dashboard) ➔ Klik **"Add New..." ➔ "Project"**.
2. Pilih repository GitHub Anda.
3. Pada bagian **Root Directory**, klik **Edit** dan pilih folder **`backend`**.
4. Masukkan Environment Variables:
   * `DATABASE_URL`: URI Supabase Transaction Pooler Anda.
   * `JWT_SECRET`: Kunci rahasia token JWT produksi.
   * `NODE_ENV`: `production`.
5. Klik **Deploy** dan salin URL Backend yang dihasilkan (misal: `https://reviewpulse-backend.vercel.app`).

### 3. Deploy Project 2: Frontend Next.js di Vercel
1. Di Dashboard Vercel, klik **"Add New..." ➔ "Project"**.
2. Pilih repository GitHub yang sama.
3. Pada bagian **Root Directory**, pilih folder **`frontend`**.
4. Masukkan Environment Variable:
   * `NEXT_PUBLIC_API_URL`: URL Backend Vercel Anda + `/api/v1` (misal: `https://reviewpulse-backend.vercel.app/api/v1`).
5. Klik **Deploy**. Website dan REST API Anda sekarang aktif 100% di internet!

---

## 📄 Lisensi
Didistribusikan di bawah lisensi MIT. Lihat file `LICENSE` untuk informasi lebih lanjut.
