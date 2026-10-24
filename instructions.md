# Project Build & Deployment Instructions

This document breaks the end‑to‑end implementation into ~20 incremental commits. Follow the steps in order; each step corresponds to a commit that can be made with `git commit -m "<message>"`.

---

## 1. Repository Initialization
- **Commit:** `init: create repo skeleton`
- Create `README.md` with a high‑level description.
- Add `.gitignore` (Python, Node, Docker, VSCode, .env).

## 2. Front‑end Scaffold
- **Commit:** `feat(frontend): scaffold React app with Vite`
- `cd frontend && npm create vite@latest . -- --template react-ts`
- Install MUI, React Query, Recharts.

## 3. Backend Scaffold
- **Commit:** `feat(backend): scaffold FastAPI app`
- Create `backend/app/__init__.py` and `backend/app/main.py` with a hello endpoint.
- Add `requirements.txt` (fastapi, uvicorn[standard], httpx, pandas, python‑dotenv).

## 4. Dockerfiles (Backend & Frontend)
- **Commit:** `chore: add multi‑stage Dockerfiles`
- Backend Dockerfile (builder + runtime).
- Frontend Dockerfile (node → nginx).

## 5. Docker‑Compose for Local Development
- **Commit:** `chore: add docker‑compose.yml`
- Define `backend` service exposing 8000; `frontend` service exposing 3000.

## 6. Data Fetcher Service (Backend)
- **Commit:** `feat(backend): implement async data fetcher for Elexon`
- Create `backend/app/fetcher.py` – pulls FUELHH and WINDFOR streams, filters WIND, Jan 2026.
- Add basic error handling and retry.

## 7. Persistence Layer
- **Commit:** `feat(backend): add SQLite schema and helper`
- Use SQLAlchemy to store `start_time, generation_actual, generation_forecast, publish_time`.
- Migration script `backend/migrations/create_tables.sql`.

## 8. Metric Calculations
- **Commit:** `feat(backend): implement forecast‑actual error metrics`
- Functions for MAE, RMSE, bias, percentile bands.
- Expose `/metrics/{date}` endpoint.

## 9. FastAPI Endpoints (Core API)
- **Commit:** `feat(backend): expose /forecasts, /actuals, /metrics`
- Use Pydantic models for responses.
- Add OpenAPI docs.

## 10. Background Scheduler
- **Commit:** `chore(backend): schedule hourly data refresh`
- Use APScheduler to call fetcher every hour.

## 11. Basic Authentication (Security)
- **Commit:** `feat(security): add HTTP Basic auth to all API routes`
- Use `fastapi.security.HTTPBasic`.
- Load credentials from environment variables `APP_USERNAME` / `APP_PASSWORD`.
- Constant‑time compare with `secrets.compare_digest`.
- Update Dockerfile to copy a `.env.example`.

## 12. Front‑end API Integration
- **Commit:** `feat(frontend): hook React Query to backend API`
- Create `api.ts` with fetch functions for forecasts, actuals, metrics.
- Build pages: `LatestForecast`, `HistoricalView`, `MetricsDashboard`.

## 13. UI Design using Taste‑Skill
- **Commit:** `feat(frontend): run design‑taste‑frontend skill & apply styles`
- Execute `npx skills use design-taste-frontend -y` and copy generated CSS/theme into the React project.
- Adjust components to use the generated palette, typography, layout.

## 14. Responsive Layout & Export
- **Commit:** `feat(frontend): add responsive layout, CSV export button`
- Use MUI Grid, make charts stack on mobile.
- Implement CSV download via Blob.

## 15. Testing – Backend
- **Commit:** `test(backend): add pytest suite for fetcher, DB, metrics`
- Mock Elexon responses with `respx`.
- Verify auth returns 401 without credentials.

## 16. Testing – Frontend
- **Commit:** `test(frontend): add Jest + React Testing Library tests`
- Smoke test component rendering and API error handling.

## 17. CI/CD Pipeline (GitHub Actions)
- **Commit:** `ci: add GitHub Actions workflow`
- Lint (flake8, eslint), run tests, build Docker images.
- On push to `main`, publish Docker images to GitHub Container Registry.

## 18. Vercel Deployment Configuration
- **Commit:** `chore(vercel): add vercel.json for Docker deployment`
- ```json
  {
    "builds": [{ "src": "Dockerfile", "use": "@vercel/docker" }],
    "routes": [ { "src": "/api/(.*)", "dest": "/api/$1" }, { "src": "/(.*)", "dest": "/frontend/$1" } ]
  }
  ```
- Explain that Vercel will build the Docker image and expose `/:frontend` and `/api/*` routes.

## 19. Environment Variables for Vercel
- **Commit:** `chore(vercel): document required env vars`
- Add `README` section: `APP_USERNAME`, `APP_PASSWORD`, `ELEXON_API_KEY` (if needed).
- Vercel UI will store them securely.

## 20. Final Documentation
- **Commit:** `doc: complete README & usage guide`
- Include:
  - Project overview
  - Local dev (`docker compose up --build`)
  - Vercel deployment steps
  - Authentication usage (`curl -u user:pass https://…/api/forecasts/2026‑01‑15`)
  - Note that AI (ChatGPT) was used to scaffold code.

---

### How to Apply These Commits
1. Clone the repo.
2. Follow the list sequentially, committing after each numbered step.
3. After step 20 push to GitHub; the GitHub Actions workflow will run, and Vercel will automatically build the Docker image from the root `Dockerfile`.
4. Set the required env vars in Vercel’s dashboard.
5. Verify the live site: the frontend should be reachable at `https://<project>.vercel.app` and the API at `https://<project>.vercel.app/api/...` with HTTP Basic auth.

---

**Security Note** – Basic auth credentials are stored in environment variables and never committed. The backend uses `secrets.compare_digest` to avoid timing attacks. All external calls are made over HTTPS (Vercel provides TLS).