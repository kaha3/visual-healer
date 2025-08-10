import { spawn } from 'node:child_process';

const p = spawn('node', ['src/cli.js', 'analyze', 'https://example.com'], { stdio: 'inherit' });

p.on('exit', code => process.exit(code));