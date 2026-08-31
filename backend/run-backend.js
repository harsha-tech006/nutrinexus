const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

function getPythonExecutable() {
  const venvWin = path.join(__dirname, '.venv', 'Scripts', 'python.exe');
  const venvUnix = path.join(__dirname, '.venv', 'bin', 'python');

  if (fs.existsSync(venvWin)) {
    return venvWin;
  }
  if (fs.existsSync(venvUnix)) {
    return venvUnix;
  }
  return process.platform === 'win32' ? 'python' : 'python3';
}

const pythonBin = getPythonExecutable();
console.log(`===================================================`);
console.log(`🚀 Starting NutriNexus Flask Backend via Python:`);
console.log(`📍 Python path: ${pythonBin}`);
console.log(`===================================================`);

const child = spawn(pythonBin, ['app.py'], {
  cwd: __dirname,
  stdio: 'inherit',
  env: process.env
});

child.on('error', (err) => {
  console.error('❌ Failed to start Python process:', err);
});

child.on('exit', (code, signal) => {
  if (code !== null) {
    console.log(`Backend process exited with code ${code}`);
  } else if (signal !== null) {
    console.log(`Backend process killed with signal ${signal}`);
  }
});
