# Astra Ventures

Responsive React/Vite landing page and NestJS API with JSON-file persistence.

## Requirements

- Node.js 20+
- npm

## Backend

```powershell
cd backend
npm install
Copy-Item .env.example .env
```

Set a long, unique, random `ADMIN_ACCESS_TOKEN` in `backend/.env`, then run:

```powershell
npm run start:dev
```

The API listens on `http://localhost:3000/api`. The admin dashboard accepts `ADMIN_ACCESS_TOKEN` and sends it as a bearer token. Founder submissions are public at `POST /api/submissions`; LP inquiries are public at `POST /api/lp-submissions`. Listing either inquiry type and updating website content require the bearer token. Inquiries are persisted separately in `backend/data/submissions.json` and `backend/data/lp-submissions.json`.

## Frontend

In another terminal:

```powershell
cd frontend
npm install
npm run dev
```

The site is served at `http://localhost:5173`; the admin dashboard is at `/admin`. The public LP and founder forms have separate inquiry queues in the dashboard. Create `frontend/.env` from `.env.example` to configure the API URL. The dashboard accepts team profile changes and publishes them immediately to the public Team section.

## Deploying to Vercel

The SPA rewrite in `frontend/vercel.json` serves the React entry point for deep links such as `/admin`. In Vercel, use separate projects from this monorepo:

1. **Backend project:** create/deploy this first, with Root Directory `backend` (Framework Preset: NestJS). Set a long, unique `ADMIN_ACCESS_TOKEN` and `FRONTEND_ORIGIN` in its Environment Variables. `FRONTEND_ORIGIN` must exactly match your deployed website origin, such as `https://your-site.vercel.app` (no path); comma-separate origins if you also need preview domains. Redeploy after setting these values.
2. **Frontend project:** set Root Directory to `frontend` (Framework Preset: Vite, Output Directory: `dist`). The root `vercel.json` also supports deploying the frontend from the repository root.
3. In the frontend project's Environment Variables, set `VITE_API_URL` to the backend deployment URL followed by `/api`, for example `https://your-api.vercel.app/api`. Set it for Production and Preview as needed, then redeploy the frontend. Vite embeds this value at build time; changing it requires a new deployment.
4. Verify the backend directly by opening `https://your-api.vercel.app/api/content`, then submit a test inquiry from the deployed site. A browser `Failed to fetch` message usually means `VITE_API_URL` is missing/wrong or the backend's `FRONTEND_ORIGIN` does not allow the site origin.

The API currently stores inquiries in local JSON files. Vercel Functions do not provide durable local file storage, so this JSON storage is not suitable for preserving production submissions across deployments or function instances. Connect durable storage before collecting real inquiries in production.

## Production notes

Build each app with `npm run build` in its directory. Set `FRONTEND_ORIGIN`, `ADMIN_ACCESS_TOKEN`, and `PORT` in the backend environment. JSON-file storage is appropriate for a small MVP on a single persistent instance; use a transactional database and durable shared storage before scaling to concurrent/multi-instance deployments.
