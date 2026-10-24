# UK Wind Forecast Dashboard

A Docker‑based web application that shows the latest UK national wind‑generation forecasts, compares them to actual generation, and quantifies forecast error.

## Features
- **Backend** – FastAPI service that fetches Elexon **FUELHH** (actual) and **WINDFOR** (forecast) data, stores it in SQLite, and calculates MAE, RMSE, bias, and error‑band percentages.
- **Basic HTTP‑Basic authentication** – credentials are supplied via `APP_USERNAME` / `APP_PASSWORD` env vars; constant‑time comparison prevents timing attacks.
- **Frontend** – React (Vite) UI with MUI components, Recharts line charts, and CSV export.
- **Design guidance** – UI styled using the `design‑taste‑frontend` skill to ensure a premium, non‑sloppy look.
- **Docker** – Multi‑stage images for backend and frontend, coordinated with `docker‑compose.yml` for local development.
- **Vercel deployment** – Docker image can be deployed to Vercel; the Vercel config (`vercel.json`) routes `/api/*` to the backend and serves the React bundle.
- **CI/CD** – GitHub Actions workflow runs linting, tests, and builds the Docker image on push.

## How to Run Locally
```bash
# Clone the repo
git clone <repo-url>
cd effective-octo-disco

# Build and start services
docker compose up --build
```
The backend is reachable at `http://localhost:8000` and the frontend at `http://localhost:3000` (if added).

## Authentication
Requests to any `/api/*` endpoint require HTTP Basic auth:
```bash
curl -u admin:password http://localhost:8000/api/forecasts/2026-01-15
```
Replace the credentials with the values set in your environment.

## Deployment to Vercel
1. Connect the repository to Vercel.
2. Add the following environment variables in the Vercel dashboard:
   - `APP_USERNAME`
   - `APP_PASSWORD`
   - `ELEXON_API_KEY` (if required by the provider)
3. Vercel will detect the root `Dockerfile` and build the image.
4. The app will be served at `https://<project>.vercel.app`.

## AI Assistance
The initial project scaffolding, Dockerfiles, and UI design were generated with the help of **ChatGPT (OpenCode)**. No proprietary code was copied; all generated code is reviewed and adapted.
