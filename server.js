const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const http = require('http');
const { exec, spawn } = require('child_process');

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Determine base and data directory
const isPackaged = !process.execPath.toLowerCase().endsWith('node.exe');
const appRoot = isPackaged ? path.dirname(process.execPath) : __dirname;
const dataDir = path.join(appRoot, 'data');
const dataFilePath = path.join(dataDir, 'notebook-data.json');

// Ensure data directory exists
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Default clean state - ZERO template or example entries
function getInitialData() {
  return {
    campaigns: [],
    activeCampaignId: null,
    entries: [],
    characters: [],
    activeCharacterId: null,
    customCategories: [],
    sessions: []
  };
}

// Load data from file
function loadData() {
  try {
    if (fs.existsSync(dataFilePath)) {
      const content = fs.readFileSync(dataFilePath, 'utf8');
      const parsed = JSON.parse(content);
      // Guarantee valid structure
      if (!parsed.campaigns || !Array.isArray(parsed.campaigns)) {
        parsed.campaigns = [];
      }
      parsed.campaigns.forEach(c => {
        if (!c.mode) c.mode = 'dm';
        if (!c.system) c.system = 'D&D 5e';
        if (!c.chapters || !Array.isArray(c.chapters)) {
          c.chapters = ['General'];
        } else if (!c.chapters.includes('General')) {
          c.chapters.unshift('General');
        }
        if (!c.settings) {
          c.settings = {
            allowDmSecrets: true,
            autoLinkDiscoveries: true
          };
        }
      });
      if (!parsed.entries || !Array.isArray(parsed.entries)) {
        parsed.entries = [];
      }
      if (!parsed.characters || !Array.isArray(parsed.characters)) {
        parsed.characters = [];
      }
      if (!parsed.customCategories || !Array.isArray(parsed.customCategories)) {
        parsed.customCategories = [];
      }
      if (!parsed.sessions || !Array.isArray(parsed.sessions)) {
        parsed.sessions = [];
      }
      return parsed;
    }
  } catch (err) {
    console.error('[Storage] Error loading data file, initializing clean state:', err.message);
  }
  const initial = getInitialData();
  saveData(initial);
  return initial;
}

// Save data to file safely with temp file swap
function saveData(data) {
  try {
    const tempPath = `${dataFilePath}.tmp`;
    fs.writeFileSync(tempPath, JSON.stringify(data, null, 2), 'utf8');
    fs.renameSync(tempPath, dataFilePath);
    return true;
  } catch (err) {
    console.error('[Storage] Error saving data file:', err.message);
    return false;
  }
}

// Initialize in-memory cache
let database = loadData();

// Helper to generate unique IDs
function generateId(prefix = 'entry') {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
}

// Static file serving: Check next to executable first, then local directory
let publicDir = path.join(appRoot, 'public');
if (!fs.existsSync(publicDir)) {
  publicDir = path.join(__dirname, 'public');
}
app.use(express.static(publicDir));

// --- REST API ENDPOINTS ---

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    version: '0.2.6',
    mode: isPackaged ? 'executable' : 'node',
    entriesCount: database.entries.length,
    charactersCount: database.characters.length,
    sessionsCount: database.sessions.length,
    activeCampaignId: database.activeCampaignId
  });
});

// Full state
app.get('/api/data', (req, res) => {
  res.json(database);
});

// --- ENTRIES CRUD ---

// Create entry
app.post('/api/entries', (req, res) => {
  const {
    title,
    category,
    tags,
    status,
    friendliness,
    parentId,
    attributes,
    connections,
    notes,
    secretNotes,
    campaignId
  } = req.body;

  if (!title || !title.trim()) {
    return res.status(400).json({ error: 'Entry title is required.' });
  }

  const now = new Date().toISOString();
  const newEntry = {
    id: generateId('entry'),
    campaignId: campaignId || database.activeCampaignId,
    title: title.trim(),
    category: category || 'lore',
    tags: Array.isArray(tags) ? tags : [],
    status: status || 'Unknown', // Alive, Dead, Missing, Unknown, Resurrected
    friendliness: friendliness || 'Neutral', // Friendly, Neutral, Hostile
    parentId: parentId || null,
    attributes: Array.isArray(attributes) ? attributes : [], // [{ key, value }]
    connections: Array.isArray(connections) ? connections : [], // [{ targetId, relation }]
    notes: notes || '',
    secretNotes: secretNotes || '', // DM Only
    createdAt: now,
    updatedAt: now
  };

  database.entries.unshift(newEntry);
  saveData(database);

  res.status(201).json(newEntry);
});

