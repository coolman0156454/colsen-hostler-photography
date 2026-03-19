# Colsen Hostler Photography

Production-ready photography portfolio built with Next.js App Router, Google OAuth login, Google Drive gallery integration, password-protected galleries, and an admin panel.

## Tech Stack

- Next.js (App Router) + React + Tailwind CSS
- NextAuth (Google OAuth)
- JSON-backed file storage (lightweight and deployable)
- Google Drive API (`googleapis`)
- Resend API for contact email
- Deployable to Vercel or Railway

## Features

- Home page with animated hero and featured images pulled from Google Drive
- Gallery system with dynamic Drive folder loading
- Fullscreen modal image viewer with next/prev keyboard navigation
- Public, password-protected, or Google-login-protected galleries
- Passwords stored as bcrypt hashes
- Password access token stored in browser localStorage per gallery
- Google OAuth login with server session
- Admin dashboard for creating galleries from Drive folder IDs
- Contact form API route with real email sending through Resend
- Mobile-first, dark/light theme (default dark), sticky navbar

## Project Structure

```txt
src/
  app/
    api/
    admin/
    auth/signin/
    galleries/
    contact/
  components/
  config/
  lib/
  types/
data/
  galleries.json (auto-created)
```

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Copy environment file:

```bash
cp .env.example .env.local
```

3. Configure variables in `.env.local` (see env section below).

4. Run dev server:

```bash
npm run dev
```

Open `http://localhost:3000`.

## Environment Variables

Required core:

- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL` (for production URL, required in prod)
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `ADMIN_EMAILS` (comma-separated admin account emails)

Google Drive:

- `GOOGLE_DRIVE_API_KEY` (for public Drive folders)
- or service account credentials:
  - `GOOGLE_SERVICE_ACCOUNT_EMAIL`
  - `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY`
  - `GOOGLE_SERVICE_ACCOUNT_IMPERSONATE_USER` (optional domain-wide delegation)

Initial folders (auto-seed into DB on first run):

- `DRIVE_FOLDER_FEATURED`
- `DRIVE_FOLDER_SPORTS`
- `DRIVE_FOLDER_PORTRAITS`
- `DRIVE_FOLDER_EVENTS`

Protected gallery token signing:

- `GALLERY_ACCESS_TOKEN_SECRET` (or fallback to `NEXTAUTH_SECRET`)

Request/security logging:

- `NEXTAUTH_DEBUG=true` to keep verbose NextAuth debug output
- `REQUEST_COUNTRY_ALLOWLIST=US` to flag traffic from unexpected countries
- `REQUEST_ALERT_THRESHOLD=100` to flag high request volume from one IP in a 10-minute window
- `DATA_DIR=/data` to store galleries on a persistent volume in production

Contact form:

- `RESEND_API_KEY`
- `CONTACT_FROM_EMAIL`
- `CONTACT_TO_EMAIL`

## Google OAuth Setup

1. Create OAuth credentials in Google Cloud Console.
2. Add authorized JavaScript origin:
   - `http://localhost:3000` (dev)
   - your production domain(s)
3. Add authorized redirect URI:
   - `http://localhost:3000/api/auth/callback/google`
   - `https://<your-domain>/api/auth/callback/google`
4. Set `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in env.

## Google Drive Setup

1. Enable Google Drive API in Google Cloud.
2. Choose access pattern:
   - Public folders + API key: set `GOOGLE_DRIVE_API_KEY`
   - Private folders: use service account credentials and share folders with that service account
3. Put folder IDs in env (`DRIVE_FOLDER_*`) or add galleries in admin UI.

## Request Logging

The app includes centralized request logging in `src/proxy.ts` for Railway logs.

It logs:

- client IP
- method and path
- browser/OS/device signature
- edge-provided geo headers when available
- request count per IP over a rolling 10-minute window
- alerts for suspicious paths like `/wp-login.php`, `/.env`, `/phpmyadmin`, `/config`

Notes:

- Browsers do not expose a reliable hardware device ID to the server, so logs use a device signature based on user-agent data.
- Exact coordinates are only logged if your edge provider sends latitude/longitude headers. Standard Railway requests usually do not provide precise GPS data.

## Adding Galleries

Option A: Auto-seeded from env folder IDs (from `src/config/gallery-folders.ts` and env vars).

Option B: Admin route:

1. Sign in with Google account in `ADMIN_EMAILS`
2. Go to `/admin`
3. Enter:
   - Gallery name
   - Google Drive folder ID
   - Visibility (public/password/google-login)
   - Optional password, category, cover image file ID, featured flag

## Deployment

### Vercel

1. Push repo to GitHub
2. Import repo in Vercel
3. Set env vars
4. Build command: `npm run build`
5. Install command: `npm install`
6. Start command: `npm run start`

### Railway

`railway.toml` is included. Configure:

1. Deploy from GitHub repo
2. Set all env vars
3. Add a Railway volume, mount it at `/data`, and set `DATA_DIR=/data`
4. Railway start command runs `npm run start`

## GitHub Push Commands

Run from the `colsen-hostler-photography` directory:

```bash
git init
git add .
git commit -m "Initial production-ready Colsen Hostler Photography site"
git branch -M main
git remote add origin https://github.com/<your-username>/<your-repo>.git
git push -u origin main
```

## Production Checklist

- Set secure `NEXTAUTH_SECRET` and `GALLERY_ACCESS_TOKEN_SECRET`
- Verify Google OAuth redirect URIs
- Verify Drive folder permissions
- Verify Resend sender domain/email
- Verify admin access email list
