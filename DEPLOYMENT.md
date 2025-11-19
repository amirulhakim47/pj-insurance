# Deployment Guide

This project is configured for deployment to **GitHub Pages** using a manual build process.

## Setup (One Time)

1. Go to your GitHub Repository Settings.
2. Navigate to **Pages** (on the left sidebar).
3. Under **Build and deployment** > **Source**, select **"Deploy from a branch"**.
4. Select **Branch: main** and **Folder: /out** (or `/root` if `/out` isn't an option, but usually it tracks the root. If `/out` option isn't there, you might need to just serve from root but our build puts it in `out`. GitHub Pages classic usually serves from root or `/docs`. If we want to serve `out`, we might need to use a specific action or just copy contents to root on a `gh-pages` branch. 
   *Actually, the easiest way for manual deployment to GitHub Pages is to use the `gh-pages` package or push the `out` folder content to a separate `gh-pages` branch.*)

**Wait**, standard GitHub Pages "Deploy from branch" only supports `/` (root) or `/docs`. It does **not** support arbitrary folders like `/out` on the main branch.

### Revised Strategy:

We will use the `gh-pages` branch strategy.

1. **Install `gh-pages`**: `npm install --save-dev gh-pages` (I will do this for you).
2. **Update `deploy` script**: `"deploy": "next build && gh-pages -d out -t"` (-t checks for dotfiles).
3. **Run**: `npm run deploy`.

This will push the contents of `out/` to a `gh-pages` branch. GitHub Pages will then serve from that branch.

## Usage

To deploy your latest changes:

```bash
npm run deploy
```

This command will:
1. Build the project locally (generating `out/`).
2. Push the `out/` folder to the `gh-pages` branch on GitHub.
3. Your site will update automatically.

*Note: You still need to push your source code changes to `main` separately using standard git commands.*
