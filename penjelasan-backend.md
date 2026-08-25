# Penjelasan Backend ReviewPulse SaaS

Dokumen ini menjelaskan **setiap file dan fungsi di `backend/`**, buat apa dia ada, dan bagaimana dia dipakai oleh bagian lain sistem. Ditulis rinci biar bisa dipakai referensi belajar/laporan, bukan cuma ringkasan.

Base URL production sekarang: `https://046-paw-tubes-v2-backend.vercel.app`

---

## 1. `server.js` — Entry Point Aplikasi

Ini file yang dijalankan pertama kali (`node server.js`). Isinya:

```js
const app = express();
app.use(cors());              // izinkan request lintas domain (frontend beda origin)
app.use(express.json());      // parse body JSON otomatis ke req.body
app.use('/api/', limiter);    // rate limit 200 request/15 menit khusus prefix /api/
app.use('/api/v1', apiRouter); // semua route API di-mount di sini
```

**Kenapa `cors()` dipasang tanpa opsi (izinkan semua origin)?** Karena ini API publik yang memang didesain dipanggil dari domain manapun (client X-API-KEY bisa dari server manapun), sama seperti pola OpenRouter/Stripe API.

**`express-rate-limit`** — melindungi dari brute-force/spam. Nge-hitung request per IP, kalau lewat 200 dalam 15 menit, balikin `429` otomatis sebelum request sempat nyentuh controller manapun.

**`GET /health`** — didefinisikan langsung di sini (bukan di router), makanya path-nya `/health` bukan `/api/v1/health`. Fungsinya cuma ngecek server hidup, dipakai buat monitoring/uptime check.

**Auto-sync Sequelize** — pas server nyala, otomatis:
```js
db.sequelize.authenticate().then(() => db.sequelize.sync())
```
`authenticate()` = tes koneksi ke database beneran konek. `sync()` = bikin/update tabel di database sesuai definisi model kalau belum ada. Ini yang bikin database "self-healing" — kalau tabel belum ada, otomatis dibuatin, gak perlu jalanin migration manual dulu.

**`if (process.env.NODE_ENV !== 'production') app.listen(...)`** — di lokal, server beneran "nyala" dan dengerin port 8000. Di Vercel, ini **gak dipanggil** — Vercel treat `module.exports = app` sebagai serverless function, dia yang manggil `app` tiap ada request masuk, bukan kita yang manual `.listen()`.

---

## 2. `routes/api.js` — Peta Semua Endpoint

File ini cuma nyambungin URL ke fungsi controller yang nanganin, plus nentuin middleware apa yang harus lolos dulu sebelum sampai ke controller:

```js
router.post('/auth/register', register);                          // publik
router.post('/auth/login', login);                                 // publik
router.post('/user/api-keys', verifyToken, createApiKey);          // wajib JWT
router.get('/user/api-keys', verifyToken, getUserApiKeys);         // wajib JWT
router.delete('/user/api-keys/:keyId', verifyToken, revokeApiKey); // wajib JWT
router.post('/review/analyze', verifyApiKey, analyzeReviews);      // wajib X-API-KEY
router.get('/review/history', getReviewHistory);                   // publik
router.get('/admin/users', verifyToken, requireAdmin, listUsers);              // JWT + role admin
router.get('/admin/api-keys', verifyToken, requireAdmin, listAllApiKeys);      // JWT + role admin
router.get('/admin/usage-logs', verifyToken, requireAdmin, listAllUsageLogs);  // JWT + role admin
router.delete('/admin/api-keys/:keyId', verifyToken, requireAdmin, revokeAnyApiKey); // JWT + role admin
```

**Cara baca urutan middleware:** Express jalanin dari kiri ke kanan. `verifyToken, requireAdmin, listUsers` artinya: cek JWT dulu (`verifyToken`) → kalau lolos, cek role admin (`requireAdmin`) → kalau lolos juga, baru `listUsers` dipanggil. Kalau salah satu gagal, request langsung dipotong (`return res.status(...)`), gak pernah sampai ke controller.

---

## 3. `middleware/authMiddleware.js` — Penjaga Gerbang

Ada 3 fungsi, masing-masing jenis penjagaan beda:

