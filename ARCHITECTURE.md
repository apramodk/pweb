# Architecture

## System Overview

```mermaid
flowchart TB
    subgraph "Your Machine"
        STRAPI["Strapi CMS<br/>localhost:1337<br/>(SQLite)"]
        ADMIN["Admin Panel<br/>localhost:1337/admin"]
        PUBLISH["publish.py<br/>(Claude workflow)"]
    end

    subgraph "SvelteKit Build"
        API["src/lib/api.ts<br/>(fetch client)"]
        LOADERS["+page.ts loaders<br/>(build-time fetch)"]
        PAGES["+page.svelte<br/>(templates)"]
        BUILD["pnpm build<br/>→ static HTML"]
    end

    subgraph "Vercel CDN"
        STATIC["Static HTML/CSS/JS<br/>apramodk.com"]
    end

    ADMIN -->|edit content| STRAPI
    PUBLISH -->|POST /api/writings| STRAPI
    API -->|GET /api/*| STRAPI
    LOADERS --> API
    PAGES --> LOADERS
    BUILD --> PAGES
    BUILD -->|vercel deploy| STATIC
```

## Data Flow

```mermaid
sequenceDiagram
    participant CMS as Strapi CMS
    participant Loader as +page.ts
    participant Page as +page.svelte
    participant Build as vite build
    participant CDN as Vercel

    Note over CMS: Content stored in SQLite
    Build->>Loader: Execute load function
    Loader->>CMS: GET /api/skills?sort=sort_order
    CMS-->>Loader: JSON response
    Loader-->>Page: { skills, experiences, ... }
    Page->>Build: Render to static HTML
    Build->>CDN: Deploy build/ directory
    Note over CDN: Static site served globally
```

## Route Structure

```mermaid
graph TD
    subgraph "Layout Layer"
        LAYOUT["+layout.svelte<br/>(theme, navbar, footer, spotlight)"]
        LAYOUT_TS["+layout.ts<br/>(prerender + search index)"]
    end

    subgraph "Pages"
        HOME["/ — Home<br/>(skills, experience, education)"]
        HCI["/HCI — HCI Projects<br/>(4 hardware projects)"]
        SOFTWARE["/software — Software<br/>(5 projects)"]
        RESEARCH["/research — Research<br/>(positions + writings list)"]
        PAPER["/research/[slug]<br/>(individual paper)"]
    end

    subgraph "Data Sources"
        S_SKILLS["api/skills"]
        S_EXP["api/experiences"]
        S_EDU["api/educations"]
        S_HCI["api/hci-projects"]
        S_SW["api/software-projects"]
        S_RES["api/research-positions"]
        S_WRITE["api/writings"]
    end

    LAYOUT_TS -->|search index| LAYOUT
    LAYOUT -->|slot| HOME
    LAYOUT -->|slot| HCI
    LAYOUT -->|slot| SOFTWARE
    LAYOUT -->|slot| RESEARCH
    LAYOUT -->|slot| PAPER

    HOME --> S_SKILLS
    HOME --> S_EXP
    HOME --> S_EDU
    HCI --> S_HCI
    SOFTWARE --> S_SW
    RESEARCH --> S_RES
    RESEARCH --> S_WRITE
    PAPER --> S_WRITE
```

## Component Hierarchy

```mermaid
graph TD
    APP["app.html"] --> LAYOUT["+layout.svelte"]

    LAYOUT --> NAVBAR["Navbar.svelte<br/>(nav + theme toggle)"]
    LAYOUT --> SPOTLIGHT["Spotlight.svelte<br/>(Cmd+K search)"]
    LAYOUT --> FOOTER["Footer.svelte"]
    LAYOUT --> SLOT["Page slot"]

    SLOT --> HOME["+page.svelte /"]
    SLOT --> HCI["+page.svelte /HCI"]
    SLOT --> SW["+page.svelte /software"]
    SLOT --> RES["+page.svelte /research"]
    SLOT --> PAPER["+page.svelte /research/[slug]"]

    HCI --> CARD["Card.svelte<br/>(collapsible modal)"]
    HCI --> IMAGES["Images.svelte<br/>(image gallery)"]
```

## Theme System

```mermaid
sequenceDiagram
    participant User
    participant Navbar
    participant Layout
    participant DaisyUI

    User->>Navbar: Click theme toggle
    Navbar->>Layout: bind:isDarkMode updates
    Layout->>Layout: theme = isDarkMode ? "macdark" : "maclight"
    Layout->>DaisyUI: document.documentElement.setAttribute("data-theme", theme)
    DaisyUI->>User: Theme applied
```

Two custom DaisyUI themes:
- **maclight** — warm light theme (#faf8f5 base, #3B7EA1 primary)
- **macdark** — warm dark theme (#2a2924 base, #5BA3C9 primary)

## CMS Content Types

```mermaid
classDiagram
    class Skill {
        +string name
        +int sort_order
    }
    class Experience {
        +string job_title
        +string organization
        +string team
        +string start_date
        +string end_date
        +string location
        +text description
        +string color
        +int sort_order
    }
    class Education {
        +string degree
        +string institution
        +string graduation_date
        +string location
        +string color
        +int sort_order
    }
    class SoftwareProject {
        +string title
        +text description
        +text detail
        +json tech
        +string github_url
        +int sort_order
    }
    class ResearchPosition {
        +string lab_name
        +string institution
        +string role
        +string period
        +string location
        +text description
        +json topics
        +int sort_order
    }
    class HciProject {
        +string title
        +string short_description
        +richtext content
        +json youtube_urls
        +json local_videos
        +json image_indices
        +json code_blocks
        +int sort_order
    }
    class Writing {
        +string title
        +uid slug
        +text abstract
        +richtext content
        +json authors
        +date published_date
        +json tags
        +int sort_order
    }
```

## File Structure

```
pweb/
├── src/
│   ├── lib/
│   │   ├── api.ts                  # Strapi fetch client + types
│   │   ├── index.ts                # Component exports
│   │   ├── components/
│   │   │   ├── Navbar.svelte       # Nav + theme toggle
│   │   │   ├── Card.svelte         # Modal card (HCI page)
│   │   │   ├── Footer.svelte       # Footer
│   │   │   └── Spotlight.svelte    # Cmd+K search
│   │   └── images/
│   │       └── images.svelte       # Image gallery
│   └── routes/
│       ├── +layout.svelte          # Root layout
│       ├── +layout.ts              # Prerender + search index loader
│       ├── +page.svelte            # Home
│       ├── +page.ts                # Home loader
│       ├── HCI/+page.{svelte,ts}   # HCI projects
│       ├── software/+page.{svelte,ts}  # Software projects
│       └── research/
│           ├── +page.{svelte,ts}   # Research + writings list
│           └── [slug]/+page.{svelte,ts} # Individual paper
├── static/
│   ├── videos/                     # Local MOV files
│   └── favicons/
├── .env                            # VITE_STRAPI_URL, VITE_STRAPI_TOKEN
├── deploy.sh                       # Build + deploy to Vercel
├── svelte.config.js                # adapter-static
├── tailwind.config.js              # DaisyUI + Typography
└── vite.config.ts

~/strapi-cms/
├── .env                            # Strapi secrets
├── docker-compose.yml              # Docker setup (optional)
├── seed.mjs                        # Content migration script
├── publish.py                      # Claude publishing CLI
└── strapi-app/                     # Strapi project
    ├── src/api/                    # Content type schemas + routes
    └── .tmp/data.db                # SQLite database
```
