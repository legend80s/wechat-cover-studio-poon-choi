// 1 npm pack
// 2 unpack
// 3 run `❯ node poon-choi-1.1.1/package/bin/cli.ts -h`
// expect print help message

import assert from 'node:assert'
import { execSync } from 'node:child_process'
import { mkdir, rm } from 'node:fs/promises'
import { test } from 'node:test'

test('CLI e2e test', async () => {
  const actual = await run()

  console.log('actual:', actual)

  assert.match(actual, /poon-choi/)
})

async function run(): Promise<string> {
  let filename: string | undefined = ''
  try {
    // 1 npm pack output `poon-choi-1.1.1.tgz`
    const stdout = execSync('npm pack 2>&1').toString('utf-8')

    // console.log(`stdout1: |${stdout}|`)

    // extract `poon-choi-1.1.1.tgz` from stdout
    // `npm notice filename: poon-choi-1.1.1.tgz`
    filename = stdout.match(/(\S+\.tgz)/)?.[1]

    if (!filename) {
      console.log(`stdout2: |${stdout}|`)
      throw new Error('Failed to extract filename from stdout')
    }

    await mkdir('./target-dir-wechat-cover-studio-44ae')

    // 2. 解压（推荐用 tar 库，无环境依赖）
    // 到一个 uniq 目录，避免冲突
    execSync(`tar -xzf ${filename} -C ./target-dir-wechat-cover-studio-44ae`)

    // 3. 执行（使用子进程隔离，避免污染主进程）
    const output = execSync(
      'node target-dir-wechat-cover-studio-44ae/package/bin/cli.ts -h',
    ).toString()

    // console.log(`output: |${output}|`)

    return output
  } finally {
    // 4. 无论成功失败，清理临时文件
    filename && (await rm(filename))
    await rm('./target-dir-wechat-cover-studio-44ae', {
      recursive: true,
      force: true,
    })
  }
}
