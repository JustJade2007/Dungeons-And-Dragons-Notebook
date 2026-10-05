const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('===================================================');
console.log('  Building Standalone Windows Executable (.exe)    ');
console.log('===================================================');

const projectRoot = path.resolve(__dirname, '..');
const distDir = path.join(projectRoot, 'dist');
const bundlePath = path.join(distDir, 'server.bundle.js');
const seaConfigPath = path.join(distDir, 'sea-config.json');
const seaBlobPath = path.join(distDir, 'sea-prep.blob');
const exePath = path.join(distDir, 'dnd-notebook.exe');
const publicSrcDir = path.join(projectRoot, 'public');
const publicDestDir = path.join(distDir, 'public');

// 1. Ensure dist directory
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// 2. Bundle server.js with esbuild
console.log('[1/5] Bundling server with esbuild...');
try {
  execSync(
    `npx esbuild "${path.join(projectRoot, 'server.js')}" --bundle --platform=node --target=node22 --outfile="${bundlePath}"`,
    { stdio: 'inherit', cwd: projectRoot }
  );
} catch (err) {
  console.error('[Error] esbuild bundle failed:', err.message);
  process.exit(1);
}

// 3. Generate sea-config.json
console.log('[2/5] Creating Node Single Executable Application (SEA) configuration...');
const seaConfig = {
  main: bundlePath,
  output: seaBlobPath,
  disableExperimentalSEAWarning: true
};
fs.writeFileSync(seaConfigPath, JSON.stringify(seaConfig, null, 2), 'utf8');

// 4. Generate SEA blob using node --experimental-sea-config
console.log('[3/5] Generating SEA preparation blob...');
try {
  execSync(`node --experimental-sea-config "${seaConfigPath}"`, { stdio: 'inherit', cwd: projectRoot });
} catch (err) {
  console.error('[Error] node --experimental-sea-config failed:', err.message);
  process.exit(1);
}

// 5. Copy node.exe to target exe and inject blob via postject
console.log('[4/5] Copying node executable and injecting blob with postject...');
try {
  fs.copyFileSync(process.execPath, exePath);

  // Run postject to inject blob
  execSync(
    `npx postject "${exePath}" NODE_SEA_BLOB "${seaBlobPath}" --sentinel-fuse NODE_SEA_FUSE_fce680ab2cc467b6e072b8b5df1996b2`,
    { stdio: 'inherit', cwd: projectRoot }
  );
} catch (err) {
  console.error('[Error] postject injection failed:', err.message);
  process.exit(1);
}

// 6. Copy public assets into dist/public
console.log('[5/5] Copying frontend static assets to dist/public...');
function copyRecursive(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

copyRecursive(publicSrcDir, publicDestDir);

// Clean up intermediate files
try {
  if (fs.existsSync(seaConfigPath)) fs.unlinkSync(seaConfigPath);
  if (fs.existsSync(seaBlobPath)) fs.unlinkSync(seaBlobPath);
} catch (e) {}

// 7. Verify & Finalize Executable Features
console.log('[6/6] Finalizing & Verifying all features against the standalone executable...');
try {
  execSync(`node "${path.join(projectRoot, 'tests', 'verify-exe.js')}"`, {
    stdio: 'inherit',
    cwd: projectRoot
  });
} catch (err) {
  console.error('[Error] Executable feature verification test suite failed:', err.message);
  process.exit(1);
}

console.log('===================================================');
console.log('  SUCCESS! Standalone Executable Finalized & Verified:');
console.log(`  ${exePath}`);
console.log('===================================================');
