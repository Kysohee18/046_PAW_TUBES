# 🚀 Panduan Produksi & Deployment Vercel: ReviewPulse SaaS

Dokumen ini berisi panduan komprehensif untuk merilis (*deploy*) platform **ReviewPulse SaaS** ke lingkungan produksi (**Vercel & Supabase Cloud**) menggunakan struktur **Monorepo (1 Repository GitHub ➔ 2 Project Vercel)** serta panduan implementasi **Live Real-Time Scraping**.

---

## 🏗️ 1. Arsitektur Monorepo & Deployment di Vercel

Anda **TIDAK PERLU memisahkan repository GitHub**. Anda cukup menggunakan **1 repository GitHub yang sama** (`046_PAW_TUBES`), lalu di Vercel dibuat **2 Project terpisah** dengan mengatur **Root Directory**:

```
                              [ GitHub Repository ]
                              (046_PAW_TUBES: main)
                                        │
                    ┌───────────────────┴───────────────────┐
                    ▼                                       ▼
        [ Project 1: Frontend ]                 [ Project 2: Backend ]
        Root Directory: `frontend`              Root Directory: `backend`
        Framework: Next.js 16                   Framework: Other / Node.js
        URL: https://reviewpulse.vercel.app     URL: https://reviewpulse-backend.vercel.app
                    │                                       │
                    │         NEXT_PUBLIC_API_URL           │
                    └───────────────────────────────────────┘
```

---

## 🗄️ 2. Langkah 1: Setup Database Supabase Cloud (PostgreSQL)

1. Buka [supabase.com](https://supabase.com/) dan buat project baru (Free Plan).
2. Pilih Region terdekat (misalnya: `Singapore (ap-southeast-1)`).
3. Masuk ke menu **SQL Editor**, salin seluruh isi file `backend/schema.sql`, lalu klik tombol **Run**.
4. Masuk ke menu **Project Settings ➔ Database ➔ Connection string**:
   * Pilih tab **URI** atau **Transaction Pooler (Port 6543)**.
   * Salin connection string tersebut (contoh: `postgres://postgres.[REF]:[PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres`).

---

## ⚙️ 3. Langkah 2: Deploy Backend ke Vercel (Project 1)

1. Pastikan kode terbaru sudah di-push ke GitHub:
   ```bash
   git add .
   git commit -m "feat: ready for vercel production"
   git push origin main
   ```
2. Buka [vercel.com/dashboard](https://vercel.com/dashboard) ➔ Klik tombol **"Add New..." ➔ "Project"**.
3. Pilih repository GitHub Anda (`046_PAW_TUBES`).
4. **PENTING**: Pada bagian **Root Directory**, klik **Edit** dan pilih folder **`backend`**.
5. Buka accordion **Environment Variables** dan masukkan variabel berikut:

| Environment Variable | Value Contoh | Deskripsi |
|---|---|---|
| `DATABASE_URL` | `postgres://postgres.xxx:pass@pooler.supabase.com:6543/postgres` | URI PostgreSQL Supabase |
| `JWT_SECRET` | `reviewpulse_production_secret_key_2026_xyz` | Kunci rahasia token JWT |
| `NODE_ENV` | `production` | Mengaktifkan mode produksi & SSL |

6. Klik tombol **Deploy**.
7. Setelah selesai, salin URL backend produksi Anda (contoh: `https://reviewpulse-backend.vercel.app`).
8. Cek endpoint health di browser: `https://reviewpulse-backend.vercel.app/health`.

---

## 🖥️ 4. Langkah 3: Deploy Frontend ke Vercel (Project 2)

1. Kembali ke Dashboard Vercel ➔ Klik tombol **"Add New..." ➔ "Project"**.
2. Pilih repository GitHub yang sama (`046_PAW_TUBES`).
3. **PENTING**: Pada bagian **Root Directory**, klik **Edit** dan pilih folder **`frontend`**.
4. Buka accordion **Environment Variables** dan masukkan:

| Environment Variable | Value Contoh | Deskripsi |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `https://reviewpulse-backend.vercel.app/api/v1` | URL Backend Vercel Anda + `/api/v1` |

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

## 🛡️ 6. Checklist Keamanan & Troubleshooting Produksi

* **Masalah CORS**: `backend/server.js` sudah dilengkapi `cors()` sehingga aman dipanggil dari domain frontend Vercel manapun.
* **Database Connection Timeout**: Gunakan **Transaction Pooler (Port 6543)** dari Supabase, bukan Direct Connection (Port 5432) untuk serverless environment.
* **Rate Limiter**: Aktif 200 request per 15 menit per IP untuk mencegah abuse/DDoS (`server.js`).
* **Auth Guard**: Halaman `/dashboard/*` diproteksi secara ketat dari akses unauthenticated (`layout.tsx`).
* **Audit Trail Logging**: Setiap request yang menggunakan `X-API-KEY` dicatat ke tabel `usage_logs` lengkap dengan waktu respons.
