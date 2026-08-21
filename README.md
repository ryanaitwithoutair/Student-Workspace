# Evolve Student Workspace

A Vite + React focus workspace with Supabase authentication.

## Local development

1. Copy `.env.example` to `.env` and add your Supabase project URL and anon key.
2. Run `npm install`.
3. Run `npm run dev`.

## Deploying to Vercel

The project is a Vite application, not a Next.js application. Vercel uses the
configuration in `vercel.json` to build it with `npm run build` and deploy the
generated `dist` directory. Add `VITE_SUPABASE_URL` and
`VITE_SUPABASE_ANON_KEY` in the Vercel project environment variables before
deploying.

## Enable cloud workspace data

The app stores each signed-in user's focus sessions, analytics inputs, streak
history, tasks, checklists, spaces, preferences, and achievements in Supabase.

1. Open Supabase **SQL Editor** and run [supabase/schema.sql](supabase/schema.sql).
2. Deploy this version of the app.
3. Sign in. Existing browser data is used as the initial workspace and then
   synchronizes to the signed-in user's own Supabase records.

The SQL enables Row Level Security, so one user cannot read or change another
user's workspace data.
