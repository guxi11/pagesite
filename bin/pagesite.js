#!/usr/bin/env node
// pagesite — self-hosted HTML sharing with optional access codes
// Modes: serve | upload | delete | mcp
import { existsSync, readFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { basename, resolve } from 'node:path'
import { parseArgs } from 'node:util'

const fail = msg => { console.error(`pagesite: ${msg}`); process.exit(1) }

// --- config resolution (flag > env > rc) ---
const loadRc = () => {
  const rc = `${homedir()}/.pagesiterc.json`
  return existsSync(rc) ? JSON.parse(readFileSync(rc, 'utf8')) : {}
}

// --- subcommand: serve ---
const serve = async () => {
  const { values } = parseArgs({
    args: process.argv.slice(3),
    options: {
      port: { type: 'string', default: process.env.PAGESITE_PORT || '3000' },
      dir: { type: 'string', default: process.env.PAGESITE_DIR || './pages' },
      token: { type: 'string', default: process.env.PAGESITE_TOKEN || loadRc().token },
      'tls-cert': { type: 'string' },
      'tls-key': { type: 'string' },
      'public-url': { type: 'string', default: process.env.PAGESITE_PUBLIC_URL },
      'trust-proxy': { type: 'boolean', default: process.env.PAGESITE_TRUST_PROXY === 'true' }
    },
    strict: false
  })
  if (!values.token) console.error('pagesite: no --token set; only registered user tokens will work for uploads')
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

// --- subcommand: upload ---
const upload = async (fileArg) => {
  const { values, positionals } = parseArgs({
    args: process.argv.slice(fileArg ?2 : 3),
    options: {
      domain: { type: 'string' },
      token: { type: 'string' },
      user: { type: 'string' },
      pass: { type: 'string' },
      seal: { type: 'boolean', default: false },
      code: { type: 'string' }
    },
    allowPositionals: true,
    strict: false
  })
  const file = positionals[0]
  if (!file || !existsSync(file)) fail(`file not found: ${file}`)

  const rc = loadRc()
  const domain = values.domain ?? process.env.PAGESITE_DOMAIN ?? rc.domain
  if (!domain) fail('--domain required')

  const token = values.token ?? process.env.PAGESITE_TOKEN ?? rc.token
  const user = values.user ?? process.env.PAGESITE_USER ?? rc.user
  const pass = values.pass ?? process.env.PAGESITE_PASS ?? rc.pass

  const html = readFileSync(file, 'utf8')
  let body = html, code = null

  if (values.seal) {
    const { genCode, seal, sealedPage } = await import('../lib/seal.js')
    code = values.code ?? genCode()
    body = sealedPage(seal(html, code))
  }

  const name = basename(file)
  const url = `${domain.replace(/\/+$/, '')}/${name}`
  const headers = {}
  if (token) headers.authorization = `Bearer ${token}`
  else if (user) headers.authorization = `Basic ${Buffer.from(`${user}:${pass ?? ''}`).toString('base64')}`

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
      user: { type: 'string' },
      pass: { type: 'string' }
    },
    allowPositionals: true,
    strict: false
  })
  const name = positionals[0]
  if (!name) fail('filename required (e.g. page.html)')

  const rc = loadRc()
  const domain = values.domain ?? process.env.PAGESITE_DOMAIN ?? rc.domain
  if (!domain) fail('--domain required')

  const token = values.token ?? process.env.PAGESITE_TOKEN ?? rc.token
  const user = values.user ?? process.env.PAGESITE_USER ?? rc.user
  const pass = values.pass ?? process.env.PAGESITE_PASS ?? rc.pass

  const url = `${domain.replace(/\/+$/, '')}/${name}`
  const headers = {}
  if (token) headers.authorization = `Bearer ${token}`
  else if (user) headers.authorization = `Basic ${Buffer.from(`${user}:${pass ?? ''}`).toString('base64')}`

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
  console.error(`pagesite v1.2.5 — self-hosted HTML sharing

Usage:
  pagesite serve  --port 3000 --dir ./pages [--token ADMIN_SECRET] [--tls-cert F --tls-key F]
                  [--public-url URL] [--trust-proxy]
  pagesite upload <file.html> --domain URL [--token T | --user U --pass P] [--seal] [--code CODE]
  pagesite delete <name.html> --domain URL [--token T | --user U --pass P]
  pagesite <file.html> --domain URL ...(shorthand for upload)

Auth:
  Users register via web UI or POST /api/register with {id, token}.
  --token in serve mode sets an admin token (optional, alongside user tokens).

Environment:
  PAGESITE_PORT, PAGESITE_DIR, PAGESITE_TOKEN, PAGESITE_DOMAIN
  PAGESITE_PUBLIC_URL  — base URL for generated share links (serve mode)
  PAGESITE_TRUST_PROXY — honor X-Forwarded-Proto/Host headers (serve mode)`)
  process.exit(1)
}