// Update entry
app.put('/api/entries/:id', (req, res) => {
  const { id } = req.params;
  const index = database.entries.findIndex(e => e.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'Entry not found.' });
  }

  const existing = database.entries[index];
  const updated = {
    ...existing,
    ...req.body,
    id: existing.id,
    campaignId: existing.campaignId,
    createdAt: existing.createdAt,
    updatedAt: new Date().toISOString()
  };

  if (updated.title) {
    updated.title = updated.title.trim();
  }

  database.entries[index] = updated;
  saveData(database);

  res.json(updated);
});

// Delete entry
app.delete('/api/entries/:id', (req, res) => {
  const { id } = req.params;
  const initialCount = database.entries.length;
  database.entries = database.entries.filter(e => e.id !== id);

  if (database.entries.length === initialCount) {
    return res.status(404).json({ error: 'Entry not found.' });
  }

  // Clean up references to this deleted entry in parentId and connections
  database.entries.forEach(e => {
    if (e.parentId === id) {
      e.parentId = null;
    }
    if (Array.isArray(e.connections)) {
      e.connections = e.connections.filter(c => c.targetId !== id);
    }
  });

  // Clean up character linked entries
  database.characters.forEach(c => {
    if (Array.isArray(c.linkedEntryIds)) {
      c.linkedEntryIds = c.linkedEntryIds.filter(entryId => entryId !== id);
    }
  });

  saveData(database);
  res.json({ success: true, deletedId: id });
});

// --- CHARACTERS CRUD (Player Mode) ---

// Create character
app.post('/api/characters', (req, res) => {
  const { name, characterClass, level, race, alignment, notes, campaignId } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Character name is required.' });
  }

  const now = new Date().toISOString();
  const newCharacter = {
    id: generateId('char'),
    campaignId: campaignId || database.activeCampaignId,
    name: name.trim(),
    characterClass: characterClass || 'Adventurer',
    level: parseInt(level, 10) || 1,
    race: race || 'Human',
    alignment: alignment || 'True Neutral',
    notes: notes || '',
    linkedEntryIds: [],
    createdAt: now,
    updatedAt: now
  };

  database.characters.push(newCharacter);
  if (!database.activeCharacterId) {
    database.activeCharacterId = newCharacter.id;
  }
  saveData(database);

  res.status(201).json(newCharacter);
});

// Update character
app.put('/api/characters/:id', (req, res) => {
  const { id } = req.params;
  const index = database.characters.findIndex(c => c.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'Character not found.' });
  }

  const existing = database.characters[index];
  const updated = {
    ...existing,
    ...req.body,
    id: existing.id,
    campaignId: existing.campaignId,
    createdAt: existing.createdAt,
    updatedAt: new Date().toISOString()
  };

  database.characters[index] = updated;
  saveData(database);

  res.json(updated);
});

// Delete character
app.delete('/api/characters/:id', (req, res) => {
  const { id } = req.params;
  database.characters = database.characters.filter(c => c.id !== id);

  if (database.activeCharacterId === id) {
    database.activeCharacterId = database.characters[0]?.id || null;
  }

  saveData(database);
  res.json({ success: true, deletedId: id });
});

// Set active character
app.post('/api/characters/active', (req, res) => {
  const { characterId } = req.body;
  if (characterId && !database.characters.some(c => c.id === characterId)) {
    return res.status(404).json({ error: 'Character does not exist.' });
  }

  database.activeCharacterId = characterId || null;
  saveData(database);

  res.json({ success: true, activeCharacterId: database.activeCharacterId });
});

// Link entry to active character (Player mode automatic or manual linking)
app.post('/api/characters/:id/link-entry', (req, res) => {
  const { id } = req.params;
  const { entryId } = req.body;

  const character = database.characters.find(c => c.id === id);
  if (!character) {
    return res.status(404).json({ error: 'Character not found.' });
  }

  if (!Array.isArray(character.linkedEntryIds)) {
    character.linkedEntryIds = [];
  }

  if (!character.linkedEntryIds.includes(entryId)) {
    character.linkedEntryIds.push(entryId);
    character.updatedAt = new Date().toISOString();
    saveData(database);
  }

  res.json({ success: true, character });
});

// --- SESSIONS & CHAPTERS CRUD ---

