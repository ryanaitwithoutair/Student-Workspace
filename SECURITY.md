# Security runbook

This repository intentionally exposes only the Supabase **anon** key in the browser. It is public by design; the protection for user data is the Row Level Security (RLS) policy in `supabase/schema.sql`.

## Required deployment settings

1. Run the current `supabase/schema.sql` in the Supabase SQL Editor. It is safe to rerun and adds the payload, session-count, and timestamp safeguards to an existing deployment.
2. In Supabase Authentication, disable new-user signups. The application has no signup page because it is intended for the two existing users, but dashboard settings are the real enforcement point.
3. Set Supabase **Site URL** to the exact production Vercel URL. Keep the Supabase redirect allow-list to that URL and required preview URLs only; do not use broad wildcards.
4. In Vercel, add only `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`. Never place `SUPABASE_SERVICE_ROLE_KEY`, a database password, or any private API key in a `VITE_*` variable.
5. Enable MFA for both Supabase users and use unique, long passwords. Revoke sessions and rotate credentials immediately if a device is lost or a key appears in Git history.

## What the application enforces

- Vercel sends a restrictive Content Security Policy and anti-clickjacking, HTTPS, referrer, MIME-sniffing, and browser-permissions headers.
- Tailwind is compiled at build time; no third-party runtime script is loaded.
- Workspace data loaded from local storage or Supabase is shaped and bounded before it reaches the UI. Bookmark URLs must be HTTPS, and background images are restricted to the curated Unsplash host.
- RLS limits each authenticated user to their own workspace and sessions. Database constraints cap workspace state at 256 KiB, focus entries at 1–1,440 minutes, and each user at 5,000 sessions.

## Deliberate trust boundary

The browser can never be a trusted analytics authority: a signed-in user can alter requests from their own browser and therefore falsify their own focus metrics. This does not grant access to another user's rows because RLS blocks it. If analytics must be tamper-proof, write sessions through a Supabase Edge Function that performs server-side validation instead of allowing browser writes directly.

Run these before each deployment:

```bash
npm run lint
npm run build
npm audit --omit=dev
```
