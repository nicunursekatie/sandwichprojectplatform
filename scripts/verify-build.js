#!/usr/bin/env node

import { existsSync, readdirSync } from 'fs';
import { join } from 'path';

console.log('=== Build Verification ===');
console.log('Current directory:', process.cwd());

const distPath = join(process.cwd(), 'dist');
const publicPath = join(distPath, 'public');
const indexPath = join(publicPath, 'index.html');
const serverPath = join(distPath, 'index.js');

console.log('\nChecking dist directory:', distPath);
if (existsSync(distPath)) {
  console.log('✓ dist/ exists');
  const distContents = readdirSync(distPath);
  console.log('  Contents:', distContents);
} else {
  console.log('✗ dist/ does not exist');
}

console.log('\nChecking public directory:', publicPath);
if (existsSync(publicPath)) {
  console.log('✓ dist/public/ exists');
  const publicContents = readdirSync(publicPath);
  console.log('  Contents:', publicContents);
} else {
  console.log('✗ dist/public/ does not exist');
}

console.log('\nChecking index.html:', indexPath);
if (existsSync(indexPath)) {
  console.log('✓ dist/public/index.html exists');
} else {
  console.log('✗ dist/public/index.html does not exist');
}

console.log('\nChecking server bundle:', serverPath);
if (existsSync(serverPath)) {
  console.log('✓ dist/index.js exists');
} else {
  console.log('✗ dist/index.js does not exist');
}

console.log('\n=== Build Verification Complete ===');
process.exit(0);