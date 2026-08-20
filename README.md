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
