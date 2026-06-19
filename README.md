# Component Agent

A zero-dependency, fully local React component generator. Describe what you want in plain English (or upload a screenshot), and get back production-ready **JSX + PropTypes** code — no API keys, no external LLM, no internet required.

## How It Works

```
You type:      "dark landing page with navbar, features, stats, testimonials"
                   │
                   ▼
┌─────────────────────────────────────────────────────┐
│              Natural Language Parser                │
│  Tokenizes prompt → detects type, color, size,      │
│  variant, fields, links, columns, layout...          │
└─────────────────────┬───────────────────────────────┘
                      │
        ┌─────────────┴─────────────┐
        │                           │
        ▼                           ▼
┌─────────────────┐     ┌─────────────────────────┐
│  Image Analyzer │     │    Component Registry    │
│  (Jimp-based)   │────▶│  button  card   navbar   │
│                  │     │  form    modal  table    │
│  Pixel sampling  │     │  input   badge  avatar   │
│  Color clustering│     │  layout dropdown  tabs   │
│  Layout detection│     │  page   —  13 generators │
│  Type suggestion │     └──────────┬──────────────┘
└─────────────────┘                 │
          │                         ▼
          └─────────┬───────────────┘
                    ▼
┌─────────────────────────────────────────────────────┐
│               Composition Engine                     │
│  Picks blueprint → generates React code →           │
│  strips TypeScript → injects PropTypes               │
└─────────────────────┬───────────────────────────────┘
                      │
                      ▼
      ┌──────────────────────────────┐
      │  Clean JSX + PropTypes out  │
      │  Ready to copy & paste      │
      └──────────────────────────────┘
```

## Quick Start

```bash
# Install
npm install

# Copy environment config
cp .env.example .env

# Start development server
npm run dev
```

Open **http://localhost:4001** in your browser — you'll see a dual-panel web UI. Type a prompt on the left, get code on the right.

## Examples

| Prompt | Output |
|--------|--------|
| `"primary button with loading spinner"` | Button with ripple effect, loading state, PropTypes |
| `"navbar with logo, home, about, contact, and dark mode toggle"` | Responsive navbar with scroll effects, mobile menu, theme persistence |
| `"form with name, email, password, and country select"` | Form with validation, password show/hide, touched tracking |
| `"dark landing page with features, stats, testimonials, and CTA"` | 900+ line full page with animations, sections, dark mode |
| Upload a screenshot of any UI | Pixel-level analysis detects colors, layout, component type → matching component |

## API

### POST `/api/generate`

Generate a component from a text prompt and optional image.

**Request body:**
```json
{
  "prompt": "dark landing page with features and testimonials",
  "image": "data:image/png;base64,..."  // optional
}
```

**Success response:**
```json
{
  "success": true,
  "data": {
    "componentName": "LandingPage",
    "code": "import React...",
    "props": "export interface LandingPageProps { ... }",
    "dependencies": []
  },
  "analysis": {
    "type": "page",
    "colors": ["#1a1a2e", "#16213e", "#e94560"],
    "palette": { "bg": "#1a1a2e", "text": "#e0e0e0", "accent": "#e94560", "border": "#2a2a4e" },
    "layout": "container",
    "dimensions": "1920x1080",
    "darkMode": true,
    "regions": 7
  }
}
```

### GET `/api/types`

Returns the list of supported component types.

```json
{ "types": ["button", "input", "card", "navbar", "form", "modal", "table", "badge", "avatar", "layout", "dropdown", "tabs", "page"] }
```

### GET `/health`

Server health check. Returns `{ "status": "ok" }`.

## Supported Component Types

