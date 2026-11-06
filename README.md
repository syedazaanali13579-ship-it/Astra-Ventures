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

Set `ADMIN_EMAIL`, `ADMIN_PASSWORD`, and a unique, random `ADMIN_TOKEN_SECRET` (at least 32 characters) in `backend/.env`, then run:

```powershell
npm run start:dev
```

The API listens on `http://localhost:3000/api`. Admin sign-in uses `POST /api/admin/login` and returns an eight-hour bearer token. Founder submissions are public at `POST /api/submissions`; LP inquiries are public at `POST /api/lp-submissions`. Listing either inquiry type and updating website content require the bearer token. Inquiries are persisted separately in `backend/data/submissions.json` and `backend/data/lp-submissions.json`.

## Frontend

In another terminal:

```powershell
cd frontend
npm install
npm run dev
```

The site is served at `http://localhost:5173`; the admin dashboard is at `/admin`. The frontend includes a Vercel SPA rewrite so direct navigation to `/admin` serves the React entry point. The public LP and founder forms have separate inquiry queues in the dashboard. Create `frontend/.env` from `.env.example` to configure the API URL. The dashboard accepts team profile changes and publishes them immediately to the public Team section.

## Production notes

Build each app with `npm run build` in its directory. Set `FRONTEND_ORIGIN`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_TOKEN_SECRET`, and `PORT` in the backend environment. JSON-file storage is appropriate for a small MVP on a single persistent instance; use a transactional database and durable shared storage before scaling to concurrent/multi-instance deployments.
