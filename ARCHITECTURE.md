# Website Architecture Diagram

This document provides a comprehensive overview of the SvelteKit personal website architecture, including user flow, component hierarchy, and data flow.

## Overview

```mermaid
flowchart TB
    subgraph "User Entry"
        USER[👤 User]
    end

    subgraph "SvelteKit App"
        subgraph "Layout Layer"
            LAYOUT["+layout.svelte<br/>(Root Layout)"]
            LAYOUT_TS["+layout.ts<br/>prerender: true"]
        end

        subgraph "Routes"
            HOME["/+page.svelte<br/>(Home Page)"]
            HCI["/HCI/+page.svelte<br/>(HCI Projects Page)"]
        end

        subgraph "Shared Components"
            NAVBAR["Navbar.svelte"]
            CARD["Card.svelte"]
            IMAGES["Images.svelte"]
            FOOTER["Footer.svelte (empty)"]
        end

        subgraph "Assets"
            STATIC_IMAGES["Static Images<br/>(PNG, SVG)"]
            VIDEO_FILES["Video Files<br/>(MOV)"]
        end
    end

    USER --> LAYOUT
    LAYOUT_TS -.->|config| LAYOUT
    LAYOUT --> NAVBAR
    LAYOUT -->|slot| HOME
    LAYOUT -->|slot| HCI
    
    HCI --> CARD
    HCI --> IMAGES
    CARD -.->|slot content| HCI
    IMAGES --> STATIC_IMAGES
    HCI --> VIDEO_FILES
```

## User Navigation Flow

```mermaid
flowchart LR
    subgraph "Navigation"
        HOME_PAGE["🏠 Home Page<br/>(/)"]
        HCI_PAGE["📚 HCI Projects<br/>(/HCI)"]
    end

    subgraph "Navbar Actions"
        APK_LINK["APK Logo<br/>(→ Home)"]
        HCI_LINK["HCI Link<br/>(→ HCI)"]
        THEME_TOGGLE["🌓 Theme Toggle<br/>(dim ↔ retro)"]
    end

    HOME_PAGE <-->|"APK button"| APK_LINK
    HOME_PAGE <-->|"HCI button"| HCI_LINK
    HCI_PAGE <-->|"APK button"| APK_LINK
    HCI_PAGE <-->|"HCI button"| HCI_LINK
    
    THEME_TOGGLE -.->|"affects"| HOME_PAGE
    THEME_TOGGLE -.->|"affects"| HCI_PAGE
```

## Component Hierarchy

```mermaid
graph TD
    subgraph "Root"
        APP["app.html"]
    end

    subgraph "Layout"
        LAYOUT["+layout.svelte"]
    end

    subgraph "Pages"
        HOME["+page.svelte (/)"]
        HCI["+page.svelte (/HCI)"]
    end

    subgraph "Components ($lib/components)"
        NAVBAR["Navbar.svelte"]
        CARD["Card.svelte"]
        FOOTER["Footer.svelte"]
    end

    subgraph "Images ($lib/images)"
        IMAGES_COMP["images.svelte"]
    end

    APP --> LAYOUT
    LAYOUT --> NAVBAR
    LAYOUT -->|"<slot>"| HOME
    LAYOUT -->|"<slot>"| HCI
    
    HCI --> CARD
    HCI --> IMAGES_COMP
    CARD -->|"<slot>"| CARD_CONTENT["Card Modal Content"]
```

## Data Flow

```mermaid
flowchart TD
    subgraph "State Management"
        DARK_MODE["isDarkMode: boolean"]
        THEME["theme: ['dim', 'retro']"]
        EXPANDED["expanded: boolean<br/>(HCI page local)"]
        MODAL_OPEN["isModalOpen: boolean<br/>(per Card)"]
    end

    subgraph "Layout (+layout.svelte)"
        L_DARK[isDarkMode]
        L_THEME[theme array]
        BODY_THEME["data-theme binding"]
    end

    subgraph "Navbar"
        N_DARK["isDarkMode (bound)"]
        TOGGLE["Theme Toggle Checkbox"]
    end

    subgraph "Card Component"
        C_TITLE["title: string"]
        C_DESC["description: string"]
        C_MODAL["isModalOpen: boolean"]
        MODAL_DIALOG["Modal Dialog"]
    end

    subgraph "Images Component"
        IM_INDEX["im_index: number"]
        IMG_ARRAY["mp2_images array"]
    end

    %% Data flow connections
    L_DARK <-->|"bind:isDarkMode"| N_DARK
    N_DARK <-->|"bind:checked"| TOGGLE
    L_DARK --> L_THEME
    L_THEME --> BODY_THEME

    C_TITLE --> MODAL_DIALOG
    C_DESC --> MODAL_DIALOG
    C_MODAL -->|"controls visibility"| MODAL_DIALOG

    IM_INDEX --> IMG_ARRAY
    IMG_ARRAY -->|"renders"| IMG_OUTPUT["<img> element"]
```

