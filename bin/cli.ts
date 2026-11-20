#!/usr/bin/env bun

// vite dev --port 3000

import { spawnSync } from 'node:child_process'
import net from 'node:net'
import { join } from 'node:path'
import { parseArgs, styleText } from 'node:util'
import pkg from '../package.json' with { type: 'json' }
import { detectLanguage } from './lang.ts'

// console.log('pkg:', pkg);

const { version, name, description, 'description.zh': descriptionZh } = pkg

const check = (port: number) =>
  new Promise((res) => {
    const s = net.createServer()
    // @ts-expect-error
    s.once('error', (e) => res(e.code === 'EADDRINUSE'))
    s.once('listening', () => s.close(() => res(false)))
    s.listen(port)
  })

main()

async function main() {
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
      },
      help: {
        short: 'h',
        type: 'boolean',
      },
    },
  })

  // console.log(values);

  const port = Number(values.port)
  // validate port in a valid range
  const valid = port >= 1024 && port <= 65535

  if (!valid) {
    console.error(
      `Invalid port number ${values.port}, should be in [1024, 65535]`,
    )
    process.exitCode = 1

    return
  }

  if (values.version || values.help) {
    printHelp(!!values.help)
    return
  }

  console.log(`\n${name} v${version}\n\n---\n`)

  if (await check(port)) {
    console.error(
      'port',
      styleText('red', values.port),
      'in use, try another one.',
    )
    process.exitCode = 1

    return
  }

  const dirname = import.meta.dirname

  spawnSync('node', [join(dirname, '../.output/server/index.mjs')], {
    stdio: 'inherit',
    // shell: true,
    env: {
      ...process.env,
      PORT: values.port,
    },
  })
}

function printHelp(verbose: boolean) {
  console.log(`\n${name} v${version}`)

  if (!verbose) {
    return
  }

  if (detectLanguage() === 'zh') {
    console.log()
    console.log('>', styleText('green', descriptionZh), '\n')

    console.log('用法: npx poon-choi [选项]')
    console.log()
    console.log('选项：')
    console.log('  -p, --port <port>   指定封面图工具服务端口号 (默认: 3000)')
    console.log('  -v, --version       打印版本号')
    console.log('  -h, --help          打印帮助信息')

    return
  }

  console.log()
  console.log('>', styleText('green', description), '\n')

  console.log('Usage: npx poon-choi [options]')
  console.log()
  console.log('Options:')
  console.log('  -p, --port <port>  Port to run the server on (default: 3000)')
  console.log('  -v, --version      Print version number')
  console.log('  -h, --help         Print this help message')
}
