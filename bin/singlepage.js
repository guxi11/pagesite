#!/usr/bin/env node
// singlepage — self-hosted HTML sharing with optional access codes
// Modes: serve | upload | delete
import { existsSync, readFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { basename, resolve } from 'node:path'
import { parseArgs } from 'node:util'

const fail = msg => { console.error(`singlepage: ${msg}`); process.exit(1) }

// --- config resolution (flag > env > rc) ---
const loadRc = () => {
  const rc = `${homedir()}/.singlepagerc.json`
  return existsSync(rc) ? JSON.parse(readFileSync(rc, 'utf8')) : {}
}

// --- subcommand: serve ---
const serve = async () => {
  const { values } = parseArgs({
    args: process.argv.slice(3),
    options: {
      port: { type: 'string', default: process.env.SINGLEPAGE_PORT || '3000' },
      dir: { type: 'string', default: process.env.SINGLEPAGE_DIR || './pages' },
      token: { type: 'string', default: process.env.SINGLEPAGE_TOKEN || loadRc().token },
      'tls-cert': { type: 'string' },
      'tls-key': { type: 'string' },
      'public-url': { type: 'string', default: process.env.SINGLEPAGE_PUBLIC_URL },
      'trust-proxy': { type: 'boolean', default: process.env.SINGLEPAGE_TRUST_PROXY === 'true' }
    },
    strict: false
  })
  if (!values.token) console.error('singlepage: no --token set; only users with api-keys will be authorized')
  const { createServer } = await import('../lib/server.js')
  createServer({
    dir: resolve(values.dir),
    port: parseInt(values.port),
    token: values.token,
    tlsCert: values['tls-cert'],
    tlsKey: values['tls-key'],
    publicUrl: values['public-url'],
    trustProxy: values['trust-proxy']
  })
}

const resolveAuth = (values) => {
  const rc = loadRc()
  const domain = values.domain ?? process.env.SINGLEPAGE_DOMAIN ?? rc.domain
  if (!domain) fail('--domain required')
  const adminToken = values.token ?? process.env.SINGLEPAGE_TOKEN
  const apiKey = values['api-key'] ?? process.env.SINGLEPAGE_API_KEY ?? rc.apiKey
  const headers = {}
  if (adminToken) headers.authorization = `Bearer ${adminToken}`
  else if (apiKey) headers.authorization = `Bearer ${apiKey}`
  else fail('--api-key or --token required (or set apiKey in ~/.singlepagerc.json)')
  return { domain, headers }
}

// --- subcommand: upload ---
const upload = async (fileArg) => {
  const { values, positionals } = parseArgs({
    args: process.argv.slice(fileArg ? 2 : 3),
    options: {
      domain: { type: 'string' },
      token: { type: 'string' },
      'api-key': { type: 'string' },
      seal: { type: 'boolean', default: false },
      code: { type: 'string' }
    },
    allowPositionals: true,
    strict: false
  })
  const file = positionals[0]
  if (!file || !existsSync(file)) fail(`file not found: ${file}`)

  const { domain, headers } = resolveAuth(values)

  const html = readFileSync(file, 'utf8')
  let body = html, code = null

  if (values.seal) {
    const { genCode, seal, sealedPage } = await import('../lib/seal.js')
    code = values.code ?? genCode()
    body = sealedPage(seal(html, code))
  }

  const name = basename(file)
  const url = `${domain.replace(/\/+$/, '')}/${name}`

  const res = await fetch(url, { method: 'PUT', headers, body })
  if (!res.ok) fail(`upload ${res.status}: ${await res.text()}`)

  const result = code ? { url, code } : { url }
  process.stdout.write(JSON.stringify(result) + '\n')
}

// --- subcommand: delete ---
const del = async () => {
  const { values, positionals } = parseArgs({
    args: process.argv.slice(3),
    options: {
      domain: { type: 'string' },
      token: { type: 'string' },
      'api-key': { type: 'string' }
    },
    allowPositionals: true,
    strict: false
  })
  const name = positionals[0]
  if (!name) fail('filename required (e.g. page.html)')

  const { domain, headers } = resolveAuth(values)
  const url = `${domain.replace(/\/+$/, '')}/${name}`

  const res = await fetch(url, { method: 'DELETE', headers })
  if (!res.ok) fail(`delete ${res.status}: ${await res.text()}`)

  const result = await res.json()
  process.stdout.write(JSON.stringify(result) + '\n')
}

// --- dispatch ---
const sub = process.argv[2]

if (sub === 'serve') serve()
else if (sub === 'upload') upload(false)
else if (sub === 'delete') del()
else if (sub && (sub.endsWith('.html') || sub.endsWith('.htm') || existsSync(sub))) upload(true)
else {
  console.error(`singlepage v1.4.0 — self-hosted HTML sharing

Usage:
  singlepage serve  --port 3000 --dir ./pages [--token ADMIN_SECRET] [--tls-cert F --tls-key F]
                  [--public-url URL] [--trust-proxy]
  singlepage upload <file.html> --domain URL [--token T | --api-key K] [--seal] [--code CODE]
  singlepage delete <name.html> --domain URL [--token T | --api-key K]
  singlepage <file.html> --domain URL ...(shorthand for upload)

Auth:
  Register via web UI or POST /api/register with {id, password}.
  Login via POST /api/login to get an api-key (sp_...) for CLI/API use.
  --token in serve mode sets an admin token (optional, alongside user api-keys).

Environment:
  SINGLEPAGE_PORT, SINGLEPAGE_DIR, SINGLEPAGE_TOKEN, SINGLEPAGE_DOMAIN, SINGLEPAGE_API_KEY
  SINGLEPAGE_PUBLIC_URL  — base URL for generated share links (serve mode)
  SINGLEPAGE_TRUST_PROXY — honor X-Forwarded-Proto/Host headers (serve mode)`)
  process.exit(1)
}
