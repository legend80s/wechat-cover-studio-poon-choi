#!/usr/bin/env node

// vite dev --port 3000

import { spawn } from 'node:child_process';
import { parseArgs } from 'node:util';

main();

function main() {
  const { values } = parseArgs({
    options: {
      port: {
        type: 'string',
        default: '3000',
      },
    },
  });

  console.log(values);

  const port = Number(values.port);
  // validate port in a valid range
  const valid = port >= 1024 && port <= 65535
  if (!valid) {
    console.error(`Invalid port number ${values.port}, should be between 1024 and 65535`);
    process.exitCode =1;

    return 
  }

  spawn('npx', ['vite', 'dev', `--port=${port}`], {
    stdio: 'inherit',
    shell: true,
  })
}