# apramodk.com

Personal website for Akash Pramod Kumar — SvelteKit static site powered by a self-hosted Strapi CMS.

## Architecture

```
Your Machine                          Vercel (CDN)
┌─────────────────────┐               ┌──────────────────┐
│  Strapi CMS         │── build-time  │  Static HTML/    │
│  localhost:1337      │   fetch ────→ │  CSS/JS          │
│  (SQLite + uploads) │               │  served globally  │
└─────────────────────┘               └──────────────────┘
        ↑                                     ↑
  Admin panel                           pnpm build →
  localhost:1337/admin                  vercel deploy
```

Content lives in Strapi (self-hosted, SQLite). At build time, SvelteKit fetches everything from the CMS and generates a fully static site. Vercel serves the static output — no runtime server needed.

## Prerequisites

- Node.js 20+ (install via [fnm](https://github.com/Schniz/fnm): `fnm install 20`)
- pnpm (`corepack enable && corepack prepare pnpm@latest --activate`)
- Vercel CLI (`npm i -g vercel`) — for deployments

## Quick Start

### 1. Start the CMS

```bash
cd ~/strapi-cms/strapi-app
npm run develop
```

Admin panel: http://localhost:1337/admin
- Email: akash@apramodk.com
- Password: (set during first setup)

### 2. Run the dev server

```bash
cd ~/Code/pweb
pnpm dev
```

Site: http://localhost:5173

### 3. Deploy to production

```bash
cd ~/Code/pweb
./deploy.sh
```

This checks Strapi is up, builds the static site, and deploys to Vercel.

## Project Structure

```
src/
├── lib/
│   ├── api.ts                  # Strapi fetch client + types
│   ├── index.ts                # Component barrel exports
│   ├── components/
│   │   ├── Navbar.svelte       # Navigation + theme toggle
│   │   ├── Card.svelte         # Collapsible modal card
│   │   ├── Footer.svelte       # Footer with social links
│   │   └── Spotlight.svelte    # Cmd+K search (dynamic from CMS)
│   └── images/
│       └── images.svelte       # HCI project image gallery
├── routes/
│   ├── +layout.svelte          # Root layout (theme, navbar, footer)
│   ├── +layout.ts              # Prerender + dynamic search index
│   ├── +page.svelte            # Home (skills, experience, education)
│   ├── +page.ts                # Home data loader
│   ├── HCI/
│   │   ├── +page.svelte        # HCI & Embedded Systems projects
│   │   └── +page.ts            # HCI data loader
│   ├── software/
│   │   ├── +page.svelte        # Software projects
│   │   └── +page.ts            # Software data loader
│   └── research/
│       ├── +page.svelte        # Research positions + writings list
│       ├── +page.ts            # Research data loader
│       └── [slug]/
│           ├── +page.svelte    # Individual paper/writing page
│           └── +page.ts        # Paper data loader + entries()
└── app.html
```

## CMS (Strapi)

Located at `~/strapi-cms/`. Portable — copy the whole folder to another machine and `npm run develop`.

### Content Types

| Collection | Fields | Page |
|---|---|---|
| Skill | name, sort_order | Home |
| Experience | job_title, organization, team, dates, location, description, color | Home |
| Education | degree, institution, graduation_date, location, color | Home |
| Software Project | title, description, detail, tech[], github_url | /software |
| Research Position | lab_name, institution, role, period, location, description, topics[] | /research |
| HCI Project | title, short_description, content, youtube_urls[], local_videos[], image_indices[], code_blocks[] | /HCI |
| Writing | title, slug, abstract, content, authors[], published_date, tags[] | /research/[slug] |

### Seed data

To re-seed from scratch (wipe Strapi DB first):

```bash
STRAPI_URL=http://localhost:1337 STRAPI_TOKEN=<your-api-token> node ~/strapi-cms/seed.mjs
```

### Publishing a writing (Claude workflow)

```bash
cd ~/strapi-cms
python3 publish.py \
  --title "Paper Title" \
  --abstract "Short summary" \
  --content paper.md \
  --authors "Akash Pramod Kumar" \
  --tags "AI,ML" \
  --status published
```

## Environment Variables

### `~/Code/pweb/.env` (gitignored)

```
VITE_STRAPI_URL=http://localhost:1337
VITE_STRAPI_TOKEN=<api-token>
```

### `~/strapi-cms/.env` (gitignored)

```
APP_KEYS=...
API_TOKEN_SALT=...
ADMIN_JWT_SECRET=...
JWT_SECRET=...
TRANSFER_TOKEN_SALT=...
```

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | SvelteKit (adapter-static) |
| Styling | TailwindCSS + DaisyUI + Typography |
| CMS | Strapi v5 (SQLite) |
| Hosting | Vercel (static) |
| Themes | maclight / macdark (custom DaisyUI) |
| Search | Spotlight (Cmd+K) — dynamic from CMS |

## Portability

The CMS is fully portable. To move to another machine:

1. Copy `~/strapi-cms/` to the new machine
2. `cd strapi-cms/strapi-app && npm install && npm run develop`
3. Or use Docker: `cd strapi-cms && docker compose up`

All data (SQLite DB + uploads) lives inside the `strapi-app/` directory.
