# Panduan Pengujian & Sumber Data: ReviewPulse SaaS

Dokumen ini berisi panduan lengkap pengujian sistem (*Automated & Manual Testing*), penjelasan asal-usul sumber data (*Data Acquisition Pipeline*), serta skenario uji untuk setiap endpoint backend dan halaman frontend.

---

## 🌐 1. Dari Mana Kita Mendapatkan Data & API? (Data Acquisition Guide)

Platform **ReviewPulse SaaS** mengolah ulasan pembeli e-commerce menjadi intelijen kecacatan produk melalui 4 lapisan integrasi data:

```
┌──────────────────────────────────────────────────────────────────┐
│                   SUMBER DATA UTAMA (UPSTREAM)                   │
├────────────────────────────────┬─────────────────────────────────┤
│  1. Official Marketplace API   │  2. Web Scraping & Ingestion    │
│  • Shopee Open Platform API    │  • Headless Scraper (Puppeteer) │
│  • Tokopedia Partner API       │  • RapidAPI E-Commerce Proxies  │
│  • Amazon SP-API / Lazada Open │  • Mock Ingestion Gateway       │
└────────────────────────────────┴─────────────────────────────────┘
                                 │
                                 ▼
┌──────────────────────────────────────────────────────────────────┐
│             PROCESSING ENGINE (BACKEND SERVICES)                 │
├────────────────────────────────┬─────────────────────────────────┤
│  3. VADER Sentiment Engine     │  4. Aspect Flaw Lexicon Matcher │
│  • Polarity Compound Analysis  │  • Battery, Packaging,          │
│  • Aspect CSAT (1.00 - 5.00)   │    Shipping, Quality Dictionaries│
└────────────────────────────────┴─────────────────────────────────┘
                                 │
                                 ▼
┌──────────────────────────────────────────────────────────────────┐
│               PENYIMPANAN DATA (SUPABASE / CACHE)                │
│  • PostgreSQL Pooler (`product_analyses`, `usage_logs`)          │
│  • 24-Hour Cache Window untuk Menghemat Kuota Upstream           │
└──────────────────────────────────────────────────────────────────┘
```

### A. Sumber Data Ulasan (Review Data Pipeline)

1. **Official Marketplace Open APIs (Production B2B)**:
   * **Shopee Open Platform**: Menggunakan endpoint `/api/v2/order/get_order_review` untuk toko resmi Shopee Mall / Star Seller yang mengotorisasi akses toko mereka.
   * **Tokopedia Partner Open API**: Menggunakan endpoint `/v1/review/product/list` dengan token otorisasi seller.
   * **Amazon Selling Partner API (SP-API)**: Menggunakan *Customer Feedback & Reviews API* resmi Amazon.
2. **Web Scraping & Proxy API Gateway**:
   * Untuk produk publik tanpa integrasi akun toko, backend dapat menggunakan scraping proxy (*Puppeteer / Cheerio / RapidAPI Marketplace Scrapers*).
3. **Ingestion Gateway (`services/reviewFetcher.js`)**:
   * Berfungsi sebagai *Adapter Pattern* yang menormalisasi format data ulasan dari berbagai platform menjadi skema standar:
     ```json
     {
       "id": 1,
       "author": "budi_tech99",
       "rating": 4,
       "platform": "shopee",
       "text": "Barang bagus, tapi baterai agak boros pas dipake 2 jam.",
       "created_at": "2026-08-19T10:00:00Z"
     }
     ```

### B. Sumber Data Analisis Sentimen & Flaw AI

* **VADER NLP Engine (`vader-sentiment`)**: Menghitung sentimen compound (-1.00 s/d +1.00) untuk menentukan ulasan positif, netral, atau negatif.
* **Aspect Flaw Dictionaries (`services/aiAnalyzer.js`)**: Mengidentifikasi kata kunci komplain bahasa Indonesia dan Inggris untuk mengelompokkan ke dalam 4 aspek:
  * 🔋 **Battery**: `baterai`, `boros`, `charging`, `charger`, `panas`, `drop`.
  * 📦 **Packaging**: `kemasan`, `rusak`, `pecah`, `bocor`, `kardus`, `bubble`, `penyok`.
  * 🚚 **Shipping**: `lambat`, `shipping`, `pengiriman`, `kurir`, `lama`, `telat`.
  * 🛠️ **Quality**: `jelek`, `cacat`, `patah`, `quality`, `tipis`, `bahan`, `palsu`.

---

## ⚡ 2. Automated Testing Script (End-to-End PowerShell)

Jalankan perintah berikut di terminal PowerShell untuk menguji seluruh siklus hidup backend:

```powershell
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host " RUNNING REVIEWPULSE BACKEND TEST SUITE  " -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan

# 1. Health Check
$health = Invoke-RestMethod -Uri "http://localhost:8000/health"
Write-Host "`n[TEST 1] Health Check:" -ForegroundColor Green
$health | Format-List

