# Deployment Guide

This project is configured for deployment to **GitHub Pages** with support for subdirectory hosting (e.g., `username.github.io/repo-name`).

## 1. Configure Repository Name (Important!)

If your repository is NOT at the root (e.g., it is `https://username.github.io/my-project`), you MUST configure the `NEXT_PUBLIC_REPO_NAME` variable.

### Option A: GitHub Repository Variable (Recommended)
1. Go to your GitHub Repository.
2. Navigate to **Settings** > **Secrets and variables** > **Actions**.
3. Click on the **Variables** tab.
4. Click **New repository variable**.
5. Name: `NEXT_PUBLIC_REPO_NAME`
6. Value: `/your-repo-name` (Must start with a slash, e.g., `/pj-insrnce`).

### Option B: Environment File (Alternative)
You can create a `.env.production` file in the root of your project:

```env
NEXT_PUBLIC_REPO_NAME=/your-repo-name
```

## 2. GitHub Actions

A GitHub Actions workflow has been created at `.github/workflows/nextjs.yml`.

1. Push your code to the `main` branch.
2. The action will automatically trigger.
3. Once finished, go to **Settings** > **Pages**.
4. Ensure the **Source** is set to `GitHub Actions`.
5. Your site should be live!

## 3. Local Development

In local development (`npm run dev`), the base path is ignored, so everything works as expected at `localhost:3000`.

## Troubleshooting

### Images Not Loading
If images are broken on the deployed site:
1. Check that `NEXT_PUBLIC_REPO_NAME` is set correctly in GitHub Variables.
2. Inspect the image URL in the browser. It should look like `/repo-name/logos/image.svg`.
3. If it looks like `/logos/image.svg` (missing repo name), the variable is missing.

### 404 on Refresh
GitHub Pages is a static host. If you navigate to `/quote` and refresh, you might get a 404 because that file doesn't exist (it's a client-side route).
*   Next.js `output: 'export'` generates `quote.html`.
*   Navigation works because of client-side routing.
*   Direct access to `/quote` might fail unless you configure a trailing slash or use a rewrite hack (SPA fallback).
*   This project uses `output: 'export'` which generates `out/quote.html`. GitHub Pages usually handles `quote` -> `quote.html` automatically.

## Performance
The `PerformanceMonitor` component is disabled in production builds to prevent console noise and overhead.
