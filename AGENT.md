# AI Agent Operational Guide: ReviewPulse SaaS

Welcome! This file provides essential operational guidance for any AI Agent working on the **ReviewPulse SaaS** codebase.

---

## 🚀 Environment Overview

* **Root Working Directory**: `D:\KULIAH\semester-antara\pws\reviewpulse-saas`
* **Backend Directory**: `D:\KULIAH\semester-antara\pws\reviewpulse-saas\backend`
* **Frontend Directory**: `D:\KULIAH\semester-antara\pws\reviewpulse-saas\frontend`
* **Operating System**: Windows (pwsh / PowerShell environment)

---

## 📡 Active Server Ports

* **Express.js Backend Server**: Running on `http://localhost:8000`.
  - Health check: `GET http://localhost:8000/health`
  - Start command: `node server.js` inside `backend/`.
* **Next.js 16 Frontend Server**: Running on `http://localhost:3000`.
  - Start command: `npm run dev` inside `frontend/`.

---

## 🛠️ Verification & Test Commands

To verify backend health and end-to-end API execution:
```powershell
# 1. Health Check
Invoke-RestMethod -Uri "http://localhost:8000/health"

# 2. Register Merchant Account
$reg = Invoke-RestMethod -Uri "http://localhost:8000/api/v1/auth/register" -Method Post -Body (@{ email = "seller@store.com"; password = "password123"; fullName = "Demo Seller"; companyName = "TechStore" } | ConvertTo-Json) -ContentType "application/json"
$token = $reg.token

# 3. Generate Secret API Key
$authHeader = @{ "Authorization" = "Bearer $token"; "Content-Type" = "application/json" }
$keyRes = Invoke-RestMethod -Uri "http://localhost:8000/api/v1/user/api-keys" -Method Post -Headers $authHeader -Body (@{ name = "Production Store Key" } | ConvertTo-Json)
$apiKey = $keyRes.apiKey.key

# 4. Analyze E-Commerce Reviews via X-API-KEY
$apiHeader = @{ "X-API-KEY" = $apiKey; "Content-Type" = "application/json" }
$analyze = Invoke-RestMethod -Uri "http://localhost:8000/api/v1/review/analyze" -Method Post -Headers $apiHeader -Body (@{ keyword = "TWS Wireless Earbuds"; platform = "shopee" } | ConvertTo-Json)

# 5. Fetch Scraped History
Invoke-RestMethod -Uri "http://localhost:8000/api/v1/review/history"
```

---

## 📐 Key Agent Guidelines

1. **Dual-Mode Database**: `backend/config/database.js` works instantly out-of-the-box with in-memory fallback, and automatically switches to PostgreSQL when `DATABASE_URL` is configured in `backend/.env`.
2. **Inspect Error Logs First**: Before making diagnostic claims, read un-truncated server logs.
3. **Keep Code Self-Documenting**: Maintain clean, easy-to-read code without redundant comments.
