# 🚀 Panduan Produksi & Deployment: ReviewPulse SaaS

Dokumen ini berisi panduan komprehensif untuk merilis (*deploy*) platform **ReviewPulse SaaS** ke lingkungan produksi (**Vercel & Supabase Cloud**) serta panduan implementasi **Live Real-Time Scraping**.

---

## 🏗️ 1. Arsitektur Produksi

```
[ Frontend: Next.js 16 ] (Vercel Edge / Serverless)
         │
         ▼ (HTTPS CORS API Requests)
[ Backend: Express.js API ] (Vercel Serverless Function)
         │
         ├───────────────────────────────┬───────────────────────────────┐
         ▼                               ▼                               ▼
[ Supabase PostgreSQL ]         [ VADER NLP Engine ]           [ Scraping Upstream ]
(Connection Pooler :6543)       (CPU-bound Local Node.js)       (RapidAPI / Official API)
```

---

## 🗄️ 2. Langkah 1: Setup Database Supabase Cloud

1. Buka [supabase.com](https://supabase.com/) dan buat project baru (Free Plan).
2. Pilih Region terdekat (misalnya: `Singapore (ap-southeast-1)`).
3. Masuk ke menu **SQL Editor**, salin seluruh isi file `backend/schema.sql`, lalu klik tombol **Run**.
4. Masuk ke menu **Project Settings ➔ Database ➔ Connection string**:
   * Pilih tab **URI** atau **Transaction Pooler (Port 6543)**.
   * Salin connection string tersebut (contoh: `postgres://postgres.[REF]:[PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres`).

---

## ⚙️ 3. Langkah 2: Deploy Backend ke Vercel

1. Push repository Anda ke GitHub:
   ```bash
   git add .
   git commit -m "feat: production ready"
   git push origin main
   ```
2. Buka [vercel.com/dashboard](https://vercel.com/dashboard) ➔ Klik **"Add New..." ➔ "Project"**.
3. Pilih repository GitHub Anda.
4. Pada bagian **Root Directory**, klik **Edit** dan pilih folder **`backend`**.
5. Buka accordion **Environment Variables** dan masukkan variabel berikut:

| Key | Value Contoh | Deskripsi |
|---|---|---|
| `DATABASE_URL` | `postgres://postgres.xxx:pass@pooler.supabase.com:6543/postgres` | URI PostgreSQL Supabase |
| `JWT_SECRET` | `reviewpulse_production_secret_key_2026_xyz` | Kunci rahasia token JWT |
| `NODE_ENV` | `production` | Mengaktifkan mode produksi & SSL |

6. Klik tombol **Deploy**.
7. Setelah selesai, salin URL backend produksi Anda (contoh: `https://reviewpulse-backend.vercel.app`).

---

## 🖥️ 4. Langkah 3: Deploy Frontend ke Vercel

1. Di Dashboard Vercel, klik **"Add New..." ➔ "Project"**.
2. Pilih repository GitHub yang sama.
3. Pada bagian **Root Directory**, pilih folder **`frontend`**.
4. Buka accordion **Environment Variables** dan masukkan:

| Key | Value Contoh | Deskripsi |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `https://reviewpulse-backend.vercel.app/api/v1` | URL Backend Vercel Anda |

5. Klik tombol **Deploy**.
6. Website frontend Anda sekarang sudah aktif dan dapat diakses publik di URL Vercel (contoh: `https://reviewpulse.vercel.app`).

---

## 🌐 5. Strategi Live Real-Time Scraping di Production

Di lingkungan serverless (Vercel), scraping langsung menggunakan browser lokal (seperti Puppeteer Chromium) memiliki limit ukuran file (50MB) dan berisiko terkena blokir CAPTCHA Cloudflare dari marketplace.

Gunakan salah satu dari **2 metode industri teruji** berikut untuk scraping real-time di produksi:

### Opsi A: Third-Party Scraper API (RapidAPI / ScraperAPI) — *Rekomendasi*
Layanan ini menangani rotasi proxy IP Indonesia dan bypass CAPTCHA secara otomatis:

1. Daftar di [RapidAPI](https://rapidapi.com/) dan subscribe ke API e-commerce (misal: *Shopee Scraper API* / *Amazon Data Scraper*).
2. Tambahkan API Key ke Environment Variables Vercel Backend:
   ```env
   RAPIDAPI_KEY=your_rapidapi_key_here
   ```
3. Backend ReviewPulse (`services/reviewFetcher.js`) secara otomatis memanggil upstream API dan mengekstrak ulasan pembeli real-time.

### Opsi B: Official Marketplace Open Platform API (Resmi B2B)
Jika toko Anda terdaftar sebagai Shopee Mall / Star Seller atau Tokopedia Official Partner:
1. Daftarkan aplikasi di [Shopee Open Platform](https://open.shopee.com/) atau [Tokopedia Developer](https://developer.tokopedia.com/).
2. Dapatkan *Partner ID* & *Partner Key*.
3. Panggil endpoint resmi:
   * Shopee: `POST /api/v2/order/get_order_review`
   * Tokopedia: `GET /v1/review/product/list`
4. **Kelebihan**: 100% legal, gratis, dan tidak ada risiko pemblokiran IP.

---

## 🛡️ 6. Checklist Keamanan & Monitoring Produksi

- [x] **Rate Limiter**: Telah aktif 200 request per 15 menit per IP untuk mencegah serangan DDoS (`server.js`).
- [x] **Auth Guard**: Halaman `/dashboard/*` diproteksi secara ketat dari akses unauthenticated (`layout.tsx`).
- [x] **Audit Trail Logging**: Setiap request yang menggunakan `X-API-KEY` dicatat ke tabel `usage_logs` lengkap dengan waktu respons.
- [x] **Parameterized Queries**: Semua query database menggunakan parameter (`$1`, `$2`) untuk mencegah SQL Injection.
- [x] **Dual-Mode Data Resiliency**: Jika database cloud mengalami maintenance sesaat, sistem fallback otomatis aktif untuk mencegah error 500 fatal.
