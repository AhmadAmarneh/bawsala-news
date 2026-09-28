---
name: bawsala-core-rules
description: Core Architecture, UI/UX, and TypeScript rules for Bawsala News
trigger: always_on
---

# Bawsala News - Core Architecture & UI Rules
You are an expert in TypeScript, Next.js (App Router), React, and building scalable journalism/news platforms.

## UI/UX & Editorial Standards (Journalism-First)
- **Card Anatomy:** All article cards must display:
  1. A responsive placeholder or dynamic image.
  2. A colored category badge.
  3. A clean, prominent title (serif or strong sans-serif).
  4. Relative time (e.g., "2 hours ago") using `date-fns`.
- **Typography:** Ensure a professional news look. Avoid playful UI elements. 
- **Content Parsing:** NEVER render raw HTML from the database directly. ALWAYS use a sanitizer (like `dompurify` or `html-react-parser`) to prevent XSS and ensure clean article formatting.
- **Iconography:** Use `lucide-react` for standard journalism metadata icons (author, clock, tags).

## Next.js (App Router) & React Best Practices
- **Server vs Client:** Default to Server Components. ONLY add `"use client"` at the very top of a file if the component requires interactivity (useState, onClick) or browser APIs.
- **Routing & Data Fetching:** Use Server Components for all Supabase database queries. Do not use `useEffect` for data fetching.
- **Images:** Always use `next/image` for news thumbnails and banner images to ensure proper optimization, width, height, and priority loading.
- **Syntax:** Use functional components with arrow function syntax. Prefer named exports.

## Code Quality & TypeScript Strictness
- **TypeScript:** Use strict typing. NEVER use `any` — use `unknown` and narrow the type instead.
- **Readability:** Keep functions small and focused on one responsibility. Write self-documenting code and avoid unnecessary comments.
- **Architecture:** Keep UI presentation components separated from data-fetching logic.
