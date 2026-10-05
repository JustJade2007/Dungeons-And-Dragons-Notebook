const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const http = require('http');
const { exec } = require('child_process');

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
  const now = new Date().toISOString();
  return {
    campaigns: [
      {
        id: 'camp_default',
        name: 'Default Campaign',
        description: 'Primary campaign notebook',
        createdAt: now,
        updatedAt: now
      }
    ],
    activeCampaignId: 'camp_default',
    entries: [],
    characters: [],
    activeCharacterId: null,
    customCategories: []
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
        parsed.campaigns = getInitialData().campaigns;
      }
      if (!parsed.entries || !Array.isArray(parsed.entries)) {
        parsed.entries = [];
      }
      if (!parsed.characters || !Array.isArray(parsed.characters)) {
        parsed.characters = [];
      }
      if (!parsed.activeCampaignId) {
        parsed.activeCampaignId = parsed.campaigns[0]?.id || 'camp_default';
      }
      if (!parsed.customCategories || !Array.isArray(parsed.customCategories)) {
        parsed.customCategories = [];
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
    version: '0.2.0',
    mode: isPackaged ? 'executable' : 'node',
    entriesCount: database.entries.length,
    charactersCount: database.characters.length,
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

// --- CAMPAIGNS ---

app.post('/api/campaigns', (req, res) => {
  const { name, description } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Campaign name is required.' });
  }

  const now = new Date().toISOString();
  const newCampaign = {
    id: generateId('camp'),
    name: name.trim(),
    description: description || '',
    createdAt: now,
    updatedAt: now
  };

  database.campaigns.push(newCampaign);
  database.activeCampaignId = newCampaign.id;
  saveData(database);

  res.status(201).json(newCampaign);
});

app.post('/api/campaigns/switch', (req, res) => {
  const { campaignId } = req.body;
  const campaign = database.campaigns.find(c => c.id === campaignId);
  if (!campaign) {
    return res.status(404).json({ error: 'Campaign not found.' });
  }

  database.activeCampaignId = campaignId;
  saveData(database);
  res.json({ success: true, activeCampaignId: campaignId });
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
    activeCampaignId: importedData.activeCampaignId || 'camp_default',
    entries: Array.isArray(importedData.entries) ? importedData.entries : [],
    characters: Array.isArray(importedData.characters) ? importedData.characters : [],
    activeCharacterId: importedData.activeCharacterId || null,
    customCategories: Array.isArray(importedData.customCategories) ? importedData.customCategories : []
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

findAvailablePort(defaultPort, (err, port) => {
  if (err) {
    console.error('[Error] Could not find an available port:', err);
    process.exit(1);
  }

  const server = app.listen(port, () => {
    const url = `http://localhost:${port}`;
    console.log('===================================================');
    console.log('       DUNGEONS & DRAGONS NOTEBOOK');
    console.log('===================================================');
    console.log(`[Status] Server running at: ${url}`);
    console.log(`[Mode]   ${isPackaged ? 'Executable Package' : 'Node.js Development'}`);
    console.log(`[Data]   ${dataFilePath}`);
    console.log('===================================================');

    if (shouldAutoOpen) {
      setTimeout(() => {
        const startCmd = process.platform === 'win32' ? `start ${url}` : `open ${url}`;
        exec(startCmd, () => {});
      }, 800);
    }
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
});
