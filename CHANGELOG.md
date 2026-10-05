# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

> **Version Policy**: Project versioning remains strictly in the pre-1.0 series (`0.x.y`) until explicitly instructed to graduate to 1.0+.

## [0.2.6] - 2026-10-05

### Added
- **Session Notes & Journaling Tab**: Added a dedicated "Session Notes" workspace view (`#viewSessions`) accessible via the main navigation bar, complete with session count badges and multi-column ledger view.
- **Session Chapters Support**:
  - **"General" Default Chapter**: Includes everything across all chapters and sessions by default.
  - **Dynamic Chapter Selection & Creation**: Users can select an existing chapter from the campaign or name a new chapter directly inline during session creation or via the standalone chapter creator (`#chapterModal`).
  - **Chapter Filter Pills & Dropdown**: Interactive filter pills display session counts per chapter and let the user switch between "General (All)" and individual chapter views instantly.
- **Auto-Saved Session Date**: Automatically populates and saves the date each session happened (defaulting to the current date `YYYY-MM-DD`), with full editing support via native date picker.
- **Session Attendance Tracking**: Interactive hero picker chips allowing DMs and players to select which party members were present at the table for each session.
- **DM Secret Session Notes**: Hidden DM-only session prep and whisper notes isolated from player view, honoring campaign DM mode privileges.
- **Bidirectional Session Cross-Referencing**:
  - Auto-complete `@` mentions now search and link both notebook entries and session notes (`@[Session Title](session:id)`).
  - Entry detail pane now computes and displays backlinks from session notes that referenced the entry.
  - Clicking session links navigates directly to the referenced session note in the ledger.
- **Session REST API Endpoints**:
  - `GET /api/sessions`: Returns campaign sessions, with chapter filtering ("General" returns all sessions).
  - `POST /api/sessions`: Logs a session with auto-saved date, auto-incrementing session numbers, and chapter assignment.
  - `PUT /api/sessions/:id`: Modifies session details.
  - `DELETE /api/sessions/:id`: Deletes session logs.
  - `GET /api/chapters`: Lists chapters for the campaign.
  - `POST /api/chapters`: Creates a new chapter for the campaign.
- **Updated Verification Test Suite & Standalone Executable**:
  - Expanded test suites in `tests/verify-app.js` and `tests/verify-exe.js` with comprehensive chapter filtering, auto-saved date, and session CRUD tests (16/16 tests passing).
  - Rebuilt and certified standalone binary `dist/dnd-notebook.exe`.

### Added
- **Dedicated Full-Page Startup Home**: Replaced the dismissible startup modal with a dedicated, top-level Home Page (`#homePage`) displayed by default upon launching the app or website.
- **Mandatory Notebook Selection Gateway**: Prevents unselected/empty notebook states by requiring the user to choose one of three explicit paths before entering the workspace:
  1. Forge a new notebook with brief settings.
  2. Open an existing saved notebook from the campaign list.
  3. Launch a quick temporary notepad scratchpad session.
- **Brief Campaign Settings upon Creation**:
  - **Role & Mode Selector**: Direct radio selection cards for Dungeon Master (DM) Mode vs Player Character Mode.
  - **Tabletop Rule System**: Configurable system selection (D&D 5th Edition, Pathfinder 2e, Daggerheart, OSR / Retro, Call of Cthulhu, Custom System).
  - **Feature Toggles**: Quick checkboxes for enabling DM secret notes/whispers and auto-linking discoveries to the active hero journal.
- **Home Navigation & Switcher**: Added prominent "🏠 Notebooks / Home" button in the main application header alongside the campaign selector pill, allowing effortless switching back to the Home Page at any time.
- **Executable Finalization Feature Test Suite (`tests/verify-exe.js`)**: Built an automated 15-point end-to-end verification suite that runs directly against the packaged standalone executable (`dist/dnd-notebook.exe`):
  - Process launch and `/api/health` polling on an isolated test port.
  - Static asset serving (HTML, CSS, JS) and Home Page gateway structure.
  - Database zero-entry clean state verification.
  - DM & Player notebook creation with brief settings (rule system, feature toggles).
  - Campaign switching and listings.
  - Entry CRUD across categories with friendliness, status, and parent-child hierarchy.
  - DM secret notes storage and retrieval.
  - Cross-referencing `@` mentions, bidirectional connections, and backlink computation.
  - Adventuring party, player character dossier linking, and family tree lineage modeling.
  - Temporary scratchpad sessions and notebook conversion migration.
  - Custom category persistence.
  - Backup export, database reset, and full restoration import.
  - Clean teardown to ensure zero test artifacts remain in the user database.
- **Automated Finalization in `scripts/build-exe.js`**: Step 6/6 now runs `tests/verify-exe.js` to ensure the executable is tested and certified before completing the build.
- **Enhanced `test-exe.bat`**: Upgraded test runner batch script to execute the comprehensive feature test suite directly against `dist/dnd-notebook.exe`.

### Fixed
- Fixed issue where clicking outside the startup modal closed it into an empty campaign state (`activeCampaignId: null`), which caused workspace controls and note creation to become unresponsive.

---

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
