# System Directives for Claude & AI Assistants

This repository follows strict production standards for **ReviewPulse SaaS**.

---

## 🎯 System Instructions & Coding Standards

1. **Clean Code & Self-Documenting Standard**:
   - Write self-explanatory symbol names. Do not add excessive, redundant inline comments explaining obvious code.
   - Keep controllers slim and move domain logic to `services/`.

2. **Error Log Inspection First Rule**:
   - NEVER form hypotheses for runtime errors without reading the full, un-truncated log.
   - Always verify API endpoints using empirical `Invoke-RestMethod` or `curl` calls.

3. **API Contract Integrity**:
   - Maintain the `X-API-KEY` header authentication contract across all `/api/v1/review/*` routes.
   - Ensure JSON responses match the standard `{ status: "success", data: ... }` format.

4. **Project Structure**:
   ```
   D:\KULIAH\semester-antara\pws\reviewpulse-saas/
   ├── backend/
   │   ├── config/ (database.js)
   │   ├── controllers/ (authController.js, apiKeyController.js, reviewController.js)
   │   ├── middleware/ (authMiddleware.js)
   │   ├── routes/ (api.js)
   │   ├── services/ (aiAnalyzer.js, reviewFetcher.js)
   │   ├── .env.example
   │   ├── .env
   │   ├── schema.sql
   │   ├── server.js
   │   └── vercel.json
   ├── frontend/
   │   ├── app/ (page.tsx, layout.tsx, docs/page.tsx, dashboard/...)
   │   ├── components/ (ThemeToggle.tsx, ThemeProvider.tsx)
   │   ├── lib/ (api.ts)
   │   └── public/logos/ (shopee.svg, tokopedia.svg, amazon.svg, shopify.svg, lazada.svg, tiktokshop.svg, blibli.svg)
   ├── CONTEXT.md
   ├── AGENT.md
   └── CLAUDE.md
   ```
