import net from 'node:net'
import { resolve } from 'node:path'
import { setTimeout as sleep } from 'node:timers/promises'

const ATTACH_COMMAND = 'tmux attach -t bun-platform-dev'
const DB_PANE = 'bun-platform-dev:0.0'
const DB_PORT = 8080
const KILL_COMMAND = 'tmux kill-session -t bun-platform-dev'
const PROJECT_ROOT = resolve(import.meta.dir, '..')
const READY_TIMEOUT_MS = 30_000
const SESSION_NAME = 'bun-platform-dev'

type CommandResult = {
  exitCode: number
  stderr: string
  stdout: string
}

function decodeOutput(output: Uint8Array<ArrayBufferLike> | undefined) {
  return output ? Buffer.from(output).toString('utf8').trim() : ''
}

function runCommand(cmd: string[], currentWorkingDirectory = PROJECT_ROOT): CommandResult {
  const result = Bun.spawnSync({
    cmd,
    cwd: currentWorkingDirectory,
    stderr: 'pipe',
    stdout: 'pipe',
  })

  return {
    exitCode: result.exitCode,
    stderr: decodeOutput(result.stderr),
    stdout: decodeOutput(result.stdout),
  }
}

async function runForegroundCommand(cmd: string[], envOverrides: Record<string, string> = {}) {
  const subprocess = Bun.spawn({
    cmd,
    cwd: PROJECT_ROOT,
    env: {
      ...process.env,
      ...envOverrides,
    },
    stderr: 'inherit',
    stdin: 'inherit',
    stdout: 'inherit',
  })

  return await subprocess.exited
}

function runTmuxCommand(args: string[]) {
  return runCommand(['tmux', ...args])
}

function ensureTmuxAvailable() {
  const result = runTmuxCommand(['-V'])

  if (result.exitCode !== 0) {
    throw new Error(`tmux is required for bun run dev:local.\n${result.stderr || result.stdout}`)
  }
}

function ensureSessionDoesNotExist() {
  const result = runTmuxCommand(['has-session', '-t', SESSION_NAME])

  if (result.exitCode === 0) {
    throw new Error(
      [`tmux session ${SESSION_NAME} already exists.`, `Attach: ${ATTACH_COMMAND}`, `Kill: ${KILL_COMMAND}`].join('\n'),
    )
  }
}

function ensureSuccess(result: CommandResult, message: string) {
  if (result.exitCode !== 0) {
    throw new Error([message, result.stdout, result.stderr].filter(Boolean).join('\n'))
  }
}

function getDbPaneOutput() {
  const result = runTmuxCommand(['capture-pane', '-p', '-t', DB_PANE])

  ensureSuccess(result, 'Failed to read the tmux DB pane output.')

  return result.stdout
}

function isDbPaneDead() {
  const result = runTmuxCommand(['display-message', '-p', '-t', DB_PANE, '#{pane_dead}'])

  ensureSuccess(result, 'Failed to inspect the tmux DB pane state.')

  return result.stdout === '1'
}

function sendKeys(target: string, command: string) {
  const result = runTmuxCommand(['send-keys', '-t', target, command, 'C-m'])

  ensureSuccess(result, `Failed to run ${command} in tmux pane ${target}.`)
}

async function isPortReachable(hostname: string, port: number) {
  return await new Promise<boolean>((resolveConnection) => {
    const socket = net.createConnection({
      host: hostname,
      port,
    })

    const finish = (didConnect: boolean) => {
      socket.destroy()
      resolveConnection(didConnect)
    }

    socket.once('connect', () => finish(true))
    socket.once('error', () => finish(false))
    socket.setTimeout(500, () => finish(false))
  })
}

async function waitForDatabaseReadiness() {
  const startTime = Date.now()

  while (Date.now() - startTime < READY_TIMEOUT_MS) {
    const output = getDbPaneOutput()

    if (output.includes('sqld listening on port') || (await isPortReachable('127.0.0.1', DB_PORT))) {
      return
    }

    if (isDbPaneDead()) {
      throw new Error(
        ['Local database exited before becoming ready.', output, `Attach: ${ATTACH_COMMAND}`, `Kill: ${KILL_COMMAND}`]
          .filter(Boolean)
          .join('\n'),
      )
    }

    await sleep(250)
  }

  throw new Error(
    [
      `Timed out waiting ${READY_TIMEOUT_MS / 1000}s for the local database to become ready.`,
      getDbPaneOutput(),
      `Attach: ${ATTACH_COMMAND}`,
      `Kill: ${KILL_COMMAND}`,
    ]
      .filter(Boolean)
      .join('\n'),
  )
}

function startSession() {
  ensureSuccess(
    runTmuxCommand(['new-session', '-d', '-s', SESSION_NAME, '-c', PROJECT_ROOT]),
    `Failed to create tmux session ${SESSION_NAME}.`,
  )
  ensureSuccess(
    runTmuxCommand(['set-option', '-t', SESSION_NAME, 'remain-on-exit', 'on']),
    `Failed to enable remain-on-exit for tmux session ${SESSION_NAME}.`,
  )

  sendKeys(DB_PANE, 'bun run db:local')
}

function startApiAndWeb() {
  ensureSuccess(
    runTmuxCommand(['split-window', '-h', '-p', '50', '-t', `${SESSION_NAME}:0`, '-c', PROJECT_ROOT]),
    'Failed to create the API pane.',
  )
  ensureSuccess(
    runTmuxCommand(['split-window', '-v', '-p', '50', '-t', `${SESSION_NAME}:0.1`, '-c', PROJECT_ROOT]),
    'Failed to create the web pane.',
  )

  sendKeys(`${SESSION_NAME}:0.1`, 'bun run dev:api')
  sendKeys(`${SESSION_NAME}:0.2`, 'bun run dev:web')
}

function getAttachEnv() {
  return {
    TERM: !process.env.TERM || process.env.TERM === 'dumb' ? 'screen-256color' : process.env.TERM,
  }
}

async function main() {
  ensureTmuxAvailable()
  ensureSessionDoesNotExist()

  console.log(`Creating tmux session ${SESSION_NAME}.`)
  startSession()

  console.log('Waiting for the local database to become ready.')
  await waitForDatabaseReadiness()

  console.log('Running db:push.')
  if ((await runForegroundCommand(['bun', 'run', 'db:push'])) !== 0) {
    throw new Error([`bun run db:push failed.`, `Attach: ${ATTACH_COMMAND}`, `Kill: ${KILL_COMMAND}`].join('\n'))
  }

  console.log('Running db:seed.')
  if ((await runForegroundCommand(['bun', 'run', 'db:seed'])) !== 0) {
    throw new Error([`bun run db:seed failed.`, `Attach: ${ATTACH_COMMAND}`, `Kill: ${KILL_COMMAND}`].join('\n'))
  }

  console.log('Starting API and web panes.')
  startApiAndWeb()

  console.log(`Attaching to tmux session ${SESSION_NAME}.`)
  process.exitCode = await runForegroundCommand(['tmux', 'attach-session', '-t', SESSION_NAME], getAttachEnv())
}

await main()
