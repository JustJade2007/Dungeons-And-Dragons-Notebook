# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

> **Version Policy**: Project versioning remains strictly in the pre-1.0 series (`0.x.y`) until explicitly instructed to graduate to 1.0+.

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
