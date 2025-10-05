Deployment to Vercel

Quick steps

1. Create a Vercel account and install the Vercel CLI (optional).
2. From the project root (this repository), run `vercel` and follow prompts, or connect the GitHub repository from the Vercel dashboard.

Environment variables

- In the Vercel dashboard for your project, add the following Environment Variables (Production & Preview as appropriate):
  - NEXT_PUBLIC_SUPABASE_URL (value: your Supabase project URL)
  - NEXT_PUBLIC_SUPABASE_ANON_KEY (value: your Supabase anon public key)
  - NEXT_SERVER_ACTIONS_ENCRYPTION_KEY (optional but recommended if using Next.js Server Actions)

Security notes

- NEVER add service role keys with NEXT_PUBLIC_ prefix. If you need service role access, add it as SUPABASE_SERVICE_ROLE_KEY (server-only) and reference it from server code (not exposed to client).
- Keep `.env.local` private (it's excluded from git by default in Next.js projects). Use the `.env.example` file as a template for required variables.

Build & Settings

- Build command: (default) `npm run build`
- Output directory: (default) handled by Next.js on Vercel
- The included `vercel.json` maps env keys to project-level secrets prefixed with `@` (Vercel secret names). When you add secrets via the Vercel CLI or dashboard, you can use the same names.

Troubleshooting

- If you see runtime errors about navigation hooks (useSearchParams, usePathname) during prerender, ensure any components using those hooks are inside `"use client"` components and that server pages render them inside a `<Suspense>` boundary.
- If Supabase permissions block operations, verify your Supabase row-level security policies and anon key permissions.

If you want, I can:
- Add a GitHub Action workflow file to deploy to Vercel automatically on push.
- Create Vercel CLI commands or scripts to set secrets from a `.env` file (careful with secrets in CI).
