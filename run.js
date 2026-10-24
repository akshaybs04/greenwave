import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('================================================================');
console.log('  🚑 GreenWave: Emergency Vehicle Green-Corridor AI System');
console.log('  Bengaluru ITMS Simulation with TinyFish Web Agents');
console.log('================================================================');

// Determine command runner for Windows
const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';

// Spawn Backend Server
console.log('[1/2] Starting GreenWave Backend Server on http://localhost:5000...');
const serverProcess = spawn('node', ['src/index.js'], {
  cwd: path.join(__dirname, 'server'),
  stdio: 'inherit',
  shell: true
});

// Spawn Frontend Client
console.log('[2/2] Starting React + Vite Frontend on http://localhost:5173...');
const clientProcess = spawn(npmCmd, ['run', 'dev'], {
  cwd: path.join(__dirname, 'client'),
  stdio: 'inherit',
  shell: true
});

process.on('SIGINT', () => {
  console.log('\nShutting down GreenWave services...');
  serverProcess.kill();
  clientProcess.kill();
  process.exit(0);
});
