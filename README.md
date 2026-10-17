# Zyngram Campus Hub — Local Implementation

A Next.js 16 application with Student, Trainer, Campus Coordinator and Administrator workspaces. The local backend is implemented with Next.js Route Handlers and a persistent JSON data store at `data/campus-hub-db.json`; no separate backend server or extra database package is required.

## Requirements
- Node.js 20.9 or newer (Node.js 24 is suitable)
- npm

## Run locally
1. Open a terminal in the `zyngram-campus-hub` folder.
2. Install dependencies:
   ```powershell
   npm install
   ```
3. Optional but recommended: copy `.env.example` to `.env.local` and change `ADMIN_EMAIL` and `ADMIN_PASSWORD` **before the first start**.
4. Start the application:
   ```powershell
   npm run dev
   ```
5. Open the URL shown by Next.js (usually `http://localhost:3000`; if that port is busy it may use `3001`).

## First administrator account
If the local database has no administrator yet, the first backend request creates one using `ADMIN_EMAIL` and `ADMIN_PASSWORD`. If no environment variables are configured, the local demo defaults are:
- Email: `admin@campushub.local`
- Password: `ChangeMe123!`

Change these defaults before first use where possible. The seed account is created once; changing environment values after creation does not reset the existing account. Do not deploy with demo credentials.

## Implemented backend
- `POST /api/auth/register` — student account registration (public registration cannot assign staff/admin roles)
- `POST /api/auth/login` — verifies a scrypt-hashed password and creates an HTTP-only session cookie
- `POST /api/auth/logout` and `GET /api/auth/me`
- `POST /api/auth/forgot-password` — demo-only password reset; it does not verify email ownership
- `GET /api/users` and `PATCH /api/users` — administrator-only user listing and role management
- `GET /api/modules` — authenticated module listing
- `POST /api/modules`, `PATCH /api/modules`, `DELETE /api/modules?id=...` — administrator-only module CRUD
- Server-side sessions, password hashing, input validation, role checks and audit entries for key authentication/admin actions

## Persistence
The server writes accounts, session records, modules and audit records to `data/campus-hub-db.json`. This file is created on first use and persists across local server restarts. Back it up before deleting or replacing it. This simple file-backed store is appropriate for a local assignment/demo, not concurrent production traffic. Use a managed database such as PostgreSQL/SQLite and a verified email reset flow before production deployment.

Some training batches, assessments, feedback, announcements and student profile/community features in the existing UI still use browser local storage. They are prototype features and are not yet shared across browsers/users.

## Verification
Run:
```powershell
npm run build
```
Then manually test:
1. Register a student and sign in.
2. Sign out and sign back in.
3. Sign in as the administrator using the credentials above (or the values configured before the database was created).
4. Change a registered user's role from the Admin workspace.
5. Create a module, switch it between Active and Draft, delete it, then refresh and verify persistence.
6. As a student, try to access `/api/users` or POST to `/api/modules`; the server should return `401` or `403` rather than allowing the action.

## Security notes
This is an assignment-ready local prototype, not a production-ready service. The demo password reset does not verify identity. The file-backed store is not designed for simultaneous multi-instance writes. Use HTTPS, verified recovery tokens, rate limiting, CSRF protections appropriate to deployment, and a production database before handling real student information.
