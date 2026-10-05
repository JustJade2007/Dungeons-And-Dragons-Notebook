/**
 * Dungeons & Dragons Notebook — Front-End Application Logic
 * Comprehensive campaign management, cross-referencing, association graphs,
 * parent hierarchies, family trees, and DM / Player modes.
 */

(function () {
  'use strict';

  // Application State
  const state = {
    campaigns: [],
    activeCampaignId: null,
    entries: [],
    characters: [],
    activeCharacterId: null,
    customCategories: [],
    sessions: [],
    chapters: ['General'],
    selectedSessionId: null,
    selectedChapter: 'General', // 'General' by default, which includes everything
    sessionSortOption: 'num-desc',
    selectedEntryId: null,
    selectedCharacterId: null,
    currentMode: 'dm', // 'dm' or 'player'
    activeTab: 'entries', // 'entries', 'sessions', 'graph', 'hierarchy', 'family', 'dossier'
    searchQuery: '',
    selectedCategory: 'all',
    selectedStatus: 'all',
    sortOption: 'updated',
    graphFilterMode: 'global', // 'global' or 'selected'
    graphState: {
      panX: 0,
      panY: 0,
      scale: 1,
      isDragging: false,
      dragStartX: 0,
      dragStartY: 0,
      nodes: [],
      links: []
    },
    theme: 'whimsical'
  };

  // Predefined Visual Styles & Themes
  const THEMES = [
    { id: 'whimsical', name: 'Whimsical Fey', icon: '🍄', class: 'theme-whimsical' },
    { id: 'parchment', name: 'Inked Scroll', icon: '📜', class: 'theme-parchment' },
    { id: 'obsidian', name: 'Obsidian Dungeon', icon: '⚔️', class: 'theme-obsidian' },
    { id: 'astral', name: 'Astral Sea', icon: '✨', class: 'theme-astral' }
  ];

  // Predefined Categories
  const DEFAULT_CATEGORIES = [
    { id: 'npc', name: 'NPC', color: '#ef4444', icon: 'user' },
    { id: 'location', name: 'Location', color: '#3b82f6', icon: 'map-pin' },
    { id: 'quest', name: 'Quest', color: '#f59e0b', icon: 'compass' },
    { id: 'faction', name: 'Faction', color: '#8b5cf6', icon: 'shield' },
    { id: 'item', name: 'Item', color: '#10b981', icon: 'package' },
    { id: 'lore', name: 'Lore', color: '#ec4899', icon: 'book-open' }
  ];

  // DOM Elements Cache
  const el = {};

  function initElements() {
    // Top Bar
    el.campaignBtn = document.getElementById('campaignBtn');
    el.activeCampaignName = document.getElementById('activeCampaignName');
    el.globalSearchInput = document.getElementById('globalSearchInput');
    el.notebookModeBadge = document.getElementById('notebookModeBadge');
    el.badgeDmIcon = document.getElementById('badgeDmIcon');
    el.badgePlayerIcon = document.getElementById('badgePlayerIcon');
    el.notebookModeLabel = document.getElementById('notebookModeLabel');
    el.characterPill = document.getElementById('characterPill');
    el.activeCharAvatar = document.getElementById('activeCharAvatar');
    el.activeCharName = document.getElementById('activeCharName');
    el.activeCharMeta = document.getElementById('activeCharMeta');
    el.newEntryBtn = document.getElementById('newEntryBtn');
    el.optionsMenuBtn = document.getElementById('optionsMenuBtn');
    el.optionsDropdown = document.getElementById('optionsDropdown');
    el.exportDataBtn = document.getElementById('exportDataBtn');
    el.importFileInput = document.getElementById('importFileInput');
    el.manageCharactersBtn = document.getElementById('manageCharactersBtn');
    el.addCategoryBtn = document.getElementById('addCategoryBtn');
    el.openThemeSettingsBtn = document.getElementById('openThemeSettingsBtn');
    el.resetDataBtn = document.getElementById('resetDataBtn');

    // Theme Switcher & Modal
    el.themeSwitcherBtn = document.getElementById('themeSwitcherBtn');
    el.themeBtnIcon = document.getElementById('themeBtnIcon');
    el.themeBtnLabel = document.getElementById('themeBtnLabel');
    el.themeSettingsModal = document.getElementById('themeSettingsModal');
    el.themeSelectCards = document.querySelectorAll('.theme-select-card');

    // Temporary Notepad Banner
    el.tempNotepadBanner = document.getElementById('tempNotepadBanner');
    el.saveTempNotepadBtn = document.getElementById('saveTempNotepadBtn');
    el.exitTempNotepadBtn = document.getElementById('exitTempNotepadBtn');

    // Sub Nav
    el.navTabs = document.querySelectorAll('.nav-tab');
    el.entriesCountBadge = document.getElementById('entriesCountBadge');
    el.playerLinkedCountBadge = document.getElementById('playerLinkedCountBadge');
    el.modeStatusBanner = document.getElementById('modeStatusBanner');
    el.modeStatusText = document.getElementById('modeStatusText');

    // Tab Views
    el.tabViews = document.querySelectorAll('.tab-view');
    el.viewEntries = document.getElementById('viewEntries');
    el.viewGraph = document.getElementById('viewGraph');
    el.viewHierarchy = document.getElementById('viewHierarchy');
    el.viewParty = document.getElementById('viewParty');
    el.viewDossier = document.getElementById('viewDossier');

    // Entries Tab
    el.categoryFilterContainer = document.getElementById('categoryFilterContainer');
    el.sortSelect = document.getElementById('sortSelect');
    el.statusFilterSelect = document.getElementById('statusFilterSelect');
    el.entriesList = document.getElementById('entriesList');
    el.entriesEmptyState = document.getElementById('entriesEmptyState');

    // Entry Detail
    el.noEntrySelected = document.getElementById('noEntrySelected');
    el.entryDetailContent = document.getElementById('entryDetailContent');
    el.detailCategoryBadge = document.getElementById('detailCategoryBadge');
    el.detailStatusBadge = document.getElementById('detailStatusBadge');
    el.detailFriendlinessBadge = document.getElementById('detailFriendlinessBadge');
    el.detailParentBadge = document.getElementById('detailParentBadge');
    el.detailTitle = document.getElementById('detailTitle');
    el.detailTagsRow = document.getElementById('detailTagsRow');
    el.playerLinkBtn = document.getElementById('playerLinkBtn');
    el.playerLinkBtnText = document.getElementById('playerLinkBtnText');
    el.editEntryBtn = document.getElementById('editEntryBtn');
    el.deleteEntryBtn = document.getElementById('deleteEntryBtn');
    el.detailAttributesSection = document.getElementById('detailAttributesSection');
    el.detailAttributesGrid = document.getElementById('detailAttributesGrid');
    el.detailConnectionsSection = document.getElementById('detailConnectionsSection');
    el.detailConnectionsList = document.getElementById('detailConnectionsList');
    el.detailChildrenSection = document.getElementById('detailChildrenSection');
    el.detailChildrenList = document.getElementById('detailChildrenList');
    el.detailNotesBody = document.getElementById('detailNotesBody');
    el.detailSecretNotesSection = document.getElementById('detailSecretNotesSection');
    el.detailSecretNotesBody = document.getElementById('detailSecretNotesBody');
    el.detailBacklinksSection = document.getElementById('detailBacklinksSection');
    el.detailBacklinksList = document.getElementById('detailBacklinksList');
    el.backlinksCountBadge = document.getElementById('backlinksCountBadge');
    el.detailTimestamps = document.getElementById('detailTimestamps');

    // Graph Tab
    el.graphCanvas = document.getElementById('graphCanvas');
    el.graphContainer = document.getElementById('graphContainer');
    el.graphGlobalModeBtn = document.getElementById('graphGlobalModeBtn');
    el.graphSelectedModeBtn = document.getElementById('graphSelectedModeBtn');
    el.graphZoomInBtn = document.getElementById('graphZoomInBtn');
    el.graphZoomOutBtn = document.getElementById('graphZoomOutBtn');
    el.graphResetBtn = document.getElementById('graphResetBtn');
    el.graphEmptyNotice = document.getElementById('graphEmptyNotice');

    // Hierarchy Tab
    el.hierarchyTreeContainer = document.getElementById('hierarchyTreeContainer');

    // Adventuring Party Tab
    el.partyTab = document.getElementById('partyTab');
    el.partyCountBadge = document.getElementById('partyCountBadge');
    el.partyEmptyState = document.getElementById('partyEmptyState');
    el.partyGrid = document.getElementById('partyGrid');
    el.partyNewHeroBtn = document.getElementById('partyNewHeroBtn');

    // Family Tree Under Characters & Entries
    el.sheetFamilySection = document.getElementById('sheetFamilySection');
    el.sheetFamilyTreeContainer = document.getElementById('sheetFamilyTreeContainer');
    el.detailFamilySection = document.getElementById('detailFamilySection');
    el.detailFamilyTreeContainer = document.getElementById('detailFamilyTreeContainer');

    // Character Dossier Tab
    el.newCharacterBtn = document.getElementById('newCharacterBtn');
    el.characterList = document.getElementById('characterList');
    el.noCharacterSelected = document.getElementById('noCharacterSelected');
    el.characterSheet = document.getElementById('characterSheet');
    el.sheetCharName = document.getElementById('sheetCharName');
    el.sheetCharMeta = document.getElementById('sheetCharMeta');
    el.sheetCharAlignment = document.getElementById('sheetCharAlignment');
    el.sheetCharNotes = document.getElementById('sheetCharNotes');
    el.sheetLinkedCountBadge = document.getElementById('sheetLinkedCountBadge');
    el.sheetLinkedEntriesList = document.getElementById('sheetLinkedEntriesList');
    el.setActiveCharBtn = document.getElementById('setActiveCharBtn');
    el.editCharBtn = document.getElementById('editCharBtn');
    el.deleteCharBtn = document.getElementById('deleteCharBtn');

    // Modals
    el.entryModal = document.getElementById('entryModal');
    el.entryForm = document.getElementById('entryForm');
    el.entryFormId = document.getElementById('entryFormId');
    el.entryModalTitle = document.getElementById('entryModalTitle');
    el.entryFormTitle = document.getElementById('entryFormTitle');
    el.entryFormCategory = document.getElementById('entryFormCategory');
    el.entryFormStatus = document.getElementById('entryFormStatus');
    el.entryFormFriendliness = document.getElementById('entryFormFriendliness');
    el.entryFormParent = document.getElementById('entryFormParent');
    el.entryFormTags = document.getElementById('entryFormTags');
    el.addAttributeBtn = document.getElementById('addAttributeBtn');
    el.attributesContainer = document.getElementById('attributesContainer');
    el.addConnectionBtn = document.getElementById('addConnectionBtn');
    el.connectionsContainer = document.getElementById('connectionsContainer');
    el.entryFormNotes = document.getElementById('entryFormNotes');
    el.dmSecretNotesField = document.getElementById('dmSecretNotesField');
    el.entryFormSecretNotes = document.getElementById('entryFormSecretNotes');
    el.mentionPicker = document.getElementById('mentionPicker');
    el.mentionPickerList = document.getElementById('mentionPickerList');

    el.characterModal = document.getElementById('characterModal');
    el.characterForm = document.getElementById('characterForm');
    el.charFormId = document.getElementById('charFormId');
    el.characterModalTitle = document.getElementById('characterModalTitle');
    el.charFormName = document.getElementById('charFormName');
    el.charFormRace = document.getElementById('charFormRace');
    el.charFormClass = document.getElementById('charFormClass');
    el.charFormLevel = document.getElementById('charFormLevel');
    el.charFormAlignment = document.getElementById('charFormAlignment');
    el.charFormNotes = document.getElementById('charFormNotes');

    el.app = document.getElementById('app');
    el.homePage = document.getElementById('homePage');
    el.returnHomeBtn = document.getElementById('returnHomeBtn');
    el.homeThemeSwitcherBtn = document.getElementById('homeThemeSwitcherBtn');
    el.homeThemeBtnIcon = document.getElementById('homeThemeBtnIcon');
    el.homeThemeBtnLabel = document.getElementById('homeThemeBtnLabel');

    el.createNotebookForm = document.getElementById('createNotebookForm');
    el.newNotebookName = document.getElementById('newNotebookName');
    el.newNotebookDesc = document.getElementById('newNotebookDesc');
    el.notebookRuleSystem = document.getElementById('notebookRuleSystem');
    el.settingEnableSecrets = document.getElementById('settingEnableSecrets');
    el.settingAutoLink = document.getElementById('settingAutoLink');
    el.savedNotebooksList = document.getElementById('savedNotebooksList');
    el.startTempNotepadBtn = document.getElementById('startTempNotepadBtn');

    el.saveTempModal = document.getElementById('saveTempModal');
    el.saveTempForm = document.getElementById('saveTempForm');
    el.saveTempName = document.getElementById('saveTempName');
    el.saveTempDesc = document.getElementById('saveTempDesc');

    el.categoryModal = document.getElementById('categoryModal');
    el.categoryForm = document.getElementById('categoryForm');
    el.catFormName = document.getElementById('catFormName');
    el.catFormColor = document.getElementById('catFormColor');

    // Session Notes & Chapters
    el.sessionsTab = document.getElementById('sessionsTab');
    el.sessionsCountBadge = document.getElementById('sessionsCountBadge');
    el.viewSessions = document.getElementById('viewSessions');
    el.sidebarNewSessionBtn = document.getElementById('sidebarNewSessionBtn');
    el.sidebarNewChapterBtn = document.getElementById('sidebarNewChapterBtn');
    el.chapterFilterContainer = document.getElementById('chapterFilterContainer');
    el.activeChapterDesc = document.getElementById('activeChapterDesc');
    el.sessionSortSelect = document.getElementById('sessionSortSelect');
    el.sessionChapterSelectFilter = document.getElementById('sessionChapterSelectFilter');
    el.sessionsList = document.getElementById('sessionsList');
    el.sessionsEmptyState = document.getElementById('sessionsEmptyState');
    el.emptyStateNewSessionBtn = document.getElementById('emptyStateNewSessionBtn');

    el.sessionDetailPane = document.getElementById('sessionDetailPane');
    el.noSessionSelected = document.getElementById('noSessionSelected');
    el.sessionDetailContent = document.getElementById('sessionDetailContent');
    el.placeholderNewSessionBtn = document.getElementById('placeholderNewSessionBtn');
    el.detailSessionNumBadge = document.getElementById('detailSessionNumBadge');
    el.detailSessionChapterBadge = document.getElementById('detailSessionChapterBadge');
    el.detailSessionDateBadge = document.getElementById('detailSessionDateBadge');
    el.detailSessionTitle = document.getElementById('detailSessionTitle');
    el.detailSessionAttendeesRow = document.getElementById('detailSessionAttendeesRow');
    el.editSessionBtn = document.getElementById('editSessionBtn');
    el.deleteSessionBtn = document.getElementById('deleteSessionBtn');
    el.detailSessionSummarySection = document.getElementById('detailSessionSummarySection');
    el.detailSessionSummaryText = document.getElementById('detailSessionSummaryText');
    el.detailSessionNotesBody = document.getElementById('detailSessionNotesBody');
    el.detailSessionSecretNotesSection = document.getElementById('detailSessionSecretNotesSection');
    el.detailSessionSecretNotesBody = document.getElementById('detailSessionSecretNotesBody');
    el.detailSessionTimestamps = document.getElementById('detailSessionTimestamps');

    el.sessionModal = document.getElementById('sessionModal');
    el.sessionForm = document.getElementById('sessionForm');
    el.sessionModalTitle = document.getElementById('sessionModalTitle');
    el.sessionFormId = document.getElementById('sessionFormId');
    el.sessionFormTitle = document.getElementById('sessionFormTitle');
    el.sessionFormNumber = document.getElementById('sessionFormNumber');
    el.sessionFormDate = document.getElementById('sessionFormDate');
    el.sessionFormChapterSelect = document.getElementById('sessionFormChapterSelect');
    el.sessionToggleNewChapterBtn = document.getElementById('sessionToggleNewChapterBtn');
    el.sessionFormNewChapterWrapper = document.getElementById('sessionFormNewChapterWrapper');
    el.sessionFormNewChapter = document.getElementById('sessionFormNewChapter');
    el.sessionCancelNewChapterBtn = document.getElementById('sessionCancelNewChapterBtn');
    el.sessionAttendeesPicker = document.getElementById('sessionAttendeesPicker');
    el.sessionFormSummary = document.getElementById('sessionFormSummary');
    el.sessionFormNotes = document.getElementById('sessionFormNotes');
    el.sessionDmSecretNotesField = document.getElementById('sessionDmSecretNotesField');
    el.sessionFormSecretNotes = document.getElementById('sessionFormSecretNotes');
    el.sessionMentionPicker = document.getElementById('sessionMentionPicker');
    el.sessionMentionPickerList = document.getElementById('sessionMentionPickerList');

    el.chapterModal = document.getElementById('chapterModal');
    el.chapterForm = document.getElementById('chapterForm');
    el.chapterFormName = document.getElementById('chapterFormName');

    el.newSessionMenuBtn = document.getElementById('newSessionMenuBtn');
    el.addChapterMenuBtn = document.getElementById('addChapterMenuBtn');
  }

  // --- API SERVICE ---
  const api = {
    async fetchAllData() {
      const res = await fetch('/api/data');
      return await res.json();
    },
    async saveEntry(entry) {
      if (entry.id) {
        const res = await fetch(`/api/entries/${entry.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(entry)
        });
        return await res.json();
      } else {
        const res = await fetch('/api/entries', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(entry)
        });
        return await res.json();
      }
    },
    async deleteEntry(id) {
      const res = await fetch(`/api/entries/${id}`, { method: 'DELETE' });
      return await res.json();
    },
    async saveSession(session) {
      if (session.id) {
        const res = await fetch(`/api/sessions/${session.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(session)
        });
        return await res.json();
      } else {
        const res = await fetch('/api/sessions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(session)
        });
        return await res.json();
      }
    },
    async deleteSession(id) {
      const res = await fetch(`/api/sessions/${id}`, { method: 'DELETE' });
      return await res.json();
    },
    async fetchChapters(campaignId) {
      const res = await fetch(`/api/chapters?campaignId=${campaignId || ''}`);
      return await res.json();
    },
    async createChapter(name, campaignId) {
      const res = await fetch('/api/chapters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, campaignId })
      });
      return await res.json();
    },
    async saveCharacter(character) {
      if (character.id) {
        const res = await fetch(`/api/characters/${character.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(character)
        });
        return await res.json();
      } else {
        const res = await fetch('/api/characters', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(character)
        });
        return await res.json();
      }
    },
    async deleteCharacter(id) {
      const res = await fetch(`/api/characters/${id}`, { method: 'DELETE' });
      return await res.json();
    },
    async setActiveCharacter(characterId) {
      const res = await fetch('/api/characters/active', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ characterId })
      });
      return await res.json();
    },
    async linkEntryToCharacter(characterId, entryId) {
      const res = await fetch(`/api/characters/${characterId}/link-entry`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entryId })
      });
      return await res.json();
    },
    async createCampaign(name, description, mode = 'dm', system = 'D&D 5e', settings = {}, convertTemporary = false) {
      const res = await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description, mode, system, settings, convertTemporary })
      });
      return await res.json();
    },
    async deleteCampaign(id) {
      const res = await fetch(`/api/campaigns/${id}`, { method: 'DELETE' });
      return await res.json();
    },
    async switchCampaign(campaignId) {
      const res = await fetch('/api/campaigns/switch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ campaignId })
      });
      return await res.json();
    },
    async addCategory(name, color) {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, color })
      });
      return await res.json();
    },
    async importBackup(data) {
      const res = await fetch('/api/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return await res.json();
    },
    async resetData() {
      const res = await fetch('/api/reset', { method: 'POST' });
      return await res.json();
    }
  };

  // --- THEME & VISUAL STYLES ---
  function setTheme(themeId) {
    const theme = THEMES.find(t => t.id === themeId) || THEMES[0];
    state.theme = theme.id;
    localStorage.setItem('dnd_notebook_theme', theme.id);

    // Apply class to body
    THEMES.forEach(t => document.body.classList.remove(t.class));
    document.body.classList.add(theme.class);

    // Update Header Pill
    if (el.themeBtnIcon) el.themeBtnIcon.textContent = theme.icon;
    if (el.themeBtnLabel) el.themeBtnLabel.textContent = theme.name;

    // Update Home Header Pill
    if (el.homeThemeBtnIcon) el.homeThemeBtnIcon.textContent = theme.icon;
    if (el.homeThemeBtnLabel) el.homeThemeBtnLabel.textContent = theme.name;

    // Update Selected Tag in Modal
    if (el.themeSelectCards) {
      el.themeSelectCards.forEach(card => {
        card.classList.toggle('selected', card.dataset.themeId === theme.id);
      });
    }
  }

  function initTheme() {
    const savedTheme = localStorage.getItem('dnd_notebook_theme') || 'whimsical';
    setTheme(savedTheme);
  }

  // --- INITIALIZATION ---
  async function init() {
    initElements();
    initTheme();
    setupEventListeners();
    await loadInitialData();
  }

  async function loadInitialData() {
    try {
      const data = await api.fetchAllData();
      state.campaigns = data.campaigns || [];
      state.activeCampaignId = data.activeCampaignId || null;
      state.entries = data.entries || [];
      state.characters = data.characters || [];
      state.activeCharacterId = data.activeCharacterId || null;
      state.customCategories = data.customCategories || [];
      state.sessions = Array.isArray(data.sessions) ? data.sessions : [];

      // Determine notebook mode from active campaign if one was stored
      if (state.activeCampaignId === 'temporary') {
        state.currentMode = 'dm';
      } else if (state.activeCampaignId) {
        const camp = state.campaigns.find(c => c.id === state.activeCampaignId);
        if (camp) {
          state.currentMode = camp.mode || 'dm';
        } else {
          state.activeCampaignId = null;
        }
      }

      // By default on startup: ALWAYS show the dedicated Home Page!
      // The user MUST choose one of: Create new notebook, Open saved notebook, or Launch temporary notes
      showHomePage();
    } catch (err) {
      console.error('Failed to load application data:', err);
    }
  }

  // --- FULL-PAGE HOME GATEWAY & WORKSPACE SWITCHING ---
  function showHomePage() {
    renderSavedNotebooksList();
    if (el.app) el.app.style.display = 'none';
    if (el.homePage) el.homePage.style.display = 'flex';
  }

  async function showWorkspace(campaignId, mode = 'dm') {
    state.activeCampaignId = campaignId;
    state.currentMode = mode || 'dm';

    if (campaignId !== 'temporary') {
      try {
        await api.switchCampaign(campaignId);
      } catch (err) {
        console.warn('Could not persist switch:', err);
      }
    }

    // Select character associated with this campaign if available
    const campChars = state.characters.filter(c => c.campaignId === campaignId);
    if (campChars.length > 0) {
      if (!state.activeCharacterId || !campChars.some(c => c.id === state.activeCharacterId)) {
        state.activeCharacterId = campChars[0].id;
      }
    } else {
      state.activeCharacterId = null;
    }
    state.selectedCharacterId = state.activeCharacterId;

    if (el.homePage) el.homePage.style.display = 'none';
    if (el.app) el.app.style.display = 'flex';

    updateUI();
  }

  function renderSavedNotebooksList() {
    if (!el.savedNotebooksList) return;
    el.savedNotebooksList.innerHTML = '';
    if (state.campaigns.length === 0) {
      el.savedNotebooksList.innerHTML = `
        <div class="empty-state" style="padding: 28px 14px; text-align: center;">
          <div style="font-size: 2rem; margin-bottom: 8px;">📜</div>
          <p class="text-sm font-semibold text-secondary">No saved notebooks found</p>
          <p class="text-xs text-muted" style="margin-top: 4px;">Forge your first campaign notebook on the left, or launch an instant temporary notepad.</p>
        </div>
      `;
      return;
    }

    state.campaigns.forEach(camp => {
      const card = document.createElement('div');
      card.className = 'saved-notebook-card';
      const isDm = (camp.mode || 'dm') === 'dm';
      const entryCount = state.entries.filter(e => e.campaignId === camp.id).length;
      const charCount = state.characters.filter(c => c.campaignId === camp.id).length;
      const sessionCount = state.sessions.filter(s => s.campaignId === camp.id).length;
      const sys = camp.system || 'D&D 5e';

      card.innerHTML = `
        <div class="saved-notebook-info">
          <div class="saved-notebook-title">${escapeHTML(camp.name)}</div>
          <div class="saved-notebook-meta">
            <span class="category-tag ${isDm ? 'cat-quest' : 'cat-location'}">${isDm ? '👑 DM Mode' : '🛡️ Player Mode'}</span>
            <span class="category-tag cat-faction" style="font-size: 0.65rem;">🎲 ${escapeHTML(sys)}</span>
            <span>${entryCount} entries</span>
            ${sessionCount > 0 ? `<span>• ${sessionCount} sessions</span>` : ''}
            ${charCount > 0 ? `<span>• ${charCount} heroes</span>` : ''}
            <span>• ${formatRelativeTime(camp.updatedAt || camp.createdAt)}</span>
          </div>
        </div>
        <div class="saved-notebook-actions">
          <button class="btn btn-xs btn-primary open-camp-btn">Open Notebook</button>
          <button class="btn btn-xs btn-danger-ghost delete-camp-btn" title="Delete notebook">&times;</button>
        </div>
      `;

      card.addEventListener('click', () => {
        showWorkspace(camp.id, camp.mode || 'dm');
      });

      card.querySelector('.open-camp-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        showWorkspace(camp.id, camp.mode || 'dm');
      });

      card.querySelector('.delete-camp-btn').addEventListener('click', async (e) => {
        e.stopPropagation();
        if (confirm(`Permanently delete notebook "${camp.name}" and all its notes?`)) {
          await api.deleteCampaign(camp.id);
          state.campaigns = state.campaigns.filter(c => c.id !== camp.id);
          state.entries = state.entries.filter(ent => ent.campaignId !== camp.id);
          state.characters = state.characters.filter(ch => ch.campaignId !== camp.id);
          if (state.activeCampaignId === camp.id) {
            state.activeCampaignId = null;
          }
          renderSavedNotebooksList();
        }
      });

      el.savedNotebooksList.appendChild(card);
    });
  }

  // --- UI UPDATES ---
  function updateUI() {
    updateCampaignHeader();
    updateModeDisplay();
    updateCategoryFilters();
    renderEntriesList();
    renderEntryDetail();
    renderCharacterRoster();
    updateBadges();

    // Render active tab view
    if (state.activeTab === 'graph') {
      renderAssociationGraph();
    } else if (state.activeTab === 'hierarchy') {
      renderHierarchyTree();
    } else if (state.activeTab === 'party') {
      renderPartyView();
    } else if (state.activeTab === 'dossier') {
      renderCharacterSheet();
    } else if (state.activeTab === 'sessions') {
      renderSessionsView();
    }
  }

  function updateCampaignHeader() {
    if (state.activeCampaignId === 'temporary') {
      el.activeCampaignName.textContent = '⚡ Temporary Notepad';
      el.tempNotepadBanner.style.display = 'flex';
    } else {
      el.tempNotepadBanner.style.display = 'none';
      const activeCamp = state.campaigns.find(c => c.id === state.activeCampaignId);
      el.activeCampaignName.textContent = activeCamp ? activeCamp.name : 'Choose Notebook';
    }
  }

  function updateModeDisplay() {
    // Mode badge in header
    if (state.activeCampaignId === 'temporary') {
      el.notebookModeBadge.className = 'notebook-mode-badge temp-badge';
      el.badgeDmIcon.style.display = 'none';
      el.badgePlayerIcon.style.display = 'none';
      el.notebookModeLabel.textContent = '⚡ Temporary Scratchpad';
      el.modeStatusBanner.className = 'mode-status-banner dm-active';
      el.modeStatusText.textContent = 'Temporary Scratchpad: Notes are stored in temporary session memory.';
      el.dmSecretNotesField.style.display = 'block';
      el.detailSecretNotesSection.style.display = 'block';
    } else if (state.currentMode === 'player') {
      el.notebookModeBadge.className = 'notebook-mode-badge player-badge';
      el.badgeDmIcon.style.display = 'none';
      el.badgePlayerIcon.style.display = 'inline-block';
      el.notebookModeLabel.textContent = '🛡️ Player Notebook';
      el.modeStatusBanner.className = 'mode-status-banner player-active';
      el.modeStatusText.textContent = 'Player Notebook: Journal tracking active. DM secret notes redacted.';
      el.dmSecretNotesField.style.display = 'none';
      el.detailSecretNotesSection.style.display = 'none';
    } else {
      el.notebookModeBadge.className = 'notebook-mode-badge dm-badge';
      el.badgeDmIcon.style.display = 'inline-block';
      el.badgePlayerIcon.style.display = 'none';
      el.notebookModeLabel.textContent = '👑 DM Notebook';
      el.modeStatusBanner.className = 'mode-status-banner dm-active';
      el.modeStatusText.textContent = 'DM Notebook: Full campaign oversight enabled. Secret notes revealed.';
      el.dmSecretNotesField.style.display = 'block';
      el.detailSecretNotesSection.style.display = 'block';
    }

    // Active Character Pill
    const activeChar = state.characters.find(c => c.id === state.activeCharacterId);
    if (activeChar) {
      el.characterPill.style.display = 'flex';
      el.activeCharAvatar.textContent = activeChar.name.slice(0, 2).toUpperCase();
      el.activeCharName.textContent = activeChar.name;
      el.activeCharMeta.textContent = `Lvl ${activeChar.level} ${activeChar.characterClass}`;
    } else {
      el.characterPill.style.display = state.currentMode === 'player' ? 'flex' : 'none';
      el.activeCharAvatar.textContent = 'PC';
      el.activeCharName.textContent = 'No Hero';
      el.activeCharMeta.textContent = 'Click to create';
    }
  }

  function updateCategoryFilters() {
    const allCategories = [...DEFAULT_CATEGORIES, ...state.customCategories];
    
    // Populate modal parent selector
    el.entryFormParent.innerHTML = '<option value="">(None - Top Level)</option>';
    state.entries.forEach(entry => {
      const opt = document.createElement('option');
      opt.value = entry.id;
      opt.textContent = `${entry.title} (${entry.category.toUpperCase()})`;
      el.entryFormParent.appendChild(opt);
    });

    // Populate category select in modal
    el.entryFormCategory.innerHTML = '';
    allCategories.forEach(cat => {
      const opt = document.createElement('option');
      opt.value = cat.id;
      opt.textContent = cat.name;
      el.entryFormCategory.appendChild(opt);
    });
  }

  function updateBadges() {
    el.entriesCountBadge.textContent = state.entries.length;
    if (el.sessionsCountBadge) {
      const campSessions = state.sessions.filter(s => s.campaignId === state.activeCampaignId);
      el.sessionsCountBadge.textContent = campSessions.length;
    }
    if (el.partyCountBadge) {
      el.partyCountBadge.textContent = state.characters.length;
    }
    const activeChar = state.characters.find(c => c.id === state.activeCharacterId);
    const count = activeChar && Array.isArray(activeChar.linkedEntryIds) ? activeChar.linkedEntryIds.length : 0;
    el.playerLinkedCountBadge.textContent = count;
  }

  // --- FILTERING & SORTING ENTRIES ---
  function getFilteredEntries() {
    let result = state.entries.filter(entry => {
      // Must match active campaign
      if (entry.campaignId && entry.campaignId !== state.activeCampaignId) {
        return false;
      }

      // Search Query
      if (state.searchQuery) {
        const q = state.searchQuery.toLowerCase();
        const matchesTitle = entry.title.toLowerCase().includes(q);
        const matchesNotes = entry.notes && entry.notes.toLowerCase().includes(q);
        const matchesTags = Array.isArray(entry.tags) && entry.tags.some(t => t.toLowerCase().includes(q));
        if (!matchesTitle && !matchesNotes && !matchesTags) {
          return false;
        }
      }

      // Category filter
      if (state.selectedCategory !== 'all' && entry.category.toLowerCase() !== state.selectedCategory.toLowerCase()) {
        return false;
      }

      // Life Status filter
      if (state.selectedStatus !== 'all' && entry.status !== state.selectedStatus) {
        return false;
      }

      return true;
    });

    // Sorting
    result.sort((a, b) => {
      switch (state.sortOption) {
        case 'alpha-asc':
          return a.title.localeCompare(b.title);
        case 'alpha-desc':
          return b.title.localeCompare(a.title);
        case 'category':
          return a.category.localeCompare(b.category);
        case 'status':
          return (a.status || '').localeCompare(b.status || '');
        case 'friendliness':
          return (a.friendliness || '').localeCompare(b.friendliness || '');
        case 'updated':
        default:
          return new Date(b.updatedAt || b.createdAt || 0) - new Date(a.updatedAt || a.createdAt || 0);
      }
    });

    return result;
  }

  function renderEntriesList() {
    const filtered = getFilteredEntries();
    el.entriesList.innerHTML = '';

    if (filtered.length === 0) {
      el.entriesEmptyState.style.display = 'flex';
      return;
    }

    el.entriesEmptyState.style.display = 'none';

    filtered.forEach(entry => {
      const card = document.createElement('div');
      card.className = `entry-card-item ${entry.id === state.selectedEntryId ? 'selected' : ''}`;
      card.dataset.id = entry.id;

      // Extract plain text snippet
      const snippet = entry.notes ? entry.notes.replace(/[#*`_~@]/g, '').slice(0, 90) : 'No chronicle recorded.';
      const catClass = `cat-${entry.category.toLowerCase()}`;

      // Calculate backlinks count
      const backlinks = getBacklinksForEntry(entry.id);

      card.innerHTML = `
        <div class="entry-card-top">
          <span class="entry-card-title">${escapeHTML(entry.title)}</span>
          <span class="category-tag ${catClass}">${escapeHTML(entry.category)}</span>
        </div>
        <p class="entry-card-preview">${escapeHTML(snippet)}</p>
        <div class="entry-card-footer">
          <span class="entry-card-status">${escapeHTML(entry.status || 'Unknown')} • ${escapeHTML(entry.friendliness || 'Neutral')}</span>
          <div class="entry-card-meta">
            ${backlinks.length > 0 ? `<span>🔗 ${backlinks.length}</span>` : ''}
            <span>${formatRelativeTime(entry.updatedAt || entry.createdAt)}</span>
          </div>
        </div>
      `;

      card.addEventListener('click', () => {
        selectEntry(entry.id);
      });

      el.entriesList.appendChild(card);
    });
  }

  // --- ENTRY SELECTION & DETAIL VIEW ---
  function selectEntry(id) {
    state.selectedEntryId = id;
    renderEntriesList();
    renderEntryDetail();

    // In Player Mode: Auto-link viewed entry to the active character!
    if (state.currentMode === 'player' && state.activeCharacterId) {
      autoLinkEntryToActiveCharacter(id);
    }
  }

  async function autoLinkEntryToActiveCharacter(entryId) {
    const character = state.characters.find(c => c.id === state.activeCharacterId);
    if (!character) return;

    if (!Array.isArray(character.linkedEntryIds)) {
      character.linkedEntryIds = [];
    }

    if (!character.linkedEntryIds.includes(entryId)) {
      character.linkedEntryIds.push(entryId);
      await api.linkEntryToCharacter(state.activeCharacterId, entryId);
      updateBadges();
      renderCharacterRoster();
    }
  }

  function renderEntryDetail() {
    const entry = state.entries.find(e => e.id === state.selectedEntryId);

    if (!entry) {
      el.noEntrySelected.style.display = 'flex';
      el.entryDetailContent.style.display = 'none';
      return;
    }

    el.noEntrySelected.style.display = 'none';
    el.entryDetailContent.style.display = 'flex';

    // Header Information
    el.detailTitle.textContent = entry.title;
    el.detailCategoryBadge.textContent = entry.category.toUpperCase();
    el.detailCategoryBadge.className = `category-badge cat-${entry.category.toLowerCase()}`;

    el.detailStatusBadge.textContent = entry.status || 'Unknown';
    el.detailStatusBadge.className = `status-badge status-${(entry.status || 'unknown').toLowerCase()}`;

    el.detailFriendlinessBadge.textContent = entry.friendliness || 'Neutral';
    el.detailFriendlinessBadge.className = `friendliness-badge friendly-${(entry.friendliness || 'neutral').toLowerCase()}`;

    // Parent entry badge
    if (entry.parentId) {
      const parent = state.entries.find(e => e.id === entry.parentId);
      if (parent) {
        el.detailParentBadge.style.display = 'inline-block';
        el.detailParentBadge.textContent = `Part of: ${parent.title}`;
        el.detailParentBadge.onclick = () => selectEntry(parent.id);
        el.detailParentBadge.style.cursor = 'pointer';
      } else {
        el.detailParentBadge.style.display = 'none';
      }
    } else {
      el.detailParentBadge.style.display = 'none';
    }

    // Tags
    el.detailTagsRow.innerHTML = '';
    if (Array.isArray(entry.tags) && entry.tags.length > 0) {
      entry.tags.forEach(tag => {
        if (!tag.trim()) return;
        const tagEl = document.createElement('span');
        tagEl.className = 'tag-pill';
        tagEl.textContent = `#${tag.trim()}`;
        el.detailTagsRow.appendChild(tagEl);
      });
    }

    // Player Link Toggle Button
    if (state.activeCharacterId) {
      el.playerLinkBtn.style.display = 'inline-flex';
      const activeChar = state.characters.find(c => c.id === state.activeCharacterId);
      const isLinked = activeChar && Array.isArray(activeChar.linkedEntryIds) && activeChar.linkedEntryIds.includes(entry.id);
      el.playerLinkBtnText.textContent = isLinked ? 'In Hero Journal' : 'Link to Hero';
      el.playerLinkBtn.className = isLinked ? 'btn btn-sm btn-secondary' : 'btn btn-sm btn-ghost';
    } else {
      el.playerLinkBtn.style.display = 'none';
    }

    // Attributes Panel
    if (Array.isArray(entry.attributes) && entry.attributes.length > 0) {
      el.detailAttributesSection.style.display = 'flex';
      el.detailAttributesGrid.innerHTML = '';
      entry.attributes.forEach(attr => {
        if (!attr.key && !attr.value) return;
        const card = document.createElement('div');
        card.className = 'attribute-card';
        card.innerHTML = `
          <span class="attr-key">${escapeHTML(attr.key)}</span>
          <span class="attr-val">${escapeHTML(attr.value)}</span>
        `;
        el.detailAttributesGrid.appendChild(card);
      });
    } else {
      el.detailAttributesSection.style.display = 'none';
    }

    // Explicit Connections Panel
    if (Array.isArray(entry.connections) && entry.connections.length > 0) {
      el.detailConnectionsSection.style.display = 'flex';
      el.detailConnectionsList.innerHTML = '';
      entry.connections.forEach(conn => {
        const target = state.entries.find(e => e.id === conn.targetId);
        if (!target) return;
        const chip = document.createElement('div');
        chip.className = 'relation-chip';
        chip.innerHTML = `
          <span class="relation-type">${escapeHTML(conn.relation || 'Relates to')}:</span>
          <span class="relation-target">${escapeHTML(target.title)}</span>
        `;
        chip.addEventListener('click', () => selectEntry(target.id));
        el.detailConnectionsList.appendChild(chip);
      });
    } else {
      el.detailConnectionsSection.style.display = 'none';
    }

    // Family Tree / Lineage Panel for Characters & NPCs
    if (el.detailFamilySection) {
      if (entry.category === 'npc' || hasFamilyConnections(entry)) {
        el.detailFamilySection.style.display = 'block';
        renderFamilyTreeForSubject(entry.title, entry.connections, el.detailFamilyTreeContainer, entry.id);
      } else {
        el.detailFamilySection.style.display = 'none';
      }
    }

    // Children / Sub-entries Hierarchy
    const children = state.entries.filter(e => e.parentId === entry.id);
    if (children.length > 0) {
      el.detailChildrenSection.style.display = 'flex';
      el.detailChildrenList.innerHTML = '';
      children.forEach(child => {
        const chip = document.createElement('div');
        chip.className = 'relation-chip';
        chip.innerHTML = `
          <span class="relation-type">Contains:</span>
          <span class="relation-target">${escapeHTML(child.title)}</span>
        `;
        chip.addEventListener('click', () => selectEntry(child.id));
        el.detailChildrenList.appendChild(chip);
      });
    } else {
      el.detailChildrenSection.style.display = 'none';
    }

    // Notes Body: Render Markdown + Interactive @ Mention Links
    el.detailNotesBody.innerHTML = renderMarkdownWithMentions(entry.notes || '*(No notes chronicle provided yet.)*');

    // Attach click listeners to rendered @ mention links
    el.detailNotesBody.querySelectorAll('.mention-link').forEach(link => {
      link.addEventListener('click', e => {
        e.preventDefault();
        const targetId = link.dataset.entryId;
        if (targetId) {
          selectEntry(targetId);
        }
      });
    });

    // Secret Notes (DM only)
    if (state.currentMode === 'dm' && entry.secretNotes) {
      el.detailSecretNotesSection.style.display = 'block';
      el.detailSecretNotesBody.innerHTML = renderMarkdownWithMentions(entry.secretNotes);
      el.detailSecretNotesBody.querySelectorAll('.mention-link').forEach(link => {
        link.addEventListener('click', e => {
          e.preventDefault();
          const targetId = link.dataset.entryId;
          if (targetId) {
            selectEntry(targetId);
          }
        });
      });
    } else {
      el.detailSecretNotesSection.style.display = 'none';
    }

    // Backlinks Index Tracking
    renderBacklinks(entry.id);

    // Timestamps
    const createdStr = entry.createdAt ? new Date(entry.createdAt).toLocaleString() : 'Unknown';
    const updatedStr = entry.updatedAt ? new Date(entry.updatedAt).toLocaleString() : createdStr;
    el.detailTimestamps.textContent = `Created: ${createdStr} | Last Updated: ${updatedStr}`;
  }

  // --- CROSS-REFERENCING & BACKLINKS ---
  function getBacklinksForEntry(targetId) {
    const targetEntry = state.entries.find(e => e.id === targetId);
    if (!targetEntry) return [];

    const referringEntries = [];

    state.entries.forEach(source => {
      if (source.id === targetId) return;

      let isReferenced = false;

      // Check explicit connections
      if (Array.isArray(source.connections)) {
        if (source.connections.some(c => c.targetId === targetId)) {
          isReferenced = true;
        }
      }

      // Check parentId
      if (source.parentId === targetId) {
        isReferenced = true;
      }

      // Check @ mentions in notes
      if (!isReferenced && source.notes) {
        if (source.notes.includes(targetId) || source.notes.toLowerCase().includes(`@${targetEntry.title.toLowerCase()}`)) {
          isReferenced = true;
        }
      }

      // Check @ mentions in secret notes (if DM mode)
      if (!isReferenced && state.currentMode === 'dm' && source.secretNotes) {
        if (source.secretNotes.includes(targetId) || source.secretNotes.toLowerCase().includes(`@${targetEntry.title.toLowerCase()}`)) {
          isReferenced = true;
        }
      }

      // Check @ mentions in session notes & secret notes
      state.sessions.forEach(session => {
        if (session.campaignId !== state.activeCampaignId) return;
        let isSessionReferenced = false;
        if (session.notes && (session.notes.includes(targetId) || session.notes.toLowerCase().includes(`@${targetEntry.title.toLowerCase()}`))) {
          isSessionReferenced = true;
        }
        if (!isSessionReferenced && state.currentMode === 'dm' && session.secretNotes) {
          if (session.secretNotes.includes(targetId) || session.secretNotes.toLowerCase().includes(`@${targetEntry.title.toLowerCase()}`)) {
            isSessionReferenced = true;
          }
        }
        if (isSessionReferenced) {
          referringEntries.push({
            id: session.id,
            title: `Session #${session.sessionNumber || 1}: ${session.title}`,
            category: 'session',
            isSession: true
          });
        }
      });

      if (isReferenced) {
        referringEntries.push(source);
      }
    });

    return referringEntries;
  }

  function renderBacklinks(targetId) {
    const backlinks = getBacklinksForEntry(targetId);
    el.backlinksCountBadge.textContent = backlinks.length;
    el.detailBacklinksList.innerHTML = '';

    if (backlinks.length === 0) {
      el.detailBacklinksList.innerHTML = '<span class="text-muted text-sm">No incoming references or connections from other entries.</span>';
      return;
    }

    backlinks.forEach(source => {
      const item = document.createElement('div');
      item.className = 'backlink-item';
      const cat = source.isSession ? 'quest' : (source.category || 'lore').toLowerCase();
      const badgeText = source.isSession ? 'SESSION' : (source.category || 'ENTRY');
      item.innerHTML = `
        <span class="category-tag cat-${cat}">${escapeHTML(badgeText)}</span>
        <span>${escapeHTML(source.title)}</span>
      `;
      item.addEventListener('click', () => {
        if (source.isSession) {
          selectSession(source.id);
          switchTab('sessions');
        } else {
          selectEntry(source.id);
        }
      });
      el.detailBacklinksList.appendChild(item);
    });
  }

  // --- MARKDOWN & @ MENTION PARSER ---
  function renderMarkdownWithMentions(text) {
    if (!text) return '';

    // Step 1: Escape HTML
    let out = escapeHTML(text);

    // Step 2: Parse @[Title](id) mentions
    out = out.replace(/@\[(.*?)\]\((.*?)\)/g, (match, title, id) => {
      if (id && id.startsWith('session:')) {
        const sId = id.replace('session:', '');
        return `<a class="mention-link mention-session-link" data-session-id="${sId}">📜 ${title}</a>`;
      }
      return `<a class="mention-link" data-entry-id="${id}">${title}</a>`;
    });

    // Step 3: Parse @[Title] mentions (match against existing entries or sessions by title)
    out = out.replace(/@\[(.*?)\]/g, (match, title) => {
      const foundEntry = state.entries.find(e => e.title.toLowerCase() === title.toLowerCase());
      if (foundEntry) {
        return `<a class="mention-link" data-entry-id="${foundEntry.id}">${title}</a>`;
      }
      const foundSession = state.sessions.find(s => s.title.toLowerCase() === title.toLowerCase());
      if (foundSession) {
        return `<a class="mention-link mention-session-link" data-session-id="${foundSession.id}">📜 ${title}</a>`;
      }
      return `<a class="mention-link">${title}</a>`;
    });

    // Step 4: Basic Markdown conversions (Headers, bold, italics, tables, lists)
    // Headings
    out = out.replace(/^### (.*$)/gim, '<h3>$1</h3>');
    out = out.replace(/^## (.*$)/gim, '<h2>$1</h2>');
    out = out.replace(/^# (.*$)/gim, '<h1>$1</h1>');

    // Bold & Italics
    out = out.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    out = out.replace(/\*(.*?)\*/g, '<em>$1</em>');

    // Blockquotes
    out = out.replace(/^\> (.*$)/gim, '<blockquote>$1</blockquote>');

    // Simple Line breaks & paragraphs
    const paragraphs = out.split(/\n\s*\n/).map(p => {
      p = p.trim();
      if (!p) return '';
      if (p.startsWith('<h') || p.startsWith('<blockquote') || p.startsWith('<ul>') || p.startsWith('<table')) {
        return p;
      }
      return `<p>${p.replace(/\n/g, '<br>')}</p>`;
    });

    return paragraphs.join('\n');
  }

  // --- @ MENTION AUTOCOMPLETE PICKER ---
  function setupMentionAutocompleteForTextarea(textarea, picker, pickerList, isSessionTextarea = false) {
    if (!textarea || !picker || !pickerList) return;
    let selectedIndex = 0;
    let matchingItems = [];
    let mentionStartPos = -1;

    textarea.addEventListener('input', () => {
      const pos = textarea.selectionStart;
      const textBeforeCursor = textarea.value.slice(0, pos);
      const atIndex = textBeforeCursor.lastIndexOf('@');

      if (atIndex !== -1 && atIndex >= pos - 25) {
        const query = textBeforeCursor.slice(atIndex + 1);
        if (!/\s/.test(query)) {
          mentionStartPos = atIndex;
          showPicker(query);
          return;
        }
      }

      hidePicker();
    });

    textarea.addEventListener('keydown', e => {
      if (picker.style.display !== 'none' && matchingItems.length > 0) {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          selectedIndex = (selectedIndex + 1) % matchingItems.length;
          updateHighlightedItem();
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          selectedIndex = (selectedIndex - 1 + matchingItems.length) % matchingItems.length;
          updateHighlightedItem();
        } else if (e.key === 'Enter' || e.key === 'Tab') {
          e.preventDefault();
          insertMention(matchingItems[selectedIndex]);
        } else if (e.key === 'Escape') {
          hidePicker();
        }
      }
    });

    function showPicker(query) {
      const q = query.toLowerCase();
      const currentEditingEntryId = el.entryFormId?.value;
      const currentEditingSessionId = el.sessionFormId?.value;
      
      const matchedEntries = state.entries.filter(e => {
        if (!isSessionTextarea && e.id === currentEditingEntryId) return false;
        return e.title.toLowerCase().includes(q);
      }).map(e => ({
        id: e.id,
        title: e.title,
        category: e.category,
        isSession: false
      }));

      const matchedSessions = state.sessions.filter(s => {
        if (isSessionTextarea && s.id === currentEditingSessionId) return false;
        return (s.title && s.title.toLowerCase().includes(q)) ||
               (s.chapter && s.chapter.toLowerCase().includes(q)) ||
               (`session ${s.sessionNumber}`.includes(q));
      }).map(s => ({
        id: `session:${s.id}`,
        title: `Session #${s.sessionNumber || 1}: ${s.title}`,
        category: 'session',
        isSession: true
      }));

      matchingItems = [...matchedEntries, ...matchedSessions].slice(0, 8);

      if (matchingItems.length === 0) {
        hidePicker();
        return;
      }

      pickerList.innerHTML = '';
      selectedIndex = 0;

      matchingItems.forEach((item, idx) => {
        const row = document.createElement('div');
        row.className = `mention-picker-item ${idx === 0 ? 'highlighted' : ''}`;
        const catClass = item.isSession ? 'cat-quest' : `cat-${(item.category || 'lore').toLowerCase()}`;
        const badgeLabel = item.isSession ? 'SESSION' : (item.category || 'ENTRY').toUpperCase();
        row.innerHTML = `
          <span>${escapeHTML(item.title)}</span>
          <span class="category-tag ${catClass}">${escapeHTML(badgeLabel)}</span>
        `;
        row.addEventListener('click', () => {
          insertMention(item);
        });
        pickerList.appendChild(row);
      });

      picker.style.display = 'block';
    }

    function hidePicker() {
      picker.style.display = 'none';
      matchingItems = [];
      mentionStartPos = -1;
    }

    function updateHighlightedItem() {
      const items = pickerList.querySelectorAll('.mention-picker-item');
      items.forEach((item, idx) => {
        item.classList.toggle('highlighted', idx === selectedIndex);
      });
    }

    function insertMention(item) {
      if (mentionStartPos === -1) return;
      const text = textarea.value;
      const pos = textarea.selectionStart;
      const before = text.slice(0, mentionStartPos);
      const after = text.slice(pos);
      const mentionToken = `@[${item.title}](${item.id}) `;

      textarea.value = before + mentionToken + after;
      const newCursorPos = before.length + mentionToken.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
      textarea.focus();
      hidePicker();
    }
  }

  function setupMentionAutocomplete() {
    setupMentionAutocompleteForTextarea(el.entryFormNotes, el.mentionPicker, el.mentionPickerList, false);
    setupMentionAutocompleteForTextarea(el.sessionFormNotes, el.sessionMentionPicker, el.sessionMentionPickerList, true);
  }

  // --- TAB 2: ASSOCIATION GRAPH RENDERER ---
  function renderAssociationGraph() {
    const canvas = el.graphCanvas;
    const ctx = canvas.getContext('2d');
    const width = el.graphContainer.clientWidth;
    const height = el.graphContainer.clientHeight;

    // High DPI scaling
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(dpr, dpr);

    // Build Graph Data
    let graphEntries = state.entries;
    if (state.graphFilterMode === 'selected' && state.selectedEntryId) {
      const root = state.entries.find(e => e.id === state.selectedEntryId);
      if (root) {
        const connectedIds = new Set([root.id]);
        if (Array.isArray(root.connections)) {
          root.connections.forEach(c => connectedIds.add(c.targetId));
        }
        if (root.parentId) connectedIds.add(root.parentId);
        state.entries.forEach(e => {
          if (e.parentId === root.id) connectedIds.add(e.id);
          if (Array.isArray(e.connections) && e.connections.some(c => c.targetId === root.id)) {
            connectedIds.add(e.id);
          }
        });
        graphEntries = state.entries.filter(e => connectedIds.has(e.id));
      }
    }

    if (graphEntries.length === 0) {
      el.graphEmptyNotice.style.display = 'block';
      return;
    }
    el.graphEmptyNotice.style.display = 'none';

    // Position Nodes in Circular / Force layout
    const nodeMap = new Map();
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) * 0.35;
    const count = graphEntries.length;

    graphEntries.forEach((entry, idx) => {
      const angle = (idx / count) * 2 * Math.PI;
      const x = count === 1 ? centerX : centerX + radius * Math.cos(angle);
      const y = count === 1 ? centerY : centerY + radius * Math.sin(angle);
      nodeMap.set(entry.id, {
        id: entry.id,
        title: entry.title,
        category: entry.category,
        x,
        y,
        radius: 20
      });
    });

    // Links collection
    const links = [];
    graphEntries.forEach(entry => {
      if (entry.parentId && nodeMap.has(entry.parentId)) {
        links.push({
          source: nodeMap.get(entry.parentId),
          target: nodeMap.get(entry.id),
          relation: 'Parent'
        });
      }
      if (Array.isArray(entry.connections)) {
        entry.connections.forEach(conn => {
          if (nodeMap.has(conn.targetId)) {
            links.push({
              source: nodeMap.get(entry.id),
              target: nodeMap.get(conn.targetId),
              relation: conn.relation || 'Connected'
            });
          }
        });
      }
    });

    state.graphState.nodes = Array.from(nodeMap.values());
    state.graphState.links = links;

    // Draw Routine
    function draw() {
      ctx.clearRect(0, 0, width, height);
      ctx.save();

      // Pan & Zoom
      ctx.translate(state.graphState.panX, state.graphState.panY);
      ctx.scale(state.graphState.scale, state.graphState.scale);

      // 1. Draw Links
      links.forEach(link => {
        ctx.beginPath();
        ctx.moveTo(link.source.x, link.source.y);
        ctx.lineTo(link.target.x, link.target.y);
        ctx.strokeStyle = 'rgba(245, 158, 11, 0.3)';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Relation label on link midpoint
        const midX = (link.source.x + link.target.x) / 2;
        const midY = (link.source.y + link.target.y) / 2;
        ctx.fillStyle = '#94a3b8';
        ctx.font = '10px Inter';
        ctx.textAlign = 'center';
        ctx.fillText(link.relation, midX, midY - 4);
      });

      // 2. Draw Nodes
      state.graphState.nodes.forEach(node => {
        const isSelected = node.id === state.selectedEntryId;
        const color = getCategoryColor(node.category);

        // Glow when selected
        if (isSelected) {
          ctx.beginPath();
          ctx.arc(node.x, node.y, node.radius + 6, 0, 2 * Math.PI);
          ctx.fillStyle = 'rgba(245, 158, 11, 0.4)';
          ctx.fill();
        }

        // Main Node Body
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, 2 * Math.PI);
        ctx.fillStyle = '#151a28';
        ctx.fill();
        ctx.strokeStyle = color;
        ctx.lineWidth = 3;
        ctx.stroke();

        // Node Title
        ctx.fillStyle = '#f8fafc';
        ctx.font = '11px Cinzel, serif';
        ctx.textAlign = 'center';
        ctx.fillText(node.title, node.x, node.y + node.radius + 14);

        // Category Subtext
        ctx.fillStyle = '#64748b';
        ctx.font = '9px Inter';
        ctx.fillText(node.category.toUpperCase(), node.x, node.y + node.radius + 25);
      });

      ctx.restore();
    }

    draw();
  }

  function setupGraphInteractions() {
    const canvas = el.graphCanvas;

    canvas.addEventListener('mousedown', e => {
      const rect = canvas.getBoundingClientRect();
      const mouseX = (e.clientX - rect.left - state.graphState.panX) / state.graphState.scale;
      const mouseY = (e.clientY - rect.top - state.graphState.panY) / state.graphState.scale;

      // Check node hit
      const hitNode = state.graphState.nodes.find(n => {
        const dx = n.x - mouseX;
        const dy = n.y - mouseY;
        return Math.sqrt(dx * dx + dy * dy) <= n.radius + 4;
      });

      if (hitNode) {
        selectEntry(hitNode.id);
        renderAssociationGraph();
        return;
      }

      state.graphState.isDragging = true;
      state.graphState.dragStartX = e.clientX - state.graphState.panX;
      state.graphState.dragStartY = e.clientY - state.graphState.panY;
    });

    window.addEventListener('mousemove', e => {
      if (state.graphState.isDragging) {
        state.graphState.panX = e.clientX - state.graphState.dragStartX;
        state.graphState.panY = e.clientY - state.graphState.dragStartY;
        renderAssociationGraph();
      }
    });

    window.addEventListener('mouseup', () => {
      state.graphState.isDragging = false;
    });

    canvas.addEventListener('wheel', e => {
      e.preventDefault();
      const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
      state.graphState.scale = Math.max(0.3, Math.min(3, state.graphState.scale * zoomFactor));
      renderAssociationGraph();
    });

    el.graphZoomInBtn.onclick = () => {
      state.graphState.scale = Math.min(3, state.graphState.scale * 1.2);
      renderAssociationGraph();
    };

    el.graphZoomOutBtn.onclick = () => {
      state.graphState.scale = Math.max(0.3, state.graphState.scale * 0.8);
      renderAssociationGraph();
    };

    el.graphResetBtn.onclick = () => {
      state.graphState.panX = 0;
      state.graphState.panY = 0;
      state.graphState.scale = 1;
      renderAssociationGraph();
    };

    el.graphGlobalModeBtn.onclick = () => {
      state.graphFilterMode = 'global';
      el.graphGlobalModeBtn.classList.add('active');
      el.graphSelectedModeBtn.classList.remove('active');
      renderAssociationGraph();
    };

    el.graphSelectedModeBtn.onclick = () => {
      state.graphFilterMode = 'selected';
      el.graphSelectedModeBtn.classList.add('active');
      el.graphGlobalModeBtn.classList.remove('active');
      renderAssociationGraph();
    };
  }

  // --- TAB 3: HIERARCHY TREE RENDERER ---
  function renderHierarchyTree() {
    el.hierarchyTreeContainer.innerHTML = '';

    // Find all top-level entries (parentId is null)
    const topLevel = state.entries.filter(e => !e.parentId);

    if (topLevel.length === 0) {
      el.hierarchyTreeContainer.innerHTML = `
        <div class="empty-state">
          <h3>No Hierarchies Formed</h3>
          <p>Assign a "Parent Entry" to any entry to construct organizational hierarchies such as Kingdoms, Cities, and Taverns.</p>
        </div>
      `;
      return;
    }

    function renderNode(entry) {
      const nodeEl = document.createElement('div');
      nodeEl.className = 'tree-node';

      const header = document.createElement('div');
      header.className = 'tree-node-header';
      header.innerHTML = `
        <span class="category-tag cat-${entry.category.toLowerCase()}">${escapeHTML(entry.category)}</span>
        <span class="tree-node-title">${escapeHTML(entry.title)}</span>
        <span class="text-xs text-muted">${escapeHTML(entry.status || 'Unknown')}</span>
      `;
      header.addEventListener('click', () => {
        selectEntry(entry.id);
        switchTab('entries');
      });

      nodeEl.appendChild(header);

      // Find children
      const children = state.entries.filter(e => e.parentId === entry.id);
      if (children.length > 0) {
        const childContainer = document.createElement('div');
        childContainer.className = 'tree-children-container';
        children.forEach(child => {
          childContainer.appendChild(renderNode(child));
        });
        nodeEl.appendChild(childContainer);
      }

      return nodeEl;
    }

    topLevel.forEach(entry => {
      el.hierarchyTreeContainer.appendChild(renderNode(entry));
    });
  }

  // Helper to test if an entry has family-related relations
  function hasFamilyConnections(entry) {
    const familyKeywords = ['parent', 'father', 'mother', 'child', 'son', 'daughter', 'spouse', 'husband', 'wife', 'partner', 'married', 'sibling', 'brother', 'sister', 'ancestor', 'lineage'];
    if (Array.isArray(entry.connections)) {
      if (entry.connections.some(c => familyKeywords.some(k => (c.relation || '').toLowerCase().includes(k)))) {
        return true;
      }
    }
    // Also check if any other entry refers to this entry with family terms
    return state.entries.some(e => {
      if (e.id !== entry.id && Array.isArray(e.connections)) {
        return e.connections.some(c => c.targetId === entry.id && familyKeywords.some(k => (c.relation || '').toLowerCase().includes(k)));
      }
      return false;
    });
  }

  // --- PER-CHARACTER & PER-ENTRY FAMILY TREE RENDERER ---
  function renderFamilyTreeForSubject(subjectName, subjectConnections, container, subjectEntryId = null) {
    if (!container) return;
    container.innerHTML = '';

    // Find the primary entry corresponding to this subject (if any)
    let primaryEntry = null;
    if (subjectEntryId) {
      primaryEntry = state.entries.find(e => e.id === subjectEntryId);
    }
    if (!primaryEntry && subjectName) {
      primaryEntry = state.entries.find(e => (e.title || '').trim().toLowerCase() === subjectName.trim().toLowerCase());
    }

    const parents = [];
    const spouses = [];
    const siblings = [];
    const children = [];

    const addedIds = new Set();
    if (primaryEntry) addedIds.add(primaryEntry.id);

    // 1. Process outgoing connections
    const outgoing = Array.isArray(subjectConnections) ? subjectConnections : (primaryEntry && Array.isArray(primaryEntry.connections) ? primaryEntry.connections : []);
    outgoing.forEach(conn => {
      const target = state.entries.find(e => e.id === conn.targetId);
      if (!target || addedIds.has(target.id)) return;

      const rel = (conn.relation || '').toLowerCase();
      if (rel.includes('parent') || rel.includes('father') || rel.includes('mother') || rel.includes('ancestor')) {
        parents.push({ entry: target, role: conn.relation || 'Parent' });
        addedIds.add(target.id);
      } else if (rel.includes('spouse') || rel.includes('husband') || rel.includes('wife') || rel.includes('partner') || rel.includes('married')) {
        spouses.push({ entry: target, role: conn.relation || 'Spouse' });
        addedIds.add(target.id);
      } else if (rel.includes('sibling') || rel.includes('brother') || rel.includes('sister')) {
        siblings.push({ entry: target, role: conn.relation || 'Sibling' });
        addedIds.add(target.id);
      } else if (rel.includes('child') || rel.includes('son') || rel.includes('daughter')) {
        children.push({ entry: target, role: conn.relation || 'Child' });
        addedIds.add(target.id);
      }
    });

    // 2. Process incoming connections from other entries in campaign
    if (primaryEntry) {
      state.entries.forEach(other => {
        if (other.id === primaryEntry.id || addedIds.has(other.id)) return;
        if (!Array.isArray(other.connections)) return;

        other.connections.forEach(conn => {
          if (conn.targetId === primaryEntry.id) {
            const rel = (conn.relation || '').toLowerCase();
            if (rel.includes('child') || rel.includes('son') || rel.includes('daughter')) {
              children.push({ entry: other, role: conn.relation || 'Child' });
              addedIds.add(other.id);
            } else if (rel.includes('parent') || rel.includes('father') || rel.includes('mother')) {
              parents.push({ entry: other, role: conn.relation || 'Parent' });
              addedIds.add(other.id);
            } else if (rel.includes('spouse') || rel.includes('husband') || rel.includes('wife') || rel.includes('partner')) {
              spouses.push({ entry: other, role: conn.relation || 'Spouse' });
              addedIds.add(other.id);
            } else if (rel.includes('sibling') || rel.includes('brother') || rel.includes('sister')) {
              siblings.push({ entry: other, role: conn.relation || 'Sibling' });
              addedIds.add(other.id);
            }
          }
        });
      });
    }

    const hasAnyFamily = parents.length > 0 || spouses.length > 0 || siblings.length > 0 || children.length > 0;

    if (!hasAnyFamily) {
      container.innerHTML = '<div class="family-tree-empty">No family lineage recorded yet. Connect relatives in entry relationships (e.g. "Father of", "Mother of", "Spouse of", "Child of").</div>';
      return;
    }

    // Helper to create a member chip
    function createMemberChip(item) {
      const chip = document.createElement('div');
      chip.className = 'family-member-chip';
      chip.innerHTML = `
        <span class="family-chip-role">${escapeHTML(item.role)}</span>
        <span class="family-chip-name">${escapeHTML(item.entry.title)}</span>
        <span class="family-chip-meta">${escapeHTML(item.entry.category)} • ${escapeHTML(item.entry.status || 'Alive')}</span>
      `;
      chip.addEventListener('click', () => {
        selectEntry(item.entry.id);
        switchTab('entries');
      });
      return chip;
    }

    // Branch 1: Parents & Ancestors
    if (parents.length > 0) {
      const pSec = document.createElement('div');
      pSec.className = 'family-branch-section';
      pSec.innerHTML = '<span class="family-branch-title">👑 Parents & Lineage</span>';
      const grid = document.createElement('div');
      grid.className = 'family-chips-grid';
      parents.forEach(p => grid.appendChild(createMemberChip(p)));
      pSec.appendChild(grid);
      container.appendChild(pSec);
    }

    // Branch 2: Current Generation / Spouses & Siblings
    const curSec = document.createElement('div');
    curSec.className = 'family-branch-section';
    curSec.innerHTML = '<span class="family-branch-title">⚔️ Current Generation & Kin</span>';
    const curGrid = document.createElement('div');
    curGrid.className = 'family-chips-grid';

    const selfChip = document.createElement('div');
    selfChip.className = 'family-member-chip current-subject';
    selfChip.innerHTML = `
      <span class="family-chip-role">This Character</span>
      <span class="family-chip-name">${escapeHTML(subjectName || 'Character')}</span>
      <span class="family-chip-meta">Subject</span>
    `;
    curGrid.appendChild(selfChip);

    spouses.forEach(s => curGrid.appendChild(createMemberChip(s)));
    siblings.forEach(s => curGrid.appendChild(createMemberChip(s)));
    curSec.appendChild(curGrid);
    container.appendChild(curSec);

    // Branch 3: Children & Descendants
    if (children.length > 0) {
      const cSec = document.createElement('div');
      cSec.className = 'family-branch-section';
      cSec.innerHTML = '<span class="family-branch-title">🌱 Children & Descendants</span>';
      const grid = document.createElement('div');
      grid.className = 'family-chips-grid';
      children.forEach(c => grid.appendChild(createMemberChip(c)));
      cSec.appendChild(grid);
      container.appendChild(cSec);
    }
  }

  // --- TAB: SESSION NOTES & CHAPTERS ---

  function renderSessionsView() {
    renderChapterFilters();
    renderSessionsList();
    renderSessionDetail();
  }

  function getCampaignChapters() {
    const chapterSet = new Set(['General']);
    const activeCamp = state.campaigns.find(c => c.id === state.activeCampaignId);
    if (activeCamp && Array.isArray(activeCamp.chapters)) {
      activeCamp.chapters.forEach(ch => {
        if (ch && ch.trim()) chapterSet.add(ch.trim());
      });
    }
    // Also collect chapters from current sessions in this campaign
    state.sessions
      .filter(s => s.campaignId === state.activeCampaignId)
      .forEach(s => {
        if (s.chapter && s.chapter.trim()) chapterSet.add(s.chapter.trim());
      });
    return Array.from(chapterSet);
  }

  function renderChapterFilters() {
    if (!el.chapterFilterContainer) return;
    state.chapters = getCampaignChapters();
    el.chapterFilterContainer.innerHTML = '';

    const campSessions = state.sessions.filter(s => s.campaignId === state.activeCampaignId);

    // 1. General (All) Button - Selected by default, includes all sessions
    const generalBtn = document.createElement('button');
    generalBtn.className = `filter-pill ${state.selectedChapter === 'General' ? 'active' : ''}`;
    generalBtn.dataset.chapter = 'General';
    generalBtn.innerHTML = `General (All) <span class="badge" style="margin-left: 4px;">${campSessions.length}</span>`;
    generalBtn.title = 'Includes everything across all chapters';
    generalBtn.addEventListener('click', () => {
      state.selectedChapter = 'General';
      renderChapterFilters();
      renderSessionsList();
    });
    el.chapterFilterContainer.appendChild(generalBtn);

    // 2. Specific Chapter Buttons
    state.chapters.forEach(ch => {
      if (ch === 'General') return;
      const count = campSessions.filter(s => s.chapter === ch).length;
      const btn = document.createElement('button');
      btn.className = `filter-pill ${state.selectedChapter === ch ? 'active' : ''}`;
      btn.dataset.chapter = ch;
      btn.innerHTML = `${escapeHTML(ch)} <span class="badge" style="margin-left: 4px;">${count}</span>`;
      btn.addEventListener('click', () => {
        state.selectedChapter = ch;
        renderChapterFilters();
        renderSessionsList();
      });
      el.chapterFilterContainer.appendChild(btn);
    });

    // Update Dropdown Filter
    if (el.sessionChapterSelectFilter) {
      el.sessionChapterSelectFilter.innerHTML = '<option value="General">All Chapters (General)</option>';
      state.chapters.forEach(ch => {
        if (ch === 'General') return;
        const opt = document.createElement('option');
        opt.value = ch;
        opt.textContent = ch;
        if (state.selectedChapter === ch) opt.selected = true;
        el.sessionChapterSelectFilter.appendChild(opt);
      });
      if (state.selectedChapter === 'General') {
        el.sessionChapterSelectFilter.value = 'General';
      }
    }

    // Update Active Chapter description text
    if (el.activeChapterDesc) {
      if (state.selectedChapter === 'General') {
        el.activeChapterDesc.textContent = 'Showing all sessions';
      } else {
        el.activeChapterDesc.textContent = `Filtered to "${state.selectedChapter}"`;
      }
    }
  }

  function getFilteredSessions() {
    let result = state.sessions.filter(s => {
      if (s.campaignId && s.campaignId !== state.activeCampaignId) return false;

      // Chapter Filter: 'General' includes everything!
      if (state.selectedChapter && state.selectedChapter !== 'General') {
        if (s.chapter !== state.selectedChapter) return false;
      }

      // Search Query
      if (state.searchQuery) {
        const q = state.searchQuery.toLowerCase();
        const matchesTitle = s.title && s.title.toLowerCase().includes(q);
        const matchesChapter = s.chapter && s.chapter.toLowerCase().includes(q);
        const matchesNotes = s.notes && s.notes.toLowerCase().includes(q);
        const matchesSummary = s.summary && s.summary.toLowerCase().includes(q);
        if (!matchesTitle && !matchesChapter && !matchesNotes && !matchesSummary) return false;
      }

      return true;
    });

    // Sorting
    result.sort((a, b) => {
      switch (state.sessionSortOption) {
        case 'num-asc':
          return (a.sessionNumber || 0) - (b.sessionNumber || 0);
        case 'date-desc':
          return new Date(b.date || b.createdAt || 0) - new Date(a.date || a.createdAt || 0);
        case 'date-asc':
          return new Date(a.date || a.createdAt || 0) - new Date(b.date || b.createdAt || 0);
        case 'updated':
          return new Date(b.updatedAt || b.createdAt || 0) - new Date(a.updatedAt || a.createdAt || 0);
        case 'alpha':
          return (a.title || '').localeCompare(b.title || '');
        case 'num-desc':
        default:
          return (b.sessionNumber || 0) - (a.sessionNumber || 0);
      }
    });

    return result;
  }

  function renderSessionsList() {
    if (!el.sessionsList || !el.sessionsEmptyState) return;
    const filtered = getFilteredSessions();
    el.sessionsList.innerHTML = '';

    if (filtered.length === 0) {
      el.sessionsEmptyState.style.display = 'flex';
      return;
    }

    el.sessionsEmptyState.style.display = 'none';

    filtered.forEach(session => {
      const card = document.createElement('div');
      const isSelected = session.id === state.selectedSessionId;
      card.className = `session-card ${isSelected ? 'active' : ''}`;
      
      const numLabel = session.sessionNumber ? `Session #${session.sessionNumber}` : 'Session';
      const chapterLabel = session.chapter || 'General';
      const dateLabel = session.date || new Date(session.createdAt || Date.now()).toISOString().slice(0, 10);
      const snippet = session.summary || (session.notes ? session.notes.slice(0, 140).replace(/@\[(.*?)\](\(.*?\))?/g, '$1') : 'No chronicle text recorded.');

      card.innerHTML = `
        <div class="session-card-header">
          <div class="session-card-title-group">
            <span class="session-card-title">${escapeHTML(session.title)}</span>
            <div class="session-card-chips">
              <span class="session-num-badge">${escapeHTML(numLabel)}</span>
              <span class="chapter-badge">📜 ${escapeHTML(chapterLabel)}</span>
              <span class="date-badge">📅 ${escapeHTML(dateLabel)}</span>
            </div>
          </div>
        </div>
        <p class="session-card-snippet">${escapeHTML(snippet)}</p>
      `;

      card.addEventListener('click', () => {
        selectSession(session.id);
      });

      el.sessionsList.appendChild(card);
    });
  }

  function selectSession(id) {
    state.selectedSessionId = id;
    const cards = el.sessionsList.querySelectorAll('.session-card');
    const filtered = getFilteredSessions();
    cards.forEach((card, idx) => {
      card.classList.toggle('active', filtered[idx]?.id === id);
    });
    renderSessionDetail();
  }

  function renderSessionDetail() {
    if (!el.sessionDetailContent || !el.noSessionSelected) return;
    const session = state.sessions.find(s => s.id === state.selectedSessionId);

    if (!session) {
      el.noSessionSelected.style.display = 'flex';
      el.sessionDetailContent.style.display = 'none';
      return;
    }

    el.noSessionSelected.style.display = 'none';
    el.sessionDetailContent.style.display = 'flex';

    el.detailSessionNumBadge.textContent = session.sessionNumber ? `Session #${session.sessionNumber}` : 'Session Note';
    el.detailSessionChapterBadge.textContent = `📜 Chapter: ${session.chapter || 'General'}`;
    el.detailSessionChapterBadge.title = 'Click to filter by this chapter';
    el.detailSessionChapterBadge.style.cursor = 'pointer';
    el.detailSessionChapterBadge.onclick = () => {
      state.selectedChapter = session.chapter || 'General';
      renderChapterFilters();
      renderSessionsList();
    };

    el.detailSessionDateBadge.textContent = `📅 Date: ${session.date || new Date(session.createdAt || Date.now()).toISOString().slice(0, 10)}`;
    el.detailSessionTitle.textContent = session.title;

    // Attendees / Heroes present
    el.detailSessionAttendeesRow.innerHTML = '';
    if (Array.isArray(session.attendees) && session.attendees.length > 0) {
      session.attendees.forEach(nameOrId => {
        const char = state.characters.find(c => c.id === nameOrId || c.name === nameOrId);
        const name = char ? char.name : nameOrId;
        const chip = document.createElement('span');
        chip.className = 'session-attendee-chip';
        chip.innerHTML = `🛡️ ${escapeHTML(name)}`;
        el.detailSessionAttendeesRow.appendChild(chip);
      });
      el.detailSessionAttendeesRow.style.display = 'flex';
    } else {
      el.detailSessionAttendeesRow.style.display = 'none';
    }

    // Summary / Logline
    if (session.summary && session.summary.trim()) {
      el.detailSessionSummarySection.style.display = 'block';
      el.detailSessionSummaryText.textContent = session.summary;
    } else {
      el.detailSessionSummarySection.style.display = 'none';
    }

    // Chronicle Notes
    el.detailSessionNotesBody.innerHTML = renderMarkdownWithMentions(session.notes || '*(No chronicle text recorded for this session yet.)*');
    el.detailSessionNotesBody.querySelectorAll('.mention-link').forEach(link => {
      link.addEventListener('click', e => {
        e.preventDefault();
        const targetId = link.dataset.entryId;
        if (targetId) {
          selectEntry(targetId);
          switchTab('entries');
        }
      });
    });

    // Secret Notes (DM only)
    if (state.currentMode === 'dm' && session.secretNotes && session.secretNotes.trim()) {
      el.detailSessionSecretNotesSection.style.display = 'block';
      el.detailSessionSecretNotesBody.innerHTML = renderMarkdownWithMentions(session.secretNotes);
      el.detailSessionSecretNotesBody.querySelectorAll('.mention-link').forEach(link => {
        link.addEventListener('click', e => {
          e.preventDefault();
          const targetId = link.dataset.entryId;
          if (targetId) {
            selectEntry(targetId);
            switchTab('entries');
          }
        });
      });
    } else {
      el.detailSessionSecretNotesSection.style.display = 'none';
    }

    // Timestamps
    const createdStr = session.createdAt ? new Date(session.createdAt).toLocaleString() : 'Unknown';
    const updatedStr = session.updatedAt ? new Date(session.updatedAt).toLocaleString() : createdStr;
    el.detailSessionTimestamps.textContent = `Played: ${session.date || 'Today'} | Logged: ${createdStr} | Updated: ${updatedStr}`;
  }

  function openSessionModal(session = null) {
    el.sessionForm.reset();
    el.sessionFormNewChapterWrapper.style.display = 'none';
    el.sessionFormNewChapter.value = '';

    const todayStr = new Date().toISOString().slice(0, 10);
    const campSessions = state.sessions.filter(s => s.campaignId === state.activeCampaignId);
    state.chapters = getCampaignChapters();

    // Populate Chapter Selector
    el.sessionFormChapterSelect.innerHTML = '<option value="General">General (Default - Includes Everything)</option>';
    state.chapters.forEach(ch => {
      if (ch === 'General') return;
      const opt = document.createElement('option');
      opt.value = ch;
      opt.textContent = ch;
      el.sessionFormChapterSelect.appendChild(opt);
    });
    const newOpt = document.createElement('option');
    newOpt.value = '__new__';
    newOpt.textContent = '+ Name a New Chapter...';
    el.sessionFormChapterSelect.appendChild(newOpt);

    // Populate Attendees Checkbox Chips
    el.sessionAttendeesPicker.innerHTML = '';
    const campCharacters = state.characters.filter(c => !c.campaignId || c.campaignId === state.activeCampaignId);
    if (campCharacters.length === 0) {
      el.sessionAttendeesPicker.innerHTML = '<span class="text-xs text-muted">No heroes in party roster yet. You can add them under the Party tab.</span>';
    } else {
      campCharacters.forEach(char => {
        const isPresent = session && Array.isArray(session.attendees) && (session.attendees.includes(char.id) || session.attendees.includes(char.name));
        const label = document.createElement('label');
        label.className = `attendee-picker-pill ${isPresent ? 'selected' : ''}`;
        label.innerHTML = `
          <input type="checkbox" name="sessionAttendee" value="${char.id}" ${isPresent ? 'checked' : ''}>
          <span>🛡️ ${escapeHTML(char.name)} (Lvl ${char.level})</span>
        `;
        label.querySelector('input').addEventListener('change', (e) => {
          label.classList.toggle('selected', e.target.checked);
        });
        el.sessionAttendeesPicker.appendChild(label);
      });
    }

    if (session) {
      el.sessionModalTitle.textContent = 'Edit Session Note';
      el.sessionFormId.value = session.id;
      el.sessionFormTitle.value = session.title;
      el.sessionFormNumber.value = session.sessionNumber || 1;
      el.sessionFormDate.value = session.date || todayStr;
      el.sessionFormChapterSelect.value = session.chapter || 'General';
      el.sessionFormSummary.value = session.summary || '';
      el.sessionFormNotes.value = session.notes || '';
      el.sessionFormSecretNotes.value = session.secretNotes || '';
    } else {
      el.sessionModalTitle.textContent = 'Log Game Session';
      el.sessionFormId.value = '';
      // Auto-increment session number
      el.sessionFormNumber.value = campSessions.length + 1;
      // Auto-save date it happened (defaults automatically to today's date)
      el.sessionFormDate.value = todayStr;
      // Default chapter is 'General' or active chapter filter
      if (state.selectedChapter && state.selectedChapter !== '__new__') {
        el.sessionFormChapterSelect.value = state.selectedChapter;
      } else {
        el.sessionFormChapterSelect.value = 'General';
      }
      el.sessionFormSummary.value = '';
      el.sessionFormNotes.value = '';
      el.sessionFormSecretNotes.value = '';
    }

    // DM Secret notes field visibility
    el.sessionDmSecretNotesField.style.display = state.currentMode === 'dm' ? 'block' : 'none';

    el.sessionModal.style.display = 'flex';
    el.sessionFormTitle.focus();
  }

  function openChapterModal() {
    el.chapterForm.reset();
    el.chapterModal.style.display = 'flex';
    el.chapterFormName.focus();
  }

  // --- TAB 4: ADVENTURING PARTY VIEW ---
  function renderPartyView() {
    if (!el.partyGrid || !el.partyEmptyState) return;
    el.partyGrid.innerHTML = '';

    if (state.characters.length === 0) {
      el.partyEmptyState.style.display = 'block';
      el.partyGrid.style.display = 'none';
      return;
    }

    el.partyEmptyState.style.display = 'none';
    el.partyGrid.style.display = 'grid';

    state.characters.forEach(char => {
      const isActive = char.id === state.activeCharacterId;
      const card = document.createElement('article');
      card.className = `party-member-card ${isActive ? 'is-active-hero' : ''}`;

      const linkedCount = Array.isArray(char.linkedEntryIds) ? char.linkedEntryIds.length : 0;

      card.innerHTML = `
        <header class="party-card-header">
          <div class="party-card-identity">
            <div class="party-hero-avatar">${char.name.slice(0, 2).toUpperCase()}</div>
            <div class="party-card-titles">
              <h3 class="party-hero-name">${escapeHTML(char.name)}</h3>
              <span class="party-hero-meta">Level ${char.level} ${escapeHTML(char.race || 'Adventurer')} • ${escapeHTML(char.characterClass || '')}</span>
            </div>
          </div>
          <div>
            ${isActive ? '<span class="party-hero-badge">⭐ Active Hero</span>' : `<button class="btn btn-xs btn-secondary set-active-party-btn" data-char-id="${char.id}">Set Active</button>`}
          </div>
        </header>

        <div class="char-alignment-pill">${escapeHTML(char.alignment || 'True Neutral')}</div>

        <div class="party-card-bio">
          ${escapeHTML(char.notes || 'No backstory chronicle recorded for this hero.')}
        </div>

        <div class="party-card-family-section">
          <div class="family-branch-title" style="margin-bottom: 6px;">Family Tree & Lineage</div>
          <div class="party-card-family-container"></div>
        </div>

        <div class="party-card-stats">
          <span>📖 ${linkedCount} Discoveries Logged</span>
          <span>Adventurer Ready</span>
        </div>

        <footer class="party-card-actions">
          <button class="btn btn-sm btn-primary open-dossier-btn" data-char-id="${char.id}">Journal & Dossier</button>
          <button class="btn btn-sm btn-secondary edit-party-hero-btn" data-char-id="${char.id}">Edit</button>
          <button class="btn btn-sm btn-danger-ghost delete-party-hero-btn" data-char-id="${char.id}">Delete</button>
        </footer>
      `;

      // Render family tree under this character card
      const familyCont = card.querySelector('.party-card-family-container');
      renderFamilyTreeForSubject(char.name, null, familyCont);

      // Event listeners
      const setActiveBtn = card.querySelector('.set-active-party-btn');
      if (setActiveBtn) {
        setActiveBtn.addEventListener('click', async () => {
          await api.setActiveCharacter(char.id);
          state.activeCharacterId = char.id;
          updateUI();
        });
      }

      card.querySelector('.open-dossier-btn').addEventListener('click', () => {
        state.selectedCharacterId = char.id;
        switchTab('dossier');
      });

      card.querySelector('.edit-party-hero-btn').addEventListener('click', () => {
        openCharacterModal(char);
      });

      card.querySelector('.delete-party-hero-btn').addEventListener('click', async () => {
        if (confirm(`Permanently delete ${char.name} from the party?`)) {
          await api.deleteCharacter(char.id);
          state.characters = state.characters.filter(c => c.id !== char.id);
          if (state.activeCharacterId === char.id) {
            state.activeCharacterId = state.characters[0]?.id || null;
          }
          if (state.selectedCharacterId === char.id) {
            state.selectedCharacterId = state.activeCharacterId;
          }
          updateUI();
        }
      });

      el.partyGrid.appendChild(card);
    });
  }

  // --- TAB 5: CHARACTER DOSSIER (PLAYER MODE) ---
  function renderCharacterRoster() {
    el.characterList.innerHTML = '';

    if (state.characters.length === 0) {
      el.characterList.innerHTML = '<div class="empty-state" style="padding: 20px 10px;"><p>No heroes created yet.</p></div>';
      return;
    }

    state.characters.forEach(char => {
      const card = document.createElement('div');
      card.className = `character-item-card ${char.id === state.selectedCharacterId ? 'active' : ''}`;
      card.innerHTML = `
        <div class="char-avatar">${char.name.slice(0, 2).toUpperCase()}</div>
        <div class="char-info">
          <div class="char-name">${escapeHTML(char.name)}</div>
          <div class="char-meta">Lvl ${char.level} ${escapeHTML(char.characterClass)}</div>
        </div>
      `;
      card.addEventListener('click', () => {
        state.selectedCharacterId = char.id;
        renderCharacterRoster();
        renderCharacterSheet();
      });
      el.characterList.appendChild(card);
    });
  }

  function renderCharacterSheet() {
    const char = state.characters.find(c => c.id === (state.selectedCharacterId || state.activeCharacterId));

    if (!char) {
      el.noCharacterSelected.style.display = 'flex';
      el.characterSheet.style.display = 'none';
      return;
    }

    el.noCharacterSelected.style.display = 'none';
    el.characterSheet.style.display = 'flex';

    el.sheetCharName.textContent = char.name;
    el.sheetCharMeta.textContent = `Level ${char.level} ${char.race} ${char.characterClass}`;
    el.sheetCharAlignment.textContent = char.alignment;
    el.sheetCharNotes.innerHTML = renderMarkdownWithMentions(char.notes || '*(No character background or objectives recorded.)*');

    // Render Family Tree & Lineage under this Character
    if (el.sheetFamilyTreeContainer) {
      renderFamilyTreeForSubject(char.name, null, el.sheetFamilyTreeContainer);
    }

    // Active Character Button State
    if (char.id === state.activeCharacterId) {
      el.setActiveCharBtn.textContent = 'Active Hero (Current)';
      el.setActiveCharBtn.disabled = true;
    } else {
      el.setActiveCharBtn.textContent = 'Set as Active Hero';
      el.setActiveCharBtn.disabled = false;
    }

    // Render linked entries
    const linkedIds = Array.isArray(char.linkedEntryIds) ? char.linkedEntryIds : [];
    el.sheetLinkedCountBadge.textContent = linkedIds.length;
    el.sheetLinkedEntriesList.innerHTML = '';

    if (linkedIds.length === 0) {
      el.sheetLinkedEntriesList.innerHTML = '<span class="text-muted text-sm">No campaign entries linked yet. In Player Mode, entries you view or create are automatically attached to this character!</span>';
      return;
    }

    linkedIds.forEach(id => {
      const entry = state.entries.find(e => e.id === id);
      if (!entry) return;
      const card = document.createElement('div');
      card.className = 'entry-card-item';
      card.innerHTML = `
        <div class="entry-card-top">
          <span class="entry-card-title">${escapeHTML(entry.title)}</span>
          <span class="category-tag cat-${entry.category.toLowerCase()}">${escapeHTML(entry.category)}</span>
        </div>
        <div class="entry-card-footer">
          <span class="text-xs text-muted">${escapeHTML(entry.status || 'Unknown')}</span>
          <span class="text-xs text-muted">View Entry &rarr;</span>
        </div>
      `;
      card.addEventListener('click', () => {
        selectEntry(entry.id);
        switchTab('entries');
      });
      el.sheetLinkedEntriesList.appendChild(card);
    });
  }

  // --- MODAL HANDLING & FORMS ---
  function openEntryModal(entry = null) {
    el.entryForm.reset();
    el.attributesContainer.innerHTML = '';
    el.connectionsContainer.innerHTML = '';

    if (entry) {
      el.entryModalTitle.textContent = 'Edit Notebook Entry';
      el.entryFormId.value = entry.id;
      el.entryFormTitle.value = entry.title;
      el.entryFormCategory.value = entry.category;
      el.entryFormStatus.value = entry.status || 'Unknown';
      el.entryFormFriendliness.value = entry.friendliness || 'Neutral';
      el.entryFormParent.value = entry.parentId || '';
      el.entryFormTags.value = Array.isArray(entry.tags) ? entry.tags.join(', ') : '';
      el.entryFormNotes.value = entry.notes || '';
      el.entryFormSecretNotes.value = entry.secretNotes || '';

      if (Array.isArray(entry.attributes)) {
        entry.attributes.forEach(attr => addAttributeRow(attr.key, attr.value));
      }
      if (Array.isArray(entry.connections)) {
        entry.connections.forEach(conn => addConnectionRow(conn.targetId, conn.relation));
      }
    } else {
      el.entryModalTitle.textContent = 'Create Notebook Entry';
      el.entryFormId.value = '';
      if (state.selectedCategory !== 'all') {
        el.entryFormCategory.value = state.selectedCategory;
      }
    }

    el.entryModal.style.display = 'flex';
    el.entryFormTitle.focus();
  }

  function addAttributeRow(key = '', value = '') {
    const row = document.createElement('div');
    row.className = 'dynamic-row';
    row.innerHTML = `
      <input type="text" placeholder="Key (e.g. Armor Class)" value="${escapeHTML(key)}" class="attr-key-input">
      <input type="text" placeholder="Value (e.g. 18 Plate)" value="${escapeHTML(value)}" class="attr-val-input">
      <button type="button" class="btn btn-xs btn-danger-ghost remove-row-btn">&times;</button>
    `;
    row.querySelector('.remove-row-btn').addEventListener('click', () => row.remove());
    el.attributesContainer.appendChild(row);
  }

  function addConnectionRow(targetId = '', relation = '') {
    const row = document.createElement('div');
    row.className = 'dynamic-row';

    let options = '<option value="">-- Choose Target Entry --</option>';
    state.entries.forEach(e => {
      const selected = e.id === targetId ? 'selected' : '';
      options += `<option value="${e.id}" ${selected}>${escapeHTML(e.title)} (${e.category})</option>`;
    });

    row.innerHTML = `
      <select class="conn-target-select">${options}</select>
      <input type="text" placeholder="Relationship (e.g. Ally of, Located in, Parent of)" value="${escapeHTML(relation)}" class="conn-relation-input">
      <button type="button" class="btn btn-xs btn-danger-ghost remove-row-btn">&times;</button>
    `;
    row.querySelector('.remove-row-btn').addEventListener('click', () => row.remove());
    el.connectionsContainer.appendChild(row);
  }

  function openCharacterModal(char = null) {
    el.characterForm.reset();
    if (char) {
      el.characterModalTitle.textContent = 'Edit Player Character';
      el.charFormId.value = char.id;
      el.charFormName.value = char.name;
      el.charFormRace.value = char.race;
      el.charFormClass.value = char.characterClass;
      el.charFormLevel.value = char.level;
      el.charFormAlignment.value = char.alignment;
      el.charFormNotes.value = char.notes;
    } else {
      el.characterModalTitle.textContent = 'Create Player Character';
      el.charFormId.value = '';
    }
    el.characterModal.style.display = 'flex';
    el.charFormName.focus();
  }

  function openCampaignModal() {
    el.campaignsContainer.innerHTML = '';
    state.campaigns.forEach(camp => {
      const item = document.createElement('div');
      item.className = 'entry-card-item';
      const isActive = camp.id === state.activeCampaignId;
      item.innerHTML = `
        <div class="entry-card-top">
          <strong>${escapeHTML(camp.name)}</strong>
          ${isActive ? '<span class="category-tag cat-item">Active</span>' : ''}
        </div>
        <p class="text-xs text-muted">${escapeHTML(camp.description || 'No description')}</p>
      `;
      if (!isActive) {
        item.style.cursor = 'pointer';
        item.addEventListener('click', async () => {
          await api.switchCampaign(camp.id);
          state.activeCampaignId = camp.id;
          el.campaignModal.style.display = 'none';
          await loadInitialData();
        });
      }
      el.campaignsContainer.appendChild(item);
    });
    el.campaignModal.style.display = 'flex';
  }

  // --- EVENT LISTENERS ---
  function setupEventListeners() {
    // Mode Switcher
    el.dmModeBtn.addEventListener('click', () => {
      state.currentMode = 'dm';
      updateModeDisplay();
      renderEntryDetail();
    });

    el.playerModeBtn.addEventListener('click', () => {
      state.currentMode = 'player';
      updateModeDisplay();
      renderEntryDetail();
    });

    // Character Pill click
    el.characterPill.addEventListener('click', () => {
      switchTab('dossier');
    });

    // Navigation Tabs
    el.navTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const targetTab = tab.dataset.tab;
        switchTab(targetTab);
      });
    });

    // Global Search
    el.globalSearchInput.addEventListener('input', e => {
      state.searchQuery = e.target.value;
      renderEntriesList();
    });

    window.addEventListener('keydown', e => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        el.globalSearchInput.focus();
      }
    });

    // Category Filter Buttons
    el.categoryFilterContainer.addEventListener('click', e => {
      if (e.target.classList.contains('filter-pill')) {
        el.categoryFilterContainer.querySelectorAll('.filter-pill').forEach(btn => btn.classList.remove('active'));
        e.target.classList.add('active');
        state.selectedCategory = e.target.dataset.category;
        renderEntriesList();
      }
    });

    // Sorting and Status Selects
    el.sortSelect.addEventListener('change', e => {
      state.sortOption = e.target.value;
      renderEntriesList();
    });

    el.statusFilterSelect.addEventListener('change', e => {
      state.selectedStatus = e.target.value;
      renderEntriesList();
    });

    // New Entry Button
    el.newEntryBtn.addEventListener('click', () => {
      openEntryModal();
    });

    // Edit and Delete Entry
    el.editEntryBtn.addEventListener('click', () => {
      const entry = state.entries.find(e => e.id === state.selectedEntryId);
      if (entry) openEntryModal(entry);
    });

    el.deleteEntryBtn.addEventListener('click', async () => {
      const entry = state.entries.find(e => e.id === state.selectedEntryId);
      if (!entry) return;
      if (confirm(`Are you sure you want to permanently delete "${entry.title}"?`)) {
        await api.deleteEntry(entry.id);
        state.entries = state.entries.filter(e => e.id !== entry.id);
        state.selectedEntryId = null;
        updateUI();
      }
    });

    // Player Link/Unlink Button
    el.playerLinkBtn.addEventListener('click', async () => {
      if (!state.activeCharacterId || !state.selectedEntryId) return;
      const char = state.characters.find(c => c.id === state.activeCharacterId);
      if (!char) return;

      if (!Array.isArray(char.linkedEntryIds)) char.linkedEntryIds = [];
      const idx = char.linkedEntryIds.indexOf(state.selectedEntryId);

      if (idx === -1) {
        char.linkedEntryIds.push(state.selectedEntryId);
      } else {
        char.linkedEntryIds.splice(idx, 1);
      }

      await api.saveCharacter(char);
      renderEntryDetail();
      updateBadges();
      renderCharacterRoster();
    });

    // Entry Form Submit
    el.entryForm.addEventListener('submit', async e => {
      e.preventDefault();

      // Gather attributes
      const attributes = [];
      el.attributesContainer.querySelectorAll('.dynamic-row').forEach(row => {
        const key = row.querySelector('.attr-key-input')?.value.trim();
        const value = row.querySelector('.attr-val-input')?.value.trim();
        if (key || value) {
          attributes.push({ key: key || '', value: value || '' });
        }
      });

      // Gather connections
      const connections = [];
      el.connectionsContainer.querySelectorAll('.dynamic-row').forEach(row => {
        const targetId = row.querySelector('.conn-target-select')?.value;
        const relation = row.querySelector('.conn-relation-input')?.value.trim();
        if (targetId) {
          connections.push({ targetId, relation: relation || 'Related to' });
        }
      });

      // Gather tags
      const tags = el.entryFormTags.value
        .split(',')
        .map(t => t.trim())
        .filter(t => t.length > 0);

      const entryPayload = {
        id: el.entryFormId.value || undefined,
        campaignId: state.activeCampaignId,
        title: el.entryFormTitle.value.trim(),
        category: el.entryFormCategory.value,
        status: el.entryFormStatus.value,
        friendliness: el.entryFormFriendliness.value,
        parentId: el.entryFormParent.value || null,
        tags,
        attributes,
        connections,
        notes: el.entryFormNotes.value,
        secretNotes: el.entryFormSecretNotes.value
      };

      const saved = await api.saveEntry(entryPayload);

      // Update state
      const existingIdx = state.entries.findIndex(e => e.id === saved.id);
      if (existingIdx !== -1) {
        state.entries[existingIdx] = saved;
      } else {
        state.entries.unshift(saved);
      }

      // Auto-link in Player Mode
      if (state.currentMode === 'player' && state.activeCharacterId) {
        await autoLinkEntryToActiveCharacter(saved.id);
      }

      el.entryModal.style.display = 'none';
      selectEntry(saved.id);
      updateUI();
    });

    el.addAttributeBtn.addEventListener('click', () => addAttributeRow());
    el.addConnectionBtn.addEventListener('click', () => addConnectionRow());

    // Character Form Submit
    el.characterForm.addEventListener('submit', async e => {
      e.preventDefault();
      const charPayload = {
        id: el.charFormId.value || undefined,
        name: el.charFormName.value.trim(),
        race: el.charFormRace.value.trim(),
        characterClass: el.charFormClass.value.trim(),
        level: parseInt(el.charFormLevel.value, 10) || 1,
        alignment: el.charFormAlignment.value,
        notes: el.charFormNotes.value
      };

      const saved = await api.saveCharacter(charPayload);
      const idx = state.characters.findIndex(c => c.id === saved.id);
      if (idx !== -1) {
        state.characters[idx] = saved;
      } else {
        state.characters.push(saved);
        if (!state.activeCharacterId) {
          state.activeCharacterId = saved.id;
        }
      }

      state.selectedCharacterId = saved.id;
      el.characterModal.style.display = 'none';
      updateUI();
    });

    el.newCharacterBtn.addEventListener('click', () => openCharacterModal());
    el.editCharBtn.addEventListener('click', () => {
      const char = state.characters.find(c => c.id === (state.selectedCharacterId || state.activeCharacterId));
      if (char) openCharacterModal(char);
    });

    el.deleteCharBtn.addEventListener('click', async () => {
      const char = state.characters.find(c => c.id === (state.selectedCharacterId || state.activeCharacterId));
      if (!char) return;
      if (confirm(`Delete character "${char.name}"?`)) {
        await api.deleteCharacter(char.id);
        state.characters = state.characters.filter(c => c.id !== char.id);
        if (state.activeCharacterId === char.id) {
          state.activeCharacterId = state.characters[0]?.id || null;
        }
        state.selectedCharacterId = state.activeCharacterId;
        updateUI();
      }
    });

    el.setActiveCharBtn.addEventListener('click', async () => {
      if (state.selectedCharacterId) {
        await api.setActiveCharacter(state.selectedCharacterId);
        state.activeCharacterId = state.selectedCharacterId;
        updateUI();
      }
    });

    // Navigation: Return to Home / Notebooks
    if (el.campaignBtn) {
      el.campaignBtn.addEventListener('click', () => showHomePage());
    }
    if (el.returnHomeBtn) {
      el.returnHomeBtn.addEventListener('click', () => showHomePage());
    }
    if (el.homeThemeSwitcherBtn) {
      el.homeThemeSwitcherBtn.addEventListener('click', () => {
        el.themeSettingsModal.style.display = 'flex';
      });
    }

    // Role choice radio styling & smart toggles
    document.querySelectorAll('input[name="notebookRoleChoice"]').forEach(radio => {
      radio.addEventListener('change', () => {
        document.querySelectorAll('.mode-choice-card').forEach(c => c.classList.remove('active'));
        radio.closest('.mode-choice-card')?.classList.add('active');
        if (el.settingEnableSecrets && el.settingAutoLink) {
          if (radio.value === 'dm') {
            el.settingEnableSecrets.checked = true;
            el.settingAutoLink.checked = false;
          } else {
            el.settingEnableSecrets.checked = false;
            el.settingAutoLink.checked = true;
          }
        }
      });
    });

    // Create Notebook Form (with brief settings: role mode, rule system, feature toggles)
    el.createNotebookForm.addEventListener('submit', async e => {
      e.preventDefault();
      const name = el.newNotebookName.value.trim();
      const desc = el.newNotebookDesc.value.trim();
      const mode = document.querySelector('input[name="notebookRoleChoice"]:checked')?.value || 'dm';
      const system = el.notebookRuleSystem ? el.notebookRuleSystem.value : 'D&D 5e';
      const settings = {
        allowDmSecrets: el.settingEnableSecrets ? el.settingEnableSecrets.checked : true,
        autoLinkDiscoveries: el.settingAutoLink ? el.settingAutoLink.checked : true
      };

      const newCamp = await api.createCampaign(name, desc, mode, system, settings, false);
      state.campaigns.push(newCamp);
      el.createNotebookForm.reset();
      showWorkspace(newCamp.id, mode);
    });

    // Start Temporary Scratchpad
    el.startTempNotepadBtn.addEventListener('click', () => {
      showWorkspace('temporary', 'dm');
    });

    // Save Temporary Scratchpad as Permanent Notebook
    el.saveTempNotepadBtn.addEventListener('click', () => {
      el.saveTempForm.reset();
      el.saveTempModal.style.display = 'flex';
      el.saveTempName.focus();
    });

    el.exitTempNotepadBtn.addEventListener('click', () => {
      showHomePage();
    });

    el.saveTempForm.addEventListener('submit', async e => {
      e.preventDefault();
      const name = el.saveTempName.value.trim();
      const desc = el.saveTempDesc.value.trim();
      const mode = document.querySelector('input[name="saveTempModeChoice"]:checked')?.value || 'dm';

      const newCamp = await api.createCampaign(name, desc, mode, 'D&D 5e', {}, true);
      state.campaigns.push(newCamp);
      el.saveTempModal.style.display = 'none';

      // Reload data to reflect converted entries and enter workspace
      const refreshed = await api.fetchAllData();
      state.entries = refreshed.entries || [];
      state.characters = refreshed.characters || [];
      showWorkspace(newCamp.id, mode);
    });

    // Custom Category Form
    el.addCategoryBtn.addEventListener('click', () => {
      el.categoryForm.reset();
      el.categoryModal.style.display = 'flex';
      el.catFormName.focus();
    });

    el.categoryForm.addEventListener('submit', async e => {
      e.preventDefault();
      const newCat = await api.addCategory(el.catFormName.value.trim(), el.catFormColor.value);
      state.customCategories.push(newCat);
      el.categoryModal.style.display = 'none';
      updateCategoryFilters();
    });

    // Theme Switcher & Settings Modal
    if (el.themeSwitcherBtn) {
      el.themeSwitcherBtn.addEventListener('click', () => {
        el.themeSettingsModal.style.display = 'flex';
      });
    }

    if (el.openThemeSettingsBtn) {
      el.openThemeSettingsBtn.addEventListener('click', () => {
        el.optionsDropdown.classList.remove('show');
        el.themeSettingsModal.style.display = 'flex';
      });
    }

    if (el.themeSelectCards) {
      el.themeSelectCards.forEach(card => {
        card.addEventListener('click', () => {
          setTheme(card.dataset.themeId);
        });
      });
    }

    // Backup & Settings
    el.optionsMenuBtn.addEventListener('click', e => {
      e.stopPropagation();
      el.optionsDropdown.classList.toggle('show');
    });

    document.addEventListener('click', e => {
      if (!el.optionsDropdown.contains(e.target) && e.target !== el.optionsMenuBtn) {
        el.optionsDropdown.classList.remove('show');
      }
    });

    el.exportDataBtn.addEventListener('click', () => {
      window.location.href = '/api/export';
    });

    el.importFileInput.addEventListener('change', async e => {
      const file = e.target.files[0];
      if (!file) return;

      try {
        const text = await file.text();
        const json = JSON.parse(text);
        if (confirm('Importing this backup will overwrite the current notebook database. Proceed?')) {
          await api.importBackup(json);
          await loadInitialData();
          alert('Notebook restored successfully.');
        }
      } catch (err) {
        alert('Invalid JSON file format.');
      }
    });

    el.resetDataBtn.addEventListener('click', async () => {
      if (confirm('Reset notebook to clean slate? This will remove all entries and characters.')) {
        await api.resetData();
        await loadInitialData();
      }
    });

    // Close Modals on cancel / backdrop click
    document.querySelectorAll('[data-close-modal]').forEach(btn => {
      btn.addEventListener('click', () => {
        const modalId = btn.dataset.closeModal;
        const modal = document.getElementById(modalId);
        if (modal) modal.style.display = 'none';
      });
    });

    document.querySelectorAll('.modal-backdrop').forEach(modal => {
      modal.addEventListener('click', e => {
        if (e.target === modal) {
          modal.style.display = 'none';
        }
      });
    });

    // Party Tab: New Hero Button
    if (el.partyNewHeroBtn) {
      el.partyNewHeroBtn.addEventListener('click', () => {
        openCharacterModal();
      });
    }

    // Sessions & Chapters Listeners
    if (el.sidebarNewSessionBtn) {
      el.sidebarNewSessionBtn.addEventListener('click', () => openSessionModal());
    }
    if (el.emptyStateNewSessionBtn) {
      el.emptyStateNewSessionBtn.addEventListener('click', () => openSessionModal());
    }
    if (el.placeholderNewSessionBtn) {
      el.placeholderNewSessionBtn.addEventListener('click', () => openSessionModal());
    }
    if (el.newSessionMenuBtn) {
      el.newSessionMenuBtn.addEventListener('click', () => {
        el.optionsDropdown.classList.remove('show');
        openSessionModal();
      });
    }

    if (el.sidebarNewChapterBtn) {
      el.sidebarNewChapterBtn.addEventListener('click', () => openChapterModal());
    }
    if (el.addChapterMenuBtn) {
      el.addChapterMenuBtn.addEventListener('click', () => {
        el.optionsDropdown.classList.remove('show');
        openChapterModal();
      });
    }

    // Chapter Select in Session Modal (Existing, General, or New)
    if (el.sessionFormChapterSelect) {
      el.sessionFormChapterSelect.addEventListener('change', (e) => {
        if (e.target.value === '__new__') {
          el.sessionFormNewChapterWrapper.style.display = 'block';
          el.sessionFormNewChapter.focus();
        } else {
          el.sessionFormNewChapterWrapper.style.display = 'none';
          el.sessionFormNewChapter.value = '';
        }
      });
    }
    if (el.sessionToggleNewChapterBtn) {
      el.sessionToggleNewChapterBtn.addEventListener('click', () => {
        el.sessionFormChapterSelect.value = '__new__';
        el.sessionFormNewChapterWrapper.style.display = 'block';
        el.sessionFormNewChapter.focus();
      });
    }
    if (el.sessionCancelNewChapterBtn) {
      el.sessionCancelNewChapterBtn.addEventListener('click', () => {
        el.sessionFormNewChapterWrapper.style.display = 'none';
        el.sessionFormChapterSelect.value = 'General';
        el.sessionFormNewChapter.value = '';
      });
    }

    // Session Sort & Dropdown Filter
    if (el.sessionSortSelect) {
      el.sessionSortSelect.addEventListener('change', (e) => {
        state.sessionSortOption = e.target.value;
        renderSessionsList();
      });
    }
    if (el.sessionChapterSelectFilter) {
      el.sessionChapterSelectFilter.addEventListener('change', (e) => {
        state.selectedChapter = e.target.value;
        renderChapterFilters();
        renderSessionsList();
      });
    }

    // Edit and Delete Session
    if (el.editSessionBtn) {
      el.editSessionBtn.addEventListener('click', () => {
        const session = state.sessions.find(s => s.id === state.selectedSessionId);
        if (session) openSessionModal(session);
      });
    }
    if (el.deleteSessionBtn) {
      el.deleteSessionBtn.addEventListener('click', async () => {
        const session = state.sessions.find(s => s.id === state.selectedSessionId);
        if (!session) return;
        if (confirm(`Are you sure you want to permanently delete Session #${session.sessionNumber}: "${session.title}"?`)) {
          await api.deleteSession(session.id);
          state.sessions = state.sessions.filter(s => s.id !== session.id);
          state.selectedSessionId = null;
          updateUI();
        }
      });
    }

    // Session Form Submit
    if (el.sessionForm) {
      el.sessionForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Determine chapter
        let chapter = el.sessionFormChapterSelect.value;
        if (chapter === '__new__' || el.sessionFormNewChapter.value.trim()) {
          chapter = el.sessionFormNewChapter.value.trim() || 'General';
        }

        // Gather attendees
        const attendees = [];
        el.sessionAttendeesPicker.querySelectorAll('input[type="checkbox"]:checked').forEach(cb => {
          attendees.push(cb.value);
        });

        // Date defaults to today if blank
        const dateVal = el.sessionFormDate.value || new Date().toISOString().slice(0, 10);

        const sessionPayload = {
          id: el.sessionFormId.value || undefined,
          campaignId: state.activeCampaignId,
          title: el.sessionFormTitle.value.trim(),
          sessionNumber: parseInt(el.sessionFormNumber.value, 10) || 1,
          date: dateVal,
          chapter: chapter || 'General',
          attendees,
          summary: el.sessionFormSummary.value.trim(),
          notes: el.sessionFormNotes.value,
          secretNotes: el.sessionFormSecretNotes.value
        };

        const saved = await api.saveSession(sessionPayload);

        // Update state sessions
        const existingIdx = state.sessions.findIndex(s => s.id === saved.id);
        if (existingIdx !== -1) {
          state.sessions[existingIdx] = saved;
        } else {
          state.sessions.unshift(saved);
        }

        // Ensure campaign chapter list includes new chapter
        if (saved.chapter && !state.chapters.includes(saved.chapter)) {
          state.chapters.push(saved.chapter);
        }

        state.selectedSessionId = saved.id;
        el.sessionModal.style.display = 'none';
        updateUI();
      });
    }

    // Standalone Chapter Form Submit
    if (el.chapterForm) {
      el.chapterForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const chapterName = el.chapterFormName.value.trim();
        if (!chapterName) return;

        const res = await api.createChapter(chapterName, state.activeCampaignId);
        if (res && res.chapters) {
          state.chapters = res.chapters;
          const camp = state.campaigns.find(c => c.id === state.activeCampaignId);
          if (camp) camp.chapters = res.chapters;
        } else if (!state.chapters.includes(chapterName)) {
          state.chapters.push(chapterName);
        }

        state.selectedChapter = chapterName;
        el.chapterForm.reset();
        el.chapterModal.style.display = 'none';
        updateUI();
      });
    }

    // Setup helpers
    setupMentionAutocomplete();
    setupGraphInteractions();
  }

  // --- NAVIGATION TAB SWITCHER ---
  function switchTab(tabName) {
    state.activeTab = tabName;
    el.navTabs.forEach(t => t.classList.toggle('active', t.dataset.tab === tabName));
    el.tabViews.forEach(v => v.classList.remove('active'));

    const activeView = document.getElementById(`view${capitalize(tabName)}`);
    if (activeView) activeView.classList.add('active');

    updateUI();
  }

  // --- UTILITY FUNCTIONS ---
  function escapeHTML(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function capitalize(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  function getCategoryColor(catId) {
    const found = [...DEFAULT_CATEGORIES, ...state.customCategories].find(c => c.id.toLowerCase() === (catId || '').toLowerCase());
    return found ? found.color : '#f59e0b';
  }

  function formatRelativeTime(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diffSec = Math.floor((now - date) / 1000);

    if (diffSec < 60) return 'just now';
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
    return `${Math.floor(diffSec / 86400)}d ago`;
  }

  // Boot Application
  document.addEventListener('DOMContentLoaded', init);
})();