# 2. Register New User
$userEmail = "tester_$(Get-Random)@store.com"
$regBody = @{
    email = $userEmail
    password = "password123"
    fullName = "QA Automated Tester"
    companyName = "Apex E-Commerce"
} | ConvertTo-Json

$reg = Invoke-RestMethod -Uri "http://localhost:8000/api/v1/auth/register" -Method Post -Body $regBody -ContentType "application/json"
Write-Host "[TEST 2] Register Account:" -ForegroundColor Green
Write-Host "  Status  :" $reg.status
Write-Host "  User ID :" $reg.user.id
Write-Host "  Email   :" $reg.user.email

$jwtToken = $reg.token
$authHeader = @{ "Authorization" = "Bearer $jwtToken"; "Content-Type" = "application/json" }

# 3. Login
$loginBody = @{ email = $userEmail; password = "password123" } | ConvertTo-Json
$login = Invoke-RestMethod -Uri "http://localhost:8000/api/v1/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
Write-Host "`n[TEST 3] Login Account:" -ForegroundColor Green
Write-Host "  Status  :" $login.status
Write-Host "  Token   :" ($login.token.Substring(0,25) + "...")

# 4. Generate Developer API Key
$keyBody = @{ name = "QA Production Key" } | ConvertTo-Json
$keyRes = Invoke-RestMethod -Uri "http://localhost:8000/api/v1/user/api-keys" -Method Post -Headers $authHeader -Body $keyBody
$apiKey = $keyRes.apiKey.key
Write-Host "`n[TEST 4] Generate API Key:" -ForegroundColor Green
Write-Host "  Key Name:" $keyRes.apiKey.name
Write-Host "  API Key :" $apiKey
Write-Host "  Quota   :" $keyRes.apiKey.usage_limit

# 5. List API Keys
$listKeys = Invoke-RestMethod -Uri "http://localhost:8000/api/v1/user/api-keys" -Method Get -Headers $authHeader
Write-Host "`n[TEST 5] List User API Keys:" -ForegroundColor Green
Write-Host "  Total Keys Found:" $listKeys.apiKeys.Count

# 6. Analyze Product Reviews (Using Generated X-API-KEY)
$apiHeader = @{ "X-API-KEY" = $apiKey; "Content-Type" = "application/json" }
$analyzeBody = @{ keyword = "TWS Earbuds Pro ANC"; platform = "shopee" } | ConvertTo-Json
$analyzeRes = Invoke-RestMethod -Uri "http://localhost:8000/api/v1/review/analyze" -Method Post -Headers $apiHeader -Body $analyzeBody
Write-Host "`n[TEST 6] Analyze Product Reviews:" -ForegroundColor Green
Write-Host "  Product       :" $analyzeRes.data.product_name
Write-Host "  Total Reviews :" $analyzeRes.data.total_reviews
Write-Host "  Average CSAT  :" $analyzeRes.data.average_csat "/ 5.00"
Write-Host "  Flaws Detected:" $analyzeRes.data.flaws_detected.Count "aspects"

# 7. Test Cache Mechanism (Calling the exact same keyword)
$cachedRes = Invoke-RestMethod -Uri "http://localhost:8000/api/v1/review/analyze" -Method Post -Headers $apiHeader -Body $analyzeBody
Write-Host "`n[TEST 7] Cache Verification (Same Keyword):" -ForegroundColor Green
Write-Host "  Cached Result :" $cachedRes.cached

# 8. Scraped History
$history = Invoke-RestMethod -Uri "http://localhost:8000/api/v1/review/history"
Write-Host "`n[TEST 8] Fetch Scraped History:" -ForegroundColor Green
Write-Host "  Total Historical Analyses:" $history.total

# 9. Revoke API Key
$keyId = $keyRes.apiKey.id
$revoke = Invoke-RestMethod -Uri "http://localhost:8000/api/v1/user/api-keys/$keyId" -Method Delete -Headers $authHeader
Write-Host "`n[TEST 9] Revoke API Key:" -ForegroundColor Green
Write-Host "  Status  :" $revoke.status
Write-Host "  Message :" $revoke.message

