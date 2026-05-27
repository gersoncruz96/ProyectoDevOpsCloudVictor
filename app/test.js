// Simple test
const http = require('http');

const tests = [
  { path: '/health', expected: 'healthy' },
  { path: '/api/info', expected: 'hostname' },
  { path: '/', expected: 'DevOps Dashboard' }
];

let passed = 0;
let failed = 0;

function runTest(test) {
  return new Promise((resolve) => {
    http.get(`http://localhost:8080${test.path}`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (data.includes(test.expected)) {
          console.log(`✅ ${test.path} - PASS`);
          passed++;
        } else {
          console.log(`❌ ${test.path} - FAIL (expected "${test.expected}")`);
          failed++;
        }
        resolve();
      });
    }).on('error', () => {
      console.log(`❌ ${test.path} - FAIL (connection error)`);
      failed++;
      resolve();
    });
  });
}

async function main() {
  console.log('Running tests...\n');
  for (const test of tests) {
    await runTest(test);
  }
  console.log(`\nResults: ${passed} passed, ${failed} failed`);
  process.exit(failed > 0 ? 1 : 0);
}

main();