### `verifyToken` (buat JWT)
```js
const token = authHeader && authHeader.split(' ')[1];
```
Header `Authorization: Bearer eyJhbGci...` di-split spasi, ambil elemen index 1 (bagian setelah kata "Bearer"). Kalau kosong → `401`. Kalau ada, `jwt.verify()` decode + cek signature-nya valid pakai `JWT_SECRET` — kalau token dipalsu atau expired, `jwt.verify()` throw error, ketangkep di `catch`, balikin `403`. Kalau valid, hasil decode (`{id, email, role}`) ditaruh di `req.user`, dipakai controller berikutnya buat tau "ini request dari user siapa".

### `verifyApiKey` (buat X-API-KEY)
Beda total dari JWT — ini **query ke database**, bukan cuma decode token:
```js
const keyRecord = await db.ApiKey.findOne({ where: { key: apiKey, is_active: true } });
```
Kalau key gak ketemu atau `is_active: false` (udah di-revoke) → `403`. Kalau `usage_count >= usage_limit` → `429` (kuota abis). Kalau lolos semua, ada efek samping penting:
```js
await keyRecord.increment('usage_count', { by: 1 });
await keyRecord.update({ last_used: new Date() });
```
**Setiap kali API key dipakai buat request yang lolos, kuotanya otomatis berkurang di sini** — ini satu-satunya tempat `usage_count` naik.

### `requireAdmin` (buat role check)
Paling simpel — cuma cek `req.user.role === 'admin'`. **Wajib jalan setelah `verifyToken`**, karena dia butuh `req.user` yang di-set sama `verifyToken`. Kalau dipanggil sendirian tanpa `verifyToken` di depannya, `req.user` bakal `undefined` dan selalu gagal.

---

## 4. `controllers/authController.js` — Registrasi & Login

### `register`
1. Validasi `email`, `password`, `fullName` wajib ada.
2. Cek email udah kepake belum (`db.User.findOne`) — kalau udah, `400`.
3. `bcrypt.hash(password, 10)` — password **gak pernah disimpan mentah**, di-hash dulu pakai bcrypt dengan cost factor 10 (artinya di-"acak" 2^10 = 1024 kali, biar berat buat di-brute-force kalau database bocor).
4. `db.User.create()` — bikin row baru, `role` defaultnya `'seller'` (di-set di level model, lihat bagian Model).
5. **Langsung generate JWT** pakai `jwt.sign()`, isi payload `{id, email, role}`, expire `7d`.
6. Response balikin `token` + data user (**`password_hash` sengaja gak diikutin** — di-exclude manual pas nyusun `userResponse`, bukan diambil dari hasil query langsung).

### `login`
1. Cari user by email.
2. `bcrypt.compare(password, user.password_hash)` — bandingin password yang dikirim vs hash yang tersimpan (bcrypt bisa compare tanpa perlu "un-hash", itu sifat one-way hashing).
3. Kalau gak cocok → `401` (pesan error-nya sengaja disamain "Invalid credentials" buat email-gak-ketemu maupun password-salah, biar orang luar gak bisa nebak "oh berarti emailnya emang terdaftar" dari beda pesan error).
4. Kalau cocok, generate JWT baru, sama kayak register.

---

## 5. `controllers/apiKeyController.js` — Kelola API Key (punya sendiri)

### `createApiKey`
```js
const rawKey = `rp_${crypto.randomBytes(24).toString('hex')}`;
```
`crypto.randomBytes(24)` generate 24 byte random dari OS-level CSPRNG (bukan `Math.random()` yang predictable) → di-convert ke hex (48 karakter) → ditempel prefix `rp_`. Ini yang jadi API key beneran, disimpan utuh di kolom `key`.
```js
const keyPrefix = rawKey.substring(0, 8);
```
8 karakter pertama disimpan terpisah di kolom `key_prefix` — ini yang ditampilin di dashboard/list buat user kenalin key mana yang mana, **tanpa perlu nyimpen/nampilin key lengkap lagi**.

