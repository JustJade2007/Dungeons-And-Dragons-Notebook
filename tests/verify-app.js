/**
 * Automated Verification Test Suite
 * Tests server startup, REST API endpoints, notebook creation with mode choice (DM vs Player),
 * temporary scratchpad conversion to permanent notebook, cross-referencing, and data integrity.
 */

const http = require('http');
const { spawn } = require('child_process');
const path = require('path');

const PORT = 4057;
const BASE_URL = `http://localhost:${PORT}`;

function request(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const req = http.request(
      url,
      {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(body ? { 'Content-Length': Buffer.byteLength(JSON.stringify(body)) } : {})
        }
      },
      res => {
        let data = '';
        res.on('data', chunk => (data += chunk));
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, body: data ? JSON.parse(data) : null });
          } catch (e) {
            resolve({ status: res.statusCode, body: data });
          }
        });
      }
    );
    req.on('error', reject);
    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

function wait(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function runTests() {
  console.log('--- Starting D&D Notebook Verification Tests ---');

  // Launch server on test port
  process.env.PORT = String(PORT);
  const serverProc = spawn(process.execPath, [path.resolve(__dirname, '../server.js'), '--no-open'], {
    env: { ...process.env, PORT: String(PORT) },
    stdio: 'pipe'
  });

  serverProc.stdout.on('data', d => process.stdout.write(`[Server] ${d}`));
  serverProc.stderr.on('data', d => process.stderr.write(`[Server Err] ${d}`));

  let serverReady = false;
  for (let i = 0; i < 25; i++) {
    await wait(300);
    try {
      const res = await request('GET', '/api/health');
      if (res.status === 200 && res.body?.status === 'ok') {
        serverReady = true;
        break;
      }
    } catch (e) {}
  }

  if (!serverReady) {
    console.error('FAIL: Server failed to start within timeout.');
    serverProc.kill();
    process.exit(1);
  }

  console.log('PASS: Server started and health check passed.');

  try {
    // 1. Ensure and check clean database state (Zero dummy/template entries rule)
    await request('POST', '/api/reset');
    const initData = await request('GET', '/api/data');
    console.log(`Checking initial database: ${initData.body.entries.length} entries, ${initData.body.campaigns.length} notebooks.`);

    // 2. Test Creating DM Notebook with Brief Settings (rule system, feature toggles)
    const dmCampRes = await request('POST', '/api/campaigns', {
      name: 'Netheril Campaign',
      description: 'Ancient empire secrets',
      mode: 'dm',
      system: 'D&D 5e',
      settings: { allowDmSecrets: true, autoLinkDiscoveries: false }
    });
    if (dmCampRes.status !== 201 || dmCampRes.body.mode !== 'dm' || dmCampRes.body.system !== 'D&D 5e' || !dmCampRes.body.settings?.allowDmSecrets) {
      throw new Error(`Failed to create DM mode notebook with settings: status ${dmCampRes.status}`);
    }
    const dmCampId = dmCampRes.body.id;
    console.log('PASS: Created DM Mode notebook with brief settings successfully.');

    // 3. Test Creating Player Mode Notebook with Brief Settings
    const playerCampRes = await request('POST', '/api/campaigns', {
      name: 'Bruce Solo Quest',
      description: 'Paladin personal journal',
      mode: 'player',
      system: 'Pathfinder 2e',
      settings: { allowDmSecrets: false, autoLinkDiscoveries: true }
    });
    if (playerCampRes.status !== 201 || playerCampRes.body.mode !== 'player' || playerCampRes.body.system !== 'Pathfinder 2e') {
      throw new Error(`Failed to create Player mode notebook with settings: status ${playerCampRes.status}`);
    }
    const playerCampId = playerCampRes.body.id;
    console.log('PASS: Created Player Mode notebook with brief settings successfully.');

    // 4. Test Switching back to DM notebook
    const switchRes = await request('POST', '/api/campaigns/switch', { campaignId: dmCampId });
    if (switchRes.status !== 200 || switchRes.body.activeCampaignId !== dmCampId) {
      throw new Error('Failed to switch notebook.');
    }
    console.log('PASS: Switched active notebook successfully.');

    // 5. Test Entry Creation in DM notebook
    const createRes = await request('POST', '/api/entries', {
      campaignId: dmCampId,
      title: 'Floating City of Ythryn',
      category: 'location',
      status: 'Alive',
      friendliness: 'Neutral',
      tags: ['netheril', 'ruins'],
      attributes: [{ key: 'Elevation', value: 'Glacier depths' }],
      notes: 'Ancient enclave encased in true ice.'
    });
    if (createRes.status !== 201 || !createRes.body.id) {
      throw new Error(`Failed to create entry: status ${createRes.status}`);
    }
    const locationId = createRes.body.id;
    console.log('PASS: Created Location entry in DM notebook.');

    // 6. Test Second Entry with @ Mention to test cross-referencing and DM Secret Notes
    const createNpcRes = await request('POST', '/api/entries', {
      campaignId: dmCampId,
      title: 'Archmage Iriolarthas',
      category: 'npc',
      status: 'Dead',
      friendliness: 'Hostile',
      connections: [{ targetId: locationId, relation: 'Rules over' }],
      notes: `Former ruler of @[Floating City of Ythryn](${locationId}).`,
      secretNotes: 'DM Secret: Transformed into a demilich guarding the mythallar.'
    });
    if (createNpcRes.status !== 201 || !createNpcRes.body.id) {
      throw new Error(`Failed to create NPC entry: status ${createNpcRes.status}`);
    }
    const npcId = createNpcRes.body.id;
    console.log('PASS: Created NPC entry with cross-reference connection and secret notes.');

    // 7. Test Temporary Scratchpad and Migration
    // Create an entry in temporary scratchpad mode
    const tempEntryRes = await request('POST', '/api/entries', {
      campaignId: 'temporary',
      title: 'Session 0 Quick Notes',
      category: 'lore',
      notes: 'Quick scratchpad notes taken during session prep.'
    });
    if (tempEntryRes.status !== 201) {
      throw new Error('Failed to create entry in temporary scratchpad.');
    }
    console.log('PASS: Created entry in Temporary Scratchpad mode.');

    // Convert temporary scratchpad to permanent notebook
    const convertRes = await request('POST', '/api/campaigns', {
      name: 'Session Prep Notebook',
      description: 'Converted from temporary scratchpad',
      mode: 'dm',
      convertTemporary: true
    });
    if (convertRes.status !== 201) {
      throw new Error('Failed to convert temporary scratchpad.');
    }
    const convertedCampId = convertRes.body.id;

    // Verify entry was migrated to the new campaign ID
    const allData = await request('GET', '/api/data');
    const migrated = allData.body.entries.find(e => e.id === tempEntryRes.body.id);
    if (!migrated || migrated.campaignId !== convertedCampId) {
      throw new Error('Temporary scratchpad entry was not migrated to new campaign.');
    }
    console.log('PASS: Successfully converted Temporary Scratchpad into permanent notebook.');

    // 8. Test Character Creation & Player Mode Linking
    const charRes = await request('POST', '/api/characters', {
      campaignId: playerCampId,
      name: 'Bruce the Valiant',
      race: 'Human',
      characterClass: 'Paladin',
      level: 3,
      alignment: 'Lawful Good',
      notes: 'Oath of Devotion warrior.'
    });
    if (charRes.status !== 201 || !charRes.body.id) {
      throw new Error(`Failed to create character: status ${charRes.status}`);
    }
    const charId = charRes.body.id;
    console.log('PASS: Created Player Character.');

    // 9. Test Session Notes, Chapters, Auto-saved Date, and Filtering
    const todayStr = new Date().toISOString().slice(0, 10);

    // 9a. Create Session 1 with default chapter and auto-saved date
    const session1Res = await request('POST', '/api/sessions', {
      campaignId: dmCampId,
      title: 'Arrival at the Frozen Spires',
      summary: 'Party reached the rim of the glacier.',
      notes: `Met with @[Lord Dagult](${npcId}) before setting out.`,
      secretNotes: 'DM Secret: The glacier is hollowed out by ancient magic.'
    });
    if (session1Res.status !== 201 || !session1Res.body.id) {
      throw new Error(`Failed to create session 1: status ${session1Res.status}`);
    }
    const session1 = session1Res.body;
    if (session1.chapter !== 'General') {
      throw new Error(`Expected default chapter 'General', got: ${session1.chapter}`);
    }
    if (session1.date !== todayStr) {
      throw new Error(`Expected auto-saved date to default to today (${todayStr}), got: ${session1.date}`);
    }
    if (session1.sessionNumber !== 1) {
      throw new Error(`Expected sessionNumber 1, got: ${session1.sessionNumber}`);
    }
    console.log('PASS: Session 1 auto-saved date and defaulted to General chapter.');

    // 9b. Create Chapter via POST /api/chapters
    const chapterName = 'Chapter 1: The Glacier Depths';
    const createChapRes = await request('POST', '/api/chapters', {
      campaignId: dmCampId,
      name: chapterName
    });
    if (createChapRes.status !== 201 || !createChapRes.body.chapters.includes(chapterName)) {
      throw new Error('Failed to create campaign chapter.');
    }
    console.log('PASS: Created campaign chapter successfully.');

    // 9c. Create Session 2 in the new chapter with explicit date
    const session2Res = await request('POST', '/api/sessions', {
      campaignId: dmCampId,
      title: 'The Demilich Tomb',
      date: '2026-10-01',
      chapter: chapterName,
      summary: 'Descended into the crypts.',
      notes: 'Discovered the hidden runes of Netheril.'
    });
    if (session2Res.status !== 201 || !session2Res.body.id) {
      throw new Error(`Failed to create session 2: status ${session2Res.status}`);
    }
    const session2 = session2Res.body;
    if (session2.chapter !== chapterName) {
      throw new Error(`Expected chapter '${chapterName}', got: ${session2.chapter}`);
    }
    if (session2.sessionNumber !== 2) {
      throw new Error(`Expected auto-calculated sessionNumber 2, got: ${session2.sessionNumber}`);
    }
    console.log('PASS: Session 2 created with specific chapter and auto session number.');

    // 9d. Test Chapter filtering: General includes everything; specific chapter returns only its own sessions
    const generalSessionsRes = await request('GET', `/api/sessions?campaignId=${dmCampId}&chapter=General`);
    if (generalSessionsRes.status !== 200 || generalSessionsRes.body.sessions.length !== 2) {
      throw new Error(`General chapter filter expected 2 sessions, got ${generalSessionsRes.body.sessions?.length}`);
    }
    const specificChapterRes = await request('GET', `/api/sessions?campaignId=${dmCampId}&chapter=${encodeURIComponent(chapterName)}`);
    if (specificChapterRes.status !== 200 || specificChapterRes.body.sessions.length !== 1 || specificChapterRes.body.sessions[0].id !== session2.id) {
      throw new Error(`Specific chapter filter expected 1 session for '${chapterName}'`);
    }
    console.log('PASS: General includes everything, and specific chapter filter isolates sessions.');

    // 9e. Test Session Update and Delete
    const updateSessRes = await request('PUT', `/api/sessions/${session1.id}`, {
      summary: 'Updated summary: Glacier summit reached successfully.'
    });
    if (updateSessRes.status !== 200 || updateSessRes.body.summary !== 'Updated summary: Glacier summit reached successfully.') {
      throw new Error('Failed to update session note.');
    }
    const delSessRes = await request('DELETE', `/api/sessions/${session2.id}`);
    if (delSessRes.status !== 200) {
      throw new Error('Failed to delete session note.');
    }
    console.log('PASS: Session update and deletion verified.');

    // 10. Verify Frontend HTML Structure & Required Elements
    const fs = require('fs');
    const htmlContent = fs.readFileSync(path.resolve(__dirname, '../public/index.html'), 'utf8');
    const requiredElements = [
      'id="homePage"',
      'class="home-page-layout"',
      'id="app"',
      'style="display: none;"',
      'id="returnHomeBtn"',
      'id="createNotebookForm"',
      'id="newNotebookName"',
      'id="newNotebookDesc"',
      'name="notebookRoleChoice"',
      'id="notebookRuleSystem"',
      'id="settingEnableSecrets"',
      'id="settingAutoLink"',
      'id="savedNotebooksList"',
      'id="startTempNotepadBtn"',
      'id="homeThemeSwitcherBtn"',
      'id="sessionsTab"',
      'id="viewSessions"',
      'id="sessionModal"',
      'id="chapterModal"',
      'id="chapterFilterContainer"',
      'id="sessionFormChapterSelect"',
      'id="sessionFormDate"'
    ];

    for (const elem of requiredElements) {
      if (!htmlContent.includes(elem)) {
        throw new Error(`Frontend HTML missing required element/attribute: ${elem}`);
      }
    }
    console.log('PASS: Frontend HTML contains all required Home Page, Gateway, and Settings elements.');

    // 10. Clean up test data and reset to pristine empty state
    await request('POST', '/api/reset');
    const resetCheck = await request('GET', '/api/data');
    if (resetCheck.body.entries.length !== 0 || resetCheck.body.campaigns.length !== 0) {
      throw new Error('Reset failed to leave pristine zero-entry state.');
    }
    console.log('PASS: Cleaned up test data and reset database to pristine empty state.');

    console.log('--- ALL VERIFICATION TESTS PASSED SUCCESSFULLY! ---');
  } catch (err) {
    console.error('TEST ERROR:', err.message);
    serverProc.kill();
    process.exit(1);
  } finally {
    serverProc.kill();
  }
}

runTests();
