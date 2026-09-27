# Bawsala News – Hybrid News Aggregator & CMS
**University Graduation Project**

Bawsala News is a modern, high-performance web platform that seamlessly merges a traditional Content Management System (CMS) with an automated RSS News Aggregator. Designed for local journalists and avid readers, it serves as a central hub for curated global headlines and exclusive local journalism.

## System Architecture

The platform is built using a modern, serverless architecture that prioritizes speed, security, and developer experience.

### Tech Stack
- **Frontend Framework:** Next.js 16+ (App Router, Server Components, Server Actions)
- **Styling & UI:** Tailwind CSS v4, `shadcn/ui` (Base UI/Radix primitives), `lucide-react`
- **Backend & Database:** Supabase (PostgreSQL, Supabase Auth, Supabase Storage)
- **Rich Text Editor:** Tiptap (Headless wrapper around ProseMirror)
- **Automation:** Vercel Cron Jobs + `rss-parser`

### Core Modules
1. **Public Frontend (`/app/(public)`):** A highly responsive, editorial-style reading experience. Features a mixed timeline distinguishing between exclusive and aggregated articles.
2. **CMS Dashboard (`/app/dashboard`):** Protected administrative area for content creation and source management.
3. **Role-Based Access Control (RBAC):** Next.js Middleware (`proxy.ts`) enforces strict access rules based on user roles (`admin`, `journalist`, `reader`) synced via a PostgreSQL database trigger.
4. **Aggregator Engine (`/api/cron/fetch-news`):** A serverless endpoint triggered hourly by Vercel Cron to parse active RSS feeds and populate the database with fresh content.

## Database Schema (Supabase)
- `users`: Extends `auth.users` with custom roles (synced automatically via trigger).
- `categories`: Taxonomies for grouping articles.
- `sources`: External RSS feeds managed by admins.
- `articles`: Central table storing both CMS-authored HTML content and aggregated snippets.
- `saved_articles`: Junction table allowing users to bookmark articles.

## Getting Started Locally

1. **Clone & Install:**
   ```bash
   git clone <repo-url>
   cd bawsala-news
   npm install
   ```
2. **Supabase Setup:**
   - Link your local project or start the local Docker container (`npx supabase start`).
   - Run migrations and seed data: `npx supabase db reset` (or run manually).
3. **Environment Variables:**
   - Copy `.env.example` to `.env.local` and fill in your Supabase details.
4. **Run Development Server:**
   ```bash
   npm run dev
   ```

## Deployment
Please refer to the detailed deployment guide located at `/docs/deployment.md`.
