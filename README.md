# Tuition App

A simple full-stack tutor listing application with a React frontend and an Express/MongoDB backend.

## Overview

- **Frontend:** Vite + React
- **Backend:** Express, Mongoose, MongoDB
- **Purpose:** Allow tutors to register, let users browse approved tutors, and enable admin approval of tutor listings.
- **Security:** Admin access is protected by a server secret (`ADMIN_SECRET`) and admin routes are rate-limited.

## Repository structure

- `/frontend` — React app using Vite.
- `/backendserver` — Express API server with tutor and admin routes.
- `/.env.example` — Example environment variables.

## Features

- Tutor registration form with client validation
- Tutor browse page with subject/city search
- Admin panel for approving or revoking tutor listings
- Admin secret protection for admin endpoints
- `GET /health` liveness endpoint

## Setup

### Backend

1. Copy `.env.example` to `.env` in `/backendserver`.
2. Set `MONGO_URI`, `ADMIN_SECRET`, and `FRONTEND_ORIGIN`.
3. Install dependencies and start the server:

```bash
cd backendserver
npm install
npm start
```

### Frontend

1. Configure `VITE_API_URL` in `/frontend/.env` or use the default in code.
2. Install dependencies and start the frontend:

```bash
cd frontend
npm install
npm run dev
```

## Environment variables

The app uses the following environment variables:

- `MONGO_URI` — MongoDB connection string for the backend.
- `ADMIN_SECRET` — Secret used to authorize admin API requests.
- `PORT` — Backend server port (default `3001`).
- `FRONTEND_ORIGIN` — Allowed frontend origin for CORS.
- `VITE_API_URL` — Frontend API base URL for backend requests.

## Development notes

- Admin secret should never be hard-coded into client code.
- Admin endpoints are protected using `X-Admin-Secret` header.
- Approved tutors are visible in search results; newly registered tutors remain pending until approved.
- The admin secret is no longer stored in browser storage by default.

## Useful commands

### Backend

```bash
cd backendserver
npm install
npm start
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Deployment

- Deploy backend to a hosting platform like Render or Heroku.
- Set `ADMIN_SECRET` and `MONGO_URI` as secure environment variables.
- Set `VITE_API_URL` in the frontend deployment to the backend URL.
- Set `FRONTEND_ORIGIN` in the backend to the deployed frontend origin.

## License

This project is provided as-is. Update the license text as needed.
