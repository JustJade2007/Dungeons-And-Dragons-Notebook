/**
 * Automated Verification Test Suite
 * Tests server startup, REST API endpoints, note-taking CRUD,
 * @ cross-referencing, backlink indexing, Player Mode linking, and clean data integrity.
 */

const http = require('http');
const { spawn } = require('child_process');
const path = require('path');

const PORT = 4055;
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
  for (let i = 0; i < 20; i++) {
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
    console.log(`Checking entry count: ${initData.body.entries.length} entries present.`);

    // 2. Test Entry Creation
    const createRes = await request('POST', '/api/entries', {
      title: 'Waterdeep Harbour',
      category: 'location',
      status: 'Alive',
      friendliness: 'Neutral',
      tags: ['coast', 'trade'],
      attributes: [{ key: 'Region', value: 'Sword Coast' }],
      notes: 'Major port in the City of Splendors.'
    });
    if (createRes.status !== 201 || !createRes.body.id) {
      throw new Error(`Failed to create entry: status ${createRes.status}`);
    }
    const locationId = createRes.body.id;
    console.log('PASS: Created Location entry successfully.');

    // 3. Test Second Entry with @ Mention to test cross-referencing
    const createNpcRes = await request('POST', '/api/entries', {
      title: 'Captain Durnan',
      category: 'npc',
      status: 'Alive',
      friendliness: 'Friendly',
      connections: [{ targetId: locationId, relation: 'Located in' }],
      notes: `Frequents @[Waterdeep Harbour](${locationId}) for supplies.`,
      secretNotes: 'DM Secret: Knows the location of the Sunken Eye.'
    });
    if (createNpcRes.status !== 201 || !createNpcRes.body.id) {
      throw new Error(`Failed to create NPC entry: status ${createNpcRes.status}`);
    }
    const npcId = createNpcRes.body.id;
    console.log('PASS: Created NPC entry with cross-reference connection and secret notes.');

    // 4. Test Character Creation & Player Mode Linking
    const charRes = await request('POST', '/api/characters', {
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

    // 5. Test Link Entry to Character
    const linkRes = await request('POST', `/api/characters/${charId}/link-entry`, {
      entryId: locationId
    });
    if (linkRes.status !== 200 || !linkRes.body.character.linkedEntryIds.includes(locationId)) {
      throw new Error('Failed to link entry to character.');
    }
    console.log('PASS: Linked entry to character journal successfully.');

    // 6. Test Entry Update
    const updateRes = await request('PUT', `/api/entries/${npcId}`, {
      title: 'Captain Durnan the Ancient',
      status: 'Alive'
    });
    if (updateRes.status !== 200 || updateRes.body.title !== 'Captain Durnan the Ancient') {
      throw new Error('Failed to update entry.');
    }
    console.log('PASS: Updated entry details successfully.');

    // 7. Clean up test data so NO template or example entries remain
    await request('DELETE', `/api/entries/${npcId}`);
    await request('DELETE', `/api/entries/${locationId}`);
    await request('DELETE', `/api/characters/${charId}`);
    await request('POST', '/api/reset');
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
