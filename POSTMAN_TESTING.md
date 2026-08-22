# 📮 Panduan Testing API ReviewPulse via Postman

Dokumen ini panduan manual test seluruh endpoint `POST /api/v1/*` pakai Postman, baik ke `localhost:8000` (dev) maupun URL Vercel production.

---

## 1. Setup Environment

Buat Postman Environment baru (`ReviewPulse Dev` / `ReviewPulse Prod`) dengan variable:

| Variable | Dev Value | Prod Value |
|---|---|---|
| `base_url` | `http://localhost:8000/api/v1` | `https://046-paw-tubes.vercel.app/api/v1` |
| `api_key` | `rp_demo_key_1234567890` | (isi dari hasil step 4 di bawah) |
| `jwt_token` | (kosong, diisi otomatis step 3) | (kosong, diisi otomatis step 3) |

> Backend production sudah live & publik (dites 2026-08-22): `https://046-paw-tubes.vercel.app/health` → `"status":"healthy"`. Frontend production: `https://046-paw-tubes-gjac.vercel.app`.

Semua request di bawah pakai `{{base_url}}`, `{{api_key}}`, `{{jwt_token}}`.

---

## 2. Register Akun Baru

- **Method**: `POST`
- **URL**: `{{base_url}}/auth/register`
- **Headers**: `Content-Type: application/json`
- **Body** (raw JSON):
```json
{
  "email": "seller@store.com",
  "password": "seller123",
  "fullName": "Demo Seller",
  "companyName": "TechStore ID"
}
```
- **Expected**: `201` dengan `{ status: "success", data: { user, token } }`. Kalau email sudah ada → `400`.

---

## 3. Login & Simpan Token Otomatis

- **Method**: `POST`
- **URL**: `{{base_url}}/auth/login`
- **Body**:
```json
{ "email": "seller@store.com", "password": "seller123" }
```
- Buka tab **Tests** pada request ini, tempel script biar token otomatis kesimpan ke environment:
```javascript
const res = pm.response.json();
if (res.data && res.data.token) {
    pm.environment.set("jwt_token", res.data.token);
}
```
- **Expected**: `200 OK`, `jwt_token` di environment kesii otomatis.

---

## 4. Generate API Key (JWT Protected)

- **Method**: `POST`
- **URL**: `{{base_url}}/user/api-keys`
- **Headers**: `Authorization: Bearer {{jwt_token}}`
- **Body**:
```json
{ "name": "Postman Test Key" }
```
- **Expected**: `201`, response `apiKey.key` (format `rp_xxxxx...`). Copy nilai ini ke variable `api_key` di environment (atau tambahkan script Tests sama seperti step 3 tapi target `res.apiKey.key`).

Endpoint lain di grup ini:
- `GET {{base_url}}/user/api-keys` (header `Authorization` sama) → list semua key.
- `DELETE {{base_url}}/user/api-keys/:keyId` → revoke key.

---

## 5. Analyze Review (Endpoint Utama)

- **Method**: `POST`
- **URL**: `{{base_url}}/review/analyze`
- **Headers**:
  - `X-API-KEY: {{api_key}}`
  - `Content-Type: application/json`
- **Body**:
```json
{
  "keyword": "headphone bluetooth",
  "productName": "Headphone Bluetooth Wireless ANC",
  "platform": "shopee"
}
```
- **Expected `200 OK`**:
```json
{
  "status": "success",
  "cached": false,
  "data": {
    "total_reviews": 15,
    "average_csat": "3.53",
    "flaws_detected": [ ... ],
    "feature_csat": { ... },
    "ai_action_items": [ ... ]
  }
}
```
- **Kirim ulang request yang sama persis** (keyword sama) → `cached: true`, response instan (< 100ms). Ini bukti cache 24-jam jalan.
- Ganti `keyword` ke produk lain → dapat set review + hasil CSAT berbeda (data disample dari dataset review asli, bukan template).

---

## 6. Review History

- **Method**: `GET`
- **URL**: `{{base_url}}/review/history`
- **Expected**: `200`, array daftar analisa yang pernah dibuat, urut terbaru.

---

## 7. Test Error Cases (Wajib buat Laporan/Demo)

| Skenario | Cara trigger | Expected Status |
|---|---|---|
| Tanpa API Key | Hapus header `X-API-KEY` di step 5 | `401` |
| API Key salah | `X-API-KEY: rp_salah123` | `403` |
| Tanpa JWT | Hapus header `Authorization` di step 4 | `401` |
| JWT expired/invalid | `Authorization: Bearer token_ngasal` | `403` |
| Body kosong | Kirim `{}` ke `/review/analyze` | `400` (keyword required) |
| Rate limit | Spam >200 request dalam 15 menit ke `/api/*` | `429` |

Screenshot bagian ini bagus buat lampiran laporan tugas (bukti error handling jalan sesuai kontrak).

---

## 8. Testing ke Vercel Production

Backend & frontend sudah live, sudah dites end-to-end:

- Backend: `https://046-paw-tubes.vercel.app` — `GET /health` → `{"status":"healthy",...}`
- Frontend: `https://046-paw-tubes-gjac.vercel.app` — sudah connect ke backend di atas lewat `NEXT_PUBLIC_API_URL`

Langkah:
1. Ganti Postman environment aktif ke `ReviewPulse Prod` (`base_url = https://046-paw-tubes.vercel.app/api/v1`).
2. Cek dulu `GET https://046-paw-tubes.vercel.app/health` (root, bukan `/api/v1`) → pastikan `"status": "healthy"`.
3. Ulangi step 2-6 di atas — response harus identik strukturnya dengan dev, cuma datanya kesimpan ke Supabase production (bukan dev database lokal).

---

## 9. Import Cepat (Opsional)

Kalau mau import langsung ke Postman tanpa ketik manual, buat Collection baru → New Request per section di atas, atau pakai **Postman → Import → Raw text** dengan cURL dari halaman `/docs` di frontend (tiap request punya tombol "Copy Code").
