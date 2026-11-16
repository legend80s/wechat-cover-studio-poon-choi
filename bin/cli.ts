#!/usr/bin/env bun

// vite dev --port 3000

import { spawn } from 'node:child_process';
import { parseArgs } from 'node:util';
import { version, name } from '../package.json';

main();

function main() {
  const { values } = parseArgs({
    options: {
      port: {
        short: 'p',
        type: 'string',
        default: '3000',
      },

      version: {
        short: 'v',
        type: 'boolean',
      }
    },
  });

  // console.log(values);

  const port = Number(values.port);
  // validate port in a valid range
  const valid = port >= 1024 && port <= 65535
  if (!valid) {
    console.error(`Invalid port number ${values.port}, should be between 1024 and 65535`);
    process.exitCode =1;

    return 
  }

  if (true || values.version) {
    console.log(`\n${name} v${version}\n\n---\n`);
    // return;
  }

  spawn('node', ['.output/server/index.mjs'], {
    stdio: 'inherit',
    shell: true,
    env: {
      ...process.env,
      PORT: values.port,
    }
  })
}