## Component Props & Exports

```mermaid
classDiagram
    class Navbar {
        +isDarkMode: boolean
        --
        Exports isDarkMode for binding
        Links: Home(/), HCI(/HCI)
    }

    class Card {
        +isModalOpen: boolean
        +title: string
        +description: string
        +slot: content
        --
        Button triggers modal
        Modal displays slot content
    }

    class Images {
        +im_index: number
        --
        Renders image from array
        15 images indexed 0-14
    }

    class LayoutSvelte {
        -isDarkMode: boolean
        -theme: string[]
        --
        Binds theme to body
        Contains Navbar + slot
    }

    class HCIPage {
        -expanded: boolean
        --
        toggleExpand() method
        Contains 4 Card components
    }

    LayoutSvelte --> Navbar : contains
    HCIPage --> Card : uses multiple
    HCIPage --> Images : uses multiple
```

## HCI Page - Card Structure

```mermaid
flowchart TB
    subgraph "HCI Page Grid (2 columns on md+)"
        subgraph "Card 1"
            MGP1["MGP1: LED Game"]
            MGP1_CONTENT["- Capacitive touch sensors<br/>- 8x8 LED matrix<br/>- YouTube embed"]
        end
        
        subgraph "Card 2"
            MGP2["MGP2: Plant Tamagotchi"]
            MGP2_CONTENT["- Photoresistor + Moisture sensor<br/>- LCD Display<br/>- Images component<br/>- YouTube embed"]
        end
        
        subgraph "Card 3"
            MGP3_PROTO["MGP3: Intermediate Prototype"]
            MGP3_PROTO_CONTENT["- Brainstorming documentation<br/>- Images component<br/>- Video files (MOV)<br/>- Expandable code blocks"]
        end
        
        subgraph "Card 4"
            MGP3["MGP3: IMU Glove Controller"]
            MGP3_CONTENT["- Final project documentation<br/>- Images + Videos<br/>- YouTube embeds<br/>- Expandable code blocks"]
        end
    end

    MGP1 --> MGP1_CONTENT
    MGP2 --> MGP2_CONTENT
    MGP3_PROTO --> MGP3_PROTO_CONTENT
    MGP3 --> MGP3_CONTENT
```

## Theme System Flow

```mermaid
sequenceDiagram
    participant User
    participant Navbar
    participant Layout
    participant Body
    participant DaisyUI

    User->>Navbar: Click theme toggle
    Navbar->>Navbar: Update isDarkMode (checkbox binding)
    Navbar->>Layout: Two-way binding updates isDarkMode
    Layout->>Layout: Calculate theme[Number(isDarkMode)]
    Layout->>Body: Set data-theme attribute
    Body->>DaisyUI: Apply theme ("dim" or "retro")
    DaisyUI->>User: Visual theme change
```

## File Structure

```
src/
├── app.d.ts              # TypeScript declarations
├── app.html              # HTML template
├── lib/
│   ├── index.ts          # Barrel exports (Navbar, Card, Images)
│   ├── components/
│   │   ├── Navbar.svelte # Navigation + theme toggle
│   │   ├── Card.svelte   # Modal card component
│   │   └── Footer.svelte # Empty (unused)
│   └── images/
│       ├── images.svelte # Image array component
│       └── *.png/svg/MOV # Static assets
└── routes/
    ├── +layout.svelte    # Root layout (theme + navbar)
    ├── +layout.ts        # Prerender config
    ├── +page.svelte      # Home page (intro)
    └── HCI/
        └── +page.svelte  # HCI projects page
```

## Technology Stack

| Layer | Technology |
|-------|------------|
| Framework | SvelteKit |
| Styling | TailwindCSS + DaisyUI |
| Build | Vite |
| Language | TypeScript |
| Themes | dim (dark), retro (light) |
