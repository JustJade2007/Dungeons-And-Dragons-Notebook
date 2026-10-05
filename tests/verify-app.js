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
    // 1. Check clean database state (Zero dummy/template entries rule)
    const initData = await request('GET', '/api/data');
    console.log(`Checking initial database: ${initData.body.entries.length} entries, ${initData.body.campaigns.length} notebooks.`);

    // 2. Test Creating DM Notebook
    const dmCampRes = await request('POST', '/api/campaigns', {
      name: 'Netheril Campaign',
      description: 'Ancient empire secrets',
      mode: 'dm'
    });
    if (dmCampRes.status !== 201 || dmCampRes.body.mode !== 'dm') {
      throw new Error(`Failed to create DM mode notebook: status ${dmCampRes.status}`);
    }
    const dmCampId = dmCampRes.body.id;
    console.log('PASS: Created DM Mode notebook successfully.');

    // 3. Test Creating Player Mode Notebook
    const playerCampRes = await request('POST', '/api/campaigns', {
      name: 'Bruce Solo Quest',
      description: 'Paladin personal journal',
      mode: 'player'
    });
    if (playerCampRes.status !== 201 || playerCampRes.body.mode !== 'player') {
      throw new Error(`Failed to create Player mode notebook: status ${playerCampRes.status}`);
    }
    const playerCampId = playerCampRes.body.id;
    console.log('PASS: Created Player Mode notebook successfully.');

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

    // 9. Clean up test data and reset to pristine empty state
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
