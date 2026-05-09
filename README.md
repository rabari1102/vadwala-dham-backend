# Vadwala Dham Backend API

Vercel-ready Express.js + MongoDB backend for **Shri Vadwala Mandir Dudhrej Dham**.

## 🚀 Deploy to Vercel

### Step 1 — Set Environment Variables on Vercel

Go to your Vercel project → Settings → Environment Variables and add:

| Variable | Value |
|---|---|
| `MONGODB_URI` | Your MongoDB Atlas connection string |
| `JWT_SECRET` | A long random string (e.g. `openssl rand -base64 32`) |
| `ADMIN_USERNAME` | `admin` (or your choice) |
| `ADMIN_PASSWORD` | Your secure password |
| `FRONTEND_URL` | `https://your-frontend.vercel.app` |
| `NODE_ENV` | `production` |

### Step 2 — Deploy

```bash
npm i -g vercel
vercel --prod
```

Or connect this repo to Vercel via the dashboard — it auto-detects `vercel.json`.

### Step 3 — Seed Initial Data

After deploying, run the seed script locally pointing to your Atlas DB:

```bash
MONGODB_URI="your-atlas-uri" npm run seed
```

## 📡 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/health` | Health check |
| GET | `/api/hero` | Hero slides |
| GET | `/api/announcements` | Announcements |
| GET | `/api/festivals` | All festivals |
| GET | `/api/festivals/upcoming` | Upcoming festivals |
| GET | `/api/gallery` | Gallery images |
| GET | `/api/services` | Temple services |
| GET | `/api/about` | About info |
| GET | `/api/acharyas` | Acharyas list |
| GET | `/api/donation` | Donation info |
| GET | `/api/contact` | Contact info |
| GET | `/api/content` | All site content |
| POST | `/api/contact/message` | Submit contact form |
| POST | `/api/admin/login` | Admin login |
| POST/PUT/DELETE | `/api/admin/*` | Admin CRUD (JWT required) |

## 🔧 Local Development

```bash
cp .env.example .env
# Fill in your values
npm install
npm run dev
```

## 📁 Project Structure

```
api/
  index.js          ← Vercel serverless entry point
src/
  models/           ← Mongoose models
  routes/           ← Express route handlers
  middleware/       ← Auth middleware
  seed.js           ← Seed script
vercel.json         ← Vercel config
```