// Get all sessions (optionally filtered by campaignId and chapter)
app.get('/api/sessions', (req, res) => {
  const targetCampaignId = req.query.campaignId || database.activeCampaignId;
  const chapterFilter = req.query.chapter;

  let filtered = database.sessions.filter(s => s.campaignId === targetCampaignId);

  // 'General' includes everything by default, unless user specifically filtered by an individual chapter
  if (chapterFilter && chapterFilter !== 'General' && chapterFilter !== 'all') {
    filtered = filtered.filter(s => s.chapter === chapterFilter);
  }

  // Sort by sessionNumber or date or createdAt
  filtered.sort((a, b) => {
    if (b.sessionNumber !== undefined && a.sessionNumber !== undefined && b.sessionNumber !== a.sessionNumber) {
      return b.sessionNumber - a.sessionNumber;
    }
    return new Date(b.date || b.createdAt).getTime() - new Date(a.date || a.createdAt).getTime();
  });

  res.json({ success: true, sessions: filtered });
});

// Create a new session note
app.post('/api/sessions', (req, res) => {
  const {
    title,
    chapter,
    date,
    sessionNumber,
    summary,
    notes,
    secretNotes,
    attendees,
    campaignId
  } = req.body;

  if (!title || !title.trim()) {
    return res.status(400).json({ error: 'Session title is required.' });
  }

  const now = new Date().toISOString();
  const todayDateString = now.slice(0, 10); // YYYY-MM-DD
  const effectiveCampaignId = campaignId || database.activeCampaignId;

  // Chapter defaults to 'General' which includes everything
  const assignedChapter = (chapter && chapter.trim()) ? chapter.trim() : 'General';

  // Auto-save the date it happened: defaults to today if not explicitly provided
  const sessionDate = (date && date.trim()) ? date.trim() : todayDateString;

  // Calculate session number if not supplied
  let num = parseInt(sessionNumber, 10);
  if (isNaN(num)) {
    const existingInCampaign = database.sessions.filter(s => s.campaignId === effectiveCampaignId);
    num = existingInCampaign.length + 1;
  }

  // Ensure chapter is tracked in the campaign's chapters
  const campaign = database.campaigns.find(c => c.id === effectiveCampaignId);
  if (campaign) {
    if (!campaign.chapters || !Array.isArray(campaign.chapters)) {
      campaign.chapters = ['General'];
    }
    if (assignedChapter && !campaign.chapters.includes(assignedChapter)) {
      campaign.chapters.push(assignedChapter);
    }
  }

  const newSession = {
    id: generateId('session'),
    campaignId: effectiveCampaignId,
    sessionNumber: num,
    title: title.trim(),
    chapter: assignedChapter,
    date: sessionDate, // Auto-saved date it happened
    summary: summary || '',
    notes: notes || '',
    secretNotes: secretNotes || '',
    attendees: Array.isArray(attendees) ? attendees : [],
    createdAt: now,
    updatedAt: now
  };

  database.sessions.unshift(newSession);
  saveData(database);

  res.status(201).json(newSession);
});

// Update session note
app.put('/api/sessions/:id', (req, res) => {
  const { id } = req.params;
  const index = database.sessions.findIndex(s => s.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'Session note not found.' });
  }

  const existing = database.sessions[index];
  const updated = {
    ...existing,
    ...req.body,
    id: existing.id,
    campaignId: existing.campaignId,
    createdAt: existing.createdAt,
    updatedAt: new Date().toISOString()
  };

  if (updated.title) {
    updated.title = updated.title.trim();
  }
  if (!updated.chapter || !updated.chapter.trim()) {
    updated.chapter = 'General';
  } else {
    updated.chapter = updated.chapter.trim();
  }
  if (!updated.date || !updated.date.trim()) {
    updated.date = new Date().toISOString().slice(0, 10);
  }

  // Ensure chapter is tracked in campaign
  const campaign = database.campaigns.find(c => c.id === existing.campaignId);
  if (campaign) {
    if (!campaign.chapters || !Array.isArray(campaign.chapters)) {
      campaign.chapters = ['General'];
    }
    if (updated.chapter && !campaign.chapters.includes(updated.chapter)) {
      campaign.chapters.push(updated.chapter);
    }
  }

  database.sessions[index] = updated;
  saveData(database);

  res.json(updated);
});