### `getUserApiKeys`
```js
db.ApiKey.findAll({ where: { user_id: userId }, attributes: { exclude: ['key'] } })
```
`attributes: { exclude: ['key'] }` — ini baris paling penting soal keamanan di controller ini. Sequelize di-suruh **gak pernah ambil kolom `key`** dari database sama sekali buat endpoint list. Jadi bukan cuma "disembunyiin di response", tapi beneran gak pernah keluar dari query SQL-nya. Dulu (sebelum di-fix pas sesi ini) baris ini gak ada, jadi key lengkap bocor tiap kali endpoint ini dipanggil.

### `revokeApiKey`
```js
db.ApiKey.findOne({ where: { id: keyId, user_id: userId } })
```
**Perhatiin filter gandanya** — bukan cuma cari by `id`, tapi juga wajib `user_id` cocok sama user yang login. Ini nyegah User A revoke API key milik User B cuma dengan nebak-nebak ID (`/user/api-keys/5`). Kalau gak ketemu (baik karena ID salah ATAU karena punya orang lain), balikin `404` — user gak bisa bedain dua kondisi itu, jadi gak ada info bocor soal "eh ternyata ID 5 itu emang ada, punya orang lain".

`await keyRecord.update({ is_active: false })` — ini **soft delete**, row tetap ada di database (buat histori/audit), cuma ditandain nonaktif. Makanya di `verifyApiKey` middleware, syarat lolosnya bukan cuma "key ketemu" tapi juga `is_active: true`.

---

## 6. `controllers/adminController.js` — Kelola Lintas User (Admin)

Empat fungsi, semua query **tanpa filter `user_id`** (beda sama `apiKeyController.js` yang selalu filter punya sendiri) — karena tujuannya emang liat data semua orang:

- `listUsers` — `attributes: { exclude: ['password_hash'] }`, sama prinsipnya kayak exclude `key` di atas: hash password gak pernah keluar dari query.
- `listAllApiKeys` — `attributes: { exclude: ['key'] }` + `include: [{ model: db.User, as: 'user', attributes: [...] }]`. Bagian `include` ini namanya **eager loading** — Sequelize otomatis JOIN ke tabel `users` buat nampilin email/nama pemilik key, tanpa admin perlu query manual dua kali.
- `listAllUsageLogs` — `limit: 200`, sengaja dibatasin biar gak nge-load ribuan row sekaligus (tabel ini paling cepat gede karena nambah tiap API call).
- `revokeAnyApiKey` — mirip `revokeApiKey` biasa, cuma **tanpa filter `user_id`** — karena ini emang hak admin buat revoke siapa aja.

---

## 7. `controllers/reviewController.js` — Endpoint Inti (Data API)

Ini yang paling kompleks, alurnya:

```
1. Validasi keyword ada
2. Cek cache: ada row product_analyses dengan keyword sama & umur < 24 jam?
   ├── ADA & masih fresh → return cached data (cepat, gak proses ulang)
   └── GAK ADA / expired  → proses baru:
        a. fetchProductReviews()   → ambil sample review
        b. analyzeReviewSentiment() → hitung sentiment + CSAT umum
        c. extractProductFlaws()    → deteksi komplain per aspek
        d. calculateFeatureCsat()   → CSAT per aspek
        e. generateActionItems()    → rekomendasi per aspek bermasalah
        f. simpan ke product_analyses
3. Catat ke usage_logs (kedua jalur, cache-hit maupun proses baru)
4. Return response
```

**Kenapa `usage_logs` dicatat di 2 tempat kode (baris 24-33 dan 64-73), bukan 1 fungsi reusable?** Ini konsekuensi dari 2 jalur berbeda (`return` di tengah fungsi buat cache-hit vs lanjut proses buat cache-miss) — technical debt kecil, harusnya bisa di-refactor jadi 1 helper function, tapi behavior-nya sekarang tetap benar.

`getReviewHistory` — simpel, `findAll` semua row `product_analyses`, urut terbaru dulu. **Sengaja publik** (gak ada middleware) karena riwayat analisa emang dirancang buat bisa dilihat siapa aja (data historis produk, bukan data pribadi user).

---

## 8. `services/aiAnalyzer.js` — "Otak" Analisa

Ini bukan model AI yang di-training — murni **rule-based/lexicon-based**, gampang ditelusuri logikanya:

### `analyzeReviewSentiment`
Pakai library `vader-sentiment` (VADER = Valence Aware Dictionary and sEntiment Reasoner). Tiap review dihitung `compound score`-nya (skala -1 sampai +1):
- `>= 0.05` → positive
- `<= -0.05` → negative
- di antaranya → neutral

