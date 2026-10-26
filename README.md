# Wattwise

Wattwise is a pilot web application for a UK utility's day-ahead procurement team. It helps users inspect national wind-generation forecasts, compare them with actual wind output, and quantify forecast uncertainty before delivery-day decisions.

The scope is intentionally limited to Elexon national wind data. It does not forecast demand, recommend thermal purchases, show market prices, or execute trades.

## Live application

Deployed app: https://effective-octo-disco-eight.vercel.app/

## Data and decision logic

- Actual generation source: Elexon FUELHH, filtered to `fuelType = WIND`.
- Forecast source: Elexon WINDFOR.
- The backend connects to the official Elexon data API at `https://data.elexon.co.uk/bmrs/api/v1`.
- The UI uses a deterministic January 2026 pilot fixture so the assessment views and metrics are repeatable.
- For a selected cutoff, the applicable forecast is the latest revision published at or before that cutoff. Later revisions are never used for a historical decision.
- Metrics are calculated from paired observations: MAE, RMSE, forecast bias, and valid interval count.

The live Elexon stream endpoints return the latest published records. They do not provide a durable January 2026 assessment snapshot by themselves, which is why the pilot fixture is retained for the January 2026 screens.

## Features

- Overview dashboard with forecast versus actual chart and operational-watch intervals.
- Forecast analysis with period filters, signed error, distribution, accuracy bands, and cross-day comparisons.
- Data explorer with filtering, sorting, pagination, and CSV export using a browser Blob.
- Custom dropdown controls and responsive layouts.
- FastAPI data ingestion, error metrics, and HTTP Basic API protection.

## Architecture

The deployment is one Vercel project with two services and one public domain:

```text
Browser
  │
  ├── /        → frontend service, React + Vite
  └── /api/*   → backend service, Python + FastAPI
                     │
                     └── Elexon FUELHH and WINDFOR streams
```

`vercel.json` defines the services and rewrites. The frontend uses same-origin `/api/*` calls, so no separate browser-visible API hostname is needed.

For production, configure `DATABASE_URL` with managed PostgreSQL. SQLite is used only by local Docker Compose. The in-process scheduler is enabled locally with `RUN_SCHEDULER=true` and disabled in Vercel, where scheduled refreshes should use Vercel Cron.

## Repository layout

```text
backend/
  app/                 FastAPI routes, Elexon fetcher, metrics, security and persistence
  tests/               Backend tests
  Dockerfile           Local backend image
  Dockerfile.vercel    Vercel container image reference
frontend/
  src/pages/           Overview, analysis and explorer screens
  src/components/      Reusable UI controls
  src/mockData.js      Deterministic January 2026 pilot data
  Dockerfile           Local frontend image
docker-compose.yml     Local two-service environment
vercel.json            Vercel Services routing
.github/workflows/     CI workflow
```

## Run locally

### Docker

```sh
docker compose up --build
```

Open `http://localhost:3000`. The backend is available on `http://localhost:8000`.

### Frontend checks

```sh
cd frontend
npm ci
npm run lint
npx eslint src
npm test -- --runInBand
npm run build
```

### Backend checks

```sh
cd backend
python -m pip install -r requirements.txt pytest pytest-asyncio respx flake8
flake8 app tests
pytest
```

## Deploy to Vercel

1. Import the repository into Vercel.
2. In Project Settings, select the **Services** framework.
3. Keep the repository root as the project root.
4. Add `DATABASE_URL`, `APP_USERNAME`, and `APP_PASSWORD` as production environment variables.
5. Deploy. Vercel routes `/` to the frontend and `/api/*` to the backend.

Verify the deployed URL in an incognito browser before submitting it.

## AI assistance

AI tools were used for scaffolding, UI iteration, Docker and Vercel configuration, testing support, and documentation drafting. All code was reviewed and adapted for this project.
