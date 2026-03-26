import { file, Glob, write } from 'bun'
import { randomBytes } from 'node:crypto'

const glob = new Glob('apps/*/.env.example')
const generateSecretPlaceholder = '__GENERATE_SECRET__'

function generateSecret() {
  return randomBytes(32).toString('hex')
}

async function replaceGeneratedSecrets(envPath: string) {
  const env = file(envPath)
  const envContents = await env.text()
  const lineEnding = envContents.includes('\r\n') ? '\r\n' : '\n'
  const lines = envContents.split(/\r?\n/)

  const replacements = lines.flatMap((line, index) => {
    if (line.trimStart().startsWith('#')) {
      return []
    }

    const separatorIndex = line.indexOf('=')

    if (separatorIndex === -1) {
      return []
    }

    const key = line.slice(0, separatorIndex)
    const value = line.slice(separatorIndex + 1)

    if (value !== generateSecretPlaceholder) {
      return []
    }

    return [{ index, line: `${key}=${generateSecret()}` }]
  })

  if (replacements.length === 0) {
    return
  }

  const replacementLines = new Map(replacements.map((replacement) => [replacement.index, replacement.line]))
  const updatedLines = lines.map((line, index) => replacementLines.get(index) ?? line)

  await write(env, updatedLines.join(lineEnding))
  console.log(`Generated ${replacements.length} secret${replacements.length === 1 ? '' : 's'} in ${envPath}`)
}

async function setupEnvFiles() {
  for await (const example of glob.scan('.')) {
    const envPath = example.replace('.env.example', '.env')
    const env = file(envPath)
    const shouldCopy = !(await env.exists()) || env.size === 0

    if (shouldCopy) {
      const contents = await file(example).text()
      await write(envPath, contents)
      console.log(`Copied ${example} → ${envPath}`)
      await replaceGeneratedSecrets(envPath)
      console.log(`The file ${envPath} was created successfully.`)
      continue
    }
    console.log(`The file ${envPath} already exists.`)
  }
}

await setupEnvFiles()
