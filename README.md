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

### 3. User Modes
- **DM Mode**: Unlock full access to every campaign entry, hidden notes, world hierarchy, encounter prep, and the main story arcs.
- **Player Mode**: Keep things focused on the characters. Check active character stats and notes, let the system automatically link viewed entries to the right character, and switch between characters in seconds.### 4. Visualization & Hierarchy
- **Association Trees**: Visual relationship graphs for selected entries or the entire campaign.
- **Parent-Child Hierarchy**: Organize regions into settlements, settlements into buildings, factions into branches, etc.
- **Family Trees**: Dedicated genealogical tree generation for families, dynasties, and lineages.

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
- Run the compiled application from `dist/dnd-notebook.exe`.

### Option 2: Local Web Server
- Double-click `launch.bat` (or execute `npm install && npm start`).
- The application will automatically detect an available port and open in your default browser.

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

- **Version**: `0.2.0` (Pre-1.0 Core Notebook & Cross-Referencing Feature Release)