// Delete session note
app.delete('/api/sessions/:id', (req, res) => {
  const { id } = req.params;
  const initialCount = database.sessions.length;
  database.sessions = database.sessions.filter(s => s.id !== id);

  if (database.sessions.length === initialCount) {
    return res.status(404).json({ error: 'Session note not found.' });
  }

  saveData(database);
  res.json({ success: true, deletedId: id });
});

// Get chapters for active campaign
app.get('/api/chapters', (req, res) => {
  const targetCampaignId = req.query.campaignId || database.activeCampaignId;
  const campaign = database.campaigns.find(c => c.id === targetCampaignId);
  const chapterSet = new Set(['General']);

  if (campaign && Array.isArray(campaign.chapters)) {
    campaign.chapters.forEach(ch => {
      if (ch && ch.trim()) chapterSet.add(ch.trim());
    });
  }

  // Also include any chapters currently in sessions
  database.sessions
    .filter(s => s.campaignId === targetCampaignId)
    .forEach(s => {
      if (s.chapter && s.chapter.trim()) chapterSet.add(s.chapter.trim());
    });

  res.json({ chapters: Array.from(chapterSet) });
});

// Create/add a new chapter name
app.post('/api/chapters', (req, res) => {
  const { name, campaignId } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Chapter name is required.' });
  }

  const trimmed = name.trim();
  const targetCampaignId = campaignId || database.activeCampaignId;
  const campaign = database.campaigns.find(c => c.id === targetCampaignId);

  if (campaign) {
    if (!campaign.chapters || !Array.isArray(campaign.chapters)) {
      campaign.chapters = ['General'];
    }
    if (!campaign.chapters.includes(trimmed)) {
      campaign.chapters.push(trimmed);
      saveData(database);
    }
  }

  const allChapters = campaign ? campaign.chapters : ['General', trimmed];
  res.status(201).json({ success: true, chapter: trimmed, chapters: allChapters });
});

// --- CAMPAIGNS & NOTEBOOKS ---

// List all campaigns with summaries
app.get('/api/campaigns', (req, res) => {
  const summaries = database.campaigns.map(camp => {
    const entryCount = database.entries.filter(e => e.campaignId === camp.id).length;
    const charCount = database.characters.filter(c => c.campaignId === camp.id).length;
    const sessionCount = database.sessions.filter(s => s.campaignId === camp.id).length;
    return {
      ...camp,
      mode: camp.mode || 'dm',
      system: camp.system || 'D&D 5e',
      chapters: Array.isArray(camp.chapters) ? camp.chapters : ['General'],
      settings: camp.settings || { allowDmSecrets: true, autoLinkDiscoveries: true },
      entryCount,
      charCount,
      sessionCount
    };
  });
  res.json({
    campaigns: summaries,
    activeCampaignId: database.activeCampaignId
  });
});

// Create notebook / campaign (with DM/Player mode, system, brief settings and optional temporary notepad migration)
app.post('/api/campaigns', (req, res) => {
  const { name, description, mode, system, settings, convertTemporary } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Notebook name is required.' });
  }

  const now = new Date().toISOString();
  const newCampaign = {
    id: generateId('camp'),
    name: name.trim(),
    description: description || '',
    mode: mode === 'player' ? 'player' : 'dm',
    system: system || 'D&D 5e',
    chapters: ['General'],
    settings: {
      allowDmSecrets: settings?.allowDmSecrets !== undefined ? Boolean(settings.allowDmSecrets) : true,
      autoLinkDiscoveries: settings?.autoLinkDiscoveries !== undefined ? Boolean(settings.autoLinkDiscoveries) : true
    },
    createdAt: now,
    updatedAt: now
  };

  database.campaigns.push(newCampaign);
  database.activeCampaignId = newCampaign.id;

  // If user is converting a temporary notepad session into this notebook, migrate entries, characters & sessions
  if (convertTemporary) {
    database.entries.forEach(e => {
      if (!e.campaignId || e.campaignId === 'temp' || e.campaignId === 'temporary') {
        e.campaignId = newCampaign.id;
        e.updatedAt = now;
      }
    });
    database.characters.forEach(c => {
      if (!c.campaignId || c.campaignId === 'temp' || c.campaignId === 'temporary') {
        c.campaignId = newCampaign.id;
        c.updatedAt = now;
      }
    });
    database.sessions.forEach(s => {
      if (!s.campaignId || s.campaignId === 'temp' || s.campaignId === 'temporary') {
        s.campaignId = newCampaign.id;
        s.updatedAt = now;
        if (s.chapter && !newCampaign.chapters.includes(s.chapter)) {
          newCampaign.chapters.push(s.chapter);
        }
      }
    });
  }

  saveData(database);
  res.status(201).json(newCampaign);
});

