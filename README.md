# Dungeons & Dragons Notebook

A comprehensive note-taking and organization tool tailored for tabletop role-playing games and narrative-heavy campaigns, inspired by tools like Goblin's Notebook.---

## Overview

Dungeons & Dragons Notebook helps you organize your games. It keeps track of campaigns, world lore, characters, and storylines for both Dungeon Masters and players. The platform features linked notes, clear outlines, media attachments, and optional AI formatting and speech-to-text tools.---

## Core Features

### 1. Note-Taking & Organization
- Add notes, descriptions, attributes, and relationships between entries.
- Build parent-child hierarchies and connect different parts of your world, including NPCs, locations, quests, factions, items, and lore.
- Sort everything automatically or group items with custom categories.

### 2. Cross-Referencing & Mentions
- Use `@` to drop in-text mentions that automatically ping and hyperlink other notebook entries.
- Track bidirectional backlinks to see everywhere an entry gets referenced across the entire campaign.

### 3. User Modes & Notebook Roles
- **Mode Selected Upon Creation**: Rather than a temporary quick toggle, each campaign notebook is configured upon creation as either a **Dungeon Master (DM) Notebook** or a **Player Notebook**.
- **DM Mode**: Unlock full access to every campaign entry, hidden DM secret notes, world hierarchy, encounter prep, and the main story arcs.
- **Player Mode**: Keep things focused on character journals. Check active hero stats and notes, let the system automatically link viewed entries to the active character dossier, and switch between characters in seconds.
- **Temporary Scratchpad**: Launch an instant, unsaved session notepad on startup or at any time, with the ability to convert and save it into a permanent DM or Player notebook.
- **Adventuring Party Tab**: Dedicated view showcasing all player characters in your campaign with stats, active hero badges, and integrated family trees.
- **Per-Character Family Trees**: Genealogical lineage trees are embedded directly under each character profile (in the Party roster and Character Dossier) as well as under NPC entries, tracking parents, spouses/partners, siblings, and children with clickable navigational links.
- **Association Trees**: Visual relationship graphs for selected entries or the entire campaign.
- **Parent-Child Hierarchy**: Organize regions into settlements, settlements into buildings, factions into branches, etc.

### 4. Visual Styles & Multi-Theme Settings
- **Whimsical Fey & Goblin (Default)**: Organic tabletop fantasy theme inspired by Goblin's Notebook, with moss greens, bioluminescent teal glow, warm mushroom amber, and fairytale typography (`MedievalSharp`).
- **Inked Parchment & Tavern Scroll**: Warm sepia and tea-stained antique scroll aesthetic with candlelit accents and medieval typography (`Almendra`).
- **Classic Obsidian & Dungeon**: Dark stone slate with gothic amber and crimson highlights (`Cinzel`).
- **Astral Sea & Spellbook**: Deep midnight celestial indigo with starlight cyan and arcane violet runes.
- **Theme Switcher**: Quick toggle badge in the header and Appearance & Styles settings dialog accessible from the options menu, with persistent local storage.

### 5. Entry Metadata & Status Tracking
- Structured metadata fields for quick identification.
- Friendly/Hostile/Neutral alignment tracking.
- Vital status tracking: Alive, Dead, Missing, Unknown, Resurrected.

### 6. Media Support
- Upload and embed images and videos directly within notes and entry headers.
- Media galleries for maps, character art, handouts, and location vistas.

### 7. Formatting & AI-Assisted Tools
- Built-in rich text and Markdown auto-formatting.
- Optional AI integration using user-provided API keys (e.g., Gemini):
  - Speech-to-text note-taking to record spoken session notes, summarizing and categorizing them directly into entries.
  - User confirmation required before applying any AI-generated data or overwrites.
  - Optional AI-assisted formatting (e.g., Gemini Flash-Lite) to create GitHub-style tables, statistics blocks, and formatted stat sheets.### 8. Data Management & Storage
- Support for multiple campaigns/notebooks.
- Local export and import backup functionality.
- Cloud save integrations (e.g., Google Drive) enabling campaign sync and sharing.

### 9. Deployment Options
- **Desktop Application**: Packaged standalone executable (`.exe`) for Windows located in `dist/dnd-notebook.exe`.
- **Web Application**: Node.js/Express web application running on `http://localhost:3000`.

---

## Running the Application

### Option 1: Standalone Windows Executable
- Build or update the executable by running `build-exe.bat` or `npm run build:exe`.
- Run `dist/dnd-notebook.exe`. It automatically launches in its own dedicated, frameless desktop application window (with no browser address bar or tabs). When you close the window, the app terminates cleanly.

### Option 2: Local Web Server
- Double-click `launch.bat` (or execute `npm install && npm start`).
- The application automatically launches in a dedicated desktop app window (or use `npm start -- --web` to open in a standard browser tab).

### Verification & Testing
- Run `test-website.bat` to test and launch the Node.js website environment.
- Run `test-exe.bat` to test and launch the standalone Windows executable.
- Run `npm test` to execute the automated verification test suite.

---

## Project Structure

```text
Dungeons-And-Dragons-Notebook/
├── .github/              # Issue templates and workflows
├── .gitignore            # Git exclusion rules (ignores build outputs, data, test runners)
├── CHANGELOG.md          # Release history and roadmap progress
├── README.md             # Project overview and specifications
├── SECURITY.md           # Security policies and key management
├── TODO.md               # Feature checklist and development roadmap (local)
├── server.js             # Express backend server and REST API
├── package.json          # Node.js project manifest & scripts
├── launch.bat            # Windows launcher script for web dev mode
├── build-exe.bat         # Standalone Windows executable build script
├── public/               # Frontend user interface assets
│   ├── index.html        # Single-page application structure
│   ├── css/
│   │   └── style.css     # Dark fantasy design system & glassmorphism
│   └── js/
│       └── app.js        # Graph canvas, @ mention picker, and state management
├── scripts/
│   └── build-exe.js      # SEA packaging script
├── tests/
│   └── verify-app.js     # Automated verification suite
└── dist/                 # Compiled Windows executable output
```

---

## Current Version

- **Version**: `0.2.1` (Pre-1.0 Notebook Hub, Mode Creation Binding & Temporary Scratchpad Release)