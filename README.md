# GarageMaster

GarageMaster is a garage management app for a local auto-repair shop. Customers can look up a repair by plate or VIN. Staff can log vehicles, track jobs, and keep parts inventory in one place.

The app has two parts:

- `client` — React and Vite shop site and staff tools
- `server` — Express API with Prisma and PostgreSQL

## What you can do

**Public site**

- Home, services, why us, FAQs, and contact
- Track a repair without signing in

**Customers**

- Sign in and open My Garage to see vehicles and job history

**Admins and mechanics**

- Dashboard overview of jobs
- Create and update repair jobs
- Adjust parts stock by car type

Roles are `CUSTOMER`, `MECHANIC`, and `ADMIN`.

## Requirements

- Node.js 18 or newer
- PostgreSQL
- npm

## Setup

### 1. Database

Create an empty PostgreSQL database, for example `garage_app`.

### 2. API

```bash
cd server
cp .env.example .env
```

On Windows PowerShell:

```powershell
cd server
Copy-Item .env.example .env
```

Edit `server/.env`:

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Secret used to sign login tokens |
| `PORT` | API port. Defaults to `5000` |
| `CLIENT_URL` | Frontend origin used in password-reset links. Defaults to `http://localhost:3000` |
| `SMTP_HOST`, `SMTP_USER` | Optional. When both are empty, reset requests return a link instead of sending mail |

Then install, migrate, and seed:

```bash
npm install
npx prisma generate
npx prisma migrate dev
npm run prisma:seed
npm run dev
```

The API listens on `http://localhost:5000`. `GET /health` returns `{ "status": "ok" }`.

### 3. Frontend

In another terminal:

```bash
cd client
cp .env.example .env
npm install
npm run dev
```

On Windows PowerShell, copy the example file with `Copy-Item .env.example .env`.

The site runs at `http://localhost:3000`. `VITE_API_URL` defaults to `http://localhost:5000/api`.

## Seed accounts

`npm run prisma:seed` wipes existing users, vehicles, jobs, and inventory, then loads demo data. Every seeded account uses the password `Password123!`.

| Role | Email |
| --- | --- |
| Admin | `admin@garagemaster.com` |
| Mechanic | `johndoe@garagemaster.com` |
| Mechanic | `sarahsmith@garagemaster.com` |
| Customer | `customer.alice@gmail.com` |
| Customer | `customer.bob@gmail.com` |

Change these passwords before using the app anywhere other than a local demo.

## Routes

| Path | Who |
| --- | --- |
| `/` | Anyone |
| `/services`, `/why-us`, `/faqs`, `/contact` | Anyone |
| `/track` | Anyone |
| `/login`, `/forgot-password`, `/reset-password` | Anyone |
| `/garage` | Customers |
| `/dashboard`, `/repairs`, `/inventory` | Admins and mechanics |

## API

All JSON routes sit under `/api`, except `GET /health`.

| Method | Path | Access |
| --- | --- | --- |
| `POST` | `/api/auth/login` | Public |
| `POST` | `/api/auth/forgot-password` | Public |
| `POST` | `/api/auth/reset-password` | Public |
| `GET` | `/api/auth/me` | Signed in |
| `GET` / `POST` | `/api/track` | Public |
| `GET` | `/api/garage` | Customer |
| `GET` | `/api/admin/overview` | Admin or mechanic |
| `GET` | `/api/admin/jobs` | Admin or mechanic |
| `GET` / `POST` | `/api/jobs` | Admin or mechanic |
| `PATCH` | `/api/jobs/:id` | Admin or mechanic |
| `GET` | `/api/inventory` | Admin or mechanic |
| `POST` | `/api/inventory/adjust` | Admin or mechanic |
| `POST` | `/api/inventory/:id/adjust` | Admin or mechanic |

Staff requests send `Authorization: Bearer <token>`.

Repair statuses are `PENDING`, `DIAGNOSING`, `PARTS_ON_ORDER`, `IN_PROGRESS`, `COMPLETED`, and `CANCELLED`.

## Project layout

```text
client/          React app
server/          Express API
server/prisma/   Schema, migrations, and seed
```

## Scripts

**Server**

- `npm run dev` — start with file watching
- `npm start` — start once
- `npm run prisma:generate` — generate the Prisma client
- `npm run prisma:migrate` — apply migrations in development
- `npm run prisma:seed` — reload demo data

**Client**

- `npm run dev` — Vite dev server on port 3000
- `npm run build` — production build
- `npm run preview` — preview the production build