// Switch active campaign or set to null (exit to notebook selector)
app.post('/api/campaigns/switch', (req, res) => {
  const { campaignId } = req.body;
  if (campaignId === null || campaignId === 'temp' || campaignId === 'temporary') {
    database.activeCampaignId = campaignId;
    saveData(database);
    return res.json({ success: true, activeCampaignId: campaignId });
  }

  const campaign = database.campaigns.find(c => c.id === campaignId);
  if (!campaign) {
    return res.status(404).json({ error: 'Campaign not found.' });
  }

  database.activeCampaignId = campaignId;
  saveData(database);
  res.json({ success: true, activeCampaignId: campaignId, campaign });
});

// Delete a campaign
app.delete('/api/campaigns/:id', (req, res) => {
  const { id } = req.params;
  database.campaigns = database.campaigns.filter(c => c.id !== id);
  // Remove associated entries, characters & sessions
  database.entries = database.entries.filter(e => e.campaignId !== id);
  database.characters = database.characters.filter(c => c.campaignId !== id);
  database.sessions = database.sessions.filter(s => s.campaignId !== id);

  if (database.activeCampaignId === id) {
    database.activeCampaignId = database.campaigns[0]?.id || null;
  }

  saveData(database);
  res.json({ success: true, deletedId: id });
});

// --- CUSTOM CATEGORIES ---

app.post('/api/categories', (req, res) => {
  const { name, color, icon } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Category name is required.' });
  }

  const categoryId = name.trim().toLowerCase().replace(/[^a-z0-9]/g, '_');
  const newCat = {
    id: categoryId,
    name: name.trim(),
    color: color || '#f59e0b',
    icon: icon || 'tag'
  };

  if (!database.customCategories) {
    database.customCategories = [];
  }

  if (!database.customCategories.some(c => c.id === categoryId)) {
    database.customCategories.push(newCat);
    saveData(database);
  }

  res.status(201).json(newCat);
});

// --- BACKUP EXPORT & IMPORT ---

