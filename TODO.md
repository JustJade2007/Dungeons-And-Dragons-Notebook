# Project Roadmap & TODO List

Based on the core features and functional requirements outlined in the project specification.

---

## 1. Documentation & Initialization
- [x] Create project `.gitignore` (dependencies, secrets, builds, IDE, agent configs)
- [x] Create `README.md` with project specifications and overview
- [x] Create `TODO.md` roadmap tracking document
- [x] Create `CHANGELOG.md` starting at version `0.1.0`
- [x] Create `SECURITY.md` for secret management and security reporting

---

## 2. Note-Taking & Organization
- [ ] Implement entry creation, editing, and deletion (notes, descriptions, attributes)
- [ ] Implement connection and relationship modeling between entries
- [ ] Implement custom categorization for entries (NPCs, Locations, Quests, Factions, Items, Lore)
- [ ] Implement auto-sorting options (alphabetical, recently edited, category, status)

---

## 3. Cross-Referencing
- [ ] Implement `@` mention autocomplete picker when typing notes
- [ ] Implement interactive links for `@` referenced entries
- [ ] Implement backlink index tracking to display incoming references for each entry

---

## 4. User Modes (DM & Player)
- [ ] Implement mode switcher between DM Mode and Player Mode
- [ ] **DM Mode**:
  - [ ] Full campaign oversight and hidden/secret notes support
- [ ] **Player Mode**:
  - [ ] Active character display and character switching
  - [ ] Automatic linking of created/viewed entries to the active character profile

---

## 5. Visualization & Hierarchy
- [ ] Implement parent-child relationship management between entries
- [ ] Implement association tree visualization for selected entries
- [ ] Implement global association graph/tree view for the entire project
- [ ] Implement family tree generator for characters, dynasties, and lineages

---

## 6. Entry Metadata & Status Tracking
- [ ] Implement friendliness status tracking (e.g., Friendly, Neutral, Hostile)
- [ ] Implement life status tracking (e.g., Alive, Dead, Missing, Unknown)
- [ ] Implement custom metadata tags and attributes per entry type

---

## 7. Media Support
- [ ] Implement image file upload, storage, and inline rendering
- [ ] Implement video file upload/embed and playback support within entries

---

## 8. Formatting & AI Integration
- [ ] Implement auto-formatting features for text and notes
- [ ] **Optional AI-Assisted Formatting**:
  - [ ] Configure user-provided API key settings (Gemini Flash-Lite)
  - [ ] Implement AI formatting to generate GitHub-style tables and stat blocks
- [ ] **Speech-to-Text & Summarization**:
  - [ ] Implement speech-to-text audio recording/input
  - [ ] Implement Gemini AI processing to summarize and categorize transcriptions into notes
  - [ ] Implement mandatory user confirmation dialog before any data overwrites

---

## 9. Data Management
- [ ] Implement support for multiple campaigns and notebooks
- [ ] Implement local backup export and import functionality (JSON/archive)
- [ ] Implement cloud save integration (e.g., Google Drive)
- [ ] Implement campaign sharing via cloud save

---

## 10. Deployment
- [ ] Configure web application build and deployment pipeline
- [ ] Configure standalone desktop executable (`.exe`) packaging pipeline
- [ ] Create and maintain launch script(s) / batch file(s) for the application
