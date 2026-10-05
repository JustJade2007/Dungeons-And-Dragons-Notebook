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
    selectedEntryId: null,
    selectedCharacterId: null,
    currentMode: 'dm', // 'dm' or 'player'
    activeTab: 'entries', // 'entries', 'graph', 'hierarchy', 'family', 'dossier'
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
    }
  };

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
    el.dmModeBtn = document.getElementById('dmModeBtn');
    el.playerModeBtn = document.getElementById('playerModeBtn');
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
    el.resetDataBtn = document.getElementById('resetDataBtn');

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
    el.viewFamily = document.getElementById('viewFamily');
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

    // Hierarchy & Family Tabs
    el.hierarchyTreeContainer = document.getElementById('hierarchyTreeContainer');
    el.familyRootSelect = document.getElementById('familyRootSelect');
    el.familyTreeContainer = document.getElementById('familyTreeContainer');

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

    el.campaignModal = document.getElementById('campaignModal');
    el.campaignsContainer = document.getElementById('campaignsContainer');
    el.newCampaignForm = document.getElementById('newCampaignForm');
    el.newCampaignName = document.getElementById('newCampaignName');
    el.newCampaignDesc = document.getElementById('newCampaignDesc');

    el.categoryModal = document.getElementById('categoryModal');
    el.categoryForm = document.getElementById('categoryForm');
    el.catFormName = document.getElementById('catFormName');
    el.catFormColor = document.getElementById('catFormColor');
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
    async createCampaign(name, description) {
      const res = await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description })
      });
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

  // --- INITIALIZATION ---
  async function init() {
    initElements();
    setupEventListeners();
    await loadInitialData();
  }

  async function loadInitialData() {
    try {
      const data = await api.fetchAllData();
      state.campaigns = data.campaigns || [];
      state.activeCampaignId = data.activeCampaignId || state.campaigns[0]?.id || 'camp_default';
      state.entries = data.entries || [];
      state.characters = data.characters || [];
      state.activeCharacterId = data.activeCharacterId || null;
      state.customCategories = data.customCategories || [];

      // Select first character if none active
      if (!state.activeCharacterId && state.characters.length > 0) {
        state.activeCharacterId = state.characters[0].id;
      }

      updateUI();
    } catch (err) {
      console.error('Failed to load application data:', err);
    }
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
    } else if (state.activeTab === 'family') {
      renderFamilyTree();
    } else if (state.activeTab === 'dossier') {
      renderCharacterSheet();
    }
  }

  function updateCampaignHeader() {
    const activeCamp = state.campaigns.find(c => c.id === state.activeCampaignId);
    el.activeCampaignName.textContent = activeCamp ? activeCamp.name : 'Default Campaign';
  }

  function updateModeDisplay() {
    if (state.currentMode === 'dm') {
      el.dmModeBtn.classList.add('active');
      el.playerModeBtn.classList.remove('active');
      el.modeStatusBanner.className = 'mode-status-banner dm-active';
      el.modeStatusText.textContent = 'DM Mode: Full campaign oversight enabled. Secret notes revealed.';
      el.dmSecretNotesField.style.display = 'block';
      el.detailSecretNotesSection.style.display = 'block';
    } else {
      el.playerModeBtn.classList.add('active');
      el.dmModeBtn.classList.remove('active');
      el.modeStatusBanner.className = 'mode-status-banner player-active';
      el.modeStatusText.textContent = 'Player Mode: Journal tracking active. DM secret notes redacted.';
      el.dmSecretNotesField.style.display = 'none';
      el.detailSecretNotesSection.style.display = 'none';
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
      item.innerHTML = `
        <span class="category-tag cat-${source.category.toLowerCase()}">${escapeHTML(source.category)}</span>
        <span>${escapeHTML(source.title)}</span>
      `;
      item.addEventListener('click', () => selectEntry(source.id));
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
      return `<a class="mention-link" data-entry-id="${id}">${title}</a>`;
    });

    // Step 3: Parse @[Title] mentions (match against existing entries by title)
    out = out.replace(/@\[(.*?)\]/g, (match, title) => {
      const found = state.entries.find(e => e.title.toLowerCase() === title.toLowerCase());
      const idAttr = found ? `data-entry-id="${found.id}"` : '';
      return `<a class="mention-link" ${idAttr}>${title}</a>`;
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
  function setupMentionAutocomplete() {
    const textarea = el.entryFormNotes;
    const picker = el.mentionPicker;
    const pickerList = el.mentionPickerList;
    let selectedIndex = 0;
    let matchingEntries = [];
    let mentionStartPos = -1;

    textarea.addEventListener('input', () => {
      const pos = textarea.selectionStart;
      const textBeforeCursor = textarea.value.slice(0, pos);
      const atIndex = textBeforeCursor.lastIndexOf('@');

      if (atIndex !== -1 && atIndex >= pos - 25) {
        // Query text between '@' and cursor
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
      if (picker.style.display !== 'none' && matchingEntries.length > 0) {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          selectedIndex = (selectedIndex + 1) % matchingEntries.length;
          updateHighlightedItem();
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          selectedIndex = (selectedIndex - 1 + matchingEntries.length) % matchingEntries.length;
          updateHighlightedItem();
        } else if (e.key === 'Enter' || e.key === 'Tab') {
          e.preventDefault();
          insertMention(matchingEntries[selectedIndex]);
        } else if (e.key === 'Escape') {
          hidePicker();
        }
      }
    });

    function showPicker(query) {
      const q = query.toLowerCase();
      const currentEditingId = el.entryFormId.value;
      
      matchingEntries = state.entries.filter(e => {
        if (e.id === currentEditingId) return false;
        return e.title.toLowerCase().includes(q);
      }).slice(0, 6);

      if (matchingEntries.length === 0) {
        hidePicker();
        return;
      }

      pickerList.innerHTML = '';
      selectedIndex = 0;

      matchingEntries.forEach((entry, idx) => {
        const item = document.createElement('div');
        item.className = `mention-picker-item ${idx === 0 ? 'highlighted' : ''}`;
        item.innerHTML = `
          <span>${escapeHTML(entry.title)}</span>
          <span class="category-tag cat-${entry.category.toLowerCase()}">${escapeHTML(entry.category)}</span>
        `;
        item.addEventListener('click', () => {
          insertMention(entry);
        });
        pickerList.appendChild(item);
      });

      picker.style.display = 'block';
    }

    function hidePicker() {
      picker.style.display = 'none';
      matchingEntries = [];
      mentionStartPos = -1;
    }

    function updateHighlightedItem() {
      const items = pickerList.querySelectorAll('.mention-picker-item');
      items.forEach((item, idx) => {
        item.classList.toggle('highlighted', idx === selectedIndex);
      });
    }

    function insertMention(entry) {
      if (mentionStartPos === -1) return;
      const text = textarea.value;
      const pos = textarea.selectionStart;
      const before = text.slice(0, mentionStartPos);
      const after = text.slice(pos);
      const mentionToken = `@[${entry.title}](${entry.id}) `;

      textarea.value = before + mentionToken + after;
      const newCursorPos = before.length + mentionToken.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
      textarea.focus();
      hidePicker();
    }
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

  // --- TAB 4: FAMILY TREE RENDERER ---
  function renderFamilyTree() {
    el.familyTreeContainer.innerHTML = '';
    el.familyRootSelect.innerHTML = '<option value="">-- Choose Dynasty / Family Root --</option>';

    // Filter characters/NPCs with family relationships
    const familyRelations = ['parent of', 'child of', 'father of', 'mother of', 'son of', 'daughter of', 'spouse of'];
    const candidates = state.entries.filter(e => {
      if (Array.isArray(e.connections)) {
        return e.connections.some(c => familyRelations.some(r => (c.relation || '').toLowerCase().includes(r)));
      }
      return false;
    });

    candidates.forEach(c => {
      const opt = document.createElement('option');
      opt.value = c.id;
      opt.textContent = `${c.title} (${c.category})`;
      el.familyRootSelect.appendChild(opt);
    });

    const rootId = el.familyRootSelect.value || candidates[0]?.id;

    if (!rootId) {
      el.familyTreeContainer.innerHTML = `
        <div class="empty-state">
          <h3>No Lineages Detected</h3>
          <p>Add relationships between characters or NPCs using labels like "Parent of", "Father of", or "Mother of" to generate dynastic trees.</p>
        </div>
      `;
      return;
    }

    const root = state.entries.find(e => e.id === rootId);
    if (!root) return;

    // Build Generation 1 (Root), Generation 2 (Children), etc.
    const gen1Row = document.createElement('div');
    gen1Row.className = 'family-generation-row';
    gen1Row.appendChild(createFamilyCard(root, 'Patriarch / Matriarch'));
    el.familyTreeContainer.appendChild(gen1Row);

    // Find children
    const childEntries = [];
    if (Array.isArray(root.connections)) {
      root.connections.forEach(c => {
        const rel = (c.relation || '').toLowerCase();
        if (rel.includes('parent') || rel.includes('father') || rel.includes('mother')) {
          const child = state.entries.find(e => e.id === c.targetId);
          if (child) childEntries.push({ entry: child, rel: 'Child' });
        }
      });
    }

    // Also check reverse connections (e.g. child marked "child of root")
    state.entries.forEach(e => {
      if (Array.isArray(e.connections)) {
        e.connections.forEach(c => {
          if (c.targetId === root.id && (c.relation || '').toLowerCase().includes('child')) {
            if (!childEntries.some(item => item.entry.id === e.id)) {
              childEntries.push({ entry: e, rel: 'Child' });
            }
          }
        });
      }
    });

    if (childEntries.length > 0) {
      const gen2Row = document.createElement('div');
      gen2Row.className = 'family-generation-row';
      childEntries.forEach(item => {
        gen2Row.appendChild(createFamilyCard(item.entry, item.rel));
      });
      el.familyTreeContainer.appendChild(gen2Row);
    }
  }

  function createFamilyCard(entry, relationTitle) {
    const card = document.createElement('div');
    card.className = 'family-card';
    card.innerHTML = `
      <div class="family-card-rel">${escapeHTML(relationTitle)}</div>
      <div class="family-card-name">${escapeHTML(entry.title)}</div>
      <div class="text-xs text-muted">${escapeHTML(entry.category)} • ${escapeHTML(entry.status || 'Alive')}</div>
    `;
    card.addEventListener('click', () => {
      selectEntry(entry.id);
      switchTab('entries');
    });
    return card;
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

    // Campaign Manager
    el.campaignBtn.addEventListener('click', openCampaignModal);
    el.newCampaignForm.addEventListener('submit', async e => {
      e.preventDefault();
      const newCamp = await api.createCampaign(el.newCampaignName.value.trim(), el.newCampaignDesc.value.trim());
      state.campaigns.push(newCamp);
      state.activeCampaignId = newCamp.id;
      el.campaignModal.style.display = 'none';
      await loadInitialData();
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

    // Family Tree Root Select
    el.familyRootSelect.addEventListener('change', () => {
      renderFamilyTree();
    });

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
