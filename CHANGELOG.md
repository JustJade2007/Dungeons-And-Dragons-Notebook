# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

> **Version Policy**: Project versioning remains strictly in the pre-1.0 series (`0.x.y`) until explicitly instructed to graduate to 1.0+.

## [0.2.4] - 2026-10-05

### Added
- **Standalone Desktop Application Window**: Updated the executable launcher to start directly in a dedicated, frameless desktop application window (`--app` mode) rather than opening a tab in the system browser.
  - Isolated application profile directory (`data/.app-profile`) preserving window state, dimensions, and local session memory.
  - No browser address bar, navigation buttons, or tabs — operates as a clean, native desktop application.
  - Automatic graceful server shutdown when the application window is closed by the user.
  - Added support for `--web` flag to explicitly force launching in standard browser tab if desired.

---

## [0.2.3] - 2026-10-05

### Added
- **Adventuring Party Tab**: Added a dedicated "Party" tab displaying all player characters in the campaign roster, with hero avatar initials, levels, class, alignment, active player character indicators, background chronicle, journal discovery count, and quick management actions.
- **Embedded Per-Character Family Tree**: Shifted family tree generation from a standalone top-level tab to be embedded directly under each character:
  - Displayed under each hero card in the Adventuring Party roster view.
  - Displayed in the Character Dossier view under character notes & background.
  - Displayed in the Entry Detail pane for NPC and character notebook entries.
  - Visualizes Parents & Lineage, Current Generation (Subject, Spouses/Partners, Siblings), and Children & Descendants with clickable navigational chips.

---

## [0.2.2] - 2026-10-05

### Added
- **Whimsical Fantasy & Fey Aesthetic**: Styled the notebook with an organic tabletop fantasy flavor inspired by Goblin's Notebook, featuring deep enchanted moss tones, bioluminescent accents, warm mushroom amber glows, rounded organic cards, and playful typography (`MedievalSharp`).
- **Multi-Theme System & Style Settings**: Added visual style switcher and theme settings modal supporting 4 distinct tabletop aesthetics:
  - **Whimsical Fey & Goblin (Default)**: Deep mossy green, enchanted forest glow, warm mushroom gold, fairytale headings (`MedievalSharp`).
  - **Inked Parchment & Tavern Scroll**: Sepia & tea-stained parchment, candlelight amber accents, inked borders, antique serif typography (`Almendra`).
  - **Classic Obsidian & Dungeon**: Dark stone palette, gothic amber & crimson ruby highlights, authoritative headings (`Cinzel`).
  - **Astral Sea & Spellbook**: Midnight celestial indigo, arcane violet nebulae, glowing starlight cyan runes.
- **Theme Switcher Pill**: Quick theme switcher badge in the top navigation header displaying the active style icon and name, with one-click access to the style picker dialog.
- **Appearance & Styles Menu Option**: Added direct entry point in the More Options dropdown to open the visual style settings modal.
- **Theme Persistence**: Theme preferences are automatically preserved across sessions via local storage.

---

## [0.2.1] - 2026-10-05

### Added
- **Notebook Creation Mode Selection**: Player Mode or Dungeon Master (DM) Mode is now configured upon creating a notebook rather than via an ad-hoc quick toggle.
- **Notebook Hub & Startup Prompt**: When launching the application or opening the website without an active notebook, users are presented with a welcome hub modal to:
  - Create a new notebook with title, description, and selected role (DM Mode vs Player Mode).
  - Open an existing notebook from a list showing role badges, entry counts, and modification dates.
  - Launch an instant temporary scratchpad.
- **Temporary Scratchpad Mode**: Enables immediate session note-taking without setting up a permanent notebook, with an alert banner and one-click "Save as Permanent Notebook" dialog to convert temporary notes at any time.
- **Notebook Mode Indicators**: Header now displays an active status badge indicating the notebook's mode (`👑 DM Notebook`, `🛡️ Player Notebook`, or `⚡ Temporary Scratchpad`).

### Changed
- Replaced header quick toggle with dedicated notebook mode badge and Notebook Hub switcher.
- Updated automated verification suite (`tests/verify-app.js`) to test DM/Player mode selection, scratchpad session creation, and permanent conversion.

---

## [0.2.0] - 2026-10-05

### Added
- **Note-Taking & Organization**: Complete CRUD support for notebook entries including titles, descriptions, categories (NPCs, Locations, Quests, Factions, Items, Lore, Custom), life status (Alive, Dead, Missing, Unknown, Resurrected), friendliness (Friendly, Neutral, Hostile), and dynamic key-value attributes.
- **Cross-Referencing & Mentions**: Interactive `@` mention autocomplete popup when typing notes, interactive clickable links that navigate directly to referenced entries, and bidirectional backlink index tracking to display all incoming references per entry.
- **User Modes**:
  - **DM Mode**: Full administrative access with support for hidden/secret DM notes.
  - **Player Mode**: Active hero selection, character profile switcher, automatic linking of viewed and created entries into the active character's journal dossier, and automatic redaction of DM secret notes.
- **Visualization & Hierarchy**:
  - Global association network and focused sub-graph visualization via interactive HTML5 Canvas with zoom/pan controls.
  - Parent-child tree hierarchy for organizing nested locations, sub-quests, and faction branches.
  - Genealogical family tree generator for tracking character lineages and dynasties.
- **Deployment & Packaging**:
  - Deployable Node.js website with Express REST API and automatic browser launching.
  - Standalone Windows executable (`dist/dnd-notebook.exe`) bundled using Node Single Executable Application (SEA) and esbuild.
  - Windows launcher scripts (`launch.bat` and `build-exe.bat`).
  - Automated test runner files (`test-website.bat` and `test-exe.bat`) added and ignored in `.gitignore`.
  - Automated verification test suite (`tests/verify-app.js`).

### Changed
- Updated `.gitignore` to ignore local runtime databases (`data/`), build outputs (`dist/`), and test launcher batch scripts (`test-*.bat`).
- Updated `README.md` and `TODO.md` roadmap items.

---

## [0.1.1] - 2026-10-05

### Changed
- Added `TODO.md` to `.gitignore` and untracked it from git index to keep local task tracking decoupled from git history.
- Explicitly documented pre-1.0 version policy in `CHANGELOG.md` and `README.md`.

---

## [0.1.0] - 2026-10-05

### Added
- Initial project documentation, architecture specifications, and roadmap.
- Comprehensive `README.md` defining project vision, core features, modes, and deployment targets.
- Structured `TODO.md` breaking down all planned roadmap items into actionable implementation tasks.
- Project `.gitignore` covering build artifacts, credentials, dependencies, and local environment configs.
- `SECURITY.md` establishing vulnerability disclosure and API key management guidelines.