app.get('/api/export', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="dnd-notebook-backup-${new Date().toISOString().slice(0, 10)}.json"`
  );
  res.send(JSON.stringify(database, null, 2));
});

app.post('/api/import', (req, res) => {
  const importedData = req.body;
  if (!importedData || typeof importedData !== 'object') {
    return res.status(400).json({ error: 'Invalid backup JSON payload.' });
  }

  database = {
    campaigns: Array.isArray(importedData.campaigns) ? importedData.campaigns : getInitialData().campaigns,
    activeCampaignId: importedData.activeCampaignId || null,
    entries: Array.isArray(importedData.entries) ? importedData.entries : [],
    characters: Array.isArray(importedData.characters) ? importedData.characters : [],
    activeCharacterId: importedData.activeCharacterId || null,
    customCategories: Array.isArray(importedData.customCategories) ? importedData.customCategories : [],
    sessions: Array.isArray(importedData.sessions) ? importedData.sessions : []
  };

  saveData(database);
  res.json({ success: true, message: 'Notebook restored successfully.' });
});

// Reset to clean state (ZERO example entries)
app.post('/api/reset', (req, res) => {
  database = getInitialData();
  saveData(database);
  res.json({ success: true, message: 'Notebook reset to clean empty state.' });
});

// Catch-all route to serve SPA
app.get('*', (req, res) => {
  const indexPath = path.join(publicDir, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send('D&D Notebook: Frontend assets not found at ' + publicDir);
  }
});

// Determine Port and Start Server
const defaultPort = parseInt(process.env.PORT || '3000', 10);
const shouldAutoOpen = !process.argv.includes('--no-open') && !process.env.CI;

function findAppBrowserExecutable() {
  if (process.platform === 'win32') {
    const progFilesX86 = process.env['ProgramFiles(x86)'] || 'C:\\Program Files (x86)';
    const progFiles = process.env['ProgramFiles'] || 'C:\\Program Files';
    const localAppData = process.env['LocalAppData'] || '';

    const candidates = [
      path.join(progFilesX86, 'Microsoft\\Edge\\Application\\msedge.exe'),
      path.join(progFiles, 'Microsoft\\Edge\\Application\\msedge.exe'),
      path.join(localAppData, 'Microsoft\\Edge\\Application\\msedge.exe'),
      path.join(progFiles, 'Google\\Chrome\\Application\\chrome.exe'),
      path.join(progFilesX86, 'Google\\Chrome\\Application\\chrome.exe'),
      path.join(localAppData, 'Google\\Chrome\\Application\\chrome.exe'),
      path.join(progFiles, 'BraveSoftware\\Brave-Browser\\Application\\brave.exe'),
      path.join(progFilesX86, 'BraveSoftware\\Brave-Browser\\Application\\brave.exe')
    ];

    for (const exePath of candidates) {
      if (exePath && fs.existsSync(exePath)) {
        return exePath;
      }
    }
  }
  return null;
}

function openSystemBrowser(url) {
  const startCmd = process.platform === 'win32' ? `start ${url}` : `open ${url}`;
  exec(startCmd, () => {});
}

function launchAppWindow(url, onExit) {
  const browserExe = findAppBrowserExecutable();
  const profileDir = path.join(dataDir, '.app-profile');

  if (browserExe) {
    console.log(`[Window] Launching standalone desktop app window via: ${browserExe}`);
    const args = [
      `--app=${url}`,
      '--window-size=1440,900',
      `--user-data-dir=${profileDir}`,
      '--no-first-run',
      '--no-default-browser-check',
      '--disable-background-networking',
      '--disable-sync'
    ];

    try {
      const child = spawn(browserExe, args, {
        detached: false,
        stdio: 'ignore'
      });

      child.on('error', err => {
        console.warn('[Window] Failed to launch desktop app window, opening system browser:', err.message);
        openSystemBrowser(url);
      });

      child.on('exit', () => {
        console.log('[Window] Application window closed by user.');
        if (typeof onExit === 'function') {
          onExit();
        }
      });

      return child;
    } catch (e) {
      console.warn('[Window] Error launching app window, opening system browser:', e.message);
      openSystemBrowser(url);
    }
  } else {
    console.log('[Window] Chromium runtime not found for app mode, opening system browser...');
    openSystemBrowser(url);
  }
}

function findAvailablePort(startPort, callback) {
  const testServer = http.createServer();
  testServer.listen(startPort, () => {
    testServer.once('close', () => callback(null, startPort));
    testServer.close();
  });
  testServer.on('error', err => {
    if (err.code === 'EADDRINUSE') {
      findAvailablePort(startPort + 1, callback);
    } else {
      callback(err);
    }
  });
}

function startServer(requestedPort = null, autoOpen = false) {
  return new Promise((resolve, reject) => {
    const portToUse = requestedPort !== null && requestedPort !== undefined ? requestedPort : defaultPort;
    findAvailablePort(portToUse, (err, port) => {
      if (err) return reject(err);

      const server = app.listen(port, () => {
        const url = `http://localhost:${port}`;
        console.log('===================================================');
        console.log('       DUNGEONS & DRAGONS NOTEBOOK');
        console.log('===================================================');
        console.log(`[Status] Server running at: ${url}`);
        console.log(`[Mode]   ${isPackaged ? 'Desktop Application (.exe)' : 'Node.js Server'}`);
        console.log(`[Data]   ${dataFilePath}`);
        console.log('===================================================');

        if (autoOpen && shouldAutoOpen && !process.versions.electron) {
          setTimeout(() => {
            const forceWeb = process.argv.includes('--web');
            if (forceWeb) {
              openSystemBrowser(url);
            } else {
              launchAppWindow(url, () => {
                if (isPackaged) {
                  shutdown();
                }
              });
            }
          }, 700);
        }

        resolve({ server, port, url, dataFilePath });
      });

      // Graceful shutdown handling
      const shutdown = () => {
        console.log('\n[Server] Shutting down gracefully...');
        server.close(() => {
          process.exit(0);
        });
      };

      process.on('SIGINT', shutdown);
      process.on('SIGTERM', shutdown);

      server.on('error', reject);
    });
  });
}

// Auto-run if executed directly via Node.js CLI
if (require.main === module && !process.versions.electron) {
  const port = process.env.PORT ? parseInt(process.env.PORT, 10) : defaultPort;
  startServer(port, true).catch(err => {
    console.error('[Error] Server failed to start:', err);
    process.exit(1);
  });
}

module.exports = {
  app,
  startServer,
  loadData,
  saveData,
  getInitialData,
  database
};
