# Vercel Deployment Guide

This guide outlines the exact, step-by-step process for deploying the Bawsala News platform live to Vercel, including configuring the database, environment variables, and automated cron jobs.

## 1. Prepare Supabase (Production Database)

Before deploying the frontend, your production database must be live.

1. **Create a Supabase Project:** Go to [Supabase](https://supabase.com), create an account, and start a new project.
2. **Apply Migrations:** 
   You need to apply the local migrations to the production database. You can do this via the Supabase CLI:
   ```bash
   npx supabase link --project-ref your-project-ref
   npx supabase db push
   ```
   *Alternatively, you can copy the SQL from the files in `supabase/migrations/` and run them sequentially in the Supabase Dashboard's SQL Editor.*
3. **Seed Initial Data:**
   Run the `supabase/seed.sql` script in your Supabase SQL Editor to populate the initial Admin, Journalist, and Reader accounts, along with the starting categories and sources.
   - **Admin Login:** `admin@bawsala.com` / `password123`
   - **Journalist Login:** `journalist@bawsala.com` / `password123`
   - **Reader Login:** `reader@bawsala.com` / `password123`
4. **Get API Keys:** Navigate to **Project Settings > API** in Supabase and copy your `Project URL` and `anon public` key.

## 2. Push Code to GitHub

Vercel deploys directly from your Git repository.

1. Initialize a Git repository if you haven't already:
   ```bash
   git init
   git add .
   git commit -m "Initial commit for Bawsala News MVP"
   ```
2. Create a new repository on GitHub.
3. Push your code:
   ```bash
   git remote add origin https://github.com/yourusername/bawsala-news.git
   git push -u origin main
   ```

## 3. Deploy to Vercel

1. **Log in to Vercel:** Go to [Vercel](https://vercel.com) and log in with your GitHub account.
2. **Import Project:** Click **"Add New..." > "Project"**. Select the `bawsala-news` repository from your GitHub account.
3. **Configure Build Settings:** Vercel will automatically detect that this is a Next.js project. The default build command (`next build`) and output directory are correct.
4. **Add Environment Variables:**
   Expand the "Environment Variables" section and add the keys from your Supabase dashboard:
   - `NEXT_PUBLIC_SUPABASE_URL`: (Paste your Project URL)
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: (Paste your anon public key)
5. **Deploy:** Click the **Deploy** button. Vercel will now build and deploy the application.

## 4. Verify Cron Jobs

Bawsala News uses a Vercel Cron Job to automatically fetch external RSS feeds.

1. **vercel.json:** The `vercel.json` file in the root directory already configures the cron schedule (`"0 * * * *"` = run at the top of every hour).
2. **Verification:** Once the deployment finishes, navigate to your project dashboard on Vercel. Go to the **Settings > Cron Jobs** tab. You should see the `/api/cron/fetch-news` endpoint listed and scheduled successfully.
3. **Manual Trigger:** You can manually trigger the cron job from this Vercel dashboard to immediately populate the database with fresh news.

Your platform is now fully deployed and live!