| Type | Description | Key Features |
|------|-------------|--------------|
| `page` | Full landing page with 6+ sections | Animated navbar, hero, features grid, stats, testimonials carousel, CTA, footer, dark mode |
| `navbar` | Responsive navigation bar | Scroll-aware, mobile hamburger, dark/light toggle, CTA button |
| `button` | Interactive buttons | Ripple effect, loading spinner, icon support, tooltip |
| `card` | Content cards | Image with hover zoom, badges, action buttons, onClick mode |
| `form` | Data entry forms | Field validation, password show/hide, touched tracking, loading state |
| `modal` | Dialog overlays | Focus trap, escape/click-outside close, scale+fade animation, body scroll lock |
| `table` | Data tables | Sortable columns, row selection, loading skeleton, empty state |
| `input` | Form input fields | Text, email, password, select, textarea, checkbox with validation |
| `badge` | Status badges | Color variants, dot indicator, pill shape |
| `avatar` | User avatars | Image fallback, status dot, size variants |
| `layout` | Page layout containers | Container, stack, grid, sidebar with responsive breakpoints |
| `dropdown` | Menu dropdowns | Click toggle, divider, disabled items |
| `tabs` | Tabbed interfaces | Active tab, click handler, content panel |

## Image Analysis

When you upload a screenshot, the image analyzer performs pixel-level detection:

1. **Pixel sampling** — samples every Nth pixel across the full image
2. **Color quantization** — clusters similar colors, identifies background, accent, text
3. **Layout detection** — scans row-by-row for color bands → identifies regions (header, content blocks)
4. **Structural analysis** — detects sidebars, grids, forms, navbars based on region patterns
5. **Type suggestion** — determines the most likely component type and color scheme

The analysis results are displayed in the web UI panel (color swatches, detected type, dark mode, region count) and override the text prompt's type selection when confident.

## Configuration

| Env Var | Default | Description |
|---------|---------|-------------|
| `PORT` | `4001` | HTTP server port |
| `MAX_IMAGE_SIZE_MB` | `5` | Max upload size for screenshots |

## Project Structure

```
src/
├── blueprints/        # Component generators (13 types)
│   ├── registry.ts    # Type → generator mapping
│   ├── page.ts        # Full landing page generator
│   ├── navbar.ts      # Navigation bar
│   ├── button.ts      # Interactive buttons
│   ├── form.ts        # Form with validation
│   ├── modal.ts       # Dialog overlays
│   ├── table.ts       # Data tables
│   ├── card.ts        # Content cards
│   ├── input.ts       # Form inputs
│   ├── badge.ts       # Status badges
│   ├── avatar.ts      # User avatars
│   ├── layout.ts      # Layout containers
│   ├── dropdown.ts    # Menu dropdowns
│   └── tabs.ts        # Tabbed interfaces
├── core/
│   ├── parser.ts      # Natural language prompt parser
│   ├── composer.ts    # Assembly pipeline
│   └── compile.ts     # TS→JSX transpiler + PropTypes
├── image/
│   └── analyzer.ts    # Jimp-based pixel analysis
├── routes/
│   └── generate.ts    # Express API routes
├── templates/
│   └── tailwind.ts    # Tailwind class utilities
├── types/
│   └── index.ts       # TypeScript type definitions
├── validators/
│   └── input.ts       # Zod request validation
├── config.ts          # Environment config
└── index.ts           # Express server entry
public/
└── index.html         # Web UI (Tailwind CDN, Highlight.js)
```

## Development

```bash
npm run dev     # Watch mode with auto-reload
npm run start   # Production start
npm run build   # TypeScript compilation
npm run lint    # Type-check only
```

## Architecture Decisions

- **JSX over TSX**: Generated code outputs plain JavaScript + PropTypes (no TypeScript). This avoids build issues in non-TypeScript projects. The compile pipeline strips all TS syntax post-generation.
- **No external dependencies for the web UI**: Uses Tailwind CDN and Highlight.js CDN for zero-build frontend. No React in the frontend — it's vanilla HTML/JS.
- **Image analysis uses Jimp**: Already in the dependency tree. Performs actual pixel sampling, color clustering, layout detection — no API calls.
- **PropTypes via compile pipeline**: A post-generation step parses the interface string and generates PropTypes declarations, avoiding duplication across 13 blueprints.

## License

MIT — built for [opencode](https://opencode.ai)
