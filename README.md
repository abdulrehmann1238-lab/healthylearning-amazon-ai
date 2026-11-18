# Healthy Learning LLC — Amazon Business Intelligence & AI Operations

Interactive frontend product demonstration showcasing an AI-powered Amazon Vendor Central business management, advertising intelligence, and human-in-the-loop automation workspace for Healthy Learning LLC.

> **Demonstration Notice:** This is a frontend-only demonstration using structured illustrative mock datasets. No live Amazon SP-API, Amazon Advertising API, or ChatGPT API credentials are connected.

## Tech Stack

- **React 19 + TypeScript + Vite 6**
- **Tailwind CSS v4**
- **Recharts** for interactive data visualizations
- **Framer Motion** for restrained interface motion (respects `prefers-reduced-motion`)
- **Lucide React** for crisp iconography
- **React Router v7** with lazy-loaded workspace routes

## Local Development

```bash
npm install
npm run dev
```

## Production Build

```bash
npm run build
npm run preview
```

## Netlify Deployment

This repository includes a pre-configured `netlify.toml` with:
- **Build command:** `npm run build`
- **Publish directory:** `dist`
- **Node version:** `22`
- **SPA routing fallback:** `/* -> /index.html (200)` for direct navigation across all 16 routes
- **Security & immutable asset caching headers**

Import this repository directly in Netlify ("Add new site" → "Import an existing project") and Netlify will automatically apply `netlify.toml`.
