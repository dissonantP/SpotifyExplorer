# SpotifyExplorer Migration: Sinatra to Static Vite Site

Rewrote the Ruby/Sinatra app (in `old/`) as a fully static Vite site (in `new/`), deployed to GitHub Pages at `dissonantP.github.io/SpotifyExplorer`.

## Directory Structure

```
new/
├── .github/workflows/deploy.yml
├── .gitignore
├── index.html
├── package.json
├── vite.config.js
├── MIGRATION_PLAN.md
├── src/
│   ├── main.js
│   └── style.scss
├── public/
│   ├── data/combined.json
│   ├── logo.png
│   └── music_icon.png
└── scraper/
    ├── scraper.rb
    ├── Gemfile
    └── .env.example
```

## What Changed

**Slim to HTML** (`index.html`): Direct translation of `old/views/root.slim`. jQuery CDN removed. Vite module entry point used instead. Relative asset paths for base-path compatibility.

**Indented Sass to SCSS** (`src/style.scss`): Added braces and semicolons to the inline Sass from the Slim template.

**CoffeeScript to vanilla JS** (`src/main.js`): Rewrote all CoffeeScript from the Slim template as a single ES module. jQuery replaced with vanilla DOM APIs. Data fetched via XMLHttpRequest (for progress tracking) using `import.meta.env.BASE_URL` so the path works under any base path.

**Scraper** (`scraper/`): Copied from `old/scraper.rb` with `byebug` removed, gzip removed, USERS array uncommented, and output path updated to write to `../public/data/combined.json`. Gemfile trimmed to `dotenv` and `json` only.

**GitHub Actions** (`.github/workflows/deploy.yml`): Builds with `BASE_PATH=/SpotifyExplorer/` and deploys to GitHub Pages. Requires repo Settings > Pages > Source set to "GitHub Actions".

**Vite config** (`vite.config.js`): `base` is set from the `BASE_PATH` env var, defaulting to `/`.

## File Mapping

| Old | New | Action |
|-----|-----|--------|
| `old/views/root.slim` (HTML) | `index.html` | Convert Slim to HTML |
| `old/views/root.slim` (Sass) | `src/style.scss` | Convert indented Sass to SCSS |
| `old/views/root.slim` (CoffeeScript) | `src/main.js` | Convert to vanilla ES module JS |
| `old/data/combined.json` | `public/data/combined.json` | Copy |
| `old/public/logo.png` | `public/logo.png` | Copy |
| `old/public/music_icon.png` | `public/music_icon.png` | Copy |
| `old/scraper.rb` | `scraper/scraper.rb` | Copy + update paths |
| `old/.env.example` | `scraper/.env.example` | Copy |
| `old/server.rb`, `config.ru`, `run.sh`, `cron_start` | -- | Not needed |
| `old/Gemfile` | `scraper/Gemfile` | Scraper deps only |

## Local Development

```sh
npm install
npm run dev
```

## Production Build

```sh
npm run build                    # default base path
BASE_PATH=/SpotifyExplorer/ npm run build  # GitHub Pages subpath
```