CSAT dihitung dengan formula:
```js
csat = ((positive*5 + neutral*3 + negative*1) / (total*5)) * 5
```
Logikanya: tiap review "dikasih nilai" — positive setara bintang 5, neutral setara bintang 3, negative setara bintang 1 — dirata-rata, hasilnya skala 1-5.

### `extractProductFlaws`
```js
const categories = { battery: {keywords:[...]}, packaging: {...}, shipping: {...}, quality: {...} }
```
4 kategori komplain, tiap kategori punya daftar kata kunci Bahasa Indonesia (`'baterai', 'boros', 'kardus', 'penyok', 'lambat'`, dst). Tiap review di-cek: teksnya mengandung salah satu kata kunci kategori itu gak (`text.includes(kw)`). Kalau iya, dihitung sebagai "komplain aspek ini".

**Severity** ditentuin dari jumlah komplain: `>= 3` = high, `>= 1` = medium, `0` = low.

**`note`** — bukan teks generik, tapi **kutipan asli** dari review yang paling representatif (diprioritaskan review dengan rating rendah atau sentiment negatif). Ini yang bikin output kerasa "nyata", bukan template kosong.

### `calculateFeatureCsat`
CSAT per aspek — kalau gak ada review yang nyinggung aspek itu, dikasih skor optimis (`overallCsat + 0.3`, dibatasin max 5.0, asumsi "gak dikomplain = gak masalah"). Kalau ada, dihitung dari rata-rata rating review yang match.

### `generateActionItems`
Cuma mapping statis `aspect → rekomendasi teks`, di-filter cuma buat aspek yang `count > 0` (gak kasih saran buat masalah yang gak ada).

---

## 9. `services/reviewFetcher.js` — Sumber Data Review

**Ini bukan scraper live** — sampling dari dataset lokal (`backend/data/reviewSeed.json`, 565 review asli hasil kurasi dari HuggingFace, lihat `documentation/README.md` bagian Models Used buat detail sumbernya).

```js
const hashSeed = (str) => { let h=0; for(...) h=(h*31+str.charCodeAt(i))>>>0; return h; };
```
Fungsi hash sederhana (mirip algoritma `djb2`-style) — ubah string keyword jadi angka. Dipakai buat nentuin titik mulai sampling di array 565 review, **secara deterministik**: keyword yang sama selalu hasilin hash yang sama, jadi selalu sampling 15 review yang sama juga (konsisten, bukan random tiap kali).

```js
picked.push(seedPool[(start + i * 37) % seedPool.length]);
```
Loncat 37 index tiap iterasi (bukan berurutan 1-1) — biar sampling-nya "menyebar" di array, bukan ngambil 15 review yang posisinya nempel-nempel (yang kemungkinan besar mirip konteksnya kalau data asalnya berurutan per produk).

---

## 10. `models/` — Definisi Tabel (Sequelize ORM)

### `models/index.js` — Loader Otomatis
```js
fs.readdirSync(__dirname).filter(...).forEach(file => {
  const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
  db[model.name] = model;
});
```
Baca semua file `.js` di folder ini (kecuali `index.js` sendiri), tiap file di-`require` dan dipanggil sebagai fungsi (`(sequelize, DataTypes) => {...}`), hasilnya didaftarin ke object `db`. Ini kenapa nambah model baru cukup taruh file baru di folder ini, gak perlu edit `index.js`.

Juga ada **fallback otomatis**: kalau `DATABASE_URL` gak ke-detect sebagai postgres, `sequelize` dikonfigurasi pakai `sqlite::memory:` (database sementara di RAM) — jadi backend tetap bisa jalan buat testing lokal walau belum setup Supabase.

### `models/user.js`
```js
role: { type: DataTypes.STRING, defaultValue: 'seller' }
```
Default role `'seller'` — makanya register baru selalu jadi seller, harus di-promote manual ke `'admin'` (gak ada endpoint publik buat itu, sengaja).

