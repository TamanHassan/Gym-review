#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const [backendUrl, frontendUrl] = process.argv.slice(2);
const readmePath = path.resolve(process.cwd(), 'README.md');

if (!fs.existsSync(readmePath)) {
  console.error('README.md not found');
  process.exit(1);
}

let content = fs.readFileSync(readmePath, 'utf8');

if (backendUrl) {
  // Replace example backend URL occurrences
  content = content.replace(/https:\/\/gym-review-backend\.onrender\.com/g, backendUrl);
  content = content.replace(/https:\/\/your-render-url/g, backendUrl);
}

if (frontendUrl) {
  // Replace example frontend URL occurrences
  content = content.replace(/https:\/\/gym-review\.vercel\.app/g, frontendUrl);
  content = content.replace(/https:\/\/your-vercel-url/g, frontendUrl);
}

fs.writeFileSync(readmePath, content, 'utf8');
console.log('README.md updated with deployed URLs');
