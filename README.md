# UK Wind Forecast Dashboard

## Project Overview

A Docker‑based web application that visualises UK national wind‑generation forecasts, compares them against actual generation data, and calculates forecast error metrics. It provides a clean, responsive React frontend and a FastAPI backend with HTTP‑Basic authentication. The app can be run locally with Docker Compose or deployed to Vercel using a Docker image.

A Docker‑based web application that shows the latest UK national wind‑generation forecasts, compares them to actual generation, and quantifies forecast error.

## Features
- **Backend** – FastAPI service that fetches Elexon **FUELHH** (actual) and **WINDFOR** (forecast) data, stores it in SQLite, and calculates MAE, RMSE, bias, and error‑band percentages.
- **Basic HTTP‑Basic authentication** – credentials are supplied via `APP_USERNAME` / `APP_PASSWORD` env vars; constant‑time comparison prevents timing attacks.
- **Frontend** – React (Vite) UI with MUI components, Recharts line charts, and CSV export.
- **Design guidance** – UI styled using the `design‑taste‑frontend` skill to ensure a premium, non‑sloppy look.
- **Docker** – Multi‑stage images for backend and frontend, coordinated with `docker‑compose.yml` for local development.
- **Vercel deployment** – Docker image can be deployed to Vercel; the Vercel config (`vercel.json`) routes `/api/*` to the backend and serves the React bundle.
- **CI/CD** – GitHub Actions workflow runs linting, tests, and builds the Docker image on push.

## Local Development

```bash
# Build and start services
docker compose up --build
```

The backend will be reachable at `http://localhost:8000` and the frontend at `http://localhost:3000`.
```bash
# Clone the repo
git clone <repo-url>
cd effective-octo-disco

# Build and start services
docker compose up --build
```
The backend is reachable at `http://localhost:8000` and the frontend at `http://localhost:3000` (if added).

## Authentication Usage

```bash
curl -u $APP_USERNAME:$APP_PASSWORD https://<project>.vercel.app/api/forecasts/2026-01-15
```

Replace `$APP_USERNAME` and `$APP_PASSWORD` with the values you set in Vercel (or your local `.env`).
Requests to any `/api/*` endpoint require HTTP Basic auth:
```bash
curl -u admin:password http://localhost:8000/api/forecasts/2026-01-15
```
Replace the credentials with the values set in your environment.

## Vercel Deployment

1. Connect the repository to Vercel.
2. Add the required environment variables in the Vercel dashboard (`APP_USERNAME`, `APP_PASSWORD`, `ELEXON_API_KEY` if needed).
3. Vercel will detect the root `Dockerfile` and build the Docker image using `vercel.json`.
4. The app will be served at `https://<project>.vercel.app` with `/api/*` routed to the backend and all other routes serving the React frontend.
1. Connect the repository to Vercel.
2. Add the following environment variables in the Vercel dashboard:
   - `APP_USERNAME`
   - `APP_PASSWORD`
   - `ELEXON_API_KEY` (if required by the provider)
3. Vercel will detect the root `Dockerfile` and build the image.
4. The app will be served at `https://<project>.vercel.app`.

## Environment Variables

- `APP_USERNAME` – username for HTTP Basic auth.
- `APP_PASSWORD` – password for HTTP Basic auth.
- `ELEXON_API_KEY` – optional API key for fetching data from Elexon services.

## AI Assistance

The initial project scaffolding, Dockerfiles, and UI design were generated with the help of **ChatGPT (OpenCode)**. All generated code was reviewed and adapted to fit the project requirements.
The initial project scaffolding, Dockerfiles, and UI design were generated with the help of **ChatGPT (OpenCode)**. No proprietary code was copied; all generated code is reviewed and adapted.