```js
User.hasMany(models.ApiKey, { foreignKey: 'user_id', as: 'apiKeys' });
User.hasMany(models.UsageLog, { foreignKey: 'user_id', as: 'usageLogs' });
```
Ini yang bikin `include: [{model: db.User, as:'user'}]` di `adminController.js` bisa jalan — relasinya didefinisiin di kedua sisi (`User.hasMany` di sini, `ApiKey.belongsTo` di `apiKey.js`).

### `models/apiKey.js`, `models/usageLog.js`, `models/productAnalysis.js`
Struktur kolomnya persis sama `schema.sql` (lihat `documentation/erd/erd.puml` buat diagram visualnya). `productAnalysis.js` **satu-satunya model tanpa relasi FK** ke model lain — sengaja, karena perannya cache bersama per-keyword, bukan data milik user tertentu.

---

## 11. `scripts/migrate.js` — Setup Database Manual

Dijalanin manual (`node scripts/migrate.js` atau `npm run db:migrate`), bukan otomatis pas server nyala. Fungsinya:
1. Baca `schema.sql`, eksekusi langsung ke database (bikin tabel kalau belum ada — pakai `CREATE TABLE IF NOT EXISTS`, aman dijalanin berkali-kali).
2. Seed 1 akun demo + 1 API key demo, **tapi cuma kalau belum ada** (`SELECT` dulu, `INSERT` cuma kalau kosong) — idempotent, gak bakal duplicate kalau dijalanin ulang.

**Catatan penting:** script ini pakai `pg.Pool` langsung (raw SQL), **bukan Sequelize** — beda jalur dari `models/index.js`. Ini peninggalan sebelum migrasi ke Sequelize ORM, tapi masih valid dipakai karena tujuannya cuma eksekusi DDL sekali di awal setup, bukan bagian dari runtime aplikasi.

---

## 12. `schema.sql` — Definisi Tabel Mentah (SQL)

Sumber kebenaran struktur database dalam bentuk SQL murni (dipakai `migrate.js`, dan referensi buat bikin ERD). 4 tabel: `users`, `api_keys`, `product_analyses`, `usage_logs` — kolom-kolomnya persis sama yang didefinisiin di masing-masing file `models/*.js`, cuma beda bahasa (SQL vs JS/Sequelize DSL).

---

## 13. `vercel.json` — Konfigurasi Deploy

```json
{
  "builds": [{ "src": "server.js", "use": "@vercel/node" }],
  "routes": [{ "src": "/(.*)", "dest": "server.js" }]
}
```
Bilang ke Vercel: "build `server.js` pakai runtime Node.js, dan **semua** path (`/(.*)`  = regex match apapun) diarahin ke `server.js`". Ini penting karena Express sendiri yang nanganin routing internal (`/health`, `/api/v1/...`) — Vercel cuma perlu tau "semua request masuk sini dulu", bukan Vercel yang mapping tiap endpoint.

---

## 14. `package.json` — Dependency

| Package | Buat apa |
|---|---|
| `express` | Web framework — routing, middleware, request/response handling |
| `sequelize` + `pg` | ORM + driver PostgreSQL |
| `bcryptjs` | Hash password |
| `jsonwebtoken` | Generate & verify JWT |
| `cors` | Izinkan request lintas origin |
| `express-rate-limit` | Rate limiting |
| `vader-sentiment` | Sentiment analysis (dipakai `aiAnalyzer.js`) |
| `dotenv` | Baca file `.env` pas development lokal |
| `nodemon` (dev only) | Auto-restart server pas file berubah, buat development |

---

## Ringkasan Alur Data (Siapa Manggil Siapa)

```
server.js
  └─ routes/api.js
       ├─ middleware/authMiddleware.js (verifyToken / verifyApiKey / requireAdmin)
       └─ controllers/*.js
             ├─ authController.js       → models/user.js
             ├─ apiKeyController.js     → models/apiKey.js
             ├─ adminController.js      → models/user.js + models/apiKey.js + models/usageLog.js
             └─ reviewController.js     → models/productAnalysis.js + models/usageLog.js
                    ├─ services/reviewFetcher.js  → backend/data/reviewSeed.json
                    └─ services/aiAnalyzer.js
```

Semua model lewat `models/index.js` (Sequelize) → konek ke satu database Supabase yang sama, terlepas dari domain/deployment mana yang lagi dipakai (backend lama maupun `046-paw-tubes-v2-backend`).