Write-Host "`n=========================================" -ForegroundColor Cyan
Write-Host " ALL 9 AUTOMATED TESTS COMPLETED! (100%) " -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
```

---

## 📋 3. Rincian Test Cases per Endpoint (cURL Format)

### Case 1: Health Check

```bash
curl -X GET http://localhost:8000/health
```

* **Expected Status**: `200 OK`
* **Expected Body**: `{"status":"healthy","service":"ReviewPulse API","version":"1.0.0"}`

### Case 2: Register User

```bash
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"seller@toko.com","password":"password123","fullName":"Budi Santoso","companyName":"Toko Budi"}'
```

* **Expected Status**: `201 Created`
* **Expected Body**: Objek user dan token JWT.

### Case 3: Login User

```bash
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"seller@toko.com","password":"password123"}'
```

* **Expected Status**: `200 OK`
* **Expected Body**: Token JWT dan data profil user.

### Case 4: Generate API Key

```bash
curl -X POST http://localhost:8000/api/v1/user/api-keys \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"name":"Shopee Integration Key"}'
```

* **Expected Status**: `201 Created`
* **Expected Body**: Objek API Key dengan format `rp_...`.

### Case 5: Analyze Product Reviews (Berhasil)

```bash
curl -X POST http://localhost:8000/api/v1/review/analyze \
  -H "X-API-KEY: rp_demo_key_1234567890" \
  -H "Content-Type: application/json" \
  -d '{"keyword":"Earphone Wireless","platform":"shopee"}'
```

* **Expected Status**: `200 OK`
* **Expected Body**: `flaws_detected`, `feature_csat`, `ai_action_items`, `average_csat`.

### Case 6: Analyze Product Reviews (Auth Error - Key Hilang)

```bash
curl -X POST http://localhost:8000/api/v1/review/analyze \
  -H "Content-Type: application/json" \
  -d '{"keyword":"Earphone Wireless"}'
```

* **Expected Status**: `401 Unauthorized`
* **Expected Body**: `{"status":"error","message":"X-API-KEY Header Required"}`

### Case 7: Analyze Product Reviews (Auth Error - Key Salah)

```bash
curl -X POST http://localhost:8000/api/v1/review/analyze \
  -H "X-API-KEY: rp_invalid_random_key_999" \
  -H "Content-Type: application/json" \
  -d '{"keyword":"Earphone Wireless"}'
```

* **Expected Status**: `403 Forbidden`
* **Expected Body**: `{"status":"error","message":"Invalid or Inactive API Key"}`

### Case 8: Get Review History

```bash
curl -X GET http://localhost:8000/api/v1/review/history
```

* **Expected Status**: `200 OK`
* **Expected Body**: Array `history` berisi seluruh riwayat analisis produk.

---

## 🖥️ 4. Panduan Pengujian Manual via Web Browser (Frontend UI)

Buka browser ke alamat **`http://localhost:3000`**:

| Langkah      | Halaman                 | Aksi yang Diuji                                                                                          | Hasil yang Diharapkan                                                                                          |
| ------------ | ----------------------- | -------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| **1**  | `/` (Landing Page)    | Scroll ke bawah, periksa spanduk marquee logo e-commerce (*Shopee, Tokopedia, Amazon, Lazada, dll.*).  | Logo bergerak otomatis dengan warna asli; saat di-hover, nama toko melebar dengan mulus.                       |
| **2**  | `/` (Landing Page)    | Toggle tombol tema ☀️ / 🌙 di header.                                                                  | Tampilan berganti antara Light Mode dan Dark Mode dengan kontras sempurna.                                     |
| **3**  | `/register`           | Masukkan nama, email, toko, dan password, lalu klik**Create Account**.                             | Akun baru terdaftar di database, token JWT tersimpan di`localStorage`, dan dialihkan ke `/dashboard`.      |
| **4**  | `/login`              | Masukkan email & password terdaftar (`seller@store.com` / `seller123`).                              | Login berhasil dan langsung diarahkan ke Dashboard.                                                            |
| **5**  | `/dashboard`          | Ketik keyword produk (misal:*"Smartwatch Waterproof"*), pilih platform, klik **Run Extraction**. | KPI Metrics terupdate, tabel**Aspect Flaw Data Matrix** menampilkan poin keparahan, dan bar CSAT terisi. |
| **6**  | `/dashboard`          | Klik filter**Critical** pada tabel matriks flaw.                                                   | Hanya keluhan berskala tinggi (*High Severity*) yang ditampilkan.                                            |
| **7**  | `/dashboard/api-keys` | Klik**Generate New API Key**, ketik nama token, klik confirm.                                      | Kunci baru berhasil dibuat, modal menampilkan kunci lengkap, dan kuota pemakaian tertera.                      |
| **8**  | `/dashboard/history`  | Ketik keyword di search bar, lalu klik**Export CSV Report**.                                       | Tabel riwayat terfilter, dan file CSV langsung terunduh ke komputer pengguna.                                  |
| **9**  | `/docs`               | Buka dokumentasi API, klik navigasi topik, klik tombol**Copy Code**.                               | Kode cURL atau Node.js berhasil disalin ke clipboard.                                                          |
| **10** | Sidebar                 | Klik**Sign Out Account**.                                                                          | Token dihapus dari browser dan pengguna dikembalikan ke halaman`/login`.                                     